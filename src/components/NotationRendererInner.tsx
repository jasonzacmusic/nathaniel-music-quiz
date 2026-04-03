"use client";

import { useEffect, useRef } from "react";

interface NotationRendererInnerProps {
  notation: string;
  width?: number;
}

/* ═══ ABC Parser ═══ */

function normalizeAbc(raw: string): string {
  const bs = "\\" + "n";
  return raw.includes(bs) ? raw.split(bs).join("\n") : raw;
}

interface VexNote {
  keys: string[];
  duration: string;
  accidentals?: { index: number; type: string }[];
}

interface ParsedNotation {
  clef: "treble" | "bass";
  keySignature: string;
  notes: VexNote[];
  hasKeySignatureOnly: boolean;
}

function abcKeyToVex(kLine: string): { clef: "treble" | "bass"; key: string } {
  const lower = kLine.toLowerCase();
  const clef: "treble" | "bass" = lower.includes("bass") ? "bass" : "treble";

  // Extract key from K: line — e.g. "K:F", "K:^C", "K:^Gmin", "K:Amin", "K:C clef=treble"
  let keyPart = kLine.replace(/^K:\s*/, "").replace(/clef=\w+/i, "").trim();
  if (!keyPart || keyPart === "C") return { clef, key: "C" };

  // Handle ABC sharp/flat prefix
  let root = "";
  let i = 0;
  if (keyPart[i] === "^") { root += "#"; i++; }
  else if (keyPart[i] === "_") { root += "b"; i++; }

  if (i < keyPart.length && /[A-Ga-g]/.test(keyPart[i])) {
    root = keyPart[i].toUpperCase() + root;
    i++;
  }

  // Check for minor
  const rest = keyPart.slice(i).toLowerCase();
  if (rest.startsWith("min") || rest === "m") {
    root += "m";
  }

  // Map to VexFlow key names
  const keyMap: Record<string, string> = {
    "C": "C", "G": "G", "D": "D", "A": "A", "E": "E", "B": "B",
    "F#": "F#", "C#": "C#",
    "F": "F", "Bb": "Bb", "Eb": "Eb", "Ab": "Ab", "Db": "Db", "Gb": "Gb",
    "Am": "Am", "Em": "Em", "Bm": "Bm", "F#m": "F#m", "C#m": "C#m", "G#m": "G#m",
    "Dm": "Dm", "Gm": "Gm", "Cm": "Cm", "Fm": "Fm", "Bbm": "Bbm", "Ebm": "Ebm",
  };

  return { clef, key: keyMap[root] || "C" };
}

function parseAbcNote(token: string, clef: string): { key: string; accidental?: string } {
  let accidental: string | undefined;
  let i = 0;

  // Parse accidentals
  if (token[i] === "^") {
    i++;
    if (token[i] === "^") { accidental = "##"; i++; }
    else accidental = "#";
  } else if (token[i] === "_") {
    i++;
    if (token[i] === "_") { accidental = "bb"; i++; }
    else accidental = "b";
  } else if (token[i] === "=") {
    accidental = "n"; i++;
  }

  const letter = token[i];
  if (!letter || !/[A-Ga-g]/.test(letter)) return { key: clef === "bass" ? "C/3" : "C/4" };
  i++;

  const isLower = letter === letter.toLowerCase();
  const noteName = letter.toUpperCase();
  let octave = clef === "bass" ? (isLower ? 4 : 3) : (isLower ? 5 : 4);

  while (i < token.length) {
    if (token[i] === ",") { octave--; i++; }
    else if (token[i] === "'") { octave++; i++; }
    else break;
  }

  return { key: `${noteName}/${octave}`, accidental };
}

function parseAbcBody(body: string, clef: string): VexNote[] {
  const notes: VexNote[] = [];
  const s = body.replace(/\|/g, " ").replace(/\s+/g, " ").trim();
  let i = 0;

  while (i < s.length) {
    if (s[i] === " ") { i++; continue; }
    if (s[i] === "x" || s[i] === "z") { i++; continue; } // invisible/rest
    if (s[i] === "(" && s[i + 1] >= "0" && s[i + 1] <= "9") { i += 2; continue; }

    // Chord: [notes]
    if (s[i] === "[") {
      i++;
      const keys: string[] = [];
      const accs: { index: number; type: string }[] = [];
      while (i < s.length && s[i] !== "]") {
        let tok = "";
        while (i < s.length && s[i] !== "]" && !"ABCDEFGabcdefg".includes(s[i]) && "^_=".includes(s[i])) {
          tok += s[i]; i++;
        }
        if (i < s.length && s[i] !== "]" && /[A-Ga-g]/.test(s[i])) {
          tok += s[i]; i++;
          while (i < s.length && (s[i] === "," || s[i] === "'")) { tok += s[i]; i++; }
        }
        if (tok) {
          const v = parseAbcNote(tok, clef);
          if (v.accidental) accs.push({ index: keys.length, type: v.accidental });
          keys.push(v.key);
        }
      }
      if (s[i] === "]") i++;
      // Skip duration numbers after chord
      while (i < s.length && /[0-9/]/.test(s[i])) i++;
      if (keys.length > 0) {
        notes.push({ keys, duration: "w", accidentals: accs.length > 0 ? accs : undefined });
      }
      continue;
    }

    // Single note
    if (/[A-Ga-g^_=]/.test(s[i])) {
      let tok = "";
      while (i < s.length && "^_=".includes(s[i])) { tok += s[i]; i++; }
      if (i < s.length && /[A-Ga-g]/.test(s[i])) { tok += s[i]; i++; }
      while (i < s.length && (s[i] === "," || s[i] === "'")) { tok += s[i]; i++; }
      while (i < s.length && /[0-9/]/.test(s[i])) i++; // skip duration

      if (tok) {
        const v = parseAbcNote(tok, clef);
        const acc = v.accidental ? [{ index: 0, type: v.accidental }] : undefined;
        notes.push({ keys: [v.key], duration: "q", accidentals: acc });
      }
      continue;
    }
    i++;
  }

  // Single note/chord → whole note
  if (notes.length === 1) notes[0].duration = "w";

  return notes;
}

function parseNotation(raw: string): ParsedNotation {
  const abc = normalizeAbc(raw);
  const lines = abc.split("\n").map(l => l.trim());

  let clef: "treble" | "bass" = "treble";
  let keySignature = "C";
  const bodyLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("K:")) {
      const parsed = abcKeyToVex(line);
      clef = parsed.clef;
      keySignature = parsed.key;
      continue;
    }
    if (/^[A-Z]:/.test(line)) continue;
    if (line) bodyLines.push(line);
  }

  const body = bodyLines.join(" ").trim();
  const hasKeySignatureOnly = !body || body === "x" || body === "z";
  const notes = hasKeySignatureOnly ? [] : parseAbcBody(body, clef);

  return { clef, keySignature, notes, hasKeySignatureOnly };
}

/* ═══ VexFlow Renderer ═══ */

export default function NotationRendererInner({ notation, width = 320 }: NotationRendererInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !notation) return;
    el.innerHTML = "";

    (async () => {
      try {
        const VexModule = await import("vexflow");
        const Vex = VexModule.default || VexModule;
        const Renderer = Vex.Renderer || VexModule.Renderer;
        const Stave = Vex.Stave || VexModule.Stave;
        const StaveNote = Vex.StaveNote || VexModule.StaveNote;
        const Voice = Vex.Voice || VexModule.Voice;
        const Formatter = Vex.Formatter || VexModule.Formatter;
        const Accidental = Vex.Accidental || VexModule.Accidental;
        const KeySignature = Vex.KeySignature || VexModule.KeySignature;
        const GhostNote = Vex.GhostNote || VexModule.GhostNote;

        const parsed = parseNotation(notation);

        // Calculate dimensions
        const noteCount = parsed.notes.length;
        const hasKeySig = parsed.keySignature !== "C";
        const keySigSpace = hasKeySig ? 40 : 0;
        const clefSpace = 50;
        let staveWidth: number;

        if (parsed.hasKeySignatureOnly) {
          staveWidth = clefSpace + keySigSpace + 40;
        } else if (noteCount <= 1) {
          staveWidth = clefSpace + keySigSpace + 60;
        } else if (noteCount <= 4) {
          staveWidth = clefSpace + keySigSpace + noteCount * 55;
        } else {
          staveWidth = clefSpace + keySigSpace + noteCount * 40 + 30;
        }

        staveWidth = Math.min(staveWidth, width - 20);
        const svgHeight = 180;
        const svgWidth = Math.max(staveWidth + 30, 180);

        const renderer = new Renderer(el, Renderer.Backends.SVG);
        renderer.resize(svgWidth, svgHeight);
        const context = renderer.getContext();

        // High quality rendering settings
        context.setFont("Bravura, Academico, serif", 10);
        const scale = 1.2;
        context.scale(scale, scale);

        // Center the stave
        const offsetX = Math.max(5, ((svgWidth / scale) - staveWidth) / 2);
        const stave = new Stave(offsetX, 25, staveWidth);
        stave.addClef(parsed.clef);

        if (hasKeySig) {
          stave.addKeySignature(parsed.keySignature);
        }

        // Professional stave styling
        stave.setStyle({ strokeStyle: "#333", lineWidth: 1.0 });
        stave.setContext(context).draw();

        // If key-signature-only question, render a ghost note to fill the voice
        if (parsed.hasKeySignatureOnly) {
          if (GhostNote) {
            const ghost = new GhostNote({ duration: "w" });
            const voice = new Voice({ numBeats: 4, beatValue: 4 });
            voice.setStrict(false);
            voice.addTickables([ghost]);
            new Formatter().joinVoices([voice]).format([voice], 30);
            voice.draw(context, stave);
          }
          return;
        }

        if (parsed.notes.length === 0) return;

        // Create VexFlow notes
        const vexNotes = parsed.notes.map(n => {
          const note = new StaveNote({
            keys: n.keys,
            duration: n.duration,
            clef: parsed.clef,
            autoStem: true,
          });

          // Professional ledger line styling — thin, proportional
          note.setLedgerLineStyle({
            strokeStyle: "#555",
            lineWidth: 1.0,
            // Note: VexFlow controls ledger line length based on note head width
          });

          // Note head styling
          note.setStyle({ strokeStyle: "#222", fillStyle: "#222" });

          if (n.accidentals) {
            for (const acc of n.accidentals) {
              note.addModifier(new Accidental(acc.type), acc.index);
            }
          }

          return note;
        });

        // Calculate beats
        const durationBeats: Record<string, number> = { w: 4, h: 2, q: 1, "8": 0.5, "16": 0.25 };
        const totalBeats = vexNotes.reduce((sum, n) => sum + (durationBeats[n.getDuration()] || 1), 0);
        const numBeats = Math.max(4, Math.ceil(totalBeats));

        const voice = new Voice({ numBeats, beatValue: 4 });
        voice.setStrict(false);
        voice.addTickables(vexNotes);

        // Tight formatting for clean spacing
        const formatWidth = noteCount <= 1
          ? 40
          : noteCount <= 4
            ? Math.max(60, (staveWidth - clefSpace - keySigSpace) * 0.85)
            : staveWidth - clefSpace - keySigSpace - 15;

        new Formatter().joinVoices([voice]).format([voice], formatWidth);
        voice.draw(context, stave);

        // Post-render: style SVG for crisp rendering
        const svg = el.querySelector("svg");
        if (svg) {
          svg.style.maxWidth = "100%";
          svg.style.height = "auto";
          svg.setAttribute("shape-rendering", "geometricPrecision");
        }
      } catch (e) {
        console.error("VexFlow render error:", e);
        el.innerHTML = '<p style="color:#b45309;text-align:center;padding:20px;font-size:14px;">Could not render notation</p>';
      }
    })();
  }, [notation, width]);

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden bg-white flex items-center justify-center"
      style={{ minHeight: 140, minWidth: Math.min(width, 320) }}
    />
  );
}
