"use client";

import { useEffect, useRef, useCallback } from "react";

interface NotationRendererProps {
  notation: string;
  width?: number;
}

/* ── ABC → VexFlow helpers ────────────────────────────────── */

/** Normalize literal \n from DB into real newlines */
function normalizeAbc(raw: string): string {
  const bs = "\\" + "n";
  return raw.includes(bs) ? raw.split(bs).join("\n") : raw;
}

interface ParsedAbc {
  clef: "treble" | "bass";
  notes: { keys: string[]; duration: string; accidentals?: { index: number; type: string }[] }[];
}

/**
 * Convert an ABC note token like E, ^F c _B, G,, into VexFlow format.
 * ABC: C=middle C (C4), D E F G A B c d e ...
 * Comma lowers octave, lowercase raises octave.
 */
function abcNoteToVex(token: string, clef: string): { key: string; accidental?: string } {
  let accidental: string | undefined;
  let i = 0;

  // Parse accidentals
  if (token[i] === "^") { accidental = "#"; i++; if (token[i] === "^") { accidental = "##"; i++; } }
  else if (token[i] === "_") { accidental = "b"; i++; if (token[i] === "_") { accidental = "bb"; i++; } }
  else if (token[i] === "=") { accidental = "n"; i++; }

  // Get note letter
  const letter = token[i];
  if (!letter) return { key: clef === "bass" ? "C/3" : "C/4" };
  i++;

  const isLower = letter === letter.toLowerCase();
  const noteName = letter.toUpperCase();

  // Base octave: uppercase = 4 (treble) or 3 (bass), lowercase = 5 (treble) or 4 (bass)
  let octave: number;
  if (clef === "bass") {
    octave = isLower ? 4 : 3;
  } else {
    octave = isLower ? 5 : 4;
  }

  // Count commas (lower octave) and apostrophes (raise octave)
  while (i < token.length) {
    if (token[i] === ",") { octave--; i++; }
    else if (token[i] === "'") { octave++; i++; }
    else break;
  }

  return { key: `${noteName}/${octave}`, accidental };
}

/** Parse ABC body into note groups */
function parseAbcBody(body: string, clef: string): ParsedAbc["notes"] {
  const notes: ParsedAbc["notes"] = [];
  let i = 0;
  const s = body.trim().replace(/\|/g, "").trim();

  while (i < s.length) {
    // Skip spaces
    if (s[i] === " ") { i++; continue; }

    // Tuplet marker like (3
    if (s[i] === "(" && s[i + 1] >= "0" && s[i + 1] <= "9") { i += 2; continue; }

    // Chord: [notes]
    if (s[i] === "[") {
      i++; // skip [
      const keys: string[] = [];
      const accidentals: { index: number; type: string }[] = [];
      while (i < s.length && s[i] !== "]") {
        // Grab one note token
        let tok = "";
        while (i < s.length && s[i] !== "]" && !/[A-Ga-g]/.test(s[i]) && "^_=".includes(s[i])) {
          tok += s[i]; i++;
        }
        if (i < s.length && s[i] !== "]" && /[A-Ga-g]/.test(s[i])) {
          tok += s[i]; i++;
          while (i < s.length && (s[i] === "," || s[i] === "'")) { tok += s[i]; i++; }
        }
        if (tok) {
          const v = abcNoteToVex(tok, clef);
          if (v.accidental) accidentals.push({ index: keys.length, type: v.accidental });
          keys.push(v.key);
        }
      }
      if (s[i] === "]") i++;
      if (keys.length > 0) {
        notes.push({ keys, duration: "w", accidentals: accidentals.length > 0 ? accidentals : undefined });
      }
      continue;
    }

    // Single note
    if (/[A-Ga-g^_=]/.test(s[i])) {
      let tok = "";
      // Accidentals
      while (i < s.length && "^_=".includes(s[i])) { tok += s[i]; i++; }
      // Note letter
      if (i < s.length && /[A-Ga-g]/.test(s[i])) { tok += s[i]; i++; }
      // Octave modifiers
      while (i < s.length && (s[i] === "," || s[i] === "'")) { tok += s[i]; i++; }
      // Duration modifiers (skip numeric duration)
      while (i < s.length && /[0-9/]/.test(s[i])) { i++; }

      if (tok) {
        const v = abcNoteToVex(tok, clef);
        // Use quarter note for sequences, whole note for single
        const acc = v.accidental ? [{ index: 0, type: v.accidental }] : undefined;
        notes.push({ keys: [v.key], duration: "q", accidentals: acc });
      }
      continue;
    }

    i++; // skip unknown chars
  }

  // If only one note, make it a whole note
  if (notes.length === 1) {
    notes[0].duration = "w";
  }

  return notes;
}

/** Parse full ABC string */
function parseAbc(raw: string): ParsedAbc {
  const abc = normalizeAbc(raw);
  const lines = abc.split("\n").map((l) => l.trim());

  let clef: "treble" | "bass" = "treble";
  const bodyLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("K:")) {
      if (line.toLowerCase().includes("bass")) clef = "bass";
      continue;
    }
    // Skip header lines (X: M: L: etc)
    if (/^[A-Z]:/.test(line)) continue;
    if (line) bodyLines.push(line);
  }

  const body = bodyLines.join(" ");
  const notes = parseAbcBody(body, clef);

  return { clef, notes };
}

/* ── Component ────────────────────────────────────────────── */

export default function NotationRenderer({ notation, width = 320 }: NotationRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const render = useCallback(async () => {
    const el = containerRef.current;
    if (!el || !notation) return;

    // Clear previous render
    el.innerHTML = "";

    try {
      const VexModule = await import("vexflow");
      // Handle various module wrapper shapes from webpack
      const Vex = VexModule.default || VexModule;
      const Renderer = Vex.Renderer || VexModule.Renderer;
      const Stave = Vex.Stave || VexModule.Stave;
      const StaveNote = Vex.StaveNote || VexModule.StaveNote;
      const Voice = Vex.Voice || VexModule.Voice;
      const Formatter = Vex.Formatter || VexModule.Formatter;
      const Accidental = Vex.Accidental || VexModule.Accidental;

      const parsed = parseAbc(notation);
      if (parsed.notes.length === 0) return;

      const renderer = new Renderer(el, Renderer.Backends.SVG);
      const noteCount = parsed.notes.length;
      // Compact stave: just wide enough for clef + notes, no excess
      const clefSpace = 45;
      const noteSpace = noteCount <= 1 ? 50 : noteCount * 45;
      const staveWidth = clefSpace + noteSpace + 20;
      const height = 150;
      const totalWidth = Math.max(width, staveWidth + 20);
      renderer.resize(totalWidth, height);

      const context = renderer.getContext();
      context.setFont("Arial", 10);
      // Center the staff horizontally
      const offsetX = Math.max(0, (totalWidth - staveWidth - 10) / 2);
      context.scale(1.15, 1.15);

      const stave = new Stave(offsetX / 1.15 + 5, 20, staveWidth);
      stave.addClef(parsed.clef);
      stave.setContext(context).draw();

      const vexNotes = parsed.notes.map((n) => {
        const note = new StaveNote({
          keys: n.keys,
          duration: n.duration,
          clef: parsed.clef,
        });
        // Short, realistic ledger lines
        note.setLedgerLineStyle({ strokeStyle: '#444', lineWidth: 1.2 });
        if (n.accidentals) {
          for (const acc of n.accidentals) {
            note.addModifier(new Accidental(acc.type), acc.index);
          }
        }
        return note;
      });

      // Calculate total beats
      const durationBeats: Record<string, number> = { w: 4, h: 2, q: 1, "8": 0.5, "16": 0.25 };
      const totalBeats = vexNotes.reduce((sum, n) => sum + (durationBeats[n.getDuration()] || 1), 0);
      const numBeats = Math.max(4, Math.ceil(totalBeats));

      const voice = new Voice({ numBeats: numBeats, beatValue: 4 });
      voice.setStrict(false);
      voice.addTickables(vexNotes);

      // Tight formatting so notes sit close to the clef
      const formatWidth = Math.max(40, noteSpace);
      new Formatter().joinVoices([voice]).format([voice], formatWidth);
      voice.draw(context, stave);
    } catch (e) {
      console.error("VexFlow render error:", e);
      el.innerHTML = '<p style="color:#f59e0b;text-align:center;padding:20px;font-size:14px;">Could not render notation</p>';
    }
  }, [notation, width]);

  useEffect(() => {
    const timer = setTimeout(render, 30);
    return () => clearTimeout(timer);
  }, [render]);

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden bg-white"
      style={{ minHeight: 150, minWidth: width }}
    />
  );
}
