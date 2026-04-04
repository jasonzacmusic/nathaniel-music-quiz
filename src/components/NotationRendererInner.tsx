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
  isRest?: boolean;
  dots?: number;
  tieToNext?: boolean;
  tupletGroup?: number;
}

interface ParsedNotation {
  clef: "treble" | "bass";
  keySignature: string;
  timeSignature?: string;
  notes: VexNote[];
  hasKeySignatureOnly: boolean;
}

function abcKeyToVex(kLine: string): { clef: "treble" | "bass"; key: string } {
  const lower = kLine.toLowerCase();
  const clef: "treble" | "bass" = lower.includes("bass") ? "bass" : "treble";

  // Extract key from K: line — e.g. "K:F", "K:^C", "K:^Gmin", "K:Amin", "K:C clef=treble"
  const keyPart = kLine.replace(/^K:\s*/, "").replace(/clef=\w+/i, "").trim();
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

/**
 * Convert ABC duration to VexFlow duration string + dot count.
 * baseBeats = how many beats the base L: unit represents (e.g. L:1/4 = 1 beat, L:1 = 4 beats)
 * durationMul = the ABC multiplier on the note (e.g. "2" doubles, "/2" halves)
 */
function abcDurationToVex(baseBeats: number, durationStr: string): { duration: string; dots: number } {
  let mul = 1;
  if (durationStr) {
    if (durationStr.includes("/")) {
      const parts = durationStr.split("/");
      const num = parseInt(parts[0]) || 1;
      const den = parseInt(parts[1]) || 2;
      mul = num / den;
    } else {
      mul = parseInt(durationStr) || 1;
    }
  }
  const totalBeats = baseBeats * mul;

  // Check for dotted values first (1.5x a standard value)
  // Dotted whole = 6, dotted half = 3, dotted quarter = 1.5, dotted eighth = 0.75, dotted sixteenth = 0.375
  if (Math.abs(totalBeats - 6) < 0.01) return { duration: "w", dots: 1 };
  if (Math.abs(totalBeats - 3) < 0.01) return { duration: "h", dots: 1 };
  if (Math.abs(totalBeats - 1.5) < 0.01) return { duration: "q", dots: 1 };
  if (Math.abs(totalBeats - 0.75) < 0.01) return { duration: "8", dots: 1 };
  if (Math.abs(totalBeats - 0.375) < 0.01) return { duration: "16", dots: 1 };

  // Standard values
  if (totalBeats >= 4) return { duration: "w", dots: 0 };
  if (totalBeats >= 2) return { duration: "h", dots: 0 };
  if (totalBeats >= 1) return { duration: "q", dots: 0 };
  if (totalBeats >= 0.5) return { duration: "8", dots: 0 };
  if (totalBeats >= 0.25) return { duration: "16", dots: 0 };
  return { duration: "q", dots: 0 };
}

function parseAbcBody(body: string, clef: string, baseBeats: number): VexNote[] {
  const notes: VexNote[] = [];
  const s = body.replace(/\|/g, " ").replace(/\s+/g, " ").trim();
  let i = 0;
  let tupletGroupId = 0;
  let tupletRemaining = 0;
  let currentTupletGroup = -1;

  while (i < s.length) {
    if (s[i] === " ") { i++; continue; }
    if (s[i] === "x") { i++; continue; } // invisible rest — skip

    // Tuplet marker: (3, (5, (7 etc.
    if (s[i] === "(" && i + 1 < s.length && s[i + 1] >= "2" && s[i + 1] <= "9") {
      tupletRemaining = parseInt(s[i + 1]);
      currentTupletGroup = tupletGroupId++;
      i += 2;
      continue;
    }

    // Rest: z with optional duration
    if (s[i] === "z") {
      i++;
      let durStr = "";
      while (i < s.length && /[0-9/]/.test(s[i])) { durStr += s[i]; i++; }
      const { duration, dots } = abcDurationToVex(baseBeats, durStr);
      const restKey = clef === "bass" ? "D/3" : "B/4";
      const note: VexNote = { keys: [restKey], duration: duration + "r", isRest: true };
      if (dots > 0) note.dots = dots;
      if (tupletRemaining > 0) {
        note.tupletGroup = currentTupletGroup;
        tupletRemaining--;
      }
      notes.push(note);
      continue;
    }

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
      let durStr = "";
      while (i < s.length && /[0-9/]/.test(s[i])) { durStr += s[i]; i++; }
      if (keys.length > 0) {
        // Sort chord notes from lowest to highest pitch (VexFlow requires this)
        const noteOrder = "CDEFGAB";
        const indexed = keys.map((k, idx) => {
          const [noteName, octStr] = k.split("/");
          const oct = parseInt(octStr);
          const pitch = oct * 7 + noteOrder.indexOf(noteName);
          const acc = accs.find(a => a.index === idx);
          return { key: k, pitch, accType: acc?.type };
        });
        indexed.sort((a, b) => a.pitch - b.pitch);
        const sortedKeys = indexed.map(n => n.key);
        const sortedAccs: { index: number; type: string }[] = [];
        indexed.forEach((n, newIdx) => {
          if (n.accType) sortedAccs.push({ index: newIdx, type: n.accType });
        });

        const { duration, dots } = durStr ? abcDurationToVex(baseBeats, durStr) : { duration: "w", dots: 0 };
        const chordNote: VexNote = {
          keys: sortedKeys,
          duration,
          accidentals: sortedAccs.length > 0 ? sortedAccs : undefined,
        };
        if (dots > 0) chordNote.dots = dots;
        notes.push(chordNote);
      }
      continue;
    }

    // Single note
    if (/[A-Ga-g^_=]/.test(s[i])) {
      let tok = "";
      while (i < s.length && "^_=".includes(s[i])) { tok += s[i]; i++; }
      if (i < s.length && /[A-Ga-g]/.test(s[i])) { tok += s[i]; i++; }
      while (i < s.length && (s[i] === "," || s[i] === "'")) { tok += s[i]; i++; }
      // Capture duration modifier (e.g. "2", "4", "/2", "3/2")
      let durStr = "";
      while (i < s.length && /[0-9/]/.test(s[i])) { durStr += s[i]; i++; }

      // Check for tie marker
      let tieToNext = false;
      if (i < s.length && s[i] === "-") {
        tieToNext = true;
        i++;
      }

      if (tok) {
        const v = parseAbcNote(tok, clef);
        const acc = v.accidental ? [{ index: 0, type: v.accidental }] : undefined;
        const { duration, dots } = abcDurationToVex(baseBeats, durStr);
        const note: VexNote = { keys: [v.key], duration, accidentals: acc };
        if (dots > 0) note.dots = dots;
        if (tieToNext) note.tieToNext = true;
        if (tupletRemaining > 0) {
          note.tupletGroup = currentTupletGroup;
          tupletRemaining--;
        }
        notes.push(note);
      }
      continue;
    }
    i++;
  }

  // Single note/chord with no explicit duration → whole note
  if (notes.length === 1 && notes[0].duration === "q") notes[0].duration = "w";

  return notes;
}

function parseNotation(raw: string): ParsedNotation {
  const abc = normalizeAbc(raw);
  const lines = abc.split("\n").map(l => l.trim());

  let clef: "treble" | "bass" = "treble";
  let keySignature = "C";
  let timeSignature: string | undefined;
  let baseBeats = 1; // default: L:1/4 = 1 beat per unit
  const bodyLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("K:")) {
      const parsed = abcKeyToVex(line);
      clef = parsed.clef;
      keySignature = parsed.key;
      continue;
    }
    if (line.startsWith("L:")) {
      // Parse base note length: L:1/4 = quarter (1 beat), L:1/8 = eighth (0.5), L:1 = whole (4 beats)
      const lMatch = line.match(/L:\s*(\d+)\/?(\d*)/);
      if (lMatch) {
        const num = parseInt(lMatch[1]);
        const den = lMatch[2] ? parseInt(lMatch[2]) : 1;
        // Convert fraction to beats: 1/4 = 1 beat, 1/8 = 0.5, 1 = 4, 1/2 = 2, 1/16 = 0.25
        baseBeats = (num / den) * 4;
      }
      continue;
    }
    if (line.startsWith("M:")) {
      const mMatch = line.match(/M:\s*(.+)/);
      if (mMatch) {
        const ts = mMatch[1].trim();
        if (ts !== "4/4" && ts !== "none") {
          timeSignature = ts;
        }
      }
      continue;
    }
    if (/^[A-Z]:/.test(line)) continue;
    if (line) bodyLines.push(line);
  }

  const body = bodyLines.join(" ").trim();
  const hasKeySignatureOnly = !body || body === "x" || body === "z";
  const notes = hasKeySignatureOnly ? [] : parseAbcBody(body, clef, baseBeats);

  // Show time signature for rhythm-style questions (multiple notes or contains rests)
  const hasRests = notes.some(n => n.isRest);
  const showTimeSig = timeSignature && (notes.length > 1 || hasRests);

  return { clef, keySignature, timeSignature: showTimeSig ? timeSignature : undefined, notes, hasKeySignatureOnly };
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
        const GhostNote = Vex.GhostNote || VexModule.GhostNote;
        const Beam = Vex.Beam || VexModule.Beam;
        const Dot = Vex.Dot || VexModule.Dot;
        const StaveTie = Vex.StaveTie || VexModule.StaveTie;
        const Tuplet = Vex.Tuplet || VexModule.Tuplet;

        const parsed = parseNotation(notation);

        // Calculate dimensions
        const noteCount = parsed.notes.length;
        const hasKeySig = parsed.keySignature !== "C";
        const isChord = noteCount === 1 && parsed.notes[0]?.keys.length > 1;
        const hasAccidentals = parsed.notes.some(n => n.accidentals && n.accidentals.length > 0);
        const accidentalSpace = hasAccidentals ? 20 : 0;
        const clefSpace = 50;
        const timeSigSpace = parsed.timeSignature ? 30 : 0;

        // Key sig space depends on number of sharps/flats
        const keySigAccidentals: Record<string, number> = {
          "C": 0, "Am": 0,
          "G": 1, "Em": 1, "F": 1, "Dm": 1,
          "D": 2, "Bm": 2, "Bb": 2, "Gm": 2,
          "A": 3, "F#m": 3, "Eb": 3, "Cm": 3,
          "E": 4, "C#m": 4, "Ab": 4, "Fm": 4,
          "B": 5, "G#m": 5, "Db": 5, "Bbm": 5,
          "F#": 6, "D#m": 6, "Gb": 6, "Ebm": 6,
          "C#": 7,
        };
        const numKeySigMarks = keySigAccidentals[parsed.keySignature] || 0;
        const keySigSpace = hasKeySig ? 15 + numKeySigMarks * 8 : 0;

        let staveWidth: number;

        if (parsed.hasKeySignatureOnly) {
          // Key signature only — tight: just clef + key sig + small margin
          staveWidth = clefSpace + keySigSpace + timeSigSpace + 15;
        } else if (isChord) {
          staveWidth = clefSpace + keySigSpace + timeSigSpace + accidentalSpace + 65;
        } else if (noteCount <= 1) {
          staveWidth = clefSpace + keySigSpace + timeSigSpace + accidentalSpace + 50;
        } else if (noteCount <= 4) {
          staveWidth = clefSpace + keySigSpace + timeSigSpace + noteCount * 50 + accidentalSpace;
        } else {
          // Scales and rhythm patterns — generous width
          staveWidth = clefSpace + keySigSpace + timeSigSpace + noteCount * 35 + 40;
        }

        // Allow scales/rhythm to use full available width
        const maxWidth = noteCount > 4 ? width - 10 : width - 20;
        staveWidth = Math.min(staveWidth, maxWidth);
        if (noteCount > 5) staveWidth = Math.max(staveWidth, Math.min(maxWidth, 300));

        const svgHeight = 180;
        const svgWidth = Math.max(staveWidth + 30, 160);

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

        if (parsed.timeSignature) {
          stave.addTimeSignature(parsed.timeSignature);
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

          // Ledger line pre-styling (post-render CSS fixes the width)
          note.setLedgerLineStyle({
            strokeStyle: "#444",
            lineWidth: 1.0,
          });

          // Crisp note head styling
          note.setStyle({ strokeStyle: "#1a1a1a", fillStyle: "#1a1a1a" });

          if (n.accidentals) {
            for (const acc of n.accidentals) {
              note.addModifier(new Accidental(acc.type), acc.index);
            }
          }

          // Add dots
          if (n.dots && n.dots > 0 && Dot) {
            for (let d = 0; d < n.dots; d++) {
              Dot.buildAndAttach([note], { all: true });
            }
          }

          return note;
        });

        // Calculate beats — account for dots (add 50% per dot)
        const durationBeats: Record<string, number> = { w: 4, h: 2, q: 1, "8": 0.5, "16": 0.25 };
        const totalBeats = parsed.notes.reduce((sum, n) => {
          const baseDur = n.duration.replace("r", ""); // strip rest suffix
          let beats = durationBeats[baseDur] || 1;
          if (n.dots) beats *= 1.5;
          return sum + beats;
        }, 0);
        const numBeats = Math.max(4, Math.ceil(totalBeats));

        const voice = new Voice({ numBeats, beatValue: 4 });
        voice.setStrict(false);
        voice.addTickables(vexNotes);

        // Format width: tight for single notes, spacious for scales/rhythm
        const availableWidth = staveWidth - clefSpace - keySigSpace - timeSigSpace;
        const formatWidth = noteCount <= 1
          ? Math.max(40, availableWidth * 0.6)
          : noteCount <= 4
            ? Math.max(60, availableWidth * 0.85)
            : availableWidth - 10;

        new Formatter().joinVoices([voice]).format([voice], formatWidth);

        // Create beams BEFORE drawing so VexFlow suppresses flags on beamed notes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let beams: any[] = [];
        if (Beam && noteCount > 1) {
          try {
            const hasBeamable = vexNotes.some((n, idx) => {
              const dur = n.getDuration();
              return (dur === "8" || dur === "16") && !parsed.notes[idx].isRest;
            });
            if (hasBeamable) {
              const Fraction = Vex.Fraction || VexModule.Fraction;
              // Beat-based beam grouping per standard music notation rules
              let groups: InstanceType<typeof Fraction>[] | undefined;
              if (Fraction) {
                const ts = parsed.timeSignature || "4/4";
                if (ts === "6/8" || ts === "9/8" || ts === "12/8") {
                  // Compound meter: beam in groups of 3 eighth notes
                  groups = [new Fraction(3, 8)];
                } else if (ts === "3/4") {
                  // Simple triple: beam per beat (1 quarter = 2 eighths)
                  groups = [new Fraction(2, 8)];
                } else if (ts === "2/4") {
                  // Simple duple: beam per beat
                  groups = [new Fraction(2, 8)];
                } else {
                  // 4/4 default: beam per beat (groups of 2 eighths / 4 sixteenths)
                  groups = [new Fraction(2, 8)];
                }
              }
              beams = Beam.generateBeams(vexNotes, {
                groups,
                maintainStemDirections: true,
              });
            }
          } catch {
            // Beaming is optional — don't crash if it fails
          }
        }

        voice.draw(context, stave);

        // Draw beams after voice (beams render on top of stems)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        beams.forEach((beam: any) => {
          try { beam.setContext(context).draw(); } catch { /* skip */ }
        });

        // Render ties
        if (StaveTie) {
          for (let idx = 0; idx < parsed.notes.length - 1; idx++) {
            if (parsed.notes[idx].tieToNext) {
              try {
                const tie = new StaveTie({
                  firstNote: vexNotes[idx],
                  lastNote: vexNotes[idx + 1],
                  firstIndexes: [0],
                  lastIndexes: [0],
                });
                tie.setContext(context).draw();
              } catch {
                // Tie rendering is optional
              }
            }
          }
        }

        // Render tuplets
        if (Tuplet) {
          const tupletGroups = new Map<number, typeof vexNotes>();
          parsed.notes.forEach((n, idx) => {
            if (n.tupletGroup !== undefined) {
              if (!tupletGroups.has(n.tupletGroup)) tupletGroups.set(n.tupletGroup, []);
              tupletGroups.get(n.tupletGroup)!.push(vexNotes[idx]);
            }
          });
          tupletGroups.forEach((group) => {
            try {
              const tuplet = new Tuplet(group, {
                numNotes: group.length,
                notesOccupied: 2,
                bracketed: true,
              });
              tuplet.setContext(context).draw();
            } catch {
              // Tuplet rendering is optional
            }
          });
        }

        // Post-render SVG quality enhancements
        const svg = el.querySelector("svg");
        if (svg) {
          svg.style.maxWidth = "100%";
          svg.style.height = "auto";
          svg.setAttribute("shape-rendering", "geometricPrecision");

          // Fix ledger lines: VexFlow draws them too wide by default.
          // Shorten them to ~1.6x note head width (theory standard).
          svg.querySelectorAll(".vf-ledger-line, [class*='ledger']").forEach(line => {
            const pathEl = line as SVGElement;
            pathEl.setAttribute("stroke-width", "1.0");
            pathEl.setAttribute("stroke", "#444");
          });

          // Also target ledger lines by their characteristic: short horizontal
          // lines drawn outside the staff. VexFlow renders them as <path> or <line>.
          svg.querySelectorAll("line").forEach(line => {
            const y1 = parseFloat(line.getAttribute("y1") || "0");
            const y2 = parseFloat(line.getAttribute("y2") || "0");
            const x1 = parseFloat(line.getAttribute("x1") || "0");
            const x2 = parseFloat(line.getAttribute("x2") || "0");
            const isHorizontal = Math.abs(y1 - y2) < 0.5;
            const lineLen = Math.abs(x2 - x1);

            // Ledger lines are short horizontal lines (typically 15-30px)
            // Staff lines span the full stave width (much longer)
            if (isHorizontal && lineLen > 10 && lineLen < 50) {
              // Shorten by 25% on each side
              const cx = (x1 + x2) / 2;
              const newHalf = lineLen * 0.38; // ~76% of original
              line.setAttribute("x1", String(cx - newHalf));
              line.setAttribute("x2", String(cx + newHalf));
              line.setAttribute("stroke-width", "1.0");
              line.setAttribute("stroke", "#444");
            }
          });
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
