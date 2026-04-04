#!/usr/bin/env node
/**
 * Comprehensive Staff Notation Question Generator
 * Generates ~1,100+ questions across 6 categories with 3 difficulty levels.
 * Output: staff_notation_generated.csv matching the existing import schema.
 */

import { writeFileSync } from "fs";

// ═══════════════════════════════════════════════════════════════════
// MUSIC THEORY DATA TABLES
// ═══════════════════════════════════════════════════════════════════

const NOTE_NAMES = ["C", "D", "E", "F", "G", "A", "B"];
const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const CHROMATIC_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// All 12 roots with sharp and flat spellings
const ALL_ROOTS = [
  { name: "C", sharp: "C", flat: "C", semitone: 0 },
  { name: "C#", sharp: "C#", flat: "Db", semitone: 1 },
  { name: "D", sharp: "D", flat: "D", semitone: 2 },
  { name: "Eb", sharp: "D#", flat: "Eb", semitone: 3 },
  { name: "E", sharp: "E", flat: "E", semitone: 4 },
  { name: "F", sharp: "F", flat: "F", semitone: 5 },
  { name: "F#", sharp: "F#", flat: "Gb", semitone: 6 },
  { name: "G", sharp: "G", flat: "G", semitone: 7 },
  { name: "Ab", sharp: "G#", flat: "Ab", semitone: 8 },
  { name: "A", sharp: "A", flat: "A", semitone: 9 },
  { name: "Bb", sharp: "A#", flat: "Bb", semitone: 10 },
  { name: "B", sharp: "B", flat: "B", semitone: 11 },
];

// Circle of fifths order for key difficulty
const EASY_KEYS = ["C", "G", "D", "F", "Bb"];        // 0-2 sharps/flats
const MEDIUM_KEYS = ["A", "E", "Eb", "Ab"];           // 3-4 sharps/flats
const HARD_KEYS = ["B", "F#", "Db", "Gb", "C#", "Cb"]; // 5-7 sharps/flats

// Key signatures: key name -> { sharps/flats count, VexFlow key, accidentals }
const KEY_SIGNATURES = {
  // Major keys
  "C Major":  { sharps: 0, flats: 0, vexKey: "C", abc: "C" },
  "G Major":  { sharps: 1, flats: 0, vexKey: "G", abc: "G" },
  "D Major":  { sharps: 2, flats: 0, vexKey: "D", abc: "D" },
  "A Major":  { sharps: 3, flats: 0, vexKey: "A", abc: "A" },
  "E Major":  { sharps: 4, flats: 0, vexKey: "E", abc: "E" },
  "B Major":  { sharps: 5, flats: 0, vexKey: "B", abc: "B" },
  "F# Major": { sharps: 6, flats: 0, vexKey: "F#", abc: "^F" },
  "C# Major": { sharps: 7, flats: 0, vexKey: "C#", abc: "^C" },
  "F Major":  { sharps: 0, flats: 1, vexKey: "F", abc: "F" },
  "Bb Major": { sharps: 0, flats: 2, vexKey: "Bb", abc: "_B" },
  "Eb Major": { sharps: 0, flats: 3, vexKey: "Eb", abc: "_E" },
  "Ab Major": { sharps: 0, flats: 4, vexKey: "Ab", abc: "_A" },
  "Db Major": { sharps: 0, flats: 5, vexKey: "Db", abc: "_D" },
  "Gb Major": { sharps: 0, flats: 6, vexKey: "Gb", abc: "_G" },
  // Minor keys
  "A Minor":  { sharps: 0, flats: 0, vexKey: "Am", abc: "Am" },
  "E Minor":  { sharps: 1, flats: 0, vexKey: "Em", abc: "Em" },
  "B Minor":  { sharps: 2, flats: 0, vexKey: "Bm", abc: "Bm" },
  "F# Minor": { sharps: 3, flats: 0, vexKey: "F#m", abc: "^Fm" },
  "C# Minor": { sharps: 4, flats: 0, vexKey: "C#m", abc: "^Cm" },
  "G# Minor": { sharps: 5, flats: 0, vexKey: "G#m", abc: "^Gm" },
  "D Minor":  { sharps: 0, flats: 1, vexKey: "Dm", abc: "Dm" },
  "G Minor":  { sharps: 0, flats: 2, vexKey: "Gm", abc: "Gm" },
  "C Minor":  { sharps: 0, flats: 3, vexKey: "Cm", abc: "Cm" },
  "F Minor":  { sharps: 0, flats: 4, vexKey: "Fm", abc: "Fm" },
  "Bb Minor": { sharps: 0, flats: 5, vexKey: "Bbm", abc: "_Bm" },
  "Eb Minor": { sharps: 0, flats: 6, vexKey: "Ebm", abc: "_Em" },
};

// Relative minor for each major key
const RELATIVE_MINOR = {
  "C Major": "A Minor", "G Major": "E Minor", "D Major": "B Minor",
  "A Major": "F# Minor", "E Major": "C# Minor", "B Major": "G# Minor",
  "F# Major": "D# Minor", "C# Major": "A# Minor",
  "F Major": "D Minor", "Bb Major": "G Minor", "Eb Major": "C Minor",
  "Ab Major": "F Minor", "Db Major": "Bb Minor", "Gb Major": "Eb Minor",
};

// Interval definitions
const INTERVALS = [
  { name: "Minor 2nd", semitones: 1, staffDist: 1 },
  { name: "Major 2nd", semitones: 2, staffDist: 1 },
  { name: "Minor 3rd", semitones: 3, staffDist: 2 },
  { name: "Major 3rd", semitones: 4, staffDist: 2 },
  { name: "Perfect 4th", semitones: 5, staffDist: 3 },
  { name: "Tritone", semitones: 6, staffDist: 3 },
  { name: "Perfect 5th", semitones: 7, staffDist: 4 },
  { name: "Minor 6th", semitones: 8, staffDist: 5 },
  { name: "Major 6th", semitones: 9, staffDist: 5 },
  { name: "Minor 7th", semitones: 10, staffDist: 6 },
  { name: "Major 7th", semitones: 11, staffDist: 6 },
  { name: "Octave", semitones: 12, staffDist: 7 },
  // Compound
  { name: "Minor 9th", semitones: 13, staffDist: 8 },
  { name: "Major 9th", semitones: 14, staffDist: 8 },
  { name: "Minor 10th", semitones: 15, staffDist: 9 },
  { name: "Major 10th", semitones: 16, staffDist: 9 },
  { name: "Perfect 11th", semitones: 17, staffDist: 10 },
  { name: "Perfect 12th", semitones: 19, staffDist: 11 },
  // Augmented/Diminished
  { name: "Augmented 4th", semitones: 6, staffDist: 3 },
  { name: "Diminished 5th", semitones: 6, staffDist: 4 },
  { name: "Augmented 5th", semitones: 8, staffDist: 4 },
  { name: "Diminished 7th", semitones: 9, staffDist: 6 },
  { name: "Augmented 2nd", semitones: 3, staffDist: 1 },
];

// Chord definitions: name -> intervals from root (in semitones)
const CHORD_TYPES = {
  // Triads
  "Major": [0, 4, 7],
  "Minor": [0, 3, 7],
  "Diminished": [0, 3, 6],
  "Augmented": [0, 4, 8],
  // Seventh chords
  "Major 7th": [0, 4, 7, 11],
  "Minor 7th": [0, 3, 7, 10],
  "Dominant 7th": [0, 4, 7, 10],
  "Half-Diminished 7th": [0, 3, 6, 10],
  "Diminished 7th": [0, 3, 6, 9],
  // Extended
  "Major 9th": [0, 4, 7, 11, 14],
  "Minor 9th": [0, 3, 7, 10, 14],
  "Dominant 9th": [0, 4, 7, 10, 14],
  "Major 11th": [0, 4, 7, 11, 14, 17],
  "Dominant 13th": [0, 4, 7, 10, 14, 21],
  // Altered
  "Dominant 7th #9": [0, 4, 7, 10, 15],
  "Dominant 7th b9": [0, 4, 7, 10, 13],
  "Dominant 7th #11": [0, 4, 7, 10, 18],
  // Sus / Add
  "Sus2": [0, 2, 7],
  "Sus4": [0, 5, 7],
  "Add9": [0, 4, 7, 14],
  "Major 6th": [0, 4, 7, 9],
  "Minor 6th": [0, 3, 7, 9],
};

// Scale/mode definitions: name -> intervals from root
const SCALE_TYPES = {
  // Major modes
  "Major Scale": [0, 2, 4, 5, 7, 9, 11, 12],
  "Dorian": [0, 2, 3, 5, 7, 9, 10, 12],
  "Phrygian": [0, 1, 3, 5, 7, 8, 10, 12],
  "Lydian": [0, 2, 4, 6, 7, 9, 11, 12],
  "Mixolydian": [0, 2, 4, 5, 7, 9, 10, 12],
  "Natural Minor Scale": [0, 2, 3, 5, 7, 8, 10, 12],
  "Locrian": [0, 1, 3, 5, 6, 8, 10, 12],
  // Minor variants
  "Harmonic Minor Scale": [0, 2, 3, 5, 7, 8, 11, 12],
  "Melodic Minor Scale (ascending)": [0, 2, 3, 5, 7, 9, 11, 12],
  // Pentatonic & Blues
  "Major Pentatonic": [0, 2, 4, 7, 9, 12],
  "Minor Pentatonic": [0, 3, 5, 7, 10, 12],
  "Blues Scale": [0, 3, 5, 6, 7, 10, 12],
  // Exotic
  "Whole Tone Scale": [0, 2, 4, 6, 8, 10, 12],
  "Diminished Scale (half-whole)": [0, 1, 3, 4, 6, 7, 9, 10, 12],
  "Diminished Scale (whole-half)": [0, 2, 3, 5, 6, 8, 9, 11, 12],
  "Altered Scale": [0, 1, 3, 4, 6, 8, 10, 12],
  "Hungarian Minor": [0, 2, 3, 6, 7, 8, 11, 12],
  "Double Harmonic Major": [0, 1, 4, 5, 7, 8, 11, 12],
  "Phrygian Dominant": [0, 1, 4, 5, 7, 8, 10, 12],
  "Lydian Dominant": [0, 2, 4, 6, 7, 9, 10, 12],
  "Bebop Dominant": [0, 2, 4, 5, 7, 9, 10, 11, 12],
  "Bebop Major": [0, 2, 4, 5, 7, 8, 9, 11, 12],
  "Chromatic Scale": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};


// ═══════════════════════════════════════════════════════════════════
// ABC NOTATION HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Convert a note name + octave to ABC notation.
 * E.g. ("C", 4) -> "C", ("C", 5) -> "c", ("C", 3) -> "C,", ("F#", 4) -> "^F"
 */
function noteToAbc(noteName, octave, clef = "treble") {
  let acc = "";
  let letter = noteName;
  if (noteName.includes("#")) {
    acc = "^";
    letter = noteName.replace("#", "");
  } else if (noteName.includes("b") && noteName !== "B") {
    acc = "_";
    letter = noteName.replace("b", "");
  }

  // In ABC: uppercase = octave 4 (treble) or 3 (bass), lowercase = one octave up
  const baseOctave = clef === "bass" ? 3 : 4;
  let abc;
  if (octave >= baseOctave + 1) {
    abc = letter.toLowerCase();
    let extra = octave - (baseOctave + 1);
    while (extra > 0) { abc += "'"; extra--; }
  } else if (octave === baseOctave) {
    abc = letter.toUpperCase();
  } else {
    abc = letter.toUpperCase();
    let extra = baseOctave - octave;
    while (extra > 0) { abc += ","; extra--; }
  }

  return acc + abc;
}

/**
 * Convert semitone offset from a root to a note name.
 * Uses the circle of fifths spelling appropriate for the context.
 */
function semitoneToNote(rootSemitone, intervalSemitones, preferFlat = false) {
  const targetSemitone = (rootSemitone + intervalSemitones) % 12;
  return preferFlat ? CHROMATIC_FLAT[targetSemitone] : CHROMATIC[targetSemitone];
}

/**
 * Build full ABC notation string for a question.
 */
function buildAbc({ clef = "treble", key = "C", timeSig, baseLength = "1", body }) {
  let abc = `X:1\nM:${timeSig || "4/4"}\nL:${baseLength}\nK:${key}${clef === "bass" ? " clef=bass" : " clef=treble"}\n${body}`;
  return abc;
}

/**
 * Compute the ABC for a chord given root + intervals.
 */
function chordToAbc(rootName, rootOctave, intervals, clef = "treble") {
  const rootSemitone = CHROMATIC.indexOf(rootName) !== -1 ? CHROMATIC.indexOf(rootName) : CHROMATIC_FLAT.indexOf(rootName);
  const useFlat = CHROMATIC_FLAT.includes(rootName) && !CHROMATIC.includes(rootName) ||
                  ["F", "Bb", "Eb", "Ab", "Db", "Gb"].includes(rootName);

  const notes = intervals.map((interval, i) => {
    const targetSemitone = (rootSemitone + interval) % 12;
    const note = useFlat ? CHROMATIC_FLAT[targetSemitone] : CHROMATIC[targetSemitone];
    const octaveOffset = Math.floor((rootSemitone + interval) / 12);
    return noteToAbc(note, rootOctave + octaveOffset, clef);
  });

  return `[${notes.join("")}]`;
}

/**
 * Build ABC for a scale given root + intervals pattern.
 */
function scaleToAbc(rootName, rootOctave, intervals, clef = "treble") {
  const rootSemitone = CHROMATIC.indexOf(rootName) !== -1 ? CHROMATIC.indexOf(rootName) : CHROMATIC_FLAT.indexOf(rootName);
  const useFlat = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"].includes(rootName);

  return intervals.map(interval => {
    const targetSemitone = (rootSemitone + interval) % 12;
    const note = useFlat ? CHROMATIC_FLAT[targetSemitone] : CHROMATIC[targetSemitone];
    const octaveOffset = Math.floor((rootSemitone + interval) / 12);
    return noteToAbc(note, rootOctave + octaveOffset, clef);
  }).join("");
}

// CSV escaping
function csvEscape(val) {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return `"${s}"`;
}

// Pick N random distinct items from an array, excluding certain values
function pickRandom(arr, count, exclude = []) {
  const filtered = arr.filter(x => !exclude.includes(x));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Deterministic shuffle based on seed string
function seededShuffle(arr, seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    hash = ((hash << 5) - hash + i) | 0;
    const j = Math.abs(hash) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════
// QUESTION GENERATORS
// ═══════════════════════════════════════════════════════════════════

function generateNoteReading() {
  const questions = [];
  let qNum = 0;

  // All note names with enharmonic alternatives for wrong answers
  const allNoteNames = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"];

  function wrongNotes(correct, count = 3) {
    const pool = allNoteNames.filter(n => n !== correct && n.length <= 2);
    return pickRandom(pool, count);
  }

  // === BEGINNER: On-staff naturals ===

  // Treble clef: E4, F4, G4, A4, B4, C5, D5, E5, F5
  const trebleOnStaff = [
    { note: "E", octave: 4, desc: "first line" },
    { note: "F", octave: 4, desc: "first space" },
    { note: "G", octave: 4, desc: "second line" },
    { note: "A", octave: 4, desc: "second space" },
    { note: "B", octave: 4, desc: "third line" },
    { note: "C", octave: 5, desc: "third space" },
    { note: "D", octave: 5, desc: "fourth line" },
    { note: "E", octave: 5, desc: "fourth space" },
    { note: "F", octave: 5, desc: "fifth line" },
  ];

  for (const { note, octave, desc } of trebleOnStaff) {
    qNum++;
    const abc = buildAbc({ clef: "treble", key: "C", baseLength: "1", body: noteToAbc(note, octave, "treble") });
    questions.push({
      set_id: `gen-notes-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What note is shown on the treble clef staff?`,
      correct_answer: note,
      wrong_answers: wrongNotes(note),
      category: "Note Reading",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `This note is ${note}${octave}, located on the ${desc} of the treble clef.`,
      notation_data: abc,
    });
  }

  // Bass clef: G2, A2, B2, C3, D3, E3, F3, G3, A3
  const bassOnStaff = [
    { note: "G", octave: 2, desc: "first line" },
    { note: "A", octave: 2, desc: "first space" },
    { note: "B", octave: 2, desc: "second line" },
    { note: "C", octave: 3, desc: "second space" },
    { note: "D", octave: 3, desc: "third line" },
    { note: "E", octave: 3, desc: "third space" },
    { note: "F", octave: 3, desc: "fourth line" },
    { note: "G", octave: 3, desc: "fourth space" },
    { note: "A", octave: 3, desc: "fifth line" },
  ];

  for (const { note, octave, desc } of bassOnStaff) {
    qNum++;
    const abc = buildAbc({ clef: "bass", key: "C", baseLength: "1", body: noteToAbc(note, octave, "bass") });
    questions.push({
      set_id: `gen-notes-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What note is shown on the bass clef staff?`,
      correct_answer: note,
      wrong_answers: wrongNotes(note),
      category: "Note Reading",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `This note is ${note}${octave}, located on the ${desc} of the bass clef.`,
      notation_data: abc,
    });
  }

  // Treble clef sharps/flats on staff (beginner level)
  const trebleSharpsFlats = [
    { note: "F#", octave: 4, display: "F#" },
    { note: "Bb", octave: 4, display: "Bb" },
    { note: "C#", octave: 5, display: "C#" },
    { note: "Eb", octave: 5, display: "Eb" },
    { note: "G#", octave: 4, display: "G#" },
    { note: "Ab", octave: 4, display: "Ab" },
  ];

  for (const { note, octave, display } of trebleSharpsFlats) {
    qNum++;
    const abc = buildAbc({ clef: "treble", key: "C", baseLength: "1", body: noteToAbc(note, octave, "treble") });
    questions.push({
      set_id: `gen-notes-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What note is shown on the treble clef staff?`,
      correct_answer: display,
      wrong_answers: wrongNotes(display),
      category: "Note Reading",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `This note is ${display}${octave} on the treble clef.`,
      notation_data: abc,
    });
  }

  // Bass clef sharps/flats
  const bassSharpsFlats = [
    { note: "F#", octave: 2, display: "F#" },
    { note: "Bb", octave: 2, display: "Bb" },
    { note: "Eb", octave: 3, display: "Eb" },
    { note: "Ab", octave: 2, display: "Ab" },
  ];

  for (const { note, octave, display } of bassSharpsFlats) {
    qNum++;
    const abc = buildAbc({ clef: "bass", key: "C", baseLength: "1", body: noteToAbc(note, octave, "bass") });
    questions.push({
      set_id: `gen-notes-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What note is shown on the bass clef staff?`,
      correct_answer: display,
      wrong_answers: wrongNotes(display),
      category: "Note Reading",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `This note is ${display}${octave} on the bass clef.`,
      notation_data: abc,
    });
  }

  // === INTERMEDIATE: Ledger lines ===
  const trebleLedger = [
    { note: "C", octave: 4, desc: "middle C (ledger line below)" },
    { note: "D", octave: 4, desc: "just below staff" },
    { note: "G", octave: 5, desc: "one ledger line above" },
    { note: "A", octave: 5, desc: "above first ledger line" },
    { note: "B", octave: 5, desc: "two ledger lines above" },
    { note: "B", octave: 3, desc: "two ledger lines below" },
    { note: "A", octave: 3, desc: "below middle C ledger line" },
  ];

  for (const { note, octave, desc } of trebleLedger) {
    qNum++;
    const abc = buildAbc({ clef: "treble", key: "C", baseLength: "1", body: noteToAbc(note, octave, "treble") });
    questions.push({
      set_id: `gen-notes-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What note is shown on the treble clef staff?`,
      correct_answer: note,
      wrong_answers: wrongNotes(note),
      category: "Note Reading",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `This note is ${note}${octave}, located at ${desc}.`,
      notation_data: abc,
    });
  }

  const bassLedger = [
    { note: "E", octave: 2, desc: "one ledger line below" },
    { note: "F", octave: 2, desc: "below first ledger line" },
    { note: "B", octave: 3, desc: "one ledger line above" },
    { note: "C", octave: 4, desc: "two ledger lines above (middle C)" },
    { note: "D", octave: 4, desc: "above middle C" },
    { note: "D", octave: 2, desc: "two ledger lines below" },
  ];

  for (const { note, octave, desc } of bassLedger) {
    qNum++;
    const abc = buildAbc({ clef: "bass", key: "C", baseLength: "1", body: noteToAbc(note, octave, "bass") });
    questions.push({
      set_id: `gen-notes-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What note is shown on the bass clef staff?`,
      correct_answer: note,
      wrong_answers: wrongNotes(note),
      category: "Note Reading",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `This note is ${note}${octave}, located at ${desc}.`,
      notation_data: abc,
    });
  }

  // Intermediate: sharps/flats on ledger lines
  const ledgerAccidentals = [
    { note: "C#", octave: 4, clef: "treble", display: "C#" },
    { note: "Db", octave: 4, clef: "treble", display: "Db" },
    { note: "G#", octave: 5, clef: "treble", display: "G#" },
    { note: "Ab", octave: 5, clef: "treble", display: "Ab" },
    { note: "F#", octave: 2, clef: "bass", display: "F#" },
    { note: "Bb", octave: 3, clef: "bass", display: "Bb" },
    { note: "Eb", octave: 2, clef: "bass", display: "Eb" },
  ];

  for (const { note, octave, clef, display } of ledgerAccidentals) {
    qNum++;
    const abc = buildAbc({ clef, key: "C", baseLength: "1", body: noteToAbc(note, octave, clef) });
    questions.push({
      set_id: `gen-notes-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What note is shown on the ${clef} clef staff?`,
      correct_answer: display,
      wrong_answers: wrongNotes(display),
      category: "Note Reading",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `This note is ${display}${octave} on a ledger line of the ${clef} clef.`,
      notation_data: abc,
    });
  }

  // Enharmonic questions (intermediate)
  const enharmonicPairs = [
    ["C#", "Db"], ["D#", "Eb"], ["F#", "Gb"], ["G#", "Ab"], ["A#", "Bb"],
  ];

  for (const [sharp, flat] of enharmonicPairs) {
    qNum++;
    questions.push({
      set_id: `gen-notes-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What is the enharmonic equivalent of ${sharp}?`,
      correct_answer: flat,
      wrong_answers: pickRandom(allNoteNames.filter(n => n !== flat && n !== sharp), 3),
      category: "Note Reading",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${sharp} and ${flat} are enharmonic equivalents — they sound the same but are written differently.`,
      notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1", body: noteToAbc(sharp, 4, "treble") }),
    });
    qNum++;
    questions.push({
      set_id: `gen-notes-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What is the enharmonic equivalent of ${flat}?`,
      correct_answer: sharp,
      wrong_answers: pickRandom(allNoteNames.filter(n => n !== flat && n !== sharp), 3),
      category: "Note Reading",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${flat} and ${sharp} are enharmonic equivalents.`,
      notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1", body: noteToAbc(flat, 4, "treble") }),
    });
  }

  // === ADVANCED: Extended ledger lines + key context ===
  const extendedLedger = [
    { note: "C", octave: 6, clef: "treble", desc: "three ledger lines above treble" },
    { note: "D", octave: 6, clef: "treble", desc: "above three ledger lines" },
    { note: "G", octave: 3, clef: "treble", desc: "three ledger lines below treble" },
    { note: "F", octave: 3, clef: "treble", desc: "below three ledger lines" },
    { note: "E", octave: 4, clef: "bass", desc: "three ledger lines above bass" },
    { note: "F", octave: 4, clef: "bass", desc: "above three ledger lines" },
    { note: "C", octave: 2, clef: "bass", desc: "three ledger lines below bass" },
    { note: "B", octave: 1, clef: "bass", desc: "below three ledger lines" },
  ];

  for (const { note, octave, clef, desc } of extendedLedger) {
    qNum++;
    const abc = buildAbc({ clef, key: "C", baseLength: "1", body: noteToAbc(note, octave, clef) });
    questions.push({
      set_id: `gen-notes-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What note is shown on the ${clef} clef staff?`,
      correct_answer: note,
      wrong_answers: wrongNotes(note),
      category: "Note Reading",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `This note is ${note}${octave}, located at ${desc}.`,
      notation_data: abc,
    });
  }

  // Advanced: Notes in key signature context
  const keyContextNotes = [
    { key: "G", keyAbc: "G", note: "F#", octave: 5, clef: "treble", display: "F#", desc: "In G major, F is always sharp" },
    { key: "D", keyAbc: "D", note: "C#", octave: 5, clef: "treble", display: "C#", desc: "In D major, C is always sharp" },
    { key: "F", keyAbc: "F", note: "Bb", octave: 4, clef: "treble", display: "Bb", desc: "In F major, B is always flat" },
    { key: "Bb", keyAbc: "_B", note: "Eb", octave: 5, clef: "treble", display: "Eb", desc: "In Bb major, E is always flat" },
    { key: "Eb", keyAbc: "_E", note: "Ab", octave: 4, clef: "treble", display: "Ab", desc: "In Eb major, A is always flat" },
    { key: "A", keyAbc: "A", note: "G#", octave: 4, clef: "treble", display: "G#", desc: "In A major, G is always sharp" },
    { key: "E", keyAbc: "E", note: "D#", octave: 5, clef: "treble", display: "D#", desc: "In E major, D is always sharp" },
    { key: "Ab", keyAbc: "_A", note: "Db", octave: 5, clef: "treble", display: "Db", desc: "In Ab major, D is always flat" },
    { key: "B", keyAbc: "B", note: "A#", octave: 4, clef: "treble", display: "A#", desc: "In B major, A is always sharp" },
    { key: "Db", keyAbc: "_D", note: "Gb", octave: 4, clef: "treble", display: "Gb", desc: "In Db major, G is always flat" },
  ];

  for (const { key, keyAbc, note, octave, clef, display, desc } of keyContextNotes) {
    qNum++;
    // Show the note on the staff with the key signature — the accidental is implied
    const noteLetter = note.replace("#", "").replace("b", "");
    const abc = buildAbc({ clef, key: keyAbc, baseLength: "1", body: noteToAbc(noteLetter, octave, clef) });
    questions.push({
      set_id: `gen-notes-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `In the key of ${key} major, what note is shown?`,
      correct_answer: display,
      wrong_answers: wrongNotes(display),
      category: "Note Reading",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `${desc}. The key signature tells you the accidental.`,
      notation_data: abc,
    });
  }

  // Advanced: Double sharps and double flats
  const doubleAccidentals = [
    { note: "F", abc: "^^F", octave: 4, clef: "treble", display: "F##", equiv: "G" },
    { note: "C", abc: "^^C", octave: 5, clef: "treble", display: "C##", equiv: "D" },
    { note: "B", abc: "__B", octave: 4, clef: "treble", display: "Bbb", equiv: "A" },
    { note: "E", abc: "__E", octave: 5, clef: "treble", display: "Ebb", equiv: "D" },
  ];

  for (const { abc: noteAbc, octave, clef, display, equiv } of doubleAccidentals) {
    qNum++;
    const abc = buildAbc({ clef, key: "C", baseLength: "1", body: noteAbc });
    questions.push({
      set_id: `gen-notes-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What is the enharmonic equivalent of ${display}?`,
      correct_answer: equiv,
      wrong_answers: wrongNotes(equiv),
      category: "Note Reading",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `${display} is enharmonically equivalent to ${equiv}.`,
      notation_data: abc,
    });
  }

  // MORE BEGINNER: Additional on-staff notes with different clef/context
  const moreBeginner = [
    { note: "D", octave: 4, clef: "treble", desc: "just below treble staff" },
    { note: "G", octave: 5, clef: "treble", desc: "just above treble staff" },
    { note: "F", octave: 2, clef: "bass", desc: "just below bass staff" },
    { note: "B", octave: 3, clef: "bass", desc: "just above bass staff" },
    { note: "C", octave: 4, clef: "treble", desc: "middle C on treble" },
    { note: "D#", octave: 4, clef: "treble", display: "D#" },
    { note: "A#", octave: 4, clef: "treble", display: "A#" },
    { note: "Db", octave: 5, clef: "treble", display: "Db" },
    { note: "Gb", octave: 4, clef: "treble", display: "Gb" },
    { note: "C#", octave: 3, clef: "bass", display: "C#" },
    { note: "Gb", octave: 2, clef: "bass", display: "Gb" },
    { note: "D#", octave: 3, clef: "bass", display: "D#" },
  ];

  for (const item of moreBeginner) {
    qNum++;
    const display = item.display || item.note;
    const abc = buildAbc({ clef: item.clef, key: "C", baseLength: "1", body: noteToAbc(item.note, item.octave, item.clef) });
    questions.push({
      set_id: `gen-notes-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What note is shown on the ${item.clef} clef staff?`,
      correct_answer: display,
      wrong_answers: wrongNotes(display),
      category: "Note Reading",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `This note is ${display}${item.octave} on the ${item.clef} clef.`,
      notation_data: abc,
    });
  }

  // MORE INTERMEDIATE: Additional ledger + accidental combinations
  const moreIntermediate = [
    { note: "Bb", octave: 5, clef: "treble", display: "Bb" },
    { note: "F#", octave: 5, clef: "treble", display: "F#" },
    { note: "D#", octave: 4, clef: "treble", display: "D#" },
    { note: "Ab", octave: 3, clef: "treble", display: "Ab" },
    { note: "C#", octave: 4, clef: "bass", display: "C#" },
    { note: "Ab", octave: 3, clef: "bass", display: "Ab" },
    { note: "D#", octave: 4, clef: "bass", display: "D#" },
    { note: "Gb", octave: 3, clef: "bass", display: "Gb" },
    { note: "A#", octave: 5, clef: "treble", display: "A#" },
    { note: "Eb", octave: 4, clef: "treble", display: "Eb" },
  ];

  for (const item of moreIntermediate) {
    qNum++;
    const abc = buildAbc({ clef: item.clef, key: "C", baseLength: "1", body: noteToAbc(item.note, item.octave, item.clef) });
    questions.push({
      set_id: `gen-notes-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What note is shown on the ${item.clef} clef staff?`,
      correct_answer: item.display,
      wrong_answers: wrongNotes(item.display),
      category: "Note Reading",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `This note is ${item.display}${item.octave} on the ${item.clef} clef.`,
      notation_data: abc,
    });
  }

  // MORE ADVANCED: More key-context and extreme ledger notes
  const moreAdvanced = [
    { key: "B", keyAbc: "B", note: "E#", octave: 5, clef: "treble", display: "E#" },
    { key: "F#", keyAbc: "^F", note: "B#", octave: 4, clef: "treble", display: "B#" },
    { key: "Gb", keyAbc: "_G", note: "Cb", octave: 5, clef: "treble", display: "Cb" },
    { key: "Ab", keyAbc: "_A", note: "Bb", octave: 4, clef: "treble", display: "Bb" },
    { key: "Eb", keyAbc: "_E", note: "Bb", octave: 4, clef: "bass", display: "Bb" },
  ];

  for (const item of moreAdvanced) {
    qNum++;
    const noteLetter = item.note.replace("#", "").replace("b", "");
    const abc = buildAbc({ clef: item.clef, key: item.keyAbc, baseLength: "1", body: noteToAbc(noteLetter, item.octave, item.clef) });
    questions.push({
      set_id: `gen-notes-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `In the key of ${item.key} major, what note is shown?`,
      correct_answer: item.display,
      wrong_answers: wrongNotes(item.display),
      category: "Note Reading",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `In ${item.key} major, the key signature determines this note is ${item.display}.`,
      notation_data: abc,
    });
  }

  return questions;
}


function generateIntervals() {
  const questions = [];
  let qNum = 0;

  const beginnerIntervals = ["Minor 2nd", "Major 2nd", "Minor 3rd", "Major 3rd", "Perfect 4th", "Perfect 5th", "Octave"];
  const intermediateIntervals = ["Minor 2nd", "Major 2nd", "Minor 3rd", "Major 3rd", "Perfect 4th", "Tritone", "Perfect 5th", "Minor 6th", "Major 6th", "Minor 7th", "Major 7th", "Octave"];
  const compoundIntervals = ["Minor 9th", "Major 9th", "Minor 10th", "Major 10th", "Perfect 11th", "Perfect 12th"];
  const augDimIntervals = ["Augmented 4th", "Diminished 5th", "Augmented 5th", "Diminished 7th", "Augmented 2nd"];

  function wrongIntervals(correct, pool) {
    return pickRandom(pool, 3, [correct]);
  }

  function getInterval(name) {
    return INTERVALS.find(i => i.name === name);
  }

  // === BEGINNER: Ascending, C major context ===
  const beginnerRoots = [
    { note: "C", octave: 4 }, { note: "D", octave: 4 }, { note: "E", octave: 4 },
    { note: "F", octave: 4 }, { note: "G", octave: 4 }, { note: "A", octave: 4 },
  ];

  for (const root of beginnerRoots) {
    for (const intName of beginnerIntervals) {
      const interval = getInterval(intName);
      if (!interval) continue;
      const rootSemitone = CHROMATIC.indexOf(root.note);
      const targetNote = semitoneToNote(rootSemitone, interval.semitones);
      const targetOctave = root.octave + Math.floor((rootSemitone + interval.semitones) / 12);

      // Skip if target goes too high
      if (targetOctave > 5) continue;

      qNum++;
      const rootAbc = noteToAbc(root.note, root.octave, "treble");
      const targetAbc = noteToAbc(targetNote, targetOctave, "treble");
      const abc = buildAbc({ clef: "treble", key: "C", baseLength: "1", body: `[${rootAbc}${targetAbc}]` });

      questions.push({
        set_id: `gen-intervals-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What ascending interval is shown from ${root.note}?`,
        correct_answer: intName,
        wrong_answers: wrongIntervals(intName, beginnerIntervals),
        category: "Intervals",
        quiz_type: "staff_notation",
        difficulty: "beginner",
        explanation: `From ${root.note} to ${targetNote} is a ${intName} (${interval.semitones} semitones).`,
        notation_data: abc,
      });
    }
  }

  // === INTERMEDIATE: All simple intervals, ascending + descending, varied keys ===
  const intRoots = [
    { note: "C", octave: 4 }, { note: "D", octave: 4 }, { note: "E", octave: 4 },
    { note: "F", octave: 4 }, { note: "G", octave: 4 }, { note: "A", octave: 4 },
    { note: "Bb", octave: 4 }, { note: "Eb", octave: 4 },
  ];

  for (const root of intRoots) {
    for (const intName of intermediateIntervals) {
      const interval = getInterval(intName);
      if (!interval) continue;
      const rootSemitone = CHROMATIC.indexOf(root.note) !== -1 ? CHROMATIC.indexOf(root.note) : CHROMATIC_FLAT.indexOf(root.note);
      const useFlat = ["Bb", "Eb", "Ab", "Db", "F"].includes(root.note);
      const targetNote = semitoneToNote(rootSemitone, interval.semitones, useFlat);
      const targetOctave = root.octave + Math.floor((rootSemitone + interval.semitones) / 12);

      if (targetOctave > 5) continue;

      // Skip beginner combos that are duplicates (C root + beginner intervals)
      if (root.note === "C" && beginnerIntervals.includes(intName)) continue;

      qNum++;
      const rootAbc = noteToAbc(root.note, root.octave, "treble");
      const targetAbc = noteToAbc(targetNote, targetOctave, "treble");
      const abc = buildAbc({ clef: "treble", key: "C", baseLength: "1", body: `[${rootAbc}${targetAbc}]` });

      questions.push({
        set_id: `gen-intervals-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What ascending interval is shown from ${root.note}?`,
        correct_answer: intName,
        wrong_answers: wrongIntervals(intName, intermediateIntervals),
        category: "Intervals",
        quiz_type: "staff_notation",
        difficulty: "intermediate",
        explanation: `From ${root.note} to ${targetNote} is a ${intName} (${interval.semitones} semitones).`,
        notation_data: abc,
      });
    }

    // Descending intervals (fewer — pick a subset)
    const descIntervals = ["Minor 3rd", "Major 3rd", "Perfect 4th", "Perfect 5th", "Minor 7th", "Octave"];
    for (const intName of descIntervals) {
      const interval = getInterval(intName);
      if (!interval) continue;
      const rootSemitone = CHROMATIC.indexOf(root.note) !== -1 ? CHROMATIC.indexOf(root.note) : CHROMATIC_FLAT.indexOf(root.note);
      const useFlat = ["Bb", "Eb", "Ab", "Db", "F"].includes(root.note);
      const lowerSemitone = (rootSemitone - interval.semitones + 12) % 12;
      const lowerNote = useFlat ? CHROMATIC_FLAT[lowerSemitone] : CHROMATIC[lowerSemitone];
      const lowerOctave = root.octave - Math.ceil(interval.semitones / 12);

      if (lowerOctave < 3) continue;

      qNum++;
      const rootAbc = noteToAbc(root.note, root.octave, "treble");
      const lowerAbc = noteToAbc(lowerNote, lowerOctave, "treble");
      const abc = buildAbc({ clef: "treble", key: "C", baseLength: "1", body: `[${rootAbc}${lowerAbc}]` });

      questions.push({
        set_id: `gen-intervals-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What descending interval is shown from ${root.note}?`,
        correct_answer: intName,
        wrong_answers: wrongIntervals(intName, intermediateIntervals),
        category: "Intervals",
        quiz_type: "staff_notation",
        difficulty: "intermediate",
        explanation: `From ${root.note} down to ${lowerNote} is a descending ${intName}.`,
        notation_data: abc,
      });
    }
  }

  // === ADVANCED: Compound + augmented/diminished ===
  const advRoots = [
    { note: "C", octave: 4 }, { note: "D", octave: 4 }, { note: "E", octave: 4 },
    { note: "F", octave: 4 }, { note: "G", octave: 3 }, { note: "A", octave: 3 },
    { note: "Bb", octave: 3 }, { note: "F#", octave: 3 },
  ];

  // Compound intervals
  for (const root of advRoots) {
    for (const intName of compoundIntervals) {
      const interval = getInterval(intName);
      if (!interval) continue;
      const rootSemitone = CHROMATIC.indexOf(root.note) !== -1 ? CHROMATIC.indexOf(root.note) : CHROMATIC_FLAT.indexOf(root.note);
      if (rootSemitone === -1) continue;
      const useFlat = ["Bb", "Eb", "Ab", "Db", "F"].includes(root.note);
      const targetNote = semitoneToNote(rootSemitone, interval.semitones % 12, useFlat);
      const targetOctave = root.octave + Math.floor((rootSemitone + interval.semitones) / 12);

      if (targetOctave > 6) continue;

      qNum++;
      const rootAbc = noteToAbc(root.note, root.octave, "treble");
      const targetAbc = noteToAbc(targetNote, targetOctave, "treble");
      const abc = buildAbc({ clef: "treble", key: "C", baseLength: "1", body: `[${rootAbc}${targetAbc}]` });

      questions.push({
        set_id: `gen-intervals-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What compound interval is shown from ${root.note}?`,
        correct_answer: intName,
        wrong_answers: wrongIntervals(intName, compoundIntervals),
        category: "Intervals",
        quiz_type: "staff_notation",
        difficulty: "advanced",
        explanation: `From ${root.note}${root.octave} to ${targetNote}${targetOctave} is a ${intName} (${interval.semitones} semitones).`,
        notation_data: abc,
      });
    }
  }

  // Augmented/diminished intervals
  const augDimRoots = [
    { note: "C", octave: 4 }, { note: "D", octave: 4 }, { note: "E", octave: 4 },
    { note: "F", octave: 4 }, { note: "G", octave: 4 }, { note: "A", octave: 4 },
  ];

  for (const root of augDimRoots) {
    for (const intName of augDimIntervals) {
      const interval = getInterval(intName);
      if (!interval) continue;
      const rootSemitone = CHROMATIC.indexOf(root.note);
      const targetNote = semitoneToNote(rootSemitone, interval.semitones);
      const targetOctave = root.octave + Math.floor((rootSemitone + interval.semitones) / 12);
      if (targetOctave > 5) continue;

      qNum++;
      const rootAbc = noteToAbc(root.note, root.octave, "treble");
      const targetAbc = noteToAbc(targetNote, targetOctave, "treble");
      const abc = buildAbc({ clef: "treble", key: "C", baseLength: "1", body: `[${rootAbc}${targetAbc}]` });

      questions.push({
        set_id: `gen-intervals-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What interval is shown from ${root.note}?`,
        correct_answer: intName,
        wrong_answers: wrongIntervals(intName, [...augDimIntervals, "Tritone", "Perfect 5th", "Minor 6th"]),
        category: "Intervals",
        quiz_type: "staff_notation",
        difficulty: "advanced",
        explanation: `From ${root.note} to ${targetNote} is a ${intName} (${interval.semitones} semitones).`,
        notation_data: abc,
      });
    }
  }

  return questions;
}


function generateChords() {
  const questions = [];
  let qNum = 0;

  const easyRoots = ["C", "G", "D", "F", "Bb", "Eb"];
  const allRoots12 = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const commonKeys7th = ["C", "D", "E", "F", "G", "A", "Bb", "Eb"];

  function wrongChords(correct, pool) {
    return pickRandom(pool, 3, [correct]);
  }

  // === BEGINNER: Major + Minor triads, root position, easy keys ===
  const beginnerTypes = ["Major", "Minor"];
  const beginnerAnswerPool = easyRoots.flatMap(r => beginnerTypes.map(t => `${r} ${t}`));

  for (const root of easyRoots) {
    for (const type of beginnerTypes) {
      const intervals = CHORD_TYPES[type];
      const rootSemitone = CHROMATIC.indexOf(root) !== -1 ? CHROMATIC.indexOf(root) : CHROMATIC_FLAT.indexOf(root);
      if (rootSemitone === -1) continue;

      qNum++;
      const body = chordToAbc(root, 4, intervals, "treble");
      const abc = buildAbc({ clef: "treble", key: "C", baseLength: "1", body });
      const answer = `${root} ${type}`;

      questions.push({
        set_id: `gen-chords-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What chord is shown?`,
        correct_answer: answer,
        wrong_answers: wrongChords(answer, beginnerAnswerPool),
        category: "Chords",
        quiz_type: "staff_notation",
        difficulty: "beginner",
        explanation: `${answer} triad in root position: ${intervals.map(i => semitoneToNote(rootSemitone, i, root.includes("b"))).join("-")}.`,
        notation_data: abc,
      });
    }
  }

  // Beginner: bass clef triads
  for (const root of ["C", "G", "F", "D"]) {
    for (const type of beginnerTypes) {
      const intervals = CHORD_TYPES[type];
      const rootSemitone = CHROMATIC.indexOf(root);

      qNum++;
      const body = chordToAbc(root, 3, intervals, "bass");
      const abc = buildAbc({ clef: "bass", key: "C", baseLength: "1", body });
      const answer = `${root} ${type}`;

      questions.push({
        set_id: `gen-chords-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What chord is shown on the bass clef?`,
        correct_answer: answer,
        wrong_answers: wrongChords(answer, beginnerAnswerPool),
        category: "Chords",
        quiz_type: "staff_notation",
        difficulty: "beginner",
        explanation: `${answer} triad in root position on bass clef.`,
        notation_data: abc,
      });
    }
  }

  // === INTERMEDIATE: All triad types in all 12 keys + inversions + 7th chords ===
  const triadTypes = ["Major", "Minor", "Diminished", "Augmented"];
  const triadPool = allRoots12.flatMap(r => triadTypes.map(t => `${r} ${t}`));

  // All triads root position (skip easy-key major/minor already done)
  for (const root of allRoots12) {
    for (const type of triadTypes) {
      if (easyRoots.includes(root) && beginnerTypes.includes(type)) continue; // skip beginner dupes

      const intervals = CHORD_TYPES[type];
      const rootSemitone = CHROMATIC.indexOf(root) !== -1 ? CHROMATIC.indexOf(root) : CHROMATIC_FLAT.indexOf(root);
      if (rootSemitone === -1) continue;

      qNum++;
      const body = chordToAbc(root, 4, intervals, "treble");
      const abc = buildAbc({ clef: "treble", key: "C", baseLength: "1", body });
      const answer = `${root} ${type}`;

      questions.push({
        set_id: `gen-chords-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What chord is shown?`,
        correct_answer: answer,
        wrong_answers: wrongChords(answer, triadPool),
        category: "Chords",
        quiz_type: "staff_notation",
        difficulty: "intermediate",
        explanation: `${answer} triad in root position.`,
        notation_data: abc,
      });
    }
  }

  // Inversions for common roots
  const inversionRoots = ["C", "D", "E", "F", "G", "A", "Bb", "Eb"];
  const invTypes = ["Major", "Minor"];

  for (const root of inversionRoots) {
    for (const type of invTypes) {
      const intervals = CHORD_TYPES[type];
      const rootSemitone = CHROMATIC.indexOf(root) !== -1 ? CHROMATIC.indexOf(root) : CHROMATIC_FLAT.indexOf(root);
      if (rootSemitone === -1) continue;
      const useFlat = ["Bb", "Eb", "Ab", "Db", "F"].includes(root);

      // 1st inversion: move root up an octave
      const inv1Notes = [intervals[1], intervals[2], intervals[0] + 12];
      qNum++;
      const inv1Abc = inv1Notes.map((int, i) => {
        const note = semitoneToNote(rootSemitone, int % 12, useFlat);
        const oct = 4 + Math.floor((rootSemitone + int) / 12);
        return noteToAbc(note, oct, "treble");
      });
      questions.push({
        set_id: `gen-chords-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What chord is shown?`,
        correct_answer: `${root} ${type} (1st inversion)`,
        wrong_answers: [`${root} ${type}`, `${root} ${type} (2nd inversion)`, pickRandom(allRoots12.filter(r => r !== root), 1)[0] + ` ${type}`],
        category: "Chords",
        quiz_type: "staff_notation",
        difficulty: "intermediate",
        explanation: `${root} ${type} in 1st inversion — the 3rd is in the bass.`,
        notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1", body: `[${inv1Abc.join("")}]` }),
      });

      // 2nd inversion: move root and 3rd up an octave
      const inv2Notes = [intervals[2], intervals[0] + 12, intervals[1] + 12];
      qNum++;
      const inv2Abc = inv2Notes.map(int => {
        const note = semitoneToNote(rootSemitone, int % 12, useFlat);
        const oct = 4 + Math.floor((rootSemitone + int) / 12);
        return noteToAbc(note, oct, "treble");
      });
      questions.push({
        set_id: `gen-chords-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What chord is shown?`,
        correct_answer: `${root} ${type} (2nd inversion)`,
        wrong_answers: [`${root} ${type}`, `${root} ${type} (1st inversion)`, pickRandom(allRoots12.filter(r => r !== root), 1)[0] + ` ${type}`],
        category: "Chords",
        quiz_type: "staff_notation",
        difficulty: "intermediate",
        explanation: `${root} ${type} in 2nd inversion — the 5th is in the bass.`,
        notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1", body: `[${inv2Abc.join("")}]` }),
      });
    }
  }

  // 7th chords root position
  const seventhTypes = ["Major 7th", "Minor 7th", "Dominant 7th", "Half-Diminished 7th", "Diminished 7th"];
  const seventhPool = commonKeys7th.flatMap(r => seventhTypes.map(t => `${r} ${t}`));

  for (const root of commonKeys7th) {
    for (const type of seventhTypes) {
      const intervals = CHORD_TYPES[type];
      const rootSemitone = CHROMATIC.indexOf(root) !== -1 ? CHROMATIC.indexOf(root) : CHROMATIC_FLAT.indexOf(root);
      if (rootSemitone === -1) continue;

      qNum++;
      const body = chordToAbc(root, 4, intervals, "treble");
      const abc = buildAbc({ clef: "treble", key: "C", baseLength: "1", body });
      const answer = `${root} ${type}`;

      questions.push({
        set_id: `gen-chords-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What chord is shown?`,
        correct_answer: answer,
        wrong_answers: wrongChords(answer, seventhPool),
        category: "Chords",
        quiz_type: "staff_notation",
        difficulty: "intermediate",
        explanation: `${answer} chord in root position.`,
        notation_data: abc,
      });
    }
  }

  // === ADVANCED: Extended chords, altered, sus, add ===
  const advancedTypes = [
    "Major 9th", "Minor 9th", "Dominant 9th", "Dominant 13th",
    "Dominant 7th #9", "Dominant 7th b9", "Dominant 7th #11",
    "Sus2", "Sus4", "Add9", "Major 6th", "Minor 6th",
  ];

  const advRoots = ["C", "D", "E", "F", "G", "A", "Bb", "Eb", "Ab", "F#", "B", "Db"];

  for (const root of advRoots) {
    for (const type of advancedTypes) {
      const intervals = CHORD_TYPES[type];
      if (!intervals) continue;
      const rootSemitone = CHROMATIC.indexOf(root) !== -1 ? CHROMATIC.indexOf(root) : CHROMATIC_FLAT.indexOf(root);
      if (rootSemitone === -1) continue;

      // For extended chords starting on higher roots, use lower octave
      const startOctave = intervals.length > 4 ? 3 : 4;

      qNum++;
      const body = chordToAbc(root, startOctave, intervals, "treble");
      const abc = buildAbc({ clef: "treble", key: "C", baseLength: "1", body });
      const answer = `${root} ${type}`;
      const advPool = advRoots.flatMap(r => advancedTypes.map(t => `${r} ${t}`));

      questions.push({
        set_id: `gen-chords-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What chord is shown?`,
        correct_answer: answer,
        wrong_answers: wrongChords(answer, advPool),
        category: "Chords",
        quiz_type: "staff_notation",
        difficulty: "advanced",
        explanation: `${answer} chord.`,
        notation_data: abc,
      });
    }
  }

  // 7th chord inversions (advanced)
  const invRoots7 = ["C", "D", "F", "G", "Bb"];
  for (const root of invRoots7) {
    for (const type of ["Major 7th", "Dominant 7th"]) {
      const intervals = CHORD_TYPES[type];
      const rootSemitone = CHROMATIC.indexOf(root) !== -1 ? CHROMATIC.indexOf(root) : CHROMATIC_FLAT.indexOf(root);
      if (rootSemitone === -1) continue;
      const useFlat = ["Bb", "Eb", "Ab", "Db", "F"].includes(root);

      // 1st, 2nd, 3rd inversions
      for (let inv = 1; inv <= 3; inv++) {
        const reordered = [];
        for (let j = 0; j < intervals.length; j++) {
          const idx = (j + inv) % intervals.length;
          let semitone = intervals[idx];
          // Bring notes below the bass note up an octave
          while (semitone < intervals[inv]) semitone += 12;
          reordered.push(semitone);
        }
        reordered.sort((a, b) => a - b);

        qNum++;
        const notesAbc = reordered.map(int => {
          const note = semitoneToNote(rootSemitone, int % 12, useFlat);
          const oct = 4 + Math.floor((rootSemitone + int) / 12);
          return noteToAbc(note, oct, "treble");
        });

        const invNames = ["", "1st inversion", "2nd inversion", "3rd inversion"];
        const answer = `${root} ${type} (${invNames[inv]})`;

        questions.push({
          set_id: `gen-chords-${String(qNum).padStart(3, "0")}`,
          question_number: qNum,
          question_text: `What chord is shown?`,
          correct_answer: answer,
          wrong_answers: [
            `${root} ${type}`,
            `${root} ${type} (${invNames[inv === 1 ? 2 : 1]})`,
            `${pickRandom(allRoots12.filter(r => r !== root), 1)[0]} ${type}`,
          ],
          category: "Chords",
          quiz_type: "staff_notation",
          difficulty: "advanced",
          explanation: `${root} ${type} in ${invNames[inv]}.`,
          notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1", body: `[${notesAbc.join("")}]` }),
        });
      }
    }
  }

  return questions;
}


function generateKeySignatures() {
  const questions = [];
  let qNum = 0;

  const majorKeys = Object.entries(KEY_SIGNATURES).filter(([name]) => name.includes("Major"));
  const minorKeys = Object.entries(KEY_SIGNATURES).filter(([name]) => name.includes("Minor"));

  function wrongKeys(correct, pool) {
    return pickRandom(pool.map(([name]) => name), 3, [correct]);
  }

  // === BEGINNER: 0-2 sharps/flats, major only ===
  const beginnerMajor = majorKeys.filter(([, info]) => info.sharps + info.flats <= 2);

  for (const [name, info] of beginnerMajor) {
    // Treble clef
    qNum++;
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What major key has this key signature?`,
      correct_answer: name,
      wrong_answers: wrongKeys(name, beginnerMajor),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `This key signature with ${info.sharps} sharp(s) and ${info.flats} flat(s) indicates ${name}.`,
      notation_data: buildAbc({ clef: "treble", key: info.abc, baseLength: "1", body: "x" }),
    });

    // Bass clef variant
    qNum++;
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What major key has this key signature (bass clef)?`,
      correct_answer: name,
      wrong_answers: wrongKeys(name, beginnerMajor),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `${name} key signature shown on the bass clef.`,
      notation_data: buildAbc({ clef: "bass", key: info.abc, baseLength: "1", body: "x" }),
    });
  }

  // How many sharps/flats questions (beginner)
  for (const [name, info] of beginnerMajor) {
    if (name === "C Major") continue;
    qNum++;
    const count = info.sharps > 0 ? info.sharps : info.flats;
    const type = info.sharps > 0 ? "sharp(s)" : "flat(s)";
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `How many sharps or flats does ${name} have?`,
      correct_answer: `${count} ${type}`,
      wrong_answers: pickRandom(["1 sharp(s)", "2 sharp(s)", "1 flat(s)", "2 flat(s)", "3 sharp(s)", "3 flat(s)", "0 (no sharps or flats)"], 3, [`${count} ${type}`]),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `${name} has ${count} ${type}.`,
      notation_data: buildAbc({ clef: "treble", key: info.abc, baseLength: "1", body: "x" }),
    });
  }

  // === INTERMEDIATE: 3-4 sharps/flats, major + relative minor ===
  const intermediateMajor = majorKeys.filter(([, info]) => (info.sharps + info.flats >= 3) && (info.sharps + info.flats <= 4));
  const intermediatePool = [...intermediateMajor, ...beginnerMajor];

  for (const [name, info] of intermediateMajor) {
    qNum++;
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What major key has this key signature?`,
      correct_answer: name,
      wrong_answers: wrongKeys(name, intermediatePool),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `This key signature with ${info.sharps || info.flats} accidental(s) indicates ${name}.`,
      notation_data: buildAbc({ clef: "treble", key: info.abc, baseLength: "1", body: "x" }),
    });
  }

  // Relative minor questions
  const intermediateMinor = minorKeys.filter(([, info]) => (info.sharps + info.flats >= 0) && (info.sharps + info.flats <= 4));
  for (const [name, info] of intermediateMinor) {
    qNum++;
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What minor key has this key signature?`,
      correct_answer: name,
      wrong_answers: wrongKeys(name, intermediateMinor),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `This key signature indicates ${name}.`,
      notation_data: buildAbc({ clef: "treble", key: info.abc, baseLength: "1", body: "x" }),
    });
  }

  // Major/minor pair identification
  for (const [majorName, majorInfo] of intermediateMajor) {
    const minorName = RELATIVE_MINOR[majorName];
    if (!minorName) continue;
    qNum++;
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `This key signature represents ${majorName}. What is its relative minor?`,
      correct_answer: minorName,
      wrong_answers: wrongKeys(minorName, intermediateMinor),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `The relative minor of ${majorName} is ${minorName} — they share the same key signature.`,
      notation_data: buildAbc({ clef: "treble", key: majorInfo.abc, baseLength: "1", body: "x" }),
    });
  }

  // === ADVANCED: 5-7 sharps/flats, enharmonic keys ===
  const advancedMajor = majorKeys.filter(([, info]) => info.sharps + info.flats >= 5);
  const allMajorPool = majorKeys;

  for (const [name, info] of advancedMajor) {
    qNum++;
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What major key has this key signature?`,
      correct_answer: name,
      wrong_answers: wrongKeys(name, allMajorPool),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `This key signature with ${info.sharps || info.flats} accidentals indicates ${name}.`,
      notation_data: buildAbc({ clef: "treble", key: info.abc, baseLength: "1", body: "x" }),
    });
  }

  const advancedMinor = minorKeys.filter(([, info]) => info.sharps + info.flats >= 5);
  for (const [name, info] of advancedMinor) {
    qNum++;
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What minor key has this key signature?`,
      correct_answer: name,
      wrong_answers: wrongKeys(name, [...advancedMinor, ...intermediateMinor]),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `This key signature indicates ${name}.`,
      notation_data: buildAbc({ clef: "treble", key: info.abc, baseLength: "1", body: "x" }),
    });
  }

  // Enharmonic key questions
  const enharmonicPairs = [
    ["F# Major", "Gb Major"],
    ["C# Major", "Db Major"],
    ["B Major", "Cb Major"],
  ];

  for (const [key1, key2] of enharmonicPairs) {
    const info1 = KEY_SIGNATURES[key1];
    if (!info1) continue;
    qNum++;
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What is the enharmonic equivalent of ${key1}?`,
      correct_answer: key2,
      wrong_answers: wrongKeys(key2, allMajorPool),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `${key1} and ${key2} are enharmonic equivalents — they sound the same but are notated differently.`,
      notation_data: buildAbc({ clef: "treble", key: info1.abc, baseLength: "1", body: "x" }),
    });
  }

  // All major keys on bass clef (advanced)
  for (const [name, info] of advancedMajor) {
    qNum++;
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What major key has this key signature (bass clef)?`,
      correct_answer: name,
      wrong_answers: wrongKeys(name, allMajorPool),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `${name} key signature shown on the bass clef.`,
      notation_data: buildAbc({ clef: "bass", key: info.abc, baseLength: "1", body: "x" }),
    });
  }

  // MORE BEGINNER: sharps/flats count for all beginner keys + "which type" questions
  for (const [name, info] of beginnerMajor) {
    qNum++;
    const hasAccidentals = info.sharps + info.flats > 0;
    const accType = info.sharps > 0 ? "sharps" : info.flats > 0 ? "flats" : "neither";
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `Does this key signature have sharps or flats?`,
      correct_answer: hasAccidentals ? (info.sharps > 0 ? "Sharps" : "Flats") : "Neither (no sharps or flats)",
      wrong_answers: pickRandom(["Sharps", "Flats", "Neither (no sharps or flats)", "Both"], 3, [hasAccidentals ? (info.sharps > 0 ? "Sharps" : "Flats") : "Neither (no sharps or flats)"]),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `${name} has ${accType}.`,
      notation_data: buildAbc({ clef: "treble", key: info.abc, baseLength: "1", body: "x" }),
    });
  }

  // MORE INTERMEDIATE: Bass clef for intermediate keys + order of sharps/flats
  for (const [name, info] of intermediateMajor) {
    qNum++;
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What major key has this key signature (bass clef)?`,
      correct_answer: name,
      wrong_answers: wrongKeys(name, intermediatePool),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${name} key signature on the bass clef.`,
      notation_data: buildAbc({ clef: "bass", key: info.abc, baseLength: "1", body: "x" }),
    });
  }

  // How many accidentals for intermediate keys
  for (const [name, info] of intermediateMajor) {
    qNum++;
    const count = info.sharps > 0 ? info.sharps : info.flats;
    const type = info.sharps > 0 ? "sharp(s)" : "flat(s)";
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `How many sharps or flats does ${name} have?`,
      correct_answer: `${count} ${type}`,
      wrong_answers: pickRandom(["2 sharp(s)", "3 sharp(s)", "4 sharp(s)", "3 flat(s)", "4 flat(s)", "5 sharp(s)", "5 flat(s)"], 3, [`${count} ${type}`]),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${name} has ${count} ${type}.`,
      notation_data: buildAbc({ clef: "treble", key: info.abc, baseLength: "1", body: "x" }),
    });
  }

  // Relative minor for beginner keys (intermediate level)
  for (const [majorName, majorInfo] of beginnerMajor) {
    const minorName = RELATIVE_MINOR[majorName];
    if (!minorName) continue;
    qNum++;
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `This key signature represents ${majorName}. What is its relative minor?`,
      correct_answer: minorName,
      wrong_answers: wrongKeys(minorName, intermediateMinor),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `The relative minor of ${majorName} is ${minorName}.`,
      notation_data: buildAbc({ clef: "treble", key: majorInfo.abc, baseLength: "1", body: "x" }),
    });
  }

  // MORE ADVANCED: How many accidentals for advanced keys
  for (const [name, info] of advancedMajor) {
    qNum++;
    const count = info.sharps > 0 ? info.sharps : info.flats;
    const type = info.sharps > 0 ? "sharp(s)" : "flat(s)";
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `How many sharps or flats does ${name} have?`,
      correct_answer: `${count} ${type}`,
      wrong_answers: pickRandom(["4 sharp(s)", "5 sharp(s)", "6 sharp(s)", "7 sharp(s)", "5 flat(s)", "6 flat(s)", "7 flat(s)"], 3, [`${count} ${type}`]),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `${name} has ${count} ${type}.`,
      notation_data: buildAbc({ clef: "treble", key: info.abc, baseLength: "1", body: "x" }),
    });
  }

  // Relative minor for advanced major keys
  for (const [majorName, majorInfo] of advancedMajor) {
    const minorName = RELATIVE_MINOR[majorName];
    if (!minorName) continue;
    qNum++;
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `This key signature represents ${majorName}. What is its relative minor?`,
      correct_answer: minorName,
      wrong_answers: wrongKeys(minorName, [...advancedMinor, ...intermediateMinor]),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `The relative minor of ${majorName} is ${minorName}.`,
      notation_data: buildAbc({ clef: "treble", key: majorInfo.abc, baseLength: "1", body: "x" }),
    });
  }

  // "Name both the major and relative minor" questions (advanced)
  for (const [majorName, majorInfo] of [...intermediateMajor, ...advancedMajor]) {
    const minorName = RELATIVE_MINOR[majorName];
    if (!minorName) continue;
    qNum++;
    const answer = `${majorName} / ${minorName}`;
    questions.push({
      set_id: `gen-keysig-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `Name both keys (major and relative minor) for this key signature.`,
      correct_answer: answer,
      wrong_answers: pickRandom(
        Object.entries(RELATIVE_MINOR).filter(([k]) => k !== majorName).map(([k, v]) => `${k} / ${v}`),
        3
      ),
      category: "Key Signatures",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `This key signature belongs to both ${majorName} and its relative minor ${minorName}.`,
      notation_data: buildAbc({ clef: "treble", key: majorInfo.abc, baseLength: "1", body: "x" }),
    });
  }

  return questions;
}


function generateScales() {
  const questions = [];
  let qNum = 0;

  function wrongScales(correct, pool) {
    return pickRandom(pool, 3, [correct]);
  }

  // === BEGINNER ===
  // Major scales in easy keys
  const beginnerMajorKeys = [
    { root: "C", octave: 4 }, { root: "G", octave: 4 }, { root: "D", octave: 4 },
    { root: "F", octave: 4 }, { root: "Bb", octave: 4 },
  ];

  const beginnerPool = [];

  for (const { root, octave } of beginnerMajorKeys) {
    const answer = `${root} Major Scale`;
    beginnerPool.push(answer);
    qNum++;
    const body = scaleToAbc(root, octave, SCALE_TYPES["Major Scale"], "treble");
    questions.push({
      set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What scale is shown?`,
      correct_answer: answer,
      wrong_answers: [], // filled after pool is complete
      category: "Scales",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `${answer} ascending over one octave.`,
      notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
    });
  }

  // Natural minor in easy keys
  const beginnerMinorKeys = [
    { root: "A", octave: 4 }, { root: "E", octave: 4 }, { root: "D", octave: 4 },
    { root: "G", octave: 4 }, { root: "C", octave: 4 },
  ];

  for (const { root, octave } of beginnerMinorKeys) {
    const answer = `${root} Natural Minor Scale`;
    beginnerPool.push(answer);
    qNum++;
    const body = scaleToAbc(root, octave, SCALE_TYPES["Natural Minor Scale"], "treble");
    questions.push({
      set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What scale is shown?`,
      correct_answer: answer,
      wrong_answers: [],
      category: "Scales",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `${answer} ascending over one octave.`,
      notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
    });
  }

  // Major pentatonic
  for (const root of ["C", "G", "D", "F", "A"]) {
    const answer = `${root} Major Pentatonic`;
    beginnerPool.push(answer);
    qNum++;
    const body = scaleToAbc(root, 4, SCALE_TYPES["Major Pentatonic"], "treble");
    questions.push({
      set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What scale is shown?`,
      correct_answer: answer,
      wrong_answers: [],
      category: "Scales",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `${answer} — a 5-note scale.`,
      notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
    });
  }

  // Minor pentatonic
  for (const root of ["A", "E", "D"]) {
    const answer = `${root} Minor Pentatonic`;
    beginnerPool.push(answer);
    qNum++;
    const body = scaleToAbc(root, 4, SCALE_TYPES["Minor Pentatonic"], "treble");
    questions.push({
      set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What scale is shown?`,
      correct_answer: answer,
      wrong_answers: [],
      category: "Scales",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `${answer} — a 5-note minor scale.`,
      notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
    });
  }

  // Fill in wrong answers for beginner
  for (const q of questions.filter(q => q.difficulty === "beginner" && q.category === "Scales")) {
    q.wrong_answers = wrongScales(q.correct_answer, beginnerPool);
  }

  // === INTERMEDIATE: Modes + harmonic/melodic minor + more pentatonics + blues ===
  const modeNames = ["Dorian", "Phrygian", "Lydian", "Mixolydian", "Locrian"];
  const modeKeys = ["C", "G", "D", "F", "Bb"];
  const intermediatePool = [...beginnerPool];

  // 7 modes across 5 keys
  for (const root of modeKeys) {
    for (const mode of modeNames) {
      const scaleIntervals = SCALE_TYPES[mode];
      if (!scaleIntervals) continue;
      const answer = `${root} ${mode}`;
      intermediatePool.push(answer);
      qNum++;
      const body = scaleToAbc(root, 4, scaleIntervals, "treble");
      questions.push({
        set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What scale or mode is shown?`,
        correct_answer: answer,
        wrong_answers: wrongScales(answer, intermediatePool),
        category: "Scales",
        quiz_type: "staff_notation",
        difficulty: "intermediate",
        explanation: `${answer} — one of the seven modes of the major scale.`,
        notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
      });
    }
  }

  // Harmonic minor in all 12 keys
  for (const root of ["A", "E", "B", "F#", "C", "D", "G", "F", "Bb", "Eb", "Ab", "C#"]) {
    const answer = `${root} Harmonic Minor Scale`;
    intermediatePool.push(answer);
    qNum++;
    const body = scaleToAbc(root, 4, SCALE_TYPES["Harmonic Minor Scale"], "treble");
    questions.push({
      set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What scale is shown?`,
      correct_answer: answer,
      wrong_answers: wrongScales(answer, intermediatePool),
      category: "Scales",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${answer} — natural minor with a raised 7th degree.`,
      notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
    });
  }

  // Melodic minor in common keys
  for (const root of ["A", "C", "D", "E", "G", "F", "Bb"]) {
    const answer = `${root} Melodic Minor Scale (ascending)`;
    intermediatePool.push(answer);
    qNum++;
    const body = scaleToAbc(root, 4, SCALE_TYPES["Melodic Minor Scale (ascending)"], "treble");
    questions.push({
      set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What scale is shown?`,
      correct_answer: answer,
      wrong_answers: wrongScales(answer, intermediatePool),
      category: "Scales",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${answer} — natural minor with raised 6th and 7th.`,
      notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
    });
  }

  // Blues scale
  for (const root of ["C", "A", "E", "G", "D", "F", "Bb"]) {
    const answer = `${root} Blues Scale`;
    intermediatePool.push(answer);
    qNum++;
    const body = scaleToAbc(root, 4, SCALE_TYPES["Blues Scale"], "treble");
    questions.push({
      set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What scale is shown?`,
      correct_answer: answer,
      wrong_answers: wrongScales(answer, intermediatePool),
      category: "Scales",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${answer} — minor pentatonic plus the blue note (b5).`,
      notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
    });
  }

  // Major scales in harder keys (intermediate)
  for (const root of ["A", "E", "Eb", "Ab"]) {
    const answer = `${root} Major Scale`;
    intermediatePool.push(answer);
    qNum++;
    const body = scaleToAbc(root, 4, SCALE_TYPES["Major Scale"], "treble");
    questions.push({
      set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What scale is shown?`,
      correct_answer: answer,
      wrong_answers: wrongScales(answer, intermediatePool),
      category: "Scales",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${answer} with 3-4 accidentals.`,
      notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
    });
  }

  // === ADVANCED: All modes in all keys, exotic scales ===
  const advancedPool = [...intermediatePool];
  const advModeKeys = ["A", "E", "B", "Eb", "Ab", "F#", "Db"];

  // Additional modes in harder keys
  for (const root of advModeKeys) {
    for (const mode of modeNames) {
      const scaleIntervals = SCALE_TYPES[mode];
      if (!scaleIntervals) continue;
      const answer = `${root} ${mode}`;
      if (advancedPool.includes(answer)) continue;
      advancedPool.push(answer);
      qNum++;
      const body = scaleToAbc(root, 4, scaleIntervals, "treble");
      questions.push({
        set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What scale or mode is shown?`,
        correct_answer: answer,
        wrong_answers: wrongScales(answer, advancedPool),
        category: "Scales",
        quiz_type: "staff_notation",
        difficulty: "advanced",
        explanation: `${answer} mode.`,
        notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
      });
    }
  }

  // Exotic scales
  const exoticScales = [
    "Whole Tone Scale", "Diminished Scale (half-whole)", "Diminished Scale (whole-half)",
    "Altered Scale", "Hungarian Minor", "Double Harmonic Major",
    "Phrygian Dominant", "Lydian Dominant", "Bebop Dominant", "Bebop Major",
    "Chromatic Scale",
  ];

  const exoticRoots = {
    "Whole Tone Scale": ["C", "Db"],
    "Diminished Scale (half-whole)": ["C", "D", "Eb"],
    "Diminished Scale (whole-half)": ["C", "D", "Eb"],
    "Altered Scale": ["C", "D", "G", "A", "Bb"],
    "Hungarian Minor": ["C", "A", "D"],
    "Double Harmonic Major": ["C", "D", "E"],
    "Phrygian Dominant": ["C", "A", "E", "D"],
    "Lydian Dominant": ["C", "F", "Bb"],
    "Bebop Dominant": ["C", "G", "F"],
    "Bebop Major": ["C", "G"],
    "Chromatic Scale": ["C"],
  };

  for (const scaleName of exoticScales) {
    const roots = exoticRoots[scaleName] || ["C"];
    const scaleIntervals = SCALE_TYPES[scaleName];
    if (!scaleIntervals) continue;

    for (const root of roots) {
      const answer = `${root} ${scaleName}`;
      advancedPool.push(answer);
      qNum++;
      const body = scaleToAbc(root, 4, scaleIntervals, "treble");
      questions.push({
        set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What scale is shown?`,
        correct_answer: answer,
        wrong_answers: wrongScales(answer, advancedPool),
        category: "Scales",
        quiz_type: "staff_notation",
        difficulty: "advanced",
        explanation: `${answer}.`,
        notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
      });
    }
  }

  // Major scales in hardest keys (advanced)
  for (const root of ["B", "F#", "Db", "Gb"]) {
    const answer = `${root} Major Scale`;
    advancedPool.push(answer);
    qNum++;
    const body = scaleToAbc(root, 4, SCALE_TYPES["Major Scale"], "treble");
    questions.push({
      set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What scale is shown?`,
      correct_answer: answer,
      wrong_answers: wrongScales(answer, advancedPool),
      category: "Scales",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `${answer} with 5+ accidentals.`,
      notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
    });
  }

  // MORE BEGINNER: Natural minor in more keys + bass clef scales
  for (const root of ["B", "F"]) {
    const answer = `${root} Natural Minor Scale`;
    beginnerPool.push(answer);
    qNum++;
    const body = scaleToAbc(root, 4, SCALE_TYPES["Natural Minor Scale"], "treble");
    questions.push({
      set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What scale is shown?`,
      correct_answer: answer,
      wrong_answers: wrongScales(answer, beginnerPool),
      category: "Scales",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `${answer} ascending over one octave.`,
      notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
    });
  }

  // Bass clef major scales (beginner)
  for (const root of ["C", "G", "F"]) {
    const answer = `${root} Major Scale`;
    qNum++;
    const body = scaleToAbc(root, 3, SCALE_TYPES["Major Scale"], "bass");
    questions.push({
      set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What scale is shown on the bass clef?`,
      correct_answer: answer,
      wrong_answers: wrongScales(answer, beginnerPool),
      category: "Scales",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `${answer} on the bass clef.`,
      notation_data: buildAbc({ clef: "bass", key: "C", baseLength: "1/8", body }),
    });
  }

  // MORE INTERMEDIATE: More keys for modes + natural minor in harder keys
  const moreIntModeKeys = ["A", "E", "Eb"];
  for (const root of moreIntModeKeys) {
    for (const mode of ["Dorian", "Mixolydian", "Lydian"]) {
      const scaleIntervals = SCALE_TYPES[mode];
      if (!scaleIntervals) continue;
      const answer = `${root} ${mode}`;
      if (intermediatePool.includes(answer)) continue;
      intermediatePool.push(answer);
      qNum++;
      const body = scaleToAbc(root, 4, scaleIntervals, "treble");
      questions.push({
        set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What scale or mode is shown?`,
        correct_answer: answer,
        wrong_answers: wrongScales(answer, intermediatePool),
        category: "Scales",
        quiz_type: "staff_notation",
        difficulty: "intermediate",
        explanation: `${answer} mode.`,
        notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
      });
    }
  }

  // Natural minor in all 12 keys (intermediate)
  for (const root of ["F#", "Bb", "Eb", "Ab", "C#"]) {
    const answer = `${root} Natural Minor Scale`;
    intermediatePool.push(answer);
    qNum++;
    const body = scaleToAbc(root, 4, SCALE_TYPES["Natural Minor Scale"], "treble");
    questions.push({
      set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What scale is shown?`,
      correct_answer: answer,
      wrong_answers: wrongScales(answer, intermediatePool),
      category: "Scales",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${answer}.`,
      notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
    });
  }

  // More pentatonic/blues in more keys (intermediate)
  for (const root of ["Bb", "Eb", "F", "B"]) {
    for (const type of ["Major Pentatonic", "Minor Pentatonic", "Blues Scale"]) {
      const scaleIntervals = SCALE_TYPES[type];
      if (!scaleIntervals) continue;
      const answer = `${root} ${type}`;
      if (intermediatePool.includes(answer)) continue;
      intermediatePool.push(answer);
      qNum++;
      const body = scaleToAbc(root, 4, scaleIntervals, "treble");
      questions.push({
        set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What scale is shown?`,
        correct_answer: answer,
        wrong_answers: wrongScales(answer, intermediatePool),
        category: "Scales",
        quiz_type: "staff_notation",
        difficulty: "intermediate",
        explanation: `${answer}.`,
        notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
      });
    }
  }

  // MORE ADVANCED: More exotic scale roots + modes in remaining keys
  const moreAdvModeKeys = ["Bb", "Gb", "C#"];
  for (const root of moreAdvModeKeys) {
    for (const mode of ["Dorian", "Phrygian", "Lydian", "Mixolydian", "Locrian"]) {
      const scaleIntervals = SCALE_TYPES[mode];
      if (!scaleIntervals) continue;
      const answer = `${root} ${mode}`;
      if (advancedPool.includes(answer)) continue;
      advancedPool.push(answer);
      qNum++;
      const body = scaleToAbc(root, 4, scaleIntervals, "treble");
      questions.push({
        set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What scale or mode is shown?`,
        correct_answer: answer,
        wrong_answers: wrongScales(answer, advancedPool),
        category: "Scales",
        quiz_type: "staff_notation",
        difficulty: "advanced",
        explanation: `${answer} mode.`,
        notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
      });
    }
  }

  // More exotic scale roots
  const moreExoticRoots = {
    "Altered Scale": ["E", "F", "F#"],
    "Phrygian Dominant": ["G", "F", "Bb"],
    "Lydian Dominant": ["D", "G", "A"],
    "Whole Tone Scale": ["D", "E", "F#"],
    "Hungarian Minor": ["E", "G", "Bb"],
    "Double Harmonic Major": ["A", "G", "F"],
  };

  for (const [scaleName, roots] of Object.entries(moreExoticRoots)) {
    const scaleIntervals = SCALE_TYPES[scaleName];
    if (!scaleIntervals) continue;
    for (const root of roots) {
      const answer = `${root} ${scaleName}`;
      if (advancedPool.includes(answer)) continue;
      advancedPool.push(answer);
      qNum++;
      const body = scaleToAbc(root, 4, scaleIntervals, "treble");
      questions.push({
        set_id: `gen-scales-${String(qNum).padStart(3, "0")}`,
        question_number: qNum,
        question_text: `What scale is shown?`,
        correct_answer: answer,
        wrong_answers: wrongScales(answer, advancedPool),
        category: "Scales",
        quiz_type: "staff_notation",
        difficulty: "advanced",
        explanation: `${answer}.`,
        notation_data: buildAbc({ clef: "treble", key: "C", baseLength: "1/8", body }),
      });
    }
  }

  return questions;
}


function generateRhythm() {
  const questions = [];
  let qNum = 0;

  // === BEGINNER: Note value identification ===
  const noteValues = [
    { name: "Whole note", beats: "4 beats", abc: "C4", baseLength: "1/4", difficulty: "beginner" },
    { name: "Half note", beats: "2 beats", abc: "C2", baseLength: "1/4", difficulty: "beginner" },
    { name: "Quarter note", beats: "1 beat", abc: "C", baseLength: "1/4", difficulty: "beginner" },
    { name: "Eighth note", beats: "1/2 beat", abc: "C/2", baseLength: "1/4", difficulty: "beginner" },
    { name: "Sixteenth note", beats: "1/4 beat", abc: "C/4", baseLength: "1/4", difficulty: "beginner" },
  ];

  const valuePool = noteValues.map(v => v.name);
  const beatsPool = noteValues.map(v => v.beats);

  // "What note value is shown?"
  for (const val of noteValues) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What note value is shown?`,
      correct_answer: val.name,
      wrong_answers: pickRandom(valuePool, 3, [val.name]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: val.difficulty,
      explanation: `This is a ${val.name}, worth ${val.beats} in 4/4 time.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: val.baseLength, body: val.abc }),
    });
  }

  // "How many beats?"
  for (const val of noteValues) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `How many beats does this note get in 4/4 time?`,
      correct_answer: val.beats,
      wrong_answers: pickRandom(beatsPool, 3, [val.beats]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: val.difficulty,
      explanation: `A ${val.name} gets ${val.beats} in 4/4 time.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: val.baseLength, body: val.abc }),
    });
  }

  // Rest values
  const restValues = [
    { name: "Whole rest", beats: "4 beats", abc: "z4", baseLength: "1/4" },
    { name: "Half rest", beats: "2 beats", abc: "z2", baseLength: "1/4" },
    { name: "Quarter rest", beats: "1 beat", abc: "z", baseLength: "1/4" },
    { name: "Eighth rest", beats: "1/2 beat", abc: "z/2", baseLength: "1/4" },
  ];

  const restPool = restValues.map(v => v.name);

  for (const val of restValues) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What rest value is shown?`,
      correct_answer: val.name,
      wrong_answers: pickRandom(restPool, 3, [val.name]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `This is a ${val.name}, lasting ${val.beats} of silence in 4/4 time.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: val.baseLength, body: val.abc }),
    });
  }

  // Simple patterns - count total beats (beginner)
  const simplePatterns = [
    { pattern: "C C C C", beats: "4 beats", desc: "4 quarter notes" },
    { pattern: "C2 C C", beats: "4 beats", desc: "half + 2 quarters" },
    { pattern: "C2 C2", beats: "4 beats", desc: "2 half notes" },
    { pattern: "C C2 C", beats: "4 beats", desc: "quarter + half + quarter" },
    { pattern: "C4", beats: "4 beats", desc: "1 whole note" },
    { pattern: "C C z C", beats: "4 beats", desc: "3 quarters + quarter rest" },
    { pattern: "z C C C", beats: "4 beats", desc: "quarter rest + 3 quarters" },
    { pattern: "C2 z2", beats: "4 beats", desc: "half note + half rest" },
    { pattern: "C C C z", beats: "4 beats", desc: "3 quarters + quarter rest" },
  ];

  const patternBeatsPool = ["3 beats", "4 beats", "5 beats", "6 beats", "2 beats"];

  for (const { pattern, beats, desc } of simplePatterns) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `How many total beats are in this measure?`,
      correct_answer: beats,
      wrong_answers: pickRandom(patternBeatsPool, 3, [beats]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `${desc} = ${beats} total.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: "1/4", body: pattern }),
    });
  }

  // === INTERMEDIATE: Dotted notes, ties, 3/4, syncopation ===

  // Dotted note identification
  const dottedNotes = [
    { name: "Dotted half note", beats: "3 beats", abc: "C3", baseLength: "1/4" },
    { name: "Dotted quarter note", beats: "1.5 beats", abc: "C3/2", baseLength: "1/4" },
    { name: "Dotted eighth note", beats: "3/4 beat", abc: "C3/4", baseLength: "1/4" },
  ];

  const dottedPool = dottedNotes.map(v => v.name);

  for (const val of dottedNotes) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What note value is shown?`,
      correct_answer: val.name,
      wrong_answers: pickRandom([...dottedPool, "Half note", "Quarter note", "Eighth note"], 3, [val.name]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `This is a ${val.name}, worth ${val.beats} in 4/4 time. A dot adds half the note's value.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: val.baseLength, body: val.abc }),
    });

    // How many beats?
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `How many beats does this dotted note get in 4/4?`,
      correct_answer: val.beats,
      wrong_answers: pickRandom(["1 beat", "1.5 beats", "2 beats", "3 beats", "4 beats", "3/4 beat"], 3, [val.beats]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `A ${val.name} gets ${val.beats}. The dot adds 50% to the note's value.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: val.baseLength, body: val.abc }),
    });
  }

  // Tied notes
  const tiedPatterns = [
    { pattern: "C2-C C", beats: "4 beats", desc: "half tied to quarter = 3 beats + quarter", answer: "3 beats + 1 beat" },
    { pattern: "C-C C C", beats: "4 beats", desc: "quarter tied to quarter = half + 2 quarters", answer: "2 beats + 1 beat + 1 beat" },
    { pattern: "C2-C2", beats: "4 beats", desc: "half tied to half = whole", answer: "4 beats (tied)" },
  ];

  for (const { pattern, beats, desc, answer } of tiedPatterns) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `How many total beats does the tied note last?`,
      correct_answer: answer,
      wrong_answers: pickRandom(["1 beat", "2 beats", "3 beats", "4 beats (tied)", "2 beats + 1 beat + 1 beat", "3 beats + 1 beat"], 3, [answer]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${desc}. A tie connects two notes of the same pitch, combining their durations.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: "1/4", body: pattern }),
    });
  }

  // 3/4 time patterns
  const threeQuarterPatterns = [
    { pattern: "C C C", beats: "3 beats", desc: "3 quarter notes in 3/4" },
    { pattern: "C2 C", beats: "3 beats", desc: "half + quarter in 3/4" },
    { pattern: "C C2", beats: "3 beats", desc: "quarter + half in 3/4" },
    { pattern: "C3", beats: "3 beats", desc: "dotted half in 3/4 (fills the bar)" },
    { pattern: "C z C", beats: "3 beats", desc: "quarter, quarter rest, quarter in 3/4" },
  ];

  for (const { pattern, beats, desc } of threeQuarterPatterns) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `How many beats fill this bar in 3/4 time?`,
      correct_answer: beats,
      wrong_answers: pickRandom(["2 beats", "3 beats", "4 beats", "5 beats", "6 beats"], 3, [beats]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `In 3/4 time, each bar has 3 beats. ${desc}.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "3/4", baseLength: "1/4", body: pattern }),
    });
  }

  // 2/4 time
  const twoQuarterPatterns = [
    { pattern: "C C", beats: "2 beats", desc: "2 quarter notes in 2/4" },
    { pattern: "C2", beats: "2 beats", desc: "half note fills the bar in 2/4" },
    { pattern: "C z", beats: "2 beats", desc: "quarter + quarter rest in 2/4" },
  ];

  for (const { pattern, beats, desc } of twoQuarterPatterns) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `How many beats fill this bar in 2/4 time?`,
      correct_answer: beats,
      wrong_answers: pickRandom(["1 beat", "2 beats", "3 beats", "4 beats"], 3, [beats]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `In 2/4 time, each bar has 2 beats. ${desc}.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "2/4", baseLength: "1/4", body: pattern }),
    });
  }

  // Intermediate patterns with sixteenths and mixed values
  const mixedPatterns = [
    { pattern: "C/2 C/2 C C", beats: "4 quarter beats", desc: "2 eighths + 2 quarters", name: "Eighth-eighth-quarter-quarter" },
    { pattern: "C C/2 C/2 C", beats: "4 quarter beats", desc: "quarter + 2 eighths + quarter", name: "Quarter-eighth-eighth-quarter" },
    { pattern: "C3/2 C/2 C C", beats: "4 quarter beats", desc: "dotted quarter + eighth + 2 quarters", name: "Dotted quarter-eighth-quarter-quarter" },
    { pattern: "C/2 C/2 C/2 C/2 C2", beats: "4 quarter beats", desc: "4 eighths + half note", name: "Four eighths then half note" },
    { pattern: "C C/4 C/4 C/4 C/4 C", beats: "3 quarter beats", desc: "quarter + 4 sixteenths + quarter", name: "Quarter-4 sixteenths-quarter" },
  ];

  for (const { pattern, beats, desc, name } of mixedPatterns) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What rhythm pattern is shown?`,
      correct_answer: name,
      wrong_answers: pickRandom(mixedPatterns.map(p => p.name), 3, [name]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${desc}.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: "1/4", body: pattern }),
    });
  }

  // Syncopation patterns (intermediate)
  const syncopationPatterns = [
    { pattern: "C/2 C C/2", beats: "2 beats", desc: "eighth-quarter-eighth syncopation", name: "Off-beat syncopation" },
    { pattern: "z/2 C C/2 C", beats: "2 beats", desc: "eighth rest-quarter-eighth-quarter", name: "Rest-based syncopation" },
    { pattern: "C/2 C/2 z/2 C/2 C", beats: "2.5 beats", desc: "syncopated with rest", name: "Displaced accent syncopation" },
  ];

  for (const { pattern, beats, desc, name } of syncopationPatterns) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What type of rhythmic device is demonstrated?`,
      correct_answer: "Syncopation",
      wrong_answers: ["Straight rhythm", "Swing", "Hemiola"],
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${name}: ${desc}. Syncopation places emphasis on normally weak beats.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: "1/4", body: pattern }),
    });
  }

  // === ADVANCED: Compound meter, triplets, complex patterns ===

  // 6/8 time identification
  const sixEightPatterns = [
    { pattern: "C/2 C/2 C/2 C/2 C/2 C/2", name: "Six eighth notes", desc: "6 equal eighth notes" },
    { pattern: "C3/2 C3/2", name: "Two dotted quarters", desc: "2 dotted quarter notes (standard 6/8 pulse)" },
    { pattern: "C/2 C/2 C/2 C3/2", name: "Three eighths + dotted quarter", desc: "3 eighths + dotted quarter" },
    { pattern: "C3/2 C/2 C/2 C/2", name: "Dotted quarter + three eighths", desc: "dotted quarter + 3 eighths" },
  ];

  for (const { pattern, name, desc } of sixEightPatterns) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What rhythm pattern is shown in 6/8 time?`,
      correct_answer: name,
      wrong_answers: pickRandom(sixEightPatterns.map(p => p.name), 3, [name]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `In 6/8 time (compound duple): ${desc}.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "6/8", baseLength: "1/4", body: pattern }),
    });
  }

  // Compound meter identification
  qNum++;
  questions.push({
    set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
    question_number: qNum,
    question_text: `6/8 time is an example of which meter type?`,
    correct_answer: "Compound duple",
    wrong_answers: ["Simple duple", "Compound triple", "Simple triple"],
    category: "Rhythm",
    quiz_type: "staff_notation",
    difficulty: "advanced",
    explanation: `6/8 = compound duple: 2 groups of 3 eighth notes per bar.`,
    notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "6/8", baseLength: "1/4", body: "C3/2 C3/2" }),
  });

  qNum++;
  questions.push({
    set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
    question_number: qNum,
    question_text: `9/8 time is an example of which meter type?`,
    correct_answer: "Compound triple",
    wrong_answers: ["Simple triple", "Compound duple", "Simple duple"],
    category: "Rhythm",
    quiz_type: "staff_notation",
    difficulty: "advanced",
    explanation: `9/8 = compound triple: 3 groups of 3 eighth notes per bar.`,
    notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "9/8", baseLength: "1/4", body: "C3/2 C3/2 C3/2" }),
  });

  qNum++;
  questions.push({
    set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
    question_number: qNum,
    question_text: `12/8 time is an example of which meter type?`,
    correct_answer: "Compound quadruple",
    wrong_answers: ["Simple quadruple", "Compound triple", "Compound duple"],
    category: "Rhythm",
    quiz_type: "staff_notation",
    difficulty: "advanced",
    explanation: `12/8 = compound quadruple: 4 groups of 3 eighth notes per bar.`,
    notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "12/8", baseLength: "1/4", body: "C3/2 C3/2 C3/2 C3/2" }),
  });

  // Triplets
  const tripletPatterns = [
    { pattern: "(3C/2 C/2 C/2 C C", beats: "3 beats", desc: "triplet quarter notes + 2 quarters", name: "Triplet + two quarters" },
    { pattern: "C (3C/2 C/2 C/2 C", beats: "3 beats", desc: "quarter + triplet + quarter", name: "Quarter-triplet-quarter" },
    { pattern: "(3C/2 C/2 C/2 (3C/2 C/2 C/2", beats: "2 beats", desc: "two consecutive triplet groups", name: "Double triplet" },
  ];

  for (const { pattern, beats, desc, name } of tripletPatterns) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What rhythm pattern includes triplets?`,
      correct_answer: name,
      wrong_answers: pickRandom(tripletPatterns.map(p => p.name).concat(["Straight eighths", "Dotted rhythm"]), 3, [name]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `${desc}. A triplet divides a beat into 3 equal parts instead of 2.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: "1/4", body: pattern }),
    });
  }

  // Complex patterns with mixed rests (advanced)
  const complexPatterns = [
    { pattern: "C/2 z/2 C3/2 C/2 z", name: "Eighth-rest-dotted quarter-eighth-rest", desc: "syncopated pattern with rests and dotted rhythm" },
    { pattern: "z/2 C/2 C/2 C/2 C2", name: "Rest-three eighths-half", desc: "pickup into half note" },
    { pattern: "C3/2 C/2 z/2 C/2 C", name: "Dotted quarter-eighth-rest-eighth-quarter", desc: "dotted rhythm with rest interruption" },
    { pattern: "C/4 C/4 C/2 C C z", name: "Two sixteenths-eighth-quarter-quarter-rest", desc: "subdivided opening into quarter values" },
  ];

  for (const { pattern, name, desc } of complexPatterns) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `Describe the rhythm pattern shown.`,
      correct_answer: name,
      wrong_answers: pickRandom(complexPatterns.map(p => p.name), 3, [name]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `This pattern shows ${desc}.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: "1/4", body: pattern }),
    });
  }

  // Note grouping in compound time (advanced)
  qNum++;
  questions.push({
    set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
    question_number: qNum,
    question_text: `In 6/8 time, how should eighth notes be grouped?`,
    correct_answer: "Groups of 3",
    wrong_answers: ["Groups of 2", "Groups of 4", "Groups of 6"],
    category: "Rhythm",
    quiz_type: "staff_notation",
    difficulty: "advanced",
    explanation: `In 6/8 (compound duple), eighth notes group in 3s, reflecting the underlying dotted-quarter pulse.`,
    notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "6/8", baseLength: "1/4", body: "C/2 C/2 C/2 C/2 C/2 C/2" }),
  });

  // Hemiola pattern (advanced)
  qNum++;
  questions.push({
    set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
    question_number: qNum,
    question_text: `What rhythmic device is demonstrated when 3/4 is superimposed over 6/8?`,
    correct_answer: "Hemiola",
    wrong_answers: ["Syncopation", "Polyrhythm", "Cross-rhythm"],
    category: "Rhythm",
    quiz_type: "staff_notation",
    difficulty: "advanced",
    explanation: `A hemiola occurs when a passage in compound meter (6/8) is temporarily grouped in duple patterns (3/4), creating rhythmic tension.`,
    notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "6/8", baseLength: "1/4", body: "C C C" }),
  });

  // ──── MORE BEGINNER RHYTHM ────

  // More simple patterns with different note combos
  const moreSimplePatterns = [
    { pattern: "C/2 C/2 C/2 C/2 C2", beats: "4 beats", desc: "4 eighths + half" },
    { pattern: "C/2 C/2 C C C", beats: "4 beats", desc: "2 eighths + 3 quarters" },
    { pattern: "C2 C2", beats: "4 beats", desc: "2 halves" },
    { pattern: "C C C/2 C/2 C", beats: "4 beats", desc: "2 quarters + 2 eighths + quarter" },
    { pattern: "z2 C2", beats: "4 beats", desc: "half rest + half note" },
    { pattern: "C z C z", beats: "4 beats", desc: "alternating quarters and rests" },
    { pattern: "z z C C", beats: "4 beats", desc: "2 quarter rests + 2 quarters" },
    { pattern: "C/2 C/2 C/2 C/2 C/2 C/2 C/2 C/2", beats: "4 beats", desc: "8 eighth notes" },
    { pattern: "z4", beats: "4 beats", desc: "whole rest" },
    { pattern: "C2 z C", beats: "4 beats", desc: "half + quarter rest + quarter" },
  ];

  for (const { pattern, beats, desc } of moreSimplePatterns) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `How many total beats are in this measure (4/4 time)?`,
      correct_answer: beats,
      wrong_answers: pickRandom(patternBeatsPool, 3, [beats]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `${desc} = ${beats} total.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: "1/4", body: pattern }),
    });
  }

  // "What fills this bar?" questions (beginner)
  const fillBarQs = [
    { given: "C C C", missing: "Quarter note", question: "What single note completes this bar in 4/4?" },
    { given: "C2 C", missing: "Quarter note", question: "What single note completes this bar in 4/4?" },
    { given: "C C", missing: "Half note", question: "What single note completes this bar in 4/4?" },
    { given: "C", missing: "Dotted half note", question: "What single note completes this bar in 4/4?" },
  ];

  for (const { given, missing, question } of fillBarQs) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: question,
      correct_answer: missing,
      wrong_answers: pickRandom(["Whole note", "Half note", "Quarter note", "Eighth note", "Dotted half note", "Dotted quarter note"], 3, [missing]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "beginner",
      explanation: `${given} + ${missing} = 4 beats to fill the bar.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: "1/4", body: given }),
    });
  }

  // ──── MORE INTERMEDIATE RHYTHM ────

  // More dotted patterns
  const moreDottedPatterns = [
    { pattern: "C3 C", name: "Dotted half + quarter", beats: "4 beats", desc: "dotted half (3 beats) + quarter (1 beat)" },
    { pattern: "C3/2 C/2 C3/2 C/2", name: "Two dotted quarter-eighth pairs", beats: "4 beats", desc: "2x (dotted quarter + eighth)" },
    { pattern: "C C3/2 C/2", name: "Quarter + dotted quarter + eighth", beats: "3 beats", desc: "quarter + dotted quarter + eighth" },
    { pattern: "C3/2 C/2 C z", name: "Dotted quarter-eighth-quarter-rest", beats: "4 beats", desc: "dotted quarter + eighth + quarter + quarter rest" },
  ];

  for (const { pattern, name, beats, desc } of moreDottedPatterns) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What rhythm pattern is shown?`,
      correct_answer: name,
      wrong_answers: pickRandom(moreDottedPatterns.map(p => p.name), 3, [name]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${desc}.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: "1/4", body: pattern }),
    });
  }

  // More tied note patterns
  const moreTiedPatterns = [
    { pattern: "C-C2 C", total: "4 beats", desc: "quarter tied to half + quarter = 3+1", tiedVal: "3 beats" },
    { pattern: "C/2-C/2 C C", total: "3 beats", desc: "eighth tied to eighth (= quarter) + 2 quarters", tiedVal: "1 beat" },
    { pattern: "C-C C-C", total: "4 beats", desc: "two tied pairs = 2+2", tiedVal: "2 beats each" },
  ];

  for (const { pattern, total, desc, tiedVal } of moreTiedPatterns) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `How many total beats are in this pattern with ties?`,
      correct_answer: total,
      wrong_answers: pickRandom(["2 beats", "3 beats", "4 beats", "5 beats", "6 beats"], 3, [total]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${desc}. Ties combine note durations: ${tiedVal}.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: "1/4", body: pattern }),
    });
  }

  // More 3/4 patterns
  const moreThreeQ = [
    { pattern: "C/2 C/2 C C", beats: "3 beats", desc: "2 eighths + 2 quarters in 3/4" },
    { pattern: "C C/2 C/2 C", beats: "3 beats", desc: "quarter-2 eighths-quarter in 3/4" },
    { pattern: "z C C", beats: "3 beats", desc: "quarter rest-quarter-quarter in 3/4" },
    { pattern: "C/2 C/2 C/2 C/2 C", beats: "3 beats", desc: "4 eighths + quarter in 3/4" },
  ];

  for (const { pattern, beats, desc } of moreThreeQ) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What rhythm fills this bar in 3/4 time?`,
      correct_answer: desc,
      wrong_answers: pickRandom(moreThreeQ.map(p => p.desc), 3, [desc]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `In 3/4: ${desc} = ${beats}.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "3/4", baseLength: "1/4", body: pattern }),
    });
  }

  // Time signature identification
  const timeSigQs = [
    { ts: "3/4", name: "3/4", desc: "3 quarter-note beats per bar" },
    { ts: "2/4", name: "2/4", desc: "2 quarter-note beats per bar" },
    { ts: "6/8", name: "6/8", desc: "6 eighth-note beats, grouped in 3s" },
    { ts: "2/2", name: "2/2", desc: "2 half-note beats per bar (cut time)" },
  ];

  for (const { ts, name, desc } of timeSigQs) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What time signature is shown?`,
      correct_answer: name,
      wrong_answers: pickRandom(timeSigQs.map(t => t.name).concat(["4/4", "5/4"]), 3, [name]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${name}: ${desc}.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: ts, baseLength: "1/4", body: "C C" }),
    });
  }

  // Sixteenth note patterns (intermediate)
  const sixteenthPatterns = [
    { pattern: "C/4 C/4 C/4 C/4 C C C", name: "4 sixteenths + 3 quarters", beats: "4 beats" },
    { pattern: "C C/4 C/4 C/4 C/4 C C", name: "Quarter + 4 sixteenths + 2 quarters", beats: "4 beats" },
    { pattern: "C/4 C/4 C/2 C/4 C/4 C/2 C2", name: "2x(2 sixteenths-eighth) + half", beats: "4 beats" },
  ];

  for (const { pattern, name, beats } of sixteenthPatterns) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What rhythm pattern is shown?`,
      correct_answer: name,
      wrong_answers: pickRandom(sixteenthPatterns.map(p => p.name).concat(["8 sixteenths", "Quarter + 2 eighths + quarter"]), 3, [name]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "intermediate",
      explanation: `${name} = ${beats}.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: "1/4", body: pattern }),
    });
  }

  // ──── MORE ADVANCED RHYTHM ────

  // More 6/8 patterns
  const moreSixEight = [
    { pattern: "C z/2 C/2 C/2 C3/2", name: "Quarter-eighth rest-2 eighths-dotted quarter", desc: "syncopated 6/8 pattern" },
    { pattern: "C/2 C C/2 C C", name: "Eighth-quarter-eighth-2 quarters", desc: "uneven grouping in 6/8" },
    { pattern: "z3/2 C/2 C/2 C/2", name: "Dotted quarter rest + 3 eighths", desc: "rest-pickup in 6/8" },
  ];

  for (const { pattern, name, desc } of moreSixEight) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `Describe this 6/8 rhythm pattern.`,
      correct_answer: name,
      wrong_answers: pickRandom([...moreSixEight.map(p => p.name), "Six even eighths", "Two dotted quarters"], 3, [name]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `${desc}.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "6/8", baseLength: "1/4", body: pattern }),
    });
  }

  // More complex mixed patterns (advanced)
  const moreComplexPatterns = [
    { pattern: "C/4 C/4 C/2 C3/2 C/2", name: "2 sixteenths-eighth-dotted quarter-eighth", desc: "fast subdivision into long note" },
    { pattern: "C/2 C/4 C/4 C/2 C/4 C/4 C2", name: "Eighth-2 sixteenths-eighth-2 sixteenths-half", desc: "compound subdivision pattern" },
    { pattern: "z/2 C/2 z/2 C/2 C2", name: "Eighth rest-eighth-eighth rest-eighth-half", desc: "broken eighth pattern resolving to half" },
    { pattern: "C3/2 z/2 C/2 C/2 z", name: "Dotted quarter-eighth rest-2 eighths-quarter rest", desc: "interrupted dotted rhythm" },
    { pattern: "C/4 C/4 C/4 C/4 C/4 C/4 C/4 C/4 C2", name: "8 sixteenths + half note", desc: "rapid subdivision resolving to sustained note" },
    { pattern: "C C/2 z/2 C/2 C/2 C", name: "Quarter-eighth-eighth rest-2 eighths-quarter", desc: "syncopation with rest displacement" },
  ];

  for (const { pattern, name, desc } of moreComplexPatterns) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `Describe the rhythm pattern shown.`,
      correct_answer: name,
      wrong_answers: pickRandom(moreComplexPatterns.map(p => p.name), 3, [name]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `${desc}.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: "1/4", body: pattern }),
    });
  }

  // Meter classification questions (advanced)
  const meterQs = [
    { meter: "4/4", type: "Simple quadruple", desc: "4 beats per bar, each divided into 2" },
    { meter: "3/4", type: "Simple triple", desc: "3 beats per bar, each divided into 2" },
    { meter: "2/4", type: "Simple duple", desc: "2 beats per bar, each divided into 2" },
    { meter: "6/8", type: "Compound duple", desc: "2 groups of 3 eighth notes" },
    { meter: "9/8", type: "Compound triple", desc: "3 groups of 3 eighth notes" },
    { meter: "12/8", type: "Compound quadruple", desc: "4 groups of 3 eighth notes" },
  ];

  for (const { meter, type, desc } of meterQs) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What type of meter is ${meter}?`,
      correct_answer: type,
      wrong_answers: pickRandom(meterQs.map(m => m.type), 3, [type]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `${meter} is ${type}: ${desc}.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: meter, baseLength: "1/4", body: "C C" }),
    });
  }

  // More triplet variations (advanced)
  const moreTriplets = [
    { pattern: "(3C/2 C/2 C/2 C2 C", name: "Triplet + half + quarter", desc: "triplet opening into sustained notes" },
    { pattern: "C C (3C/2 C/2 C/2 C", name: "Quarter-quarter-triplet-quarter", desc: "mid-bar triplet" },
    { pattern: "(3C/2 z/2 C/2 C C", name: "Triplet with rest + 2 quarters", desc: "triplet containing a rest" },
  ];

  for (const { pattern, name, desc } of moreTriplets) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: `What rhythm pattern includes triplets?`,
      correct_answer: name,
      wrong_answers: pickRandom([...moreTriplets.map(p => p.name), "Straight eighths", "Dotted rhythm", "Triplet + two quarters"], 3, [name]),
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `${desc}. Triplets divide a beat into 3 equal parts.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: "1/4", body: pattern }),
    });
  }

  // Advanced theory: note grouping rules
  const groupingQs = [
    { q: "In 4/4 time, which beat is the strongest?", a: "Beat 1", wrong: ["Beat 2", "Beat 3", "Beat 4"] },
    { q: "In 3/4 time, which beat is the strongest?", a: "Beat 1", wrong: ["Beat 2", "Beat 3", "All equal"] },
    { q: "What is an anacrusis (pickup)?", a: "Notes before the first full bar", wrong: ["A type of rest", "A tempo marking", "A dynamic marking"] },
    { q: "What does 'alla breve' (cut time) mean?", a: "2/2 time (half note gets the beat)", wrong: ["4/4 time at double speed", "3/4 time", "6/8 time"] },
  ];

  for (const { q, a, wrong } of groupingQs) {
    qNum++;
    questions.push({
      set_id: `gen-rhythm-${String(qNum).padStart(3, "0")}`,
      question_number: qNum,
      question_text: q,
      correct_answer: a,
      wrong_answers: wrong,
      category: "Rhythm",
      quiz_type: "staff_notation",
      difficulty: "advanced",
      explanation: `${a}.`,
      notation_data: buildAbc({ clef: "treble", key: "C", timeSig: "4/4", baseLength: "1/4", body: "C C C C" }),
    });
  }

  return questions;
}


// ═══════════════════════════════════════════════════════════════════
// MAIN: Generate all questions and output CSV
// ═══════════════════════════════════════════════════════════════════

function main() {
  console.error("Generating staff notation questions...");

  const allQuestions = [
    ...generateNoteReading(),
    ...generateIntervals(),
    ...generateChords(),
    ...generateKeySignatures(),
    ...generateScales(),
    ...generateRhythm(),
  ];

  // Renumber set_ids consistently
  const categoryCounts = {};
  for (const q of allQuestions) {
    const catKey = q.category.toLowerCase().replace(/\s+/g, "-");
    categoryCounts[catKey] = (categoryCounts[catKey] || 0) + 1;
    q.set_id = `gen-${catKey}-${String(categoryCounts[catKey]).padStart(3, "0")}`;
    q.question_number = categoryCounts[catKey];
  }

  // CSV header
  const header = "set_id,question_number,question_text,correct_answer,wrong_answer_1,wrong_answer_2,wrong_answer_3,category,quiz_type,difficulty,explanation,improvement_note,notation_data";

  const rows = allQuestions.map(q => {
    const wrong = q.wrong_answers || [];
    return [
      csvEscape(q.set_id),
      csvEscape(q.question_number),
      csvEscape(q.question_text),
      csvEscape(q.correct_answer),
      csvEscape(wrong[0] || ""),
      csvEscape(wrong[1] || ""),
      csvEscape(wrong[2] || ""),
      csvEscape(q.category),
      csvEscape(q.quiz_type),
      csvEscape(q.difficulty),
      csvEscape(q.explanation),
      csvEscape(""),
      csvEscape(q.notation_data),
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");
  writeFileSync("staff_notation_generated.csv", csv);

  // Stats
  const stats = {};
  for (const q of allQuestions) {
    const key = `${q.category} - ${q.difficulty}`;
    stats[key] = (stats[key] || 0) + 1;
  }

  console.error("\n=== Generation Summary ===");
  console.error(`Total questions: ${allQuestions.length}`);
  console.error("");
  const categories = [...new Set(allQuestions.map(q => q.category))];
  for (const cat of categories) {
    const catQs = allQuestions.filter(q => q.category === cat);
    console.error(`${cat}: ${catQs.length}`);
    for (const diff of ["beginner", "intermediate", "advanced"]) {
      const count = catQs.filter(q => q.difficulty === diff).length;
      if (count > 0) console.error(`  ${diff}: ${count}`);
    }
  }

  console.error(`\nOutput: staff_notation_generated.csv`);
}

main();
