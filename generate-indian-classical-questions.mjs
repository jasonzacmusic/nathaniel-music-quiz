#!/usr/bin/env node
/**
 * Comprehensive Indian Classical Music Question Generator
 * Generates ~380+ questions across 9 categories with 3 difficulty levels.
 * Output: indian_classical_generated.csv matching the existing import schema.
 */

import { writeFileSync } from "fs";

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function csvEscape(val) {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return `"${s}"`;
}

function pickRandom(arr, count, exclude = []) {
  const filtered = arr.filter(x => !exclude.includes(x));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ═══════════════════════════════════════════════════════════════════
// INDIAN CLASSICAL MUSIC DATA
// ═══════════════════════════════════════════════════════════════════

// --- CARNATIC SWARAS & THEORY ---

const SWARAS_BASIC = ["Sa", "Ri", "Ga", "Ma", "Pa", "Da", "Ni"];

const SWARA_VARIANTS = {
  Sa: ["Sa"],
  Ri: ["Ri1 (Shuddha Rishabham)", "Ri2 (Chatushruti Rishabham)", "Ri3 (Shatshruti Rishabham)"],
  Ga: ["Ga1 (Shuddha Gandharam)", "Ga2 (Sadharana Gandharam)", "Ga3 (Antara Gandharam)"],
  Ma: ["Ma1 (Shuddha Madhyamam)", "Ma2 (Prati Madhyamam)"],
  Pa: ["Pa"],
  Da: ["Da1 (Shuddha Dhaivatam)", "Da2 (Chatushruti Dhaivatam)", "Da3 (Shatshruti Dhaivatam)"],
  Ni: ["Ni1 (Shuddha Nishadam)", "Ni2 (Kaisiki Nishadam)", "Ni3 (Kakali Nishadam)"],
};

const SWARASTHANAS_16 = [
  "Sa", "Ri1", "Ri2/Ga1", "Ri3/Ga2", "Ga3", "Ma1", "Ma2",
  "Pa", "Da1", "Da2/Ni1", "Da3/Ni2", "Ni3"
];

const STHAYI = [
  { name: "Mandra Sthayi", desc: "Lower octave" },
  { name: "Madhya Sthayi", desc: "Middle octave" },
  { name: "Tara Sthayi", desc: "Upper octave" },
];

const GAMAKAS = [
  { name: "Kampita", desc: "Oscillation between two adjacent notes" },
  { name: "Janta", desc: "Repetition of a note pair" },
  { name: "Spurita", desc: "A stress or emphasis on a note with a preceding grace note" },
  { name: "Nokku", desc: "Forceful rendering of a note from a higher note" },
  { name: "Odukkal", desc: "Deflection or sliding away from a note" },
  { name: "Orikkai", desc: "A shake or turn around a note" },
  { name: "Ravai", desc: "Sustained rendering of a note" },
  { name: "Khandippu", desc: "A sharp, staccato rendering of notes" },
  { name: "Pratyahata", desc: "Bouncing between notes in a specific pattern" },
  { name: "Tribhinna", desc: "Three-fold movement around a note" },
  { name: "Ahata", desc: "A struck note that resonates naturally" },
  { name: "Tiruppam", desc: "A turning ornament, circular movement around notes" },
];

const CARNATIC_CONCEPTS = [
  { term: "Arohana", def: "Ascending scale pattern of a raga" },
  { term: "Avarohana", def: "Descending scale pattern of a raga" },
  { term: "Vadi", def: "The most prominent or sonant note in a raga" },
  { term: "Samvadi", def: "The second most important note, consonant with the vadi" },
  { term: "Graha Swara", def: "The starting note of a raga composition" },
  { term: "Nyasa Swara", def: "The resting or concluding note of a raga phrase" },
  { term: "Jiva Swara", def: "The life-giving or characteristic note of a raga" },
  { term: "Amsa Swara", def: "The note that is most frequently used and emphasized in a raga" },
  { term: "Sruti", def: "Microtonal interval, the smallest audible pitch difference in Indian music" },
  { term: "Shadja", def: "The tonic note (Sa), the fundamental pitch reference" },
  { term: "Panchama", def: "The fifth note (Pa), a fixed swara like Sa" },
  { term: "Vivadi Swara", def: "Dissonant or inimical swara that is generally avoided in a raga" },
  { term: "Swaraprastara", def: "Systematic permutation and combination of swaras" },
  { term: "Alapana", def: "Raga elaboration without rhythmic accompaniment" },
  { term: "Neraval", def: "Improvisation on a single line of a composition with different swara patterns" },
  { term: "Kalpanaswaram", def: "Improvised swara passages sung to a tala cycle" },
  { term: "Sangati", def: "Progressive melodic variation of a line in a kriti" },
];

// --- MELAKARTA RAGAS (72) ---

const MELAKARTA_RAGAS = [
  { num: 1, name: "Kanakangi", swaras: "Sa Ri1 Ga1 Ma1 Pa Da1 Ni1" },
  { num: 2, name: "Ratnangi", swaras: "Sa Ri1 Ga1 Ma1 Pa Da1 Ni2" },
  { num: 3, name: "Ganamurthi", swaras: "Sa Ri1 Ga1 Ma1 Pa Da1 Ni3" },
  { num: 4, name: "Vanaspati", swaras: "Sa Ri1 Ga1 Ma1 Pa Da2 Ni2" },
  { num: 5, name: "Manavati", swaras: "Sa Ri1 Ga1 Ma1 Pa Da2 Ni3" },
  { num: 6, name: "Tanarupi", swaras: "Sa Ri1 Ga1 Ma1 Pa Da3 Ni3" },
  { num: 7, name: "Senavati", swaras: "Sa Ri1 Ga2 Ma1 Pa Da1 Ni1" },
  { num: 8, name: "Hanumathodi", swaras: "Sa Ri1 Ga2 Ma1 Pa Da1 Ni2" },
  { num: 9, name: "Dhenuka", swaras: "Sa Ri1 Ga2 Ma1 Pa Da1 Ni3" },
  { num: 10, name: "Natakapriya", swaras: "Sa Ri1 Ga2 Ma1 Pa Da2 Ni2" },
  { num: 11, name: "Kokilapriya", swaras: "Sa Ri1 Ga2 Ma1 Pa Da2 Ni3" },
  { num: 12, name: "Rupavathi", swaras: "Sa Ri1 Ga2 Ma1 Pa Da3 Ni3" },
  { num: 13, name: "Gayakapriya", swaras: "Sa Ri1 Ga3 Ma1 Pa Da1 Ni1" },
  { num: 14, name: "Vakulabharanam", swaras: "Sa Ri1 Ga3 Ma1 Pa Da1 Ni2" },
  { num: 15, name: "Mayamalavagowla", swaras: "Sa Ri1 Ga3 Ma1 Pa Da1 Ni3" },
  { num: 16, name: "Chakravakam", swaras: "Sa Ri1 Ga3 Ma1 Pa Da2 Ni2" },
  { num: 17, name: "Suryakantham", swaras: "Sa Ri1 Ga3 Ma1 Pa Da2 Ni3" },
  { num: 18, name: "Hatakambari", swaras: "Sa Ri1 Ga3 Ma1 Pa Da3 Ni3" },
  { num: 19, name: "Jhankaradhwani", swaras: "Sa Ri2 Ga2 Ma1 Pa Da1 Ni1" },
  { num: 20, name: "Natabhairavi", swaras: "Sa Ri2 Ga2 Ma1 Pa Da1 Ni2" },
  { num: 21, name: "Keeravani", swaras: "Sa Ri2 Ga2 Ma1 Pa Da1 Ni3" },
  { num: 22, name: "Kharaharapriya", swaras: "Sa Ri2 Ga2 Ma1 Pa Da2 Ni2" },
  { num: 23, name: "Gourimanohari", swaras: "Sa Ri2 Ga2 Ma1 Pa Da2 Ni3" },
  { num: 24, name: "Varunapriya", swaras: "Sa Ri2 Ga2 Ma1 Pa Da3 Ni3" },
  { num: 25, name: "Mararanjani", swaras: "Sa Ri2 Ga3 Ma1 Pa Da1 Ni1" },
  { num: 26, name: "Charukesi", swaras: "Sa Ri2 Ga3 Ma1 Pa Da1 Ni2" },
  { num: 27, name: "Sarasangi", swaras: "Sa Ri2 Ga3 Ma1 Pa Da1 Ni3" },
  { num: 28, name: "Harikambhoji", swaras: "Sa Ri2 Ga3 Ma1 Pa Da2 Ni2" },
  { num: 29, name: "Dheerasankarabharanam", swaras: "Sa Ri2 Ga3 Ma1 Pa Da2 Ni3" },
  { num: 30, name: "Naganandini", swaras: "Sa Ri2 Ga3 Ma1 Pa Da3 Ni3" },
  { num: 31, name: "Yagapriya", swaras: "Sa Ri3 Ga3 Ma1 Pa Da1 Ni1" },
  { num: 32, name: "Ragavardhini", swaras: "Sa Ri3 Ga3 Ma1 Pa Da1 Ni2" },
  { num: 33, name: "Gangeyabhushani", swaras: "Sa Ri3 Ga3 Ma1 Pa Da1 Ni3" },
  { num: 34, name: "Vagadheeswari", swaras: "Sa Ri3 Ga3 Ma1 Pa Da2 Ni2" },
  { num: 35, name: "Shoolini", swaras: "Sa Ri3 Ga3 Ma1 Pa Da2 Ni3" },
  { num: 36, name: "Chalanatta", swaras: "Sa Ri3 Ga3 Ma1 Pa Da3 Ni3" },
  { num: 37, name: "Salagam", swaras: "Sa Ri1 Ga1 Ma2 Pa Da1 Ni1" },
  { num: 38, name: "Jalarnavam", swaras: "Sa Ri1 Ga1 Ma2 Pa Da1 Ni2" },
  { num: 39, name: "Jhalavarali", swaras: "Sa Ri1 Ga1 Ma2 Pa Da1 Ni3" },
  { num: 40, name: "Navaneetham", swaras: "Sa Ri1 Ga1 Ma2 Pa Da2 Ni2" },
  { num: 41, name: "Pavani", swaras: "Sa Ri1 Ga1 Ma2 Pa Da2 Ni3" },
  { num: 42, name: "Raghupriya", swaras: "Sa Ri1 Ga1 Ma2 Pa Da3 Ni3" },
  { num: 43, name: "Gavambodhi", swaras: "Sa Ri1 Ga2 Ma2 Pa Da1 Ni1" },
  { num: 44, name: "Bhavapriya", swaras: "Sa Ri1 Ga2 Ma2 Pa Da1 Ni2" },
  { num: 45, name: "Shubhapantuvarali", swaras: "Sa Ri1 Ga2 Ma2 Pa Da1 Ni3" },
  { num: 46, name: "Shadvidhamargini", swaras: "Sa Ri1 Ga2 Ma2 Pa Da2 Ni2" },
  { num: 47, name: "Suvarnangi", swaras: "Sa Ri1 Ga2 Ma2 Pa Da2 Ni3" },
  { num: 48, name: "Divyamani", swaras: "Sa Ri1 Ga2 Ma2 Pa Da3 Ni3" },
  { num: 49, name: "Dhavalambari", swaras: "Sa Ri1 Ga3 Ma2 Pa Da1 Ni1" },
  { num: 50, name: "Namanarayani", swaras: "Sa Ri1 Ga3 Ma2 Pa Da1 Ni2" },
  { num: 51, name: "Kamavardhini", swaras: "Sa Ri1 Ga3 Ma2 Pa Da1 Ni3" },
  { num: 52, name: "Ramapriya", swaras: "Sa Ri1 Ga3 Ma2 Pa Da2 Ni2" },
  { num: 53, name: "Gamanashrama", swaras: "Sa Ri1 Ga3 Ma2 Pa Da2 Ni3" },
  { num: 54, name: "Vishwambhari", swaras: "Sa Ri1 Ga3 Ma2 Pa Da3 Ni3" },
  { num: 55, name: "Shamalangi", swaras: "Sa Ri2 Ga2 Ma2 Pa Da1 Ni1" },
  { num: 56, name: "Shanmukhapriya", swaras: "Sa Ri2 Ga2 Ma2 Pa Da1 Ni2" },
  { num: 57, name: "Simhendramadhyamam", swaras: "Sa Ri2 Ga2 Ma2 Pa Da1 Ni3" },
  { num: 58, name: "Hemavathi", swaras: "Sa Ri2 Ga2 Ma2 Pa Da2 Ni2" },
  { num: 59, name: "Dharmavathi", swaras: "Sa Ri2 Ga2 Ma2 Pa Da2 Ni3" },
  { num: 60, name: "Neethimathi", swaras: "Sa Ri2 Ga2 Ma2 Pa Da3 Ni3" },
  { num: 61, name: "Kanthamani", swaras: "Sa Ri2 Ga3 Ma2 Pa Da1 Ni1" },
  { num: 62, name: "Rishabhapriya", swaras: "Sa Ri2 Ga3 Ma2 Pa Da1 Ni2" },
  { num: 63, name: "Latangi", swaras: "Sa Ri2 Ga3 Ma2 Pa Da1 Ni3" },
  { num: 64, name: "Vachaspathi", swaras: "Sa Ri2 Ga3 Ma2 Pa Da2 Ni2" },
  { num: 65, name: "Mechakalyani", swaras: "Sa Ri2 Ga3 Ma2 Pa Da2 Ni3" },
  { num: 66, name: "Chitrambari", swaras: "Sa Ri2 Ga3 Ma2 Pa Da3 Ni3" },
  { num: 67, name: "Sucharitra", swaras: "Sa Ri3 Ga3 Ma2 Pa Da1 Ni1" },
  { num: 68, name: "Jyotiswarupini", swaras: "Sa Ri3 Ga3 Ma2 Pa Da1 Ni2" },
  { num: 69, name: "Dhatuvardhini", swaras: "Sa Ri3 Ga3 Ma2 Pa Da1 Ni3" },
  { num: 70, name: "Nasikabhushani", swaras: "Sa Ri3 Ga3 Ma2 Pa Da2 Ni2" },
  { num: 71, name: "Kosalam", swaras: "Sa Ri3 Ga3 Ma2 Pa Da2 Ni3" },
  { num: 72, name: "Rasikapriya", swaras: "Sa Ri3 Ga3 Ma2 Pa Da3 Ni3" },
];

const JANYA_RAGAS = [
  { name: "Mohanam", parent: "Harikambhoji", parentNum: 28, swaras: "Sa Ri2 Ga3 Pa Da2", type: "Audava (pentatonic)" },
  { name: "Hamsadhwani", parent: "Mechakalyani", parentNum: 65, swaras: "Sa Ri2 Ga3 Pa Ni3", type: "Audava (pentatonic)" },
  { name: "Kalyani", parent: "Mechakalyani", parentNum: 65, swaras: "Sa Ri2 Ga3 Ma2 Pa Da2 Ni3", type: "Sampoorna (heptatonic)" },
  { name: "Shankarabharanam", parent: "Dheerasankarabharanam", parentNum: 29, swaras: "Sa Ri2 Ga3 Ma1 Pa Da2 Ni3", type: "Sampoorna (heptatonic)" },
  { name: "Todi", parent: "Hanumathodi", parentNum: 8, swaras: "Sa Ri1 Ga2 Ma1 Pa Da1 Ni2", type: "Sampoorna (heptatonic)" },
  { name: "Bhairavi", parent: "Natabhairavi", parentNum: 20, swaras: "Sa Ri2 Ga2 Ma1 Pa Da1 Ni2", type: "Sampoorna (heptatonic)" },
  { name: "Kambhoji", parent: "Harikambhoji", parentNum: 28, swaras: "Sa Ri2 Ga3 Ma1 Pa Da2 Ni2 (asc), Sa Ni2 Da2 Pa Ma1 Ga3 Ri2 Sa (desc)", type: "Bhashanga" },
  { name: "Begada", parent: "Dheerasankarabharanam", parentNum: 29, swaras: "Sa Ga3 Ri2 Ga3 Ma1 Pa Da2 Ni3", type: "Vakra (zigzag)" },
  { name: "Sahana", parent: "Harikambhoji", parentNum: 28, swaras: "Sa Ri2 Ga3 Ma1 Pa Ma1 Da2 Ni2 Ni3", type: "Bhashanga" },
  { name: "Kedaram", parent: "Harikambhoji", parentNum: 28, swaras: "Sa Ma1 Pa Da2 Ni2 (asc), Sa Ni2 Da2 Pa Ma1 Ga3 Ri2 Sa (desc)", type: "Audava-Sampoorna" },
  { name: "Abhogi", parent: "Kharaharapriya", parentNum: 22, swaras: "Sa Ri2 Ga2 Ma1 Da2", type: "Audava (pentatonic)" },
  { name: "Hindolam", parent: "Natabhairavi", parentNum: 20, swaras: "Sa Ga2 Ma1 Da1 Ni2", type: "Audava (pentatonic)" },
  { name: "Revati", parent: "Kharaharapriya", parentNum: 22, swaras: "Sa Ri2 Ma1 Pa Ni2", type: "Audava (pentatonic)" },
  { name: "Vasanta", parent: "Kharaharapriya", parentNum: 22, swaras: "Sa Ma1 Ga2 Ma1 Da2 Ni2 (asc)", type: "Vakra" },
  { name: "Bilahari", parent: "Dheerasankarabharanam", parentNum: 29, swaras: "Sa Ri2 Ga3 Pa Da2 (asc), Sa Ni3 Da2 Pa Ma1 Ga3 Ri2 Sa (desc)", type: "Audava-Sampoorna" },
  { name: "Nattai", parent: "Gamanashrama", parentNum: 53, swaras: "Sa Ri1 Ga3 Ma2 Pa Da2 Ni3", type: "Sampoorna" },
  { name: "Anandabhairavi", parent: "Kharaharapriya", parentNum: 22, swaras: "Sa Ga2 Ri2 Ga2 Ma1 Pa Da2 Pa Ni2 Da2 Pa Ma1 (complex phrases)", type: "Bhashanga" },
  { name: "Atana", parent: "Natabhairavi", parentNum: 20, swaras: "Sa Ri2 Ma1 Pa Ni2 (asc), Sa Ni2 Da1 Pa Ma1 Ga2 Ri2 Sa (desc)", type: "Audava-Sampoorna" },
];

// --- CARNATIC TALA ---

const SULADI_SAPTA_TALAS = [
  { name: "Dhruva", symbol: "I O I I", components: "Laghu + Drutam + Laghu + Laghu" },
  { name: "Matya", symbol: "I O I", components: "Laghu + Drutam + Laghu" },
  { name: "Rupaka", symbol: "O I", components: "Drutam + Laghu" },
  { name: "Jhampa", symbol: "I U O", components: "Laghu + Anudrutam + Drutam" },
  { name: "Triputa", symbol: "I O O", components: "Laghu + Drutam + Drutam" },
  { name: "Ata", symbol: "I I O O", components: "Laghu + Laghu + Drutam + Drutam" },
  { name: "Eka", symbol: "I", components: "Laghu" },
];

const JATIS = [
  { name: "Tisra", beats: 3 },
  { name: "Chatusra", beats: 4 },
  { name: "Khanda", beats: 5 },
  { name: "Misra", beats: 7 },
  { name: "Sankeerna", beats: 9 },
];

const TALA_COMPONENTS = [
  { name: "Laghu", desc: "Variable unit — beat count depends on jati (3, 4, 5, 7, or 9 beats), shown by a clap followed by finger counts" },
  { name: "Drutam", desc: "Fixed 2-beat unit — shown by a clap followed by a wave" },
  { name: "Anudrutam", desc: "Fixed 1-beat unit — shown by a single clap" },
];

const COMMON_TALAS = [
  { name: "Adi Tala", fullName: "Chatusra Jati Triputa Tala", beats: 8, structure: "4+2+2 (Laghu + Drutam + Drutam)" },
  { name: "Rupaka Tala", fullName: "Chatusra Jati Rupaka Tala", beats: 6, structure: "2+4 (Drutam + Laghu)" },
  { name: "Misra Chapu", fullName: "Misra Chapu Tala", beats: 7, structure: "3+2+2" },
  { name: "Khanda Chapu", fullName: "Khanda Chapu Tala", beats: 5, structure: "2+1+2" },
  { name: "Tisra Eka", fullName: "Tisra Jati Eka Tala", beats: 3, structure: "3 (Laghu only)" },
  { name: "Khanda Ata", fullName: "Khanda Jati Ata Tala", beats: 14, structure: "5+5+2+2 (Laghu + Laghu + Drutam + Drutam)" },
];

const TALA_KRIYA = [
  { gesture: "Thattu (clap)", purpose: "Marks the beginning of a tala component" },
  { gesture: "Visarjitam (wave)", purpose: "Second beat of a Drutam" },
  { gesture: "Finger count", purpose: "Counting the beats of a Laghu after the initial clap" },
];

// --- CARNATIC COMPOSITIONS ---

const TRINITY = [
  {
    name: "Tyagaraja",
    period: "1767-1847",
    language: "Telugu (primarily)",
    totalComps: "approximately 700",
    famousWorks: ["Pancharatna Kritis", "Nagumomu", "Endaro Mahanubhavulu"],
    style: "Devotional, bhakti-oriented, compositions in praise of Lord Rama"
  },
  {
    name: "Muthuswami Dikshitar",
    period: "1775-1835",
    language: "Sanskrit",
    totalComps: "approximately 500",
    famousWorks: ["Kamalamba Navavarana", "Akshayalinga Vibho", "Sri Subrahmanyaya Namaste"],
    style: "Sanskrit compositions with Vedic and tantric elements, influenced by Western music"
  },
  {
    name: "Syama Shastri",
    period: "1762-1827",
    language: "Telugu",
    totalComps: "approximately 300",
    famousWorks: ["Swarajathi in Bhairavi", "O Jagadamba", "Kamakshi Anudinamu"],
    style: "Devotional, known for swarajathis, compositions to Goddess Kamakshi"
  },
];

const PANCHARATNA_KRITIS = [
  { name: "Jagadanandakaraka", raga: "Nattai", tala: "Adi" },
  { name: "Dudukugala", raga: "Gowla", tala: "Adi" },
  { name: "Sadhinchane", raga: "Arabhi", tala: "Adi" },
  { name: "Kanakana Ruchira", raga: "Varali", tala: "Adi" },
  { name: "Endaro Mahanubhavulu", raga: "Sri", tala: "Adi" },
];

const OTHER_CARNATIC_COMPOSERS = [
  { name: "Purandara Dasa", title: "Pitamaha (Father) of Carnatic Music", period: "1484-1564", contribution: "Systematized the teaching method, created foundational exercises (sarali varisai, alankaras)" },
  { name: "Papanasam Sivan", title: "Tamil Tyagaraja", period: "1890-1973", contribution: "Composed extensively in Tamil, film music contributions" },
  { name: "Swathi Thirunal", title: "Royal Composer of Travancore", period: "1813-1846", contribution: "Composed in multiple languages including Sanskrit, Malayalam, Telugu, Kannada" },
  { name: "Mysore Vasudevachar", title: "Vainika Composer", period: "1865-1961", contribution: "Known for Veena compositions and teaching" },
  { name: "GN Balasubramaniam", title: "GNB", period: "1910-1965", contribution: "Revolutionary vocalist known for fast-paced singing style" },
  { name: "Oottukkadu Venkata Kavi", title: "Pre-Trinity Composer", period: "1700-1765", contribution: "Composed Krishna Leela Tarangini, influenced the Trinity" },
];

const COMPOSITION_FORMS_CARNATIC = [
  { name: "Kriti", desc: "Most important form with Pallavi, Anupallavi, and Charanam sections" },
  { name: "Varnam", desc: "Technical composition used as a warm-up, combines sahitya (lyrics) and swaras" },
  { name: "Padam", desc: "Devotional love song, often about divine love (bhakti or sringara)" },
  { name: "Javali", desc: "Light classical romantic composition, faster than padam" },
  { name: "Tillana", desc: "Rhythmic composition using syllables like ta, di, gi, na — equivalent of tarana" },
  { name: "Swarajathi", desc: "Composition with swara passages, associated with Syama Shastri" },
  { name: "Geetham", desc: "Simplest song form, used in early music education, no repeat structure" },
  { name: "Keertanam", desc: "Devotional song form, precursor to the kriti" },
];

// --- HINDUSTANI THEORY ---

const THAATS = [
  { name: "Bilawal", swaras: "Sa Re Ga Ma Pa Dha Ni", equivalent: "Major scale (Ionian)", notes: "All shuddha (natural) swaras" },
  { name: "Khamaj", swaras: "Sa Re Ga Ma Pa Dha ni", equivalent: "Mixolydian", notes: "Komal Ni" },
  { name: "Kafi", swaras: "Sa Re ga Ma Pa Dha ni", equivalent: "Dorian", notes: "Komal Ga, Komal Ni" },
  { name: "Asavari", swaras: "Sa Re ga Ma Pa dha ni", equivalent: "Natural minor (Aeolian)", notes: "Komal Ga, Komal Dha, Komal Ni" },
  { name: "Bhairavi", swaras: "Sa re ga Ma Pa dha ni", equivalent: "Phrygian", notes: "Komal Re, Komal Ga, Komal Dha, Komal Ni" },
  { name: "Bhairav", swaras: "Sa re Ga Ma Pa dha Ni", equivalent: "Double harmonic", notes: "Komal Re, Komal Dha" },
  { name: "Kalyan", swaras: "Sa Re Ga Ma' Pa Dha Ni", equivalent: "Lydian", notes: "Tivra Ma (Ma')" },
  { name: "Marwa", swaras: "Sa re Ga Ma' Pa Dha Ni", equivalent: "No Western equivalent", notes: "Komal Re, Tivra Ma" },
  { name: "Poorvi", swaras: "Sa re Ga Ma' Pa dha Ni", equivalent: "No Western equivalent", notes: "Komal Re, Tivra Ma, Komal Dha" },
  { name: "Todi", swaras: "Sa re ga Ma' Pa dha Ni", equivalent: "No Western equivalent", notes: "Komal Re, Komal Ga, Tivra Ma, Komal Dha" },
];

const HINDUSTANI_CONCEPTS = [
  { term: "Vadi", def: "The most important (king) note of a raga" },
  { term: "Samvadi", def: "The second most important (minister/queen) note, usually a fourth or fifth from the vadi" },
  { term: "Pakad", def: "The characteristic catch phrase or identifying melodic motif of a raga" },
  { term: "Chalan", def: "The overall melodic movement or progression of a raga" },
  { term: "Aaroh", def: "The ascending scale pattern of a raga" },
  { term: "Avroh", def: "The descending scale pattern of a raga" },
  { term: "Alap", def: "Slow, unmetered introduction that establishes the raga mood" },
  { term: "Jod", def: "Second section of alap introducing rhythmic pulse without tala" },
  { term: "Jhala", def: "Fast-paced climactic section using rapid rhythmic strokes" },
  { term: "Gat", def: "Fixed composition set to a specific tala (instrumental)" },
  { term: "Bandish", def: "A fixed composition with lyrics set to a specific raga and tala" },
  { term: "Tan", def: "Fast melodic runs or passages used in improvisation" },
  { term: "Meend", def: "A smooth glide from one note to another" },
  { term: "Murki", def: "A quick, delicate cluster of notes used as ornamentation" },
  { term: "Kan", def: "A grace note that touches a note briefly before landing on the main note" },
  { term: "Khatka", def: "A rapid shake or cluster ornament" },
  { term: "Zamzama", def: "An extended ornamental passage with multiple notes" },
  { term: "Gamak", def: "Heavy oscillation between notes, a forceful ornament" },
  { term: "Andolan", def: "A slow, gentle swing around a note (especially komal notes)" },
];

const GHARANAS = [
  { name: "Gwalior", founded: "Oldest, ~15th century", style: "Open-throated singing, nom-tom alap, equal emphasis on all elements", artists: "Vishnu Digambar Paluskar, D.V. Paluskar" },
  { name: "Agra", founded: "~16th century", style: "Emphasis on rhythm and layakari, nom-tom alap, dhrupad influence", artists: "Faiyaz Khan, Latafat Hussain Khan" },
  { name: "Jaipur-Atrauli", founded: "~19th century", style: "Rare ragas, complex patterns, restrained emotional expression", artists: "Alladiya Khan, Kishori Amonkar, Mallikarjun Mansur" },
  { name: "Kirana", founded: "~19th century", style: "Slow tempo, swara perfection, emphasis on melody and bhava", artists: "Abdul Karim Khan, Bhimsen Joshi, Gangubai Hangal" },
  { name: "Patiala", founded: "~19th century", style: "Fast taans, elaborate ornamentation, powerful voice", artists: "Bade Ghulam Ali Khan, Ajoy Chakraborty" },
  { name: "Rampur-Sahaswan", founded: "~19th century", style: "Long elaborate alaps, systematic raga development", artists: "Mushtaq Hussain Khan, Rashid Khan" },
];

// --- HINDUSTANI RAGAS ---

const HINDUSTANI_RAGAS = [
  // Bilawal thaat
  { name: "Bilawal", thaat: "Bilawal", vadi: "Dha", samvadi: "Ga", time: "Late morning", mood: "Serene, peaceful" },
  { name: "Alhaiya Bilawal", thaat: "Bilawal", vadi: "Dha", samvadi: "Ga", time: "Morning", mood: "Devotional, bright" },
  { name: "Durga", thaat: "Bilawal", vadi: "Pa", samvadi: "Sa", time: "Night", mood: "Calm, devotional" },
  // Khamaj thaat
  { name: "Khamaj", thaat: "Khamaj", vadi: "Ga", samvadi: "Ni", time: "Night", mood: "Romantic, light" },
  { name: "Des", thaat: "Khamaj", vadi: "Re", samvadi: "Pa", time: "Night", mood: "Romantic, tender" },
  { name: "Tilak Kamod", thaat: "Khamaj", vadi: "Re", samvadi: "Pa", time: "Night", mood: "Playful, romantic" },
  // Kafi thaat
  { name: "Kafi", thaat: "Kafi", vadi: "Pa", samvadi: "Sa", time: "Night", mood: "Romantic, earthy" },
  { name: "Desh", thaat: "Kafi", vadi: "Pa", samvadi: "Re", time: "Night (rainy season)", mood: "Patriotic, devotional" },
  { name: "Bhimpalasi", thaat: "Kafi", vadi: "Ma", samvadi: "Sa", time: "Afternoon", mood: "Melancholic, yearning" },
  // Asavari thaat
  { name: "Asavari", thaat: "Asavari", vadi: "Dha", samvadi: "Ga", time: "Late morning", mood: "Pathos, devotional" },
  { name: "Darbari Kanada", thaat: "Asavari", vadi: "Re", samvadi: "Pa", time: "Late night", mood: "Majestic, serious, grave" },
  { name: "Jaunpuri", thaat: "Asavari", vadi: "Dha", samvadi: "Ga", time: "Late morning", mood: "Calm, restful" },
  // Bhairavi thaat
  { name: "Bhairavi", thaat: "Bhairavi", vadi: "Ma", samvadi: "Sa", time: "Morning (also anytime)", mood: "Devotional, concluding raga" },
  { name: "Sindhu Bhairavi", thaat: "Bhairavi", vadi: "Ma", samvadi: "Sa", time: "Anytime", mood: "Versatile, semi-classical" },
  { name: "Bilaskhani Todi", thaat: "Bhairavi", vadi: "Dha", samvadi: "Ga", time: "Morning", mood: "Intense pathos" },
  // Bhairav thaat
  { name: "Bhairav", thaat: "Bhairav", vadi: "Dha", samvadi: "Re", time: "Early morning", mood: "Devotional, serious" },
  { name: "Ahir Bhairav", thaat: "Bhairav", vadi: "Ma", samvadi: "Sa", time: "Morning", mood: "Devotional, peaceful" },
  { name: "Jogiya", thaat: "Bhairav", vadi: "Ma", samvadi: "Sa", time: "Early morning", mood: "Ascetic, meditative" },
  // Kalyan thaat
  { name: "Yaman", thaat: "Kalyan", vadi: "Ga", samvadi: "Ni", time: "Early evening", mood: "Romantic, devotional, auspicious" },
  { name: "Shuddh Kalyan", thaat: "Kalyan", vadi: "Ga", samvadi: "Ni", time: "Evening", mood: "Serene, peaceful" },
  { name: "Hameer", thaat: "Kalyan", vadi: "Dha", samvadi: "Ga", time: "Night", mood: "Majestic, heroic" },
  // Marwa thaat
  { name: "Marwa", thaat: "Marwa", vadi: "Re", samvadi: "Dha", time: "Evening (sunset)", mood: "Restless, yearning, serious" },
  { name: "Puriya", thaat: "Marwa", vadi: "Ni", samvadi: "Ga", time: "Evening", mood: "Serious, meditative" },
  { name: "Sohni", thaat: "Marwa", vadi: "Dha", samvadi: "Re", time: "Night", mood: "Romantic, gentle" },
  // Poorvi thaat
  { name: "Poorvi", thaat: "Poorvi", vadi: "Re", samvadi: "Pa", time: "Evening (sunset)", mood: "Serious, contemplative" },
  { name: "Paraj", thaat: "Poorvi", vadi: "Pa", samvadi: "Sa", time: "Late night", mood: "Devotional, serious" },
  { name: "Basant", thaat: "Poorvi", vadi: "Pa", samvadi: "Sa", time: "Spring, late night", mood: "Festive, spring mood" },
  // Todi thaat
  { name: "Todi (Miyan ki Todi)", thaat: "Todi", vadi: "Dha", samvadi: "Ga", time: "Morning", mood: "Serious, devotional, intense" },
  { name: "Multani", thaat: "Todi", vadi: "Pa", samvadi: "Sa", time: "Afternoon", mood: "Serious, intense" },
  { name: "Gujari Todi", thaat: "Todi", vadi: "Dha", samvadi: "Ga", time: "Morning", mood: "Devotional, serious" },
];

const RAGA_TIME_THEORY = [
  { period: "Sandhi Prakash (twilight)", ragas: "Bhairav, Marwa, Poorvi, Todi", rule: "Ragas with komal Re and/or komal Dha are typically sung at dawn or dusk" },
  { period: "Morning (6 AM - 9 AM)", ragas: "Bhairav, Todi, Ahir Bhairav, Bilaskhani Todi", rule: "Komal Re ragas dominate the morning hours" },
  { period: "Late Morning (9 AM - 12 PM)", ragas: "Bilawal, Asavari, Jaunpuri", rule: "Shuddha (natural) Re ragas in the second prahar" },
  { period: "Afternoon (12 PM - 3 PM)", ragas: "Bhimpalasi, Multani, Sarang", rule: "Ragas using Ma prominently" },
  { period: "Evening (3 PM - 6 PM)", ragas: "Yaman, Marwa, Poorvi", rule: "Tivra Ma (sharp fourth) ragas are associated with evening" },
  { period: "Night (6 PM - 12 AM)", ragas: "Khamaj, Des, Darbari Kanada, Hameer", rule: "Komal Ga and komal Ni ragas are sung at night" },
  { period: "Late Night (12 AM - 6 AM)", ragas: "Malkauns, Darbari, Paraj", rule: "Deep, serious ragas with komal swaras" },
];

// --- HINDUSTANI TALA ---

const HINDUSTANI_TALAS = [
  { name: "Teental", beats: 16, vibhag: "4+4+4+4", theka: "Dha Dhin Dhin Dha | Dha Dhin Dhin Dha | Dha Tin Tin Ta | Ta Dhin Dhin Dha", sam: 1, khali: 9, tali: [1, 5, 13] },
  { name: "Jhaptaal", beats: 10, vibhag: "2+3+2+3", theka: "Dhi Na | Dhi Dhi Na | Ti Na | Dhi Dhi Na", sam: 1, khali: 6, tali: [1, 3, 8] },
  { name: "Rupak", beats: 7, vibhag: "3+2+2", theka: "Tin Tin Na | Dhi Na | Dhi Na", sam: 1, khali: 1, tali: [4, 6], note: "Unique: starts with Khali on Sam" },
  { name: "Ektaal", beats: 12, vibhag: "2+2+2+2+2+2", theka: "Dhin Dhin | DhaGe TiRaKiTa | Tu Na | Kat Ta | DhaGe TiRaKiTa | Dhi Na", sam: 1, khali: [3, 7, 11], tali: [1, 5, 9] },
  { name: "Dadra", beats: 6, vibhag: "3+3", theka: "Dha Dhi Na | Na Tin Na", sam: 1, khali: 4, tali: [1] },
  { name: "Keherwa", beats: 8, vibhag: "4+4", theka: "Dha Ge Na Ti | Na Ka Dhi Na", sam: 1, khali: 5, tali: [1] },
  { name: "Tilwada", beats: 16, vibhag: "4+4+4+4", theka: "Dha TiRaKiTa Dhi Na | Ta TiRaKiTa Dhi Na | Dha TiRaKiTa Dhi Na | Dha TiRaKiTa Dhi Na", sam: 1, khali: 9, tali: [1, 5, 13] },
  { name: "Chautaal", beats: 12, vibhag: "2+2+2+2+2+2", theka: "Dha Dha | Din Ta | KiTa Dha | Din Ta | TiTa KaTa | GaDi GaNa", sam: 1, khali: [3, 7, 11], tali: [1, 5, 9] },
  { name: "Dhamar", beats: 14, vibhag: "5+2+3+4", theka: "Ka Dhi Ta Dhi Ta | Dha — | Ge Ti Ta Ti Ta | Ta — — — —", sam: 1, khali: 8, tali: [1, 6, 11] },
  { name: "Sultal", beats: 10, vibhag: "2+2+2+2+2", theka: "Dha Dha | DhiT DhiT | Dha Dha | TiT TiT | DhaDha DhiT", sam: 1, khali: 5, tali: [1, 3, 7] },
];

const TALA_CONCEPTS_HINDUSTANI = [
  { term: "Sam", def: "The first beat of the tala cycle, the most important beat; marked with 'X'" },
  { term: "Khali", def: "The empty or open beat, played without bass; marked with '0'" },
  { term: "Tali", def: "A clap that marks the beginning of a vibhag (section)" },
  { term: "Vibhag", def: "A section or division of a tala cycle" },
  { term: "Theka", def: "The basic bol (syllable) pattern that defines a tala" },
  { term: "Bols", def: "Mnemonic syllables (like Dha, Dhin, Na, Tin) used to represent tabla strokes" },
  { term: "Matra", def: "A single beat, the basic time unit in a tala" },
  { term: "Avartan", def: "One complete cycle of the tala" },
  { term: "Layakari", def: "Rhythmic improvisation within the tala framework" },
  { term: "Tihai", def: "A rhythmic cadential pattern repeated three times, usually ending on Sam" },
  { term: "Chakradar Tihai", def: "A tihai where each of the three repetitions itself contains a tihai (tihai within tihai)" },
];

// --- HINDUSTANI COMPOSITIONS ---

const HINDUSTANI_COMPOSITION_FORMS = [
  { name: "Dhrupad", desc: "Oldest surviving form of Hindustani classical music, has 4 sections: Sthayi, Antara, Sanchari, Abhog", tempo: "Usually vilambit (slow) to madhya (medium)" },
  { name: "Khayal", desc: "Most popular vocal form, allows extensive improvisation", tempo: "Bada Khayal (vilambit/slow) and Chhota Khayal (drut/fast)" },
  { name: "Thumri", desc: "Light classical form expressing romantic devotion, associated with Lucknow and Banaras", tempo: "Slow to medium" },
  { name: "Tarana", desc: "Fast-paced composition using meaningless syllables like ta, na, dir, dir", tempo: "Drut (fast)" },
  { name: "Tappa", desc: "Fast ornamental vocal style originating from Punjab, known for quick taans", tempo: "Fast" },
  { name: "Dadra", desc: "Light classical form similar to thumri but lighter, set to Dadra tala", tempo: "Medium" },
  { name: "Ghazal", desc: "Poetic form set to music, Urdu poetry with musical rendering", tempo: "Varied" },
  { name: "Bhajan", desc: "Devotional song form, simpler structure, accessible to all", tempo: "Varied" },
];

const DHRUPAD_SECTIONS = ["Sthayi", "Antara", "Sanchari", "Abhog"];

const GREAT_HINDUSTANI_COMPOSERS = [
  { name: "Tansen", period: "16th century", contribution: "Greatest musician of Mughal court, one of the Navaratnas of Akbar, legendary raga performances", genre: "Dhrupad" },
  { name: "Amir Khusrau", period: "13th century", contribution: "Credited with creating the sitar, tabla, and inventing Khayal and Tarana forms", genre: "Various" },
  { name: "Bade Ghulam Ali Khan", period: "1902-1968", contribution: "Master of Patiala Gharana, revolutionary khayal and thumri vocalist", genre: "Khayal, Thumri" },
  { name: "Bhimsen Joshi", period: "1922-2011", contribution: "Kirana Gharana master, known for powerful khayal renditions and Abhang singing", genre: "Khayal" },
  { name: "Kishori Amonkar", period: "1931-2017", contribution: "Jaipur-Atrauli Gharana, pioneering female vocalist with distinct meditative style", genre: "Khayal" },
  { name: "Kumar Gandharva", period: "1924-1992", contribution: "Revolutionized Hindustani music with unconventional raga interpretations and folk fusion", genre: "Khayal" },
  { name: "Ravi Shankar", period: "1920-2012", contribution: "Sitar maestro who popularized Indian classical music globally", genre: "Instrumental (Sitar)" },
  { name: "Ali Akbar Khan", period: "1922-2009", contribution: "Sarod maestro, son and disciple of Allauddin Khan", genre: "Instrumental (Sarod)" },
  { name: "Zakir Hussain", period: "1951-2023", contribution: "Tabla virtuoso who brought Indian percussion to world audiences", genre: "Tabla" },
];

// --- SHARED INDIAN CLASSICAL CONCEPTS ---

const SHARED_CONCEPTS = [
  { term: "Nada", def: "The concept of musical sound; two types: Ahata (struck/audible) and Anahata (unstruck/cosmic)", system: "Both" },
  { term: "Shruti", def: "Microtonal pitch; 22 shrutis recognized in Indian music per octave", system: "Both" },
  { term: "Swara", def: "A musical note with a definite pitch; 7 swaras form the basis of Indian music", system: "Both" },
  { term: "Raga", def: "A melodic framework with specific ascending and descending patterns, characteristic phrases, and emotional content", system: "Both" },
  { term: "Tala", def: "Rhythmic cycle that provides the temporal framework for music", system: "Both" },
  { term: "Natyashastra", def: "Ancient treatise by Bharata Muni (c. 200 BCE-200 CE) describing performing arts including music", system: "Both" },
  { term: "Sangita Ratnakara", def: "13th century treatise by Sharangadeva, a comprehensive text on Indian music theory", system: "Both" },
  { term: "Saptak", def: "An octave; the range of seven notes from Sa to Ni", system: "Both" },
  { term: "Alankar", def: "Melodic patterns or exercises using different swara combinations", system: "Both" },
  { term: "Rasa", def: "The emotional essence or mood evoked by music; nine rasas in Indian aesthetics", system: "Both" },
];

const NAVA_RASAS = [
  { name: "Shringara", emotion: "Love/Romance/Beauty" },
  { name: "Hasya", emotion: "Laughter/Comedy" },
  { name: "Karuna", emotion: "Compassion/Sorrow" },
  { name: "Raudra", emotion: "Anger/Fury" },
  { name: "Veera", emotion: "Heroism/Courage" },
  { name: "Bhayanaka", emotion: "Fear/Terror" },
  { name: "Bibhatsa", emotion: "Disgust/Aversion" },
  { name: "Adbhuta", emotion: "Wonder/Amazement" },
  { name: "Shanta", emotion: "Peace/Tranquility" },
];

const CARNATIC_VS_HINDUSTANI = [
  { aspect: "Classification system", carnatic: "72 Melakarta ragas", hindustani: "10 Thaat system" },
  { aspect: "Ornamentation", carnatic: "Gamakas (systematic, integral)", hindustani: "Meend, murki, kan (more flexible)" },
  { aspect: "Rhythm system", carnatic: "Suladi Sapta Tala (35 talas)", hindustani: "Theka-based talas" },
  { aspect: "Main vocal form", carnatic: "Kriti", hindustani: "Khayal" },
  { aspect: "Composition vs improvisation", carnatic: "More composition-oriented", hindustani: "More improvisation-oriented" },
  { aspect: "Primary percussion", carnatic: "Mridangam", hindustani: "Tabla" },
  { aspect: "Primary string instrument", carnatic: "Veena (Saraswati)", hindustani: "Sitar" },
  { aspect: "Concert format", carnatic: "Kutcheri (structured format)", hindustani: "Mehfil or Baithak (flexible format)" },
  { aspect: "Drone instrument", carnatic: "Tambura (or Shruti box)", hindustani: "Tanpura" },
  { aspect: "Language of compositions", carnatic: "Telugu, Sanskrit, Tamil, Kannada", hindustani: "Hindi, Urdu, Braj Bhasha" },
];

const CONCERT_FORMATS = [
  { name: "Kutcheri (Carnatic)", desc: "Structured format: Varnam, Kritis in ascending raga weight, Main piece (Ragam Tanam Pallavi), lighter pieces, Mangalam (closing)" },
  { name: "Mehfil/Baithak (Hindustani)", desc: "Flexible format: Alap-Jod-Jhala, Vilambit (slow) composition, Drut (fast) composition, lighter pieces" },
];

// ═══════════════════════════════════════════════════════════════════
// QUESTION GENERATORS
// ═══════════════════════════════════════════════════════════════════

function generateCarnaticTheory() {
  const questions = [];
  const cat = "Carnatic Theory";
  const qt = "indian_classical";

  // Beginner: Basic swara identification
  for (const s of SWARAS_BASIC) {
    const idx = SWARAS_BASIC.indexOf(s);
    const wrong = pickRandom(SWARAS_BASIC, 3, [s]);
    questions.push({
      question_text: `In the Carnatic system, what is the ${idx + 1}${idx === 0 ? "st" : idx === 1 ? "nd" : idx === 2 ? "rd" : "th"} swara in the saptak?`,
      correct_answer: s,
      wrong_answers: wrong,
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `The seven swaras in order are: Sa, Ri, Ga, Ma, Pa, Da, Ni. ${s} is the ${idx + 1}${idx === 0 ? "st" : idx === 1 ? "nd" : idx === 2 ? "rd" : "th"} swara.`,
    });
  }

  // Beginner: Sthayi (octave) questions
  for (const st of STHAYI) {
    const wrong = pickRandom(STHAYI.map(s => s.name), 3, [st.name]);
    questions.push({
      question_text: `Which sthayi (octave register) is described as the "${st.desc}"?`,
      correct_answer: st.name,
      wrong_answers: wrong,
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `${st.name} is the ${st.desc.toLowerCase()}. The three octave registers are Mandra (lower), Madhya (middle), and Tara (upper).`,
    });
  }

  // Beginner: Fixed vs variable swaras
  questions.push({
    question_text: "Which two swaras are considered 'achala' (fixed/immovable) in the Carnatic system?",
    correct_answer: "Sa and Pa",
    wrong_answers: ["Ri and Ga", "Ma and Da", "Ga and Ni"],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "Sa (Shadja) and Pa (Panchama) are achala swaras — they have no variants and remain fixed in pitch.",
  });

  questions.push({
    question_text: "How many swaras form the basic scale (saptak) in Indian classical music?",
    correct_answer: "7",
    wrong_answers: ["5", "12", "22"],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "There are 7 swaras: Sa, Ri, Ga, Ma, Pa, Da, Ni — forming the saptak (sapta = seven).",
  });

  questions.push({
    question_text: "What does the term 'saptak' literally mean?",
    correct_answer: "A group of seven",
    wrong_answers: ["A group of five", "A group of twelve", "A group of twenty-two"],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "Saptak comes from the Sanskrit word 'sapta' meaning seven, referring to the seven swaras.",
  });

  questions.push({
    question_text: "How many swarasthanas (semitonal positions) are there in one octave in Carnatic music?",
    correct_answer: "16",
    wrong_answers: ["12", "7", "22"],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "There are 16 swarasthanas in Carnatic music: Sa (1), Ri (3), Ga (3), Ma (2), Pa (1), Da (3), Ni (3). Some positions overlap (e.g., Ri3 = Ga2).",
  });

  // Beginner: Basic concept definitions
  const beginnerConcepts = CARNATIC_CONCEPTS.filter(c =>
    ["Arohana", "Avarohana", "Shadja", "Panchama", "Alapana"].includes(c.term)
  );
  for (const concept of beginnerConcepts) {
    const allDefs = CARNATIC_CONCEPTS.map(c => c.def);
    const wrongDefs = pickRandom(allDefs, 3, [concept.def]);
    questions.push({
      question_text: `In Carnatic music, what does the term "${concept.term}" refer to?`,
      correct_answer: concept.def,
      wrong_answers: wrongDefs,
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `${concept.term} means: ${concept.def}.`,
    });
  }

  // Intermediate: Swara variants
  for (const [swara, variants] of Object.entries(SWARA_VARIANTS)) {
    if (variants.length > 1) {
      questions.push({
        question_text: `How many variants does the swara ${swara} have in Carnatic music?`,
        correct_answer: String(variants.length),
        wrong_answers: pickRandom(["1", "2", "3", "4", "5"], 3, [String(variants.length)]),
        category: cat, quiz_type: qt, difficulty: "intermediate",
        explanation: `${swara} has ${variants.length} variant(s): ${variants.join(", ")}.`,
      });
    }
  }

  // Intermediate: Gamaka identification
  for (const g of GAMAKAS.slice(0, 8)) {
    const wrongNames = pickRandom(GAMAKAS.map(x => x.name), 3, [g.name]);
    questions.push({
      question_text: `Which gamaka (ornament) in Carnatic music is described as: "${g.desc}"?`,
      correct_answer: g.name,
      wrong_answers: wrongNames,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${g.name} is the gamaka described as: ${g.desc}.`,
    });
  }

  // Intermediate: More concept definitions
  const intermediateConcepts = CARNATIC_CONCEPTS.filter(c =>
    ["Vadi", "Samvadi", "Graha Swara", "Nyasa Swara", "Jiva Swara", "Neraval", "Kalpanaswaram", "Sangati"].includes(c.term)
  );
  for (const concept of intermediateConcepts) {
    const allDefs = CARNATIC_CONCEPTS.map(c => c.def);
    const wrongDefs = pickRandom(allDefs, 3, [concept.def]);
    questions.push({
      question_text: `What is the meaning of "${concept.term}" in Carnatic music?`,
      correct_answer: concept.def,
      wrong_answers: wrongDefs,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${concept.term}: ${concept.def}.`,
    });
  }

  // Advanced: Sruti theory
  questions.push({
    question_text: "According to ancient Indian music theory, how many shrutis (microtonal intervals) exist within one octave?",
    correct_answer: "22",
    wrong_answers: ["12", "16", "7"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Indian music theory recognizes 22 shrutis per octave, as described in the Natyashastra. This is distinct from the 12 semitones of Western music.",
  });

  questions.push({
    question_text: "Which ancient text first codified the 22 shrutis and their distribution among the swaras?",
    correct_answer: "Natyashastra by Bharata Muni",
    wrong_answers: ["Sangita Ratnakara by Sharangadeva", "Chaturdandi Prakashika by Venkatamakhi", "Swaramelakalanidhi by Ramamatya"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "The Natyashastra (c. 200 BCE-200 CE) by Bharata Muni first described the 22-shruti system.",
  });

  questions.push({
    question_text: "How are the 22 shrutis distributed among the 7 swaras in classical theory? Sa and Pa together have how many shrutis?",
    correct_answer: "4 shrutis each (Sa=4, Pa=4)",
    wrong_answers: ["3 shrutis each", "2 shrutis each", "5 shrutis each"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "In the traditional distribution: Sa (4), Ri (3), Ga (2), Ma (4), Pa (4), Dha (3), Ni (2) = 22 shrutis total.",
  });

  questions.push({
    question_text: "What does 'Vivadi Swara' mean in raga theory?",
    correct_answer: "A dissonant or inimical swara that is generally avoided in a raga",
    wrong_answers: [
      "The most prominent note of a raga",
      "A swara that is held for a long duration",
      "The concluding note of a raga phrase"
    ],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Vivadi swaras are dissonant notes. Ragas that use vivadi swaras (like some rare melakartas) are called vivadi ragas.",
  });

  questions.push({
    question_text: "What is 'Swaraprastara' in Carnatic music theory?",
    correct_answer: "Systematic permutation and combination of swaras",
    wrong_answers: [
      "A type of rhythmic pattern",
      "A devotional composition form",
      "An ornamental technique for gamakas"
    ],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Swaraprastara is the mathematical method of calculating all possible permutations of swaras in a raga.",
  });

  // Advanced: Gamaka theory
  for (const g of GAMAKAS.slice(8)) {
    const wrongDescs = pickRandom(GAMAKAS.map(x => x.desc), 3, [g.desc]);
    questions.push({
      question_text: `What is the gamaka called "${g.name}" in Carnatic music?`,
      correct_answer: g.desc,
      wrong_answers: wrongDescs,
      category: cat, quiz_type: qt, difficulty: "advanced",
      explanation: `${g.name}: ${g.desc}.`,
    });
  }

  // Advanced: Concept identification
  const advConcepts = CARNATIC_CONCEPTS.filter(c =>
    ["Amsa Swara", "Sruti", "Vivadi Swara", "Swaraprastara"].includes(c.term)
  );
  for (const concept of advConcepts) {
    const allTerms = CARNATIC_CONCEPTS.map(c => c.term);
    const wrongTerms = pickRandom(allTerms, 3, [concept.term]);
    questions.push({
      question_text: `Which Carnatic music term is defined as: "${concept.def}"?`,
      correct_answer: concept.term,
      wrong_answers: wrongTerms,
      category: cat, quiz_type: qt, difficulty: "advanced",
      explanation: `The term "${concept.term}" means: ${concept.def}.`,
    });
  }

  // Additional Carnatic Theory questions

  // Beginner: Swara full names
  const swaraFullNames = [
    { short: "Sa", full: "Shadja" },
    { short: "Ri", full: "Rishabha" },
    { short: "Ga", full: "Gandhara" },
    { short: "Ma", full: "Madhyama" },
    { short: "Pa", full: "Panchama" },
    { short: "Da", full: "Dhaivata" },
    { short: "Ni", full: "Nishada" },
  ];
  for (const s of swaraFullNames) {
    const wrongFulls = pickRandom(swaraFullNames.map(x => x.full), 3, [s.full]);
    questions.push({
      question_text: `What is the full Sanskrit name of the swara "${s.short}"?`,
      correct_answer: s.full,
      wrong_answers: wrongFulls,
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `${s.short} is the abbreviation for ${s.full}.`,
    });
  }

  // Intermediate: Specific swara variant names
  const variantQs = [
    { q: "What is 'Chatushruti Rishabham' in the Carnatic system?", a: "Ri2 — the second variant of Rishabha", w: ["Ri1 — the first variant of Rishabha", "Ri3 — the third variant of Rishabha", "Ga2 — the second variant of Gandhara"] },
    { q: "What is 'Prati Madhyamam' (Ma2)?", a: "The sharp/raised variant of Madhyama, a semitone higher than Shuddha Madhyamam", w: ["The natural/default Madhyama", "A type of gamaka ornament", "The lower octave Madhyama"] },
    { q: "Which swara variant is also known as 'Kakali Nishadam'?", a: "Ni3 (the highest variant of Nishada)", w: ["Ni1 (Shuddha Nishadam)", "Ni2 (Kaisiki Nishadam)", "Da3 (Shatshruti Dhaivatam)"] },
    { q: "In the Carnatic system, Ri2 and Ga1 share the same swarasthana (pitch position). What does this overlap mean?", a: "They are enharmonic — the same pitch but named differently depending on the raga context", w: ["They are always played together as a chord", "One is always higher than the other", "They belong to different octaves"] },
    { q: "How many swara variants does Madhyama (Ma) have?", a: "2 (Shuddha and Prati)", w: ["3", "1", "4"] },
  ];
  for (const vq of variantQs) {
    questions.push({
      question_text: vq.q, correct_answer: vq.a, wrong_answers: vq.w,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${vq.a}.`,
    });
  }

  // Advanced: Additional advanced theory
  const advTheoryQs = [
    { q: "What is the 'Katapayadi' system in Carnatic music?", a: "A Sanskrit formula that encodes the melakarta raga number in the first two syllables of its name", w: ["A system of 72 hand gestures for keeping tala", "A method of tuning the veena", "A notation system for writing gamakas"] },
    { q: "According to the Katapayadi formula, which syllables in a melakarta name encode its number?", a: "The first two consonants of the raga name (reversed)", w: ["The last two vowels", "The middle syllable", "The total number of syllables"] },
    { q: "What are 'Vivadi Melakartas'?", a: "Melakartas that contain vivadi (dissonant) swaras — notes that are only a semitone apart in sequence", w: ["Melakartas that use only 5 swaras", "Melakartas that were invented after the 18th century", "Melakartas used only in temple music"] },
    { q: "How many of the 72 melakartas use Shuddha Madhyamam (Ma1) vs Prati Madhyamam (Ma2)?", a: "36 each — the first 36 use Ma1, the last 36 use Ma2", w: ["48 use Ma1 and 24 use Ma2", "All 72 can use both", "60 use Ma1 and 12 use Ma2"] },
    { q: "What is a 'Chakra' in the melakarta classification?", a: "A group of 6 consecutive melakartas that share the same combination of Ri and Ga swaras", w: ["A circular diagram of all 72 ragas", "A type of rhythmic cycle", "A group of ragas played at the same time of day"] },
    { q: "How many Chakras are there in the Melakarta system?", a: "12 (6 for Ma1 ragas + 6 for Ma2 ragas)", w: ["6", "72", "22"] },
    { q: "What does 'Sampurna raga' mean?", a: "A raga that uses all 7 swaras in both ascending and descending scales", w: ["A raga with only 5 swaras", "A raga played only during festivals", "A raga that must begin on Sa"] },
    { q: "What is an 'Audava' raga?", a: "A raga that uses only 5 swaras (pentatonic)", w: ["A raga that uses all 7 swaras", "A raga that uses 6 swaras", "A raga with zigzag phrases"] },
    { q: "What is a 'Shadava' raga?", a: "A raga that uses 6 swaras (hexatonic)", w: ["A raga that uses 5 swaras", "A raga that uses all 7 swaras", "A raga with irregular ascending pattern"] },
    { q: "What is a 'Vakra' raga?", a: "A raga with zigzag or non-linear swara movement in its arohana or avarohana", w: ["A raga with exactly 5 swaras", "A raga associated with dance", "A raga that uses only flat swaras"] },
  ];
  for (const aq of advTheoryQs) {
    questions.push({
      question_text: aq.q, correct_answer: aq.a, wrong_answers: aq.w,
      category: cat, quiz_type: qt, difficulty: "advanced",
      explanation: `${aq.a}.`,
    });
  }

  // Even more Carnatic Theory
  const moreCarnaticTheory = [
    { q: "What is 'Manodharma Sangeetam' in Carnatic music?", a: "The art of improvisation, including alapana, neraval, kalpanaswaram, and ragam-tanam-pallavi", w: ["A fixed composition form", "A method of music notation", "A type of percussion technique"], d: "intermediate" },
    { q: "What is the difference between 'Arohana' and 'Avarohana'?", a: "Arohana is the ascending scale pattern; Avarohana is the descending scale pattern of a raga", w: ["They are both types of gamakas", "Arohana is slow tempo; Avarohana is fast tempo", "They refer to upper and lower octaves"], d: "beginner" },
    { q: "What is 'Tara Sthayi' in Carnatic music?", a: "The upper (high) octave register", w: ["The lower octave register", "The middle octave register", "A type of gamaka"], d: "beginner" },
    { q: "What does 'Mandra Sthayi' refer to?", a: "The lower octave register", w: ["The upper octave register", "The middle octave register", "A rhythmic term"], d: "beginner" },
    { q: "What is the role of 'gamakas' in Carnatic music?", a: "They are essential ornaments that give life to the swaras and are integral to raga expression", w: ["They are optional decorations", "They are rhythmic patterns on mridangam", "They are types of compositions"], d: "intermediate" },
    { q: "In the Carnatic system, which swara variants share the same pitch position (enharmonic)?", a: "Ri2=Ga1, Ri3=Ga2, Da2=Ni1, Da3=Ni2", w: ["Sa=Pa", "Ma1=Ma2", "Ri1=Ni3"], d: "advanced" },
    { q: "What is 'Bhashanga Raga' in Carnatic music?", a: "A janya raga that borrows one or two foreign swaras not present in its parent melakarta", w: ["A raga with all 7 swaras", "A raga with only 5 swaras", "A raga used only in dance"], d: "advanced" },
  ];
  for (const eq of moreCarnaticTheory) {
    questions.push({
      question_text: eq.q, correct_answer: eq.a, wrong_answers: eq.w,
      category: cat, quiz_type: qt, difficulty: eq.d,
      explanation: eq.a,
    });
  }

  return questions;
}

function generateCarnaticRagas() {
  const questions = [];
  const cat = "Carnatic Ragas";
  const qt = "indian_classical";
  const allMelakartaNames = MELAKARTA_RAGAS.map(r => r.name);
  const allJanyaNames = JANYA_RAGAS.map(r => r.name);

  // Beginner: Basic melakarta identification (important ones)
  const importantMelakartas = [15, 29, 22, 28, 65, 20, 8, 56]; // by number
  for (const num of importantMelakartas) {
    const raga = MELAKARTA_RAGAS.find(r => r.num === num);
    const wrongNames = pickRandom(allMelakartaNames, 3, [raga.name]);
    questions.push({
      question_text: `Which melakarta raga is number ${raga.num} in the Carnatic system?`,
      correct_answer: raga.name,
      wrong_answers: wrongNames,
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `Melakarta raga #${raga.num} is ${raga.name} with swaras: ${raga.swaras}.`,
    });
  }

  // Intermediate: Janya raga parent identification
  for (const jr of JANYA_RAGAS.slice(0, 10)) {
    const wrongParents = pickRandom(allMelakartaNames, 3, [jr.parent]);
    questions.push({
      question_text: `Which melakarta raga is the parent of the janya raga "${jr.name}"?`,
      correct_answer: jr.parent,
      wrong_answers: wrongParents,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${jr.name} is a janya (derived) raga of ${jr.parent} (Melakarta #${jr.parentNum}).`,
    });
  }

  // Intermediate: Melakarta number from important ragas
  const midMelakartas = [15, 29, 22, 28, 65, 8];
  for (const num of midMelakartas) {
    const raga = MELAKARTA_RAGAS.find(r => r.num === num);
    const wrongNums = pickRandom(
      MELAKARTA_RAGAS.map(r => String(r.num)),
      3,
      [String(raga.num)]
    );
    questions.push({
      question_text: `What is the melakarta number of raga ${raga.name}?`,
      correct_answer: String(raga.num),
      wrong_answers: wrongNums,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${raga.name} is Melakarta #${raga.num}.`,
    });
  }

  // Advanced: Identify raga from swara pattern
  const advMelakartas = MELAKARTA_RAGAS.filter(r => [15, 22, 28, 29, 65].includes(r.num));
  for (const raga of advMelakartas) {
    const wrongNames = pickRandom(allMelakartaNames, 3, [raga.name]);
    questions.push({
      question_text: `Which melakarta raga has the swara pattern: ${raga.swaras}?`,
      correct_answer: raga.name,
      wrong_answers: wrongNames,
      category: cat, quiz_type: qt, difficulty: "advanced",
      explanation: `The swara pattern ${raga.swaras} belongs to ${raga.name} (Melakarta #${raga.num}).`,
    });
  }

  // Beginner: Total melakartas
  questions.push({
    question_text: "How many melakarta ragas are there in the Carnatic system?",
    correct_answer: "72",
    wrong_answers: ["36", "10", "22"],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "The Carnatic system has 72 melakarta (parent) ragas, systematized by Venkatamakhi.",
  });

  // Beginner: Melakarta vs Janya
  questions.push({
    question_text: "What is a 'janya raga' in the Carnatic system?",
    correct_answer: "A raga derived from a melakarta (parent) raga",
    wrong_answers: ["A raga with exactly 7 notes", "A raga sung only in the morning", "A raga used only in film music"],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "Janya ragas are derived from the 72 melakarta ragas by omitting notes, adding zigzag patterns, or using different ascending and descending scales.",
  });

  // Additional Carnatic Raga questions
  questions.push({
    question_text: "Which melakarta raga is commonly the first raga taught to Carnatic music students?",
    correct_answer: "Mayamalavagowla (Melakarta #15)",
    wrong_answers: ["Shankarabharanam (Melakarta #29)", "Kharaharapriya (Melakarta #22)", "Harikambhoji (Melakarta #28)"],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "Mayamalavagowla (#15) is traditionally the first raga taught because its swara intervals are distinct and easy to learn.",
  });

  questions.push({
    question_text: "Which famous pentatonic janya raga uses the swaras Sa Ri2 Ga3 Pa Da2?",
    correct_answer: "Mohanam",
    wrong_answers: ["Hamsadhwani", "Hindolam", "Abhogi"],
    category: cat, quiz_type: qt, difficulty: "intermediate",
    explanation: "Mohanam uses Sa Ri2 Ga3 Pa Da2 — a bright, happy pentatonic raga derived from Harikambhoji (#28).",
  });

  questions.push({
    question_text: "Which pentatonic janya raga uses the swaras Sa Ri2 Ga3 Pa Ni3?",
    correct_answer: "Hamsadhwani",
    wrong_answers: ["Mohanam", "Abhogi", "Hindolam"],
    category: cat, quiz_type: qt, difficulty: "intermediate",
    explanation: "Hamsadhwani (Sa Ri2 Ga3 Pa Ni3) is a popular auspicious raga derived from Mechakalyani (#65).",
  });

  return questions;
}

function generateCarnaticTala() {
  const questions = [];
  const cat = "Carnatic Tala";
  const qt = "indian_classical";
  const allTalaNames = SULADI_SAPTA_TALAS.map(t => t.name);

  // Beginner: Identify tala components
  for (const comp of TALA_COMPONENTS) {
    const wrongNames = pickRandom(TALA_COMPONENTS.map(c => c.name), 3, [comp.name]);
    // pad wrong answers if needed
    while (wrongNames.length < 3) wrongNames.push("Trikala");
    questions.push({
      question_text: `In Carnatic tala, what is a "${comp.name}"?`,
      correct_answer: comp.desc,
      wrong_answers: pickRandom(TALA_COMPONENTS.map(c => c.desc).concat(["A fixed 3-beat unit shown by three claps"]), 3, [comp.desc]),
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `${comp.name}: ${comp.desc}.`,
    });
  }

  // Beginner: Common tala identification
  for (const tala of COMMON_TALAS.slice(0, 4)) {
    const wrongBeats = pickRandom(["3", "4", "5", "6", "7", "8", "10", "12", "14", "16"], 3, [String(tala.beats)]);
    questions.push({
      question_text: `How many beats (aksharas) does ${tala.name} have?`,
      correct_answer: String(tala.beats),
      wrong_answers: wrongBeats,
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `${tala.name} (${tala.fullName}) has ${tala.beats} beats with structure: ${tala.structure}.`,
    });
  }

  // Beginner: Suladi Sapta Tala basics
  questions.push({
    question_text: "How many basic tala types are there in the Suladi Sapta Tala system?",
    correct_answer: "7",
    wrong_answers: ["5", "10", "35"],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "The Suladi Sapta (seven) Talas are: Dhruva, Matya, Rupaka, Jhampa, Triputa, Ata, and Eka.",
  });

  questions.push({
    question_text: "How many jatis (beat-count variants) exist in the Carnatic tala system?",
    correct_answer: "5",
    wrong_answers: ["3", "7", "10"],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "The 5 jatis are: Tisra (3), Chatusra (4), Khanda (5), Misra (7), and Sankeerna (9).",
  });

  // Intermediate: Jati identification
  for (const jati of JATIS) {
    const wrongBeats = pickRandom(JATIS.map(j => String(j.beats)), 3, [String(jati.beats)]);
    questions.push({
      question_text: `In Carnatic tala, how many beats does the "${jati.name}" jati have per laghu?`,
      correct_answer: String(jati.beats),
      wrong_answers: wrongBeats,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${jati.name} jati has ${jati.beats} beats per laghu.`,
    });
  }

  // Intermediate: Tala structure
  for (const tala of SULADI_SAPTA_TALAS) {
    const wrongComponents = pickRandom(SULADI_SAPTA_TALAS.map(t => t.components), 3, [tala.components]);
    questions.push({
      question_text: `What are the components of ${tala.name} tala in the Suladi Sapta Tala system?`,
      correct_answer: tala.components,
      wrong_answers: wrongComponents,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${tala.name} tala consists of: ${tala.components} (symbol: ${tala.symbol}).`,
    });
  }

  // Intermediate: 35 tala combinations
  questions.push({
    question_text: "How many total tala varieties are created by combining the 7 Suladi Talas with the 5 Jatis?",
    correct_answer: "35",
    wrong_answers: ["12", "72", "22"],
    category: cat, quiz_type: qt, difficulty: "intermediate",
    explanation: "7 talas x 5 jatis = 35 tala varieties in the Carnatic system.",
  });

  // Advanced: Specific tala calculations
  questions.push({
    question_text: "In Misra Jati Triputa Tala, how many beats are in one cycle? (Laghu=7, two Drutams=2+2)",
    correct_answer: "11",
    wrong_answers: ["7", "9", "14"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Triputa = Laghu + Drutam + Drutam. With Misra jati: 7 + 2 + 2 = 11 beats.",
  });

  questions.push({
    question_text: "In Khanda Jati Dhruva Tala, how many beats are in one cycle? (Laghu=5 each, Drutam=2)",
    correct_answer: "17",
    wrong_answers: ["15", "19", "22"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Dhruva = Laghu + Drutam + Laghu + Laghu. With Khanda jati: 5 + 2 + 5 + 5 = 17 beats.",
  });

  questions.push({
    question_text: "In Sankeerna Jati Ata Tala, how many beats are in one cycle? (Laghu=9 each, two Drutams=2+2)",
    correct_answer: "22",
    wrong_answers: ["18", "26", "14"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Ata = Laghu + Laghu + Drutam + Drutam. With Sankeerna jati: 9 + 9 + 2 + 2 = 22 beats.",
  });

  questions.push({
    question_text: "What is 'Trikala' in Carnatic rhythmic practice?",
    correct_answer: "Rendering a composition at three speeds: normal, double, and quadruple",
    wrong_answers: [
      "A tala with three sections",
      "A type of rhythmic ornament",
      "Playing in three different ragas"
    ],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Trikala refers to the practice of singing/playing at three tempo levels within the same tala framework.",
  });

  questions.push({
    question_text: "What is 'Eduppu' (also called Graha) in Carnatic music?",
    correct_answer: "The starting point of a composition within the tala cycle, which may or may not be on the first beat",
    wrong_answers: [
      "The concluding phrase of a composition",
      "A type of rhythmic pattern played on mridangam",
      "The total number of beats in a tala"
    ],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Eduppu is the point in the tala cycle where a composition or improvisation begins. Sama Eduppu starts on beat 1; Anagata and Atita start before or after.",
  });

  return questions;
}

function generateCarnaticCompositions() {
  const questions = [];
  const cat = "Carnatic Compositions";
  const qt = "indian_classical";
  const allComposerNames = [...TRINITY.map(t => t.name), ...OTHER_CARNATIC_COMPOSERS.map(c => c.name)];

  // Beginner: Trinity identification
  questions.push({
    question_text: "Who are the 'Musical Trinity' (Trimurtis) of Carnatic music?",
    correct_answer: "Tyagaraja, Muthuswami Dikshitar, and Syama Shastri",
    wrong_answers: [
      "Purandara Dasa, Tyagaraja, and Papanasam Sivan",
      "Tyagaraja, Purandara Dasa, and Muthuswami Dikshitar",
      "Syama Shastri, Swathi Thirunal, and Purandara Dasa"
    ],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "The Musical Trinity of Carnatic music consists of Tyagaraja (1767-1847), Muthuswami Dikshitar (1775-1835), and Syama Shastri (1762-1827).",
  });

  // Beginner: Trinity members — language and style
  for (const composer of TRINITY) {
    questions.push({
      question_text: `What was the primary language of ${composer.name}'s compositions?`,
      correct_answer: composer.language,
      wrong_answers: pickRandom(["Telugu (primarily)", "Sanskrit", "Telugu", "Tamil", "Kannada"], 3, [composer.language]),
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `${composer.name} (${composer.period}) primarily composed in ${composer.language}.`,
    });
  }

  // Beginner: Purandara Dasa
  questions.push({
    question_text: "Who is known as the 'Pitamaha' (Father/Grandfather) of Carnatic music?",
    correct_answer: "Purandara Dasa",
    wrong_answers: ["Tyagaraja", "Muthuswami Dikshitar", "Syama Shastri"],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "Purandara Dasa (1484-1564) systematized the teaching methodology of Carnatic music and is revered as its father.",
  });

  // Beginner: Composition form basics
  for (const form of COMPOSITION_FORMS_CARNATIC.slice(0, 4)) {
    const wrongDescs = pickRandom(COMPOSITION_FORMS_CARNATIC.map(f => f.desc), 3, [form.desc]);
    questions.push({
      question_text: `What is a "${form.name}" in Carnatic music?`,
      correct_answer: form.desc,
      wrong_answers: wrongDescs,
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `A ${form.name} is: ${form.desc}.`,
    });
  }

  // Intermediate: Pancharatna Kritis
  for (const pk of PANCHARATNA_KRITIS) {
    const wrongRagas = pickRandom(
      PANCHARATNA_KRITIS.map(p => p.raga).concat(["Kalyani", "Bhairavi", "Kambhoji"]),
      3, [pk.raga]
    );
    questions.push({
      question_text: `Which raga is Tyagaraja's Pancharatna Kriti "${pk.name}" composed in?`,
      correct_answer: pk.raga,
      wrong_answers: wrongRagas,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `"${pk.name}" is one of Tyagaraja's five gem compositions (Pancharatna Kritis), set in raga ${pk.raga}.`,
    });
  }

  questions.push({
    question_text: "How many compositions make up Tyagaraja's Pancharatna Kritis?",
    correct_answer: "5",
    wrong_answers: ["3", "7", "9"],
    category: cat, quiz_type: qt, difficulty: "intermediate",
    explanation: "Pancharatna means 'five gems' — the five greatest compositions of Tyagaraja.",
  });

  // Intermediate: Other composers
  for (const comp of OTHER_CARNATIC_COMPOSERS.slice(0, 3)) {
    const wrongTitles = pickRandom(OTHER_CARNATIC_COMPOSERS.map(c => c.title), 3, [comp.title]);
    questions.push({
      question_text: `Which Carnatic music composer is known by the title "${comp.title}"?`,
      correct_answer: comp.name,
      wrong_answers: pickRandom(allComposerNames, 3, [comp.name]),
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${comp.name} (${comp.period}) is known as "${comp.title}". ${comp.contribution}.`,
    });
  }

  // Intermediate: Composition forms
  for (const form of COMPOSITION_FORMS_CARNATIC.slice(4)) {
    const wrongDescs = pickRandom(COMPOSITION_FORMS_CARNATIC.map(f => f.desc), 3, [form.desc]);
    questions.push({
      question_text: `What type of Carnatic composition is a "${form.name}"?`,
      correct_answer: form.desc,
      wrong_answers: wrongDescs,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `A ${form.name}: ${form.desc}.`,
    });
  }

  // Advanced: Specific work attributions
  questions.push({
    question_text: "Which Carnatic composer is famous for the 'Kamalamba Navavarana' series of compositions?",
    correct_answer: "Muthuswami Dikshitar",
    wrong_answers: ["Tyagaraja", "Syama Shastri", "Purandara Dasa"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Muthuswami Dikshitar composed the Kamalamba Navavarana — a set of 11 compositions dedicated to Goddess Kamalamba at Tiruvarur.",
  });

  questions.push({
    question_text: "Which Carnatic composer is most closely associated with the Swarajathi form?",
    correct_answer: "Syama Shastri",
    wrong_answers: ["Tyagaraja", "Muthuswami Dikshitar", "Purandara Dasa"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Syama Shastri's Swarajathis (especially in Bhairavi) are considered masterpieces of the form.",
  });

  questions.push({
    question_text: "What are the three sections of a Carnatic Kriti?",
    correct_answer: "Pallavi, Anupallavi, and Charanam",
    wrong_answers: [
      "Sthayi, Antara, and Sanchari",
      "Alap, Jod, and Jhala",
      "Varnam, Kriti, and Tillana"
    ],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "A Kriti has three main sections: Pallavi (opening theme), Anupallavi (second section), and Charanam (final section with resolution).",
  });

  questions.push({
    question_text: "What is 'Ragam Tanam Pallavi' (RTP) in a Carnatic concert?",
    correct_answer: "The main elaborate piece featuring raga exposition, rhythmic patterns, and a composed pallavi line with extensive improvisation",
    wrong_answers: [
      "A short devotional song sung at the beginning of a concert",
      "A group of three kritis sung in sequence",
      "The concluding mangalam of a Carnatic concert"
    ],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "RTP is the centerpiece of a Carnatic concert: Ragam (raga exposition), Tanam (rhythmic elaboration), and Pallavi (a composed line subjected to complex improvisations).",
  });

  questions.push({
    question_text: "Approximately how many compositions is Tyagaraja credited with?",
    correct_answer: "Approximately 700",
    wrong_answers: ["Approximately 200", "Approximately 300", "Approximately 1,000"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Tyagaraja is credited with composing approximately 700 kritis, mostly devotional songs to Lord Rama.",
  });

  // Additional Carnatic Compositions questions
  const extraCarnaticCompQs = [
    { q: "What is a 'Varnam' used for in a Carnatic concert?", a: "As a warm-up piece at the beginning of a concert, combining sahitya and swara passages", w: ["As the grand finale", "As background music during intermission", "As a meditation piece"], d: "beginner" },
    { q: "What is a 'Mangalam' in a Carnatic concert?", a: "The closing benedictory piece that concludes a concert", w: ["The opening invocation", "The main piece of the concert", "A devotional interlude"], d: "beginner" },
    { q: "Which deity is most closely associated with Tyagaraja's compositions?", a: "Lord Rama", w: ["Lord Shiva", "Goddess Kamakshi", "Lord Krishna"], d: "intermediate" },
    { q: "Which goddess is central to Syama Shastri's devotional compositions?", a: "Goddess Kamakshi of Kanchipuram", w: ["Goddess Saraswati", "Goddess Lakshmi", "Goddess Durga"], d: "intermediate" },
    { q: "What distinguishes Muthuswami Dikshitar's compositions from the other Trinity members?", a: "They are primarily in Sanskrit with Vedic and tantric elements", w: ["They are all in Tamil", "They use only pentatonic ragas", "They avoid gamaka ornaments"], d: "intermediate" },
    { q: "What is 'Niraval' in Carnatic music performance?", a: "Improvised melodic variations on a single line of lyrics within the tala framework", w: ["A fixed rhythmic drum pattern", "A type of dance movement", "The concluding section of a kriti"], d: "advanced" },
  ];
  for (const eq of extraCarnaticCompQs) {
    questions.push({
      question_text: eq.q, correct_answer: eq.a, wrong_answers: eq.w,
      category: cat, quiz_type: qt, difficulty: eq.d,
      explanation: eq.a,
    });
  }

  return questions;
}

function generateHindustaniTheory() {
  const questions = [];
  const cat = "Hindustani Theory";
  const qt = "indian_classical";
  const allThaatNames = THAATS.map(t => t.name);

  // Beginner: Thaat system basics
  questions.push({
    question_text: "How many thaats (parent scales) are there in the Hindustani classical system?",
    correct_answer: "10",
    wrong_answers: ["7", "12", "72"],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "The Hindustani system uses 10 thaats, as codified by Vishnu Narayan Bhatkhande in the early 20th century.",
  });

  // Beginner: Identify each thaat
  for (const thaat of THAATS) {
    const wrongNames = pickRandom(allThaatNames, 3, [thaat.name]);
    questions.push({
      question_text: `Which Hindustani thaat is described as having these characteristics: "${thaat.notes}"?`,
      correct_answer: thaat.name,
      wrong_answers: wrongNames,
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `${thaat.name} thaat: ${thaat.notes}. Swaras: ${thaat.swaras}.`,
    });
  }

  // Beginner: Basic Hindustani terms
  const beginnerTerms = HINDUSTANI_CONCEPTS.filter(c =>
    ["Alap", "Aaroh", "Avroh", "Bandish", "Tan"].includes(c.term)
  );
  for (const concept of beginnerTerms) {
    const allDefs = HINDUSTANI_CONCEPTS.map(c => c.def);
    const wrongDefs = pickRandom(allDefs, 3, [concept.def]);
    questions.push({
      question_text: `In Hindustani music, what does "${concept.term}" mean?`,
      correct_answer: concept.def,
      wrong_answers: wrongDefs,
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `${concept.term}: ${concept.def}.`,
    });
  }

  // Intermediate: Gharana identification
  for (const gh of GHARANAS) {
    const wrongStyles = pickRandom(GHARANAS.map(g => g.style), 3, [gh.style]);
    questions.push({
      question_text: `Which vocal gharana is known for: "${gh.style}"?`,
      correct_answer: gh.name,
      wrong_answers: pickRandom(GHARANAS.map(g => g.name), 3, [gh.name]),
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `The ${gh.name} Gharana (${gh.founded}) is characterized by: ${gh.style}. Notable artists: ${gh.artists}.`,
    });
  }

  // Intermediate: Ornament identification
  const ornaments = HINDUSTANI_CONCEPTS.filter(c =>
    ["Meend", "Murki", "Kan", "Khatka", "Zamzama", "Gamak", "Andolan"].includes(c.term)
  );
  for (const orn of ornaments) {
    const wrongTerms = pickRandom(HINDUSTANI_CONCEPTS.map(c => c.term), 3, [orn.term]);
    questions.push({
      question_text: `Which Hindustani ornament is described as: "${orn.def}"?`,
      correct_answer: orn.term,
      wrong_answers: wrongTerms,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${orn.term}: ${orn.def}.`,
    });
  }

  // Intermediate: Performance structure
  const perfTerms = HINDUSTANI_CONCEPTS.filter(c =>
    ["Jod", "Jhala", "Gat", "Vadi", "Samvadi", "Pakad", "Chalan"].includes(c.term)
  );
  for (const concept of perfTerms) {
    const allDefs = HINDUSTANI_CONCEPTS.map(c => c.def);
    const wrongDefs = pickRandom(allDefs, 3, [concept.def]);
    questions.push({
      question_text: `What is "${concept.term}" in Hindustani classical music?`,
      correct_answer: concept.def,
      wrong_answers: wrongDefs,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${concept.term}: ${concept.def}.`,
    });
  }

  // Advanced: Thaat-Western equivalence
  for (const thaat of THAATS.filter(t => t.equivalent !== "No Western equivalent")) {
    const wrongEqs = pickRandom(
      THAATS.map(t => t.equivalent).filter(e => e !== "No Western equivalent"),
      3, [thaat.equivalent]
    );
    questions.push({
      question_text: `Which Western mode is the closest equivalent to the Hindustani ${thaat.name} thaat?`,
      correct_answer: thaat.equivalent,
      wrong_answers: wrongEqs,
      category: cat, quiz_type: qt, difficulty: "advanced",
      explanation: `${thaat.name} thaat (${thaat.swaras}) corresponds roughly to the ${thaat.equivalent}.`,
    });
  }

  // Advanced: Rasa theory
  questions.push({
    question_text: "How many rasas (emotional essences) are recognized in classical Indian aesthetics?",
    correct_answer: "9 (Nava Rasa)",
    wrong_answers: ["7", "5", "12"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "The Nava Rasas are: Shringara (love), Hasya (laughter), Karuna (sorrow), Raudra (anger), Veera (heroism), Bhayanaka (fear), Bibhatsa (disgust), Adbhuta (wonder), and Shanta (peace).",
  });

  for (const rasa of NAVA_RASAS.slice(0, 5)) {
    const wrongEmotions = pickRandom(NAVA_RASAS.map(r => r.emotion), 3, [rasa.emotion]);
    questions.push({
      question_text: `In Indian aesthetics, which emotion does the rasa "${rasa.name}" represent?`,
      correct_answer: rasa.emotion,
      wrong_answers: wrongEmotions,
      category: cat, quiz_type: qt, difficulty: "advanced",
      explanation: `${rasa.name} rasa represents ${rasa.emotion}.`,
    });
  }

  // Advanced: Alap structure
  questions.push({
    question_text: "What is the correct order of sections in a Hindustani instrumental performance?",
    correct_answer: "Alap, Jod, Jhala, Gat",
    wrong_answers: [
      "Gat, Alap, Jod, Jhala",
      "Jod, Alap, Gat, Jhala",
      "Alap, Gat, Jod, Jhala"
    ],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "The standard order is: Alap (slow raga exposition) -> Jod (rhythmic pulse added) -> Jhala (fast climax) -> Gat (composed piece with tala).",
  });

  // Additional Hindustani Theory questions

  // Beginner: Shuddha vs Komal vs Tivra
  questions.push({
    question_text: "In Hindustani music, what does 'Shuddha' swara mean?",
    correct_answer: "The natural/default position of a swara",
    wrong_answers: ["A flattened note", "A sharpened note", "A sustained note"],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "Shuddha means pure or natural — the default pitch of a swara in the Bilawal thaat.",
  });

  questions.push({
    question_text: "What does 'Komal' swara mean in Hindustani music?",
    correct_answer: "A flattened (lowered) swara",
    wrong_answers: ["A sharpened (raised) swara", "A natural swara", "A sustained swara"],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "Komal means soft/flat. Re, Ga, Dha, and Ni can be komal (lowered by a semitone).",
  });

  questions.push({
    question_text: "Which is the only swara that can be 'Tivra' (sharp) in Hindustani music?",
    correct_answer: "Ma (Madhyam)",
    wrong_answers: ["Re (Rishabh)", "Ga (Gandhar)", "Ni (Nishad)"],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "Only Ma can be Tivra (sharpened). The four swaras Re, Ga, Dha, Ni can be Komal. Sa and Pa are fixed.",
  });

  // Intermediate: Gharana details
  const gharanaQs = [
    { q: "Which gharana is considered the oldest vocal gharana in Hindustani music?", a: "Gwalior Gharana", w: ["Agra Gharana", "Kirana Gharana", "Patiala Gharana"] },
    { q: "Which gharana is known for its emphasis on rhythm and layakari (rhythmic play)?", a: "Agra Gharana", w: ["Kirana Gharana", "Gwalior Gharana", "Jaipur-Atrauli Gharana"] },
    { q: "Bhimsen Joshi is associated with which gharana?", a: "Kirana Gharana", w: ["Gwalior Gharana", "Agra Gharana", "Patiala Gharana"] },
    { q: "Which gharana is particularly known for performing rare and unusual ragas?", a: "Jaipur-Atrauli Gharana", w: ["Gwalior Gharana", "Kirana Gharana", "Patiala Gharana"] },
  ];
  for (const gq of gharanaQs) {
    questions.push({
      question_text: gq.q, correct_answer: gq.a, wrong_answers: gq.w,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${gq.a}.`,
    });
  }

  // Advanced: More theory
  const advHindQs = [
    { q: "What is 'Nom-Tom Alap' in Hindustani vocal music?", a: "A style of alap using syllables 'nom' and 'tom' (derived from Dhrupad tradition) instead of aa-kar", w: ["A type of fast taan", "A rhythmic cadence pattern", "A light classical composition form"] },
    { q: "What is the 'Prahar' system in relation to ragas?", a: "The division of 24 hours into 8 periods of 3 hours each, each associated with specific ragas", w: ["A system of 8 basic talas", "A method of classifying ragas by mood", "A tuning system for stringed instruments"] },
    { q: "What instrument traditionally provides the drone in a Hindustani performance?", a: "Tanpura", w: ["Harmonium", "Sitar", "Sarangi"] },
  ];
  for (const aq of advHindQs) {
    questions.push({
      question_text: aq.q, correct_answer: aq.a, wrong_answers: aq.w,
      category: cat, quiz_type: qt, difficulty: "advanced",
      explanation: `${aq.a}.`,
    });
  }

  return questions;
}

function generateHindustaniRagas() {
  const questions = [];
  const cat = "Hindustani Ragas";
  const qt = "indian_classical";
  const allRagaNames = HINDUSTANI_RAGAS.map(r => r.name);
  const allThaatNames = THAATS.map(t => t.name);

  // Beginner: Raga-to-thaat identification (major ragas)
  const beginnerRagas = HINDUSTANI_RAGAS.filter(r =>
    ["Yaman", "Bhairavi", "Bhairav", "Kafi", "Bilawal", "Khamaj"].includes(r.name)
  );
  for (const raga of beginnerRagas) {
    const wrongThaats = pickRandom(allThaatNames, 3, [raga.thaat]);
    questions.push({
      question_text: `Which thaat does raga ${raga.name} belong to?`,
      correct_answer: raga.thaat,
      wrong_answers: wrongThaats,
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `Raga ${raga.name} belongs to ${raga.thaat} thaat.`,
    });
  }

  // Beginner: Time of day
  for (const raga of beginnerRagas) {
    const wrongTimes = pickRandom(
      [...new Set(HINDUSTANI_RAGAS.map(r => r.time))],
      3, [raga.time]
    );
    questions.push({
      question_text: `At what time of day is raga ${raga.name} traditionally performed?`,
      correct_answer: raga.time,
      wrong_answers: wrongTimes,
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `Raga ${raga.name} is traditionally performed during ${raga.time}.`,
    });
  }

  // Intermediate: More ragas thaat identification
  const intermediateRagas = HINDUSTANI_RAGAS.filter(r =>
    ["Darbari Kanada", "Des", "Bhimpalasi", "Hameer", "Marwa", "Todi (Miyan ki Todi)", "Multani", "Basant", "Ahir Bhairav", "Desh"].includes(r.name)
  );
  for (const raga of intermediateRagas) {
    const wrongThaats = pickRandom(allThaatNames, 3, [raga.thaat]);
    questions.push({
      question_text: `Raga ${raga.name} is classified under which thaat?`,
      correct_answer: raga.thaat,
      wrong_answers: wrongThaats,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `Raga ${raga.name} belongs to ${raga.thaat} thaat. Mood: ${raga.mood}.`,
    });
  }

  // Intermediate: Vadi/Samvadi
  const vadiRagas = HINDUSTANI_RAGAS.filter(r =>
    ["Yaman", "Bhairav", "Darbari Kanada", "Bhimpalasi"].includes(r.name)
  );
  for (const raga of vadiRagas) {
    const allVadis = [...new Set(HINDUSTANI_RAGAS.map(r => r.vadi))];
    const wrongVadis = pickRandom(allVadis, 3, [raga.vadi]);
    questions.push({
      question_text: `What is the vadi (most important note) of raga ${raga.name}?`,
      correct_answer: raga.vadi,
      wrong_answers: wrongVadis,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `Raga ${raga.name}: Vadi = ${raga.vadi}, Samvadi = ${raga.samvadi}.`,
    });
  }

  // Advanced: Time theory
  for (const period of RAGA_TIME_THEORY.slice(0, 4)) {
    const wrongRules = pickRandom(RAGA_TIME_THEORY.map(p => p.rule), 3, [period.rule]);
    questions.push({
      question_text: `In Hindustani raga time theory, which rule applies to the "${period.period}" period?`,
      correct_answer: period.rule,
      wrong_answers: wrongRules,
      category: cat, quiz_type: qt, difficulty: "advanced",
      explanation: `${period.period}: ${period.rule}. Example ragas: ${period.ragas}.`,
    });
  }

  // Advanced: Mood identification
  const advRagas = HINDUSTANI_RAGAS.filter(r =>
    ["Darbari Kanada", "Marwa", "Puriya", "Yaman"].includes(r.name)
  );
  for (const raga of advRagas) {
    const wrongMoods = pickRandom(
      [...new Set(HINDUSTANI_RAGAS.map(r => r.mood))],
      3, [raga.mood]
    );
    questions.push({
      question_text: `What mood or rasa is primarily associated with raga ${raga.name}?`,
      correct_answer: raga.mood,
      wrong_answers: wrongMoods,
      category: cat, quiz_type: qt, difficulty: "advanced",
      explanation: `Raga ${raga.name} evokes the mood of: ${raga.mood}. It is performed during ${raga.time}.`,
    });
  }

  return questions;
}

function generateHindustaniTala() {
  const questions = [];
  const cat = "Hindustani Tala";
  const qt = "indian_classical";
  const allTalaNames = HINDUSTANI_TALAS.map(t => t.name);

  // Beginner: Beat count identification
  for (const tala of HINDUSTANI_TALAS.slice(0, 6)) {
    const wrongBeats = pickRandom(
      HINDUSTANI_TALAS.map(t => String(t.beats)),
      3, [String(tala.beats)]
    );
    questions.push({
      question_text: `How many beats (matras) does ${tala.name} have?`,
      correct_answer: String(tala.beats),
      wrong_answers: wrongBeats,
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `${tala.name} has ${tala.beats} beats divided as: ${tala.vibhag}.`,
    });
  }

  // Beginner: Tala concept definitions
  const beginnerConcepts = TALA_CONCEPTS_HINDUSTANI.filter(c =>
    ["Sam", "Khali", "Tali", "Matra", "Bols"].includes(c.term)
  );
  for (const concept of beginnerConcepts) {
    const allDefs = TALA_CONCEPTS_HINDUSTANI.map(c => c.def);
    const wrongDefs = pickRandom(allDefs, 3, [concept.def]);
    questions.push({
      question_text: `In Hindustani tala, what does "${concept.term}" mean?`,
      correct_answer: concept.def,
      wrong_answers: wrongDefs,
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `${concept.term}: ${concept.def}.`,
    });
  }

  // Intermediate: Vibhag structure
  for (const tala of HINDUSTANI_TALAS.slice(0, 6)) {
    const wrongVibhags = pickRandom(
      HINDUSTANI_TALAS.map(t => t.vibhag),
      3, [tala.vibhag]
    );
    questions.push({
      question_text: `What is the vibhag (section) division of ${tala.name}?`,
      correct_answer: tala.vibhag,
      wrong_answers: wrongVibhags,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${tala.name} (${tala.beats} beats) is divided as: ${tala.vibhag}.`,
    });
  }

  // Intermediate: Khali position
  for (const tala of HINDUSTANI_TALAS.slice(0, 6)) {
    const khaliStr = Array.isArray(tala.khali) ? tala.khali.join(", ") : String(tala.khali);
    const wrongKhalis = pickRandom(
      ["1", "3", "5", "6", "7", "8", "9", "11", "13"],
      3, [khaliStr]
    );
    questions.push({
      question_text: `On which beat(s) does the Khali fall in ${tala.name}?`,
      correct_answer: `Beat ${khaliStr}`,
      wrong_answers: wrongKhalis.map(k => `Beat ${k}`),
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${tala.name}: Khali falls on beat ${khaliStr}. ${tala.note || ""}`,
    });
  }

  // Intermediate: Concept definitions (remaining)
  const intConcepts = TALA_CONCEPTS_HINDUSTANI.filter(c =>
    ["Vibhag", "Theka", "Avartan", "Tihai"].includes(c.term)
  );
  for (const concept of intConcepts) {
    const allDefs = TALA_CONCEPTS_HINDUSTANI.map(c => c.def);
    const wrongDefs = pickRandom(allDefs, 3, [concept.def]);
    questions.push({
      question_text: `What is "${concept.term}" in Hindustani rhythmic theory?`,
      correct_answer: concept.def,
      wrong_answers: wrongDefs,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${concept.term}: ${concept.def}.`,
    });
  }

  // Advanced: Rupak special property
  questions.push({
    question_text: "What is unique about Rupak Tala compared to most other Hindustani talas?",
    correct_answer: "The Sam (first beat) itself is Khali — it starts with an open/empty beat",
    wrong_answers: [
      "It has no Khali at all",
      "It uses only 3 matras",
      "It has two Sam positions in one cycle"
    ],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Rupak Tala (7 beats: 3+2+2) is unique because the Sam and Khali coincide on the first beat, meaning the cycle begins with an unstressed beat.",
  });

  // Advanced: Layakari and Tihai
  questions.push({
    question_text: "What is a 'Chakradar Tihai' in Hindustani rhythmic practice?",
    correct_answer: "A tihai where each of the three repetitions itself contains a tihai (tihai within tihai)",
    wrong_answers: [
      "A tihai played in three different tempos",
      "A tihai that spans exactly one avartan",
      "A tihai played on three different drums"
    ],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Chakradar Tihai is a complex rhythmic cadence where the three-fold repetition is nested — each part of the tihai is itself a tihai, creating a 3x3=9 structure.",
  });

  questions.push({
    question_text: "What is 'Layakari' in Hindustani music?",
    correct_answer: "Rhythmic improvisation within the tala framework",
    wrong_answers: [
      "The study of raga melodic patterns",
      "A type of vocal composition",
      "The tuning system for instruments"
    ],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Layakari is the art of rhythmic improvisation, involving playing with different subdivisions (dugun, tigun, chaugun) within the tala cycle.",
  });

  // Advanced: Theka identification
  for (const tala of HINDUSTANI_TALAS.slice(0, 4)) {
    const wrongThekas = pickRandom(
      HINDUSTANI_TALAS.map(t => t.theka),
      3, [tala.theka]
    );
    questions.push({
      question_text: `Which tala has this theka (basic bol pattern): "${tala.theka}"?`,
      correct_answer: tala.name,
      wrong_answers: pickRandom(allTalaNames, 3, [tala.name]),
      category: cat, quiz_type: qt, difficulty: "advanced",
      explanation: `This is the theka of ${tala.name} (${tala.beats} beats).`,
    });
  }

  return questions;
}

function generateHindustaniCompositions() {
  const questions = [];
  const cat = "Hindustani Compositions";
  const qt = "indian_classical";
  const allFormNames = HINDUSTANI_COMPOSITION_FORMS.map(f => f.name);
  const allComposerNames = GREAT_HINDUSTANI_COMPOSERS.map(c => c.name);

  // Beginner: Composition form identification
  for (const form of HINDUSTANI_COMPOSITION_FORMS.slice(0, 5)) {
    const wrongDescs = pickRandom(HINDUSTANI_COMPOSITION_FORMS.map(f => f.desc), 3, [form.desc]);
    questions.push({
      question_text: `What is "${form.name}" in Hindustani music?`,
      correct_answer: form.desc,
      wrong_answers: wrongDescs,
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `${form.name}: ${form.desc}. Tempo: ${form.tempo}.`,
    });
  }

  // Beginner: Khayal basics
  questions.push({
    question_text: "What are the two types of Khayal based on tempo?",
    correct_answer: "Bada Khayal (slow/vilambit) and Chhota Khayal (fast/drut)",
    wrong_answers: [
      "Sthayi Khayal and Antara Khayal",
      "Dhrupad Khayal and Thumri Khayal",
      "Vilambit Khayal and Madhya Khayal"
    ],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "Khayal is performed in two tempi: Bada Khayal (vilambit/slow, usually in Ektaal or Tilwada) and Chhota Khayal (drut/fast, usually in Teental).",
  });

  // Beginner: Dhrupad sections
  questions.push({
    question_text: "What are the four sections of a Dhrupad composition?",
    correct_answer: "Sthayi, Antara, Sanchari, Abhog",
    wrong_answers: [
      "Pallavi, Anupallavi, Charanam, Mangalam",
      "Alap, Jod, Jhala, Gat",
      "Asthayi, Antara, Alap, Taan"
    ],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "Dhrupad has four sections: Sthayi (theme), Antara (development to upper register), Sanchari (exploration), and Abhog (conclusion).",
  });

  // Intermediate: Great composers
  for (const comp of GREAT_HINDUSTANI_COMPOSERS.slice(0, 6)) {
    questions.push({
      question_text: `Which Hindustani musician is known for: "${comp.contribution}"?`,
      correct_answer: comp.name,
      wrong_answers: pickRandom(allComposerNames, 3, [comp.name]),
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${comp.name} (${comp.period}): ${comp.contribution}. Genre: ${comp.genre}.`,
    });
  }

  // Intermediate: Form-genre associations
  questions.push({
    question_text: "Which Hindustani vocal form uses meaningless syllables like 'ta, na, dir, dir'?",
    correct_answer: "Tarana",
    wrong_answers: ["Thumri", "Dhrupad", "Khayal"],
    category: cat, quiz_type: qt, difficulty: "intermediate",
    explanation: "Tarana is a fast-paced vocal form that uses syllables like ta, na, dir, dir (and sometimes Persian/Arabic words) instead of meaningful lyrics.",
  });

  questions.push({
    question_text: "Thumri is most closely associated with which two cities?",
    correct_answer: "Lucknow and Banaras (Varanasi)",
    wrong_answers: ["Delhi and Agra", "Jaipur and Gwalior", "Kolkata and Dhaka"],
    category: cat, quiz_type: qt, difficulty: "intermediate",
    explanation: "Thumri has two main styles: the Lucknow style (bol-banao, emphasis on text) and the Banaras style (bol-bant, more raga-based).",
  });

  // Intermediate: Historical attribution
  questions.push({
    question_text: "Who is traditionally credited with inventing the Khayal form of Hindustani music?",
    correct_answer: "Amir Khusrau",
    wrong_answers: ["Tansen", "Bade Ghulam Ali Khan", "Vishnu Narayan Bhatkhande"],
    category: cat, quiz_type: qt, difficulty: "intermediate",
    explanation: "Amir Khusrau (13th century) is traditionally credited with inventing Khayal, though some historians dispute this attribution.",
  });

  // Advanced: Instrument associations
  for (const comp of GREAT_HINDUSTANI_COMPOSERS.filter(c => c.genre.includes("Instrumental"))) {
    questions.push({
      question_text: `Which instrument is ${comp.name} most famous for?`,
      correct_answer: comp.genre.replace("Instrumental (", "").replace(")", ""),
      wrong_answers: pickRandom(["Sitar", "Sarod", "Tabla", "Sarangi", "Santoor", "Flute"], 3, [comp.genre.replace("Instrumental (", "").replace(")", "")]),
      category: cat, quiz_type: qt, difficulty: "advanced",
      explanation: `${comp.name} (${comp.period}) was a master of ${comp.genre}.`,
    });
  }

  // Advanced: Tansen
  questions.push({
    question_text: "Tansen was one of the Navaratnas (nine jewels) in whose court?",
    correct_answer: "Emperor Akbar",
    wrong_answers: ["Emperor Shah Jahan", "Emperor Aurangzeb", "Emperor Babur"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Tansen (16th century) was one of the Navaratnas (nine jewels) of Mughal Emperor Akbar's court.",
  });

  questions.push({
    question_text: "Which form of Hindustani music is considered the oldest surviving classical vocal tradition?",
    correct_answer: "Dhrupad",
    wrong_answers: ["Khayal", "Thumri", "Tarana"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Dhrupad is the oldest surviving form of Hindustani classical music, dating back to at least the 15th century in its current form.",
  });

  questions.push({
    question_text: "What is a 'Tappa' in Hindustani music?",
    correct_answer: "A fast ornamental vocal style originating from Punjab, known for quick taans",
    wrong_answers: [
      "A slow devotional composition in praise of gods",
      "A rhythmic drum composition for tabla solo",
      "A dance form accompanied by classical music"
    ],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Tappa originated from the folk songs of Punjab camel riders and was refined into a classical form. It demands exceptional vocal agility.",
  });

  // Advanced: More form details
  for (const form of HINDUSTANI_COMPOSITION_FORMS.slice(5)) {
    const wrongDescs = pickRandom(HINDUSTANI_COMPOSITION_FORMS.map(f => f.desc), 3, [form.desc]);
    questions.push({
      question_text: `What type of Hindustani composition is a "${form.name}"?`,
      correct_answer: form.desc,
      wrong_answers: wrongDescs,
      category: cat, quiz_type: qt, difficulty: "advanced",
      explanation: `${form.name}: ${form.desc}.`,
    });
  }

  // Additional Hindustani Compositions questions
  const extraHindCompQs = [
    { q: "What are the two main sections of a Khayal performance?", a: "Sthayi (lower register theme) and Antara (upper register development)", w: ["Pallavi and Charanam", "Alap and Gat", "Arohi and Avrohi"], d: "beginner" },
    { q: "Which musical form did Tansen primarily perform?", a: "Dhrupad", w: ["Khayal", "Thumri", "Ghazal"], d: "beginner" },
    { q: "What syllables are typically used in a Tarana composition?", a: "Meaningless syllables like ta, na, dir, dir, and Persian/Arabic words", w: ["Regular Hindi or Urdu poetry", "Sanskrit shlokas", "Names of the swaras"], d: "intermediate" },
    { q: "What is the 'Bol-Banao' style of Thumri?", a: "The Lucknow style that emphasizes text interpretation and emotional expression through each word", w: ["A tabla solo technique", "A fast ornamental vocal passage", "A method of raga classification"], d: "intermediate" },
    { q: "What is 'Sadra' in Hindustani music?", a: "A vocal form similar to Dhrupad but with a lighter, more playful character", w: ["A type of tabla composition", "A raga performed at sunrise", "A stringed instrument"], d: "advanced" },
    { q: "Which Hindustani composition form is most associated with the Holi festival?", a: "Dhamar (set to 14-beat Dhamar tala, with spring-themed lyrics)", w: ["Dhrupad", "Khayal", "Tappa"], d: "advanced" },
    { q: "Kumar Gandharva was revolutionary because of what approach to Hindustani music?", a: "He broke convention by incorporating folk melodies and creating unconventional raga interpretations", w: ["He introduced Western instruments", "He abolished the guru-shishya tradition", "He only performed in films"], d: "advanced" },
    { q: "What is the role of the 'Sarangi' in traditional Hindustani vocal performance?", a: "It serves as the primary melodic accompaniment, closely following the vocalist's phrases", w: ["It provides the rhythmic cycle", "It plays the drone", "It is only used in instrumental concerts"], d: "intermediate" },
    { q: "Ravi Shankar is most famous for playing which instrument?", a: "Sitar", w: ["Sarod", "Tabla", "Santoor"], d: "beginner" },
    { q: "Ali Akbar Khan was a renowned master of which instrument?", a: "Sarod", w: ["Sitar", "Flute", "Tabla"], d: "intermediate" },
    { q: "What is a 'Jugalbandi' in Hindustani music?", a: "A duet performance where two musicians (often instrumentalists) engage in musical dialogue and friendly competition", w: ["A solo tabla recital", "A devotional song form", "A raga performed only at night"], d: "intermediate" },
    { q: "What is 'Sawaal-Jawaab' in a Hindustani performance?", a: "A musical question-and-answer exchange between performers, often between soloist and accompanist", w: ["A written music theory exam", "A type of raga classification", "A specific tala pattern"], d: "advanced" },
  ];
  for (const eq of extraHindCompQs) {
    questions.push({
      question_text: eq.q, correct_answer: eq.a, wrong_answers: eq.w,
      category: cat, quiz_type: qt, difficulty: eq.d,
      explanation: eq.a,
    });
  }

  return questions;
}

function generateIndianClassicalTheory() {
  const questions = [];
  const cat = "Indian Classical Theory";
  const qt = "indian_classical";

  // Beginner: Shared concepts
  const beginnerShared = SHARED_CONCEPTS.filter(c =>
    ["Nada", "Shruti", "Swara", "Raga", "Tala", "Saptak", "Alankar"].includes(c.term)
  );
  for (const concept of beginnerShared) {
    const allDefs = SHARED_CONCEPTS.map(c => c.def);
    const wrongDefs = pickRandom(allDefs, 3, [concept.def]);
    questions.push({
      question_text: `What does the term "${concept.term}" mean in Indian classical music?`,
      correct_answer: concept.def,
      wrong_answers: wrongDefs,
      category: cat, quiz_type: qt, difficulty: "beginner",
      explanation: `${concept.term}: ${concept.def}.`,
    });
  }

  // Beginner: Two types of Nada
  questions.push({
    question_text: "What are the two types of Nada (musical sound) in Indian music philosophy?",
    correct_answer: "Ahata (struck/audible) and Anahata (unstruck/cosmic)",
    wrong_answers: [
      "Shuddha (pure) and Vikrita (altered)",
      "Mandra (low) and Tara (high)",
      "Vadi (primary) and Samvadi (secondary)"
    ],
    category: cat, quiz_type: qt, difficulty: "beginner",
    explanation: "Ahata nada is physical, audible sound produced by striking or blowing. Anahata nada is the cosmic, unstruck sound — a philosophical concept.",
  });

  // Intermediate: Carnatic vs Hindustani differences
  for (const diff of CARNATIC_VS_HINDUSTANI.slice(0, 6)) {
    questions.push({
      question_text: `In terms of "${diff.aspect}", what system does Carnatic music use?`,
      correct_answer: diff.carnatic,
      wrong_answers: [diff.hindustani, ...pickRandom(
        CARNATIC_VS_HINDUSTANI.map(d => d.carnatic).concat(CARNATIC_VS_HINDUSTANI.map(d => d.hindustani)),
        2,
        [diff.carnatic, diff.hindustani]
      )],
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${diff.aspect}: Carnatic uses ${diff.carnatic}, while Hindustani uses ${diff.hindustani}.`,
    });
  }

  for (const diff of CARNATIC_VS_HINDUSTANI.slice(6)) {
    questions.push({
      question_text: `In terms of "${diff.aspect}", what does Hindustani music use?`,
      correct_answer: diff.hindustani,
      wrong_answers: [diff.carnatic, ...pickRandom(
        CARNATIC_VS_HINDUSTANI.map(d => d.hindustani).concat(CARNATIC_VS_HINDUSTANI.map(d => d.carnatic)),
        2,
        [diff.carnatic, diff.hindustani]
      )],
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${diff.aspect}: Hindustani uses ${diff.hindustani}, while Carnatic uses ${diff.carnatic}.`,
    });
  }

  // Intermediate: Important texts
  const textConcepts = SHARED_CONCEPTS.filter(c =>
    ["Natyashastra", "Sangita Ratnakara"].includes(c.term)
  );
  for (const concept of textConcepts) {
    const allDefs = SHARED_CONCEPTS.map(c => c.def);
    const wrongDefs = pickRandom(allDefs, 3, [concept.def]);
    questions.push({
      question_text: `What is the "${concept.term}" in Indian music history?`,
      correct_answer: concept.def,
      wrong_answers: wrongDefs,
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${concept.term}: ${concept.def}.`,
    });
  }

  // Intermediate: Concert formats
  for (const format of CONCERT_FORMATS) {
    questions.push({
      question_text: `What is the format of a ${format.name} concert?`,
      correct_answer: format.desc,
      wrong_answers: pickRandom(
        [CONCERT_FORMATS[0].desc, CONCERT_FORMATS[1].desc,
         "A free-form jam session with no set structure",
         "A competition where musicians take turns performing"],
        3, [format.desc]
      ),
      category: cat, quiz_type: qt, difficulty: "intermediate",
      explanation: `${format.name}: ${format.desc}.`,
    });
  }

  // Advanced: 22 shrutis
  questions.push({
    question_text: "How many shrutis per octave does the Indian classical system recognize?",
    correct_answer: "22",
    wrong_answers: ["12", "16", "24"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "The Natyashastra describes 22 shrutis per octave, which is a finer division than the 12 semitones in Western equal temperament.",
  });

  // Advanced: Classification systems
  questions.push({
    question_text: "Who codified the 72 Melakarta system used in Carnatic music?",
    correct_answer: "Venkatamakhi",
    wrong_answers: ["Bharata Muni", "Sharangadeva", "Vishnu Narayan Bhatkhande"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Venkatamakhi, in his treatise Chaturdandi Prakashika (1660), codified the system of 72 melakarta ragas.",
  });

  questions.push({
    question_text: "Who codified the 10 Thaat system used in Hindustani music?",
    correct_answer: "Vishnu Narayan Bhatkhande",
    wrong_answers: ["Venkatamakhi", "Bharata Muni", "Tansen"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "V.N. Bhatkhande (1860-1936) classified Hindustani ragas into 10 thaats in the early 20th century.",
  });

  // Advanced: Rasa
  questions.push({
    question_text: "Which ancient text first described the theory of Rasa (aesthetic emotion) in performing arts?",
    correct_answer: "Natyashastra by Bharata Muni",
    wrong_answers: ["Sangita Ratnakara by Sharangadeva", "Arthashastra by Kautilya", "Brihaddeshi by Matanga"],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "The Natyashastra (c. 200 BCE-200 CE) introduced the Rasa theory, originally describing 8 rasas (Shanta was added later).",
  });

  // Advanced: Nava Rasa identification
  for (const rasa of NAVA_RASAS.slice(5)) {
    const wrongEmotions = pickRandom(NAVA_RASAS.map(r => r.emotion), 3, [rasa.emotion]);
    questions.push({
      question_text: `Which rasa represents "${rasa.emotion}"?`,
      correct_answer: rasa.name,
      wrong_answers: pickRandom(NAVA_RASAS.map(r => r.name), 3, [rasa.name]),
      category: cat, quiz_type: qt, difficulty: "advanced",
      explanation: `${rasa.name} rasa represents ${rasa.emotion}.`,
    });
  }

  // Advanced: Historical continuity
  questions.push({
    question_text: "The Sangita Ratnakara by Sharangadeva is considered a bridge between which two traditions?",
    correct_answer: "Carnatic and Hindustani — it was written before the two systems diverged completely",
    wrong_answers: [
      "Indian and Persian musical traditions",
      "Vocal and instrumental traditions",
      "Sacred and secular musical traditions"
    ],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "The Sangita Ratnakara (13th century) was composed before the full split of Indian music into Carnatic and Hindustani systems, making it relevant to both.",
  });

  questions.push({
    question_text: "What is 'Brihaddeshi' and why is it historically significant?",
    correct_answer: "A treatise by Matanga (c. 6th-8th century) that first used the term 'Raga' in its modern musical sense",
    wrong_answers: [
      "A collection of 1,000 compositions by Tansen",
      "The first notation system for Indian music",
      "A treatise describing the 72 Melakarta ragas"
    ],
    category: cat, quiz_type: qt, difficulty: "advanced",
    explanation: "Brihaddeshi by Matanga is one of the earliest texts to define the concept of Raga as a melodic entity, bridging ancient and medieval Indian music theory.",
  });

  // Additional Indian Classical Theory questions
  const extraSharedQs = [
    { q: "What is the fundamental difference between Carnatic and Hindustani music in terms of raga classification?", a: "Carnatic uses 72 Melakarta parent ragas; Hindustani uses 10 Thaat parent scales", w: ["They use the same classification system", "Carnatic has 10 ragas and Hindustani has 72", "Neither system has a parent classification"], d: "beginner" },
    { q: "What is 'Guru-Shishya Parampara' in Indian classical music?", a: "The traditional teacher-student lineage system of oral musical transmission", w: ["A type of musical composition", "A rhythmic cycle", "A raga classification method"], d: "beginner" },
    { q: "Which instrument is commonly called the 'king of instruments' in Carnatic music?", a: "Veena (Saraswati Veena)", w: ["Mridangam", "Violin", "Flute"], d: "intermediate" },
    { q: "When did Carnatic and Hindustani music begin to diverge into distinct systems?", a: "Around the 12th-13th century, with the advent of Islamic cultural influence in North India", w: ["They were always separate systems", "In the 20th century", "During the Vedic period"], d: "intermediate" },
    { q: "What is 'Shruti' in the context of Indian classical music performance?", a: "The base pitch or tonic to which all instruments and voices are tuned", w: ["A type of composition", "A rhythmic pattern", "A vocal ornament"], d: "beginner" },
    { q: "What does 'Raga Alapana' (Carnatic) or 'Alap' (Hindustani) establish?", a: "The mood, structure, and character of the raga through slow, unmetered melodic exploration", w: ["The rhythmic cycle of the performance", "The key signature of the piece", "The tempo for the entire concert"], d: "intermediate" },
    { q: "What role does the 'drone' play in Indian classical music?", a: "It provides a constant tonal reference (usually Sa and Pa) against which the raga unfolds", w: ["It sets the rhythmic tempo", "It plays the melody in unison", "It is only used for tuning before the concert"], d: "intermediate" },
    { q: "Which rasa (aesthetic emotion) is considered the 'king of rasas' in Indian aesthetics?", a: "Shringara (love/romance)", w: ["Shanta (peace)", "Veera (heroism)", "Karuna (compassion)"], d: "advanced" },
    { q: "What is the significance of the number 22 in Indian music theory?", a: "There are 22 shrutis (microtonal intervals) recognized within one octave", w: ["There are 22 ragas in the basic system", "There are 22 talas", "There are 22 types of compositions"], d: "advanced" },
  ];
  for (const eq of extraSharedQs) {
    questions.push({
      question_text: eq.q, correct_answer: eq.a, wrong_answers: eq.w,
      category: cat, quiz_type: qt, difficulty: eq.d,
      explanation: eq.a,
    });
  }

  return questions;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN: Generate all questions and output CSV
// ═══════════════════════════════════════════════════════════════════

function main() {
  console.error("Generating Indian classical music questions...");

  let allQuestions = [
    ...generateCarnaticTheory(),
    ...generateCarnaticRagas(),
    ...generateCarnaticTala(),
    ...generateCarnaticCompositions(),
    ...generateHindustaniTheory(),
    ...generateHindustaniRagas(),
    ...generateHindustaniTala(),
    ...generateHindustaniCompositions(),
    ...generateIndianClassicalTheory(),
  ];

  // Filter out trivia/history questions — replace with practical musicianship
  const triviaPatterns = [
    /who (are|is|was|were) the.*trinity/i,
    /what was the primary language of/i,
    /who is known as the.*pitamaha/i,
    /which.*composer is famous for the.*kamalamba/i,
    /how many compositions is.*credited with/i,
    /what distinguishes.*dikshitar.*from the other/i,
    /greatest musician of mughal/i,
    /credited with creating the sitar/i,
    /traditionally credited with inventing the khayal/i,
    /ravi shankar.*famous.*which instrument/i,
    /ali akbar khan.*famous/i,
    /navaratnas.*jewels.*whose court/i,
    /who codified the 72 melakarta/i,
    /who codified the 10 thaat/i,
    /tansen was one of the/i,
  ];
  const beforeCount = allQuestions.length;
  allQuestions = allQuestions.filter(q => !triviaPatterns.some(p => p.test(q.question_text)));
  console.error(`Filtered ${beforeCount - allQuestions.length} trivia questions`);

  // Add practical musicianship replacements
  const practicalReplacements = [
    // Pakad (characteristic phrase) identification
    { question_text: "A raga's 'pakad' refers to what?", correct_answer: "Its characteristic melodic phrase that instantly identifies the raga", wrong_answers: ["Its time of performance", "Its parent scale", "Its rhythmic pattern"], category: "Indian Classical Theory", quiz_type: "indian_classical", difficulty: "beginner", explanation: "The pakad is the musical 'signature' of a raga — a short phrase that captures its essence." },
    { question_text: "If you hear the phrase Ni-Re-Ga-Ma-Pa in a Hindustani performance, which raga is most likely being played?", correct_answer: "Yaman", wrong_answers: ["Bhairav", "Todi", "Kafi"], category: "Hindustani Ragas", quiz_type: "indian_classical", difficulty: "intermediate", explanation: "The ascending phrase Ni-Re-Ga-Ma (with tivra Ma) is the characteristic pakad of Raga Yaman." },
    { question_text: "The phrase Sa-Ga-Ma-Pa-Ni-Sa (ascending, pentatonic) is characteristic of which Carnatic raga?", correct_answer: "Mohanam", wrong_answers: ["Hamsadhwani", "Kalyani", "Shankarabharanam"], category: "Carnatic Ragas", quiz_type: "indian_classical", difficulty: "intermediate", explanation: "Mohanam is an audava (pentatonic) raga with Sa-Ri-Ga-Pa-Da — but the ascending feel of Sa-Ga-Ma-Pa is its signature." },
    // Practice methodology
    { question_text: "What is 'Sarali Varisai' in Carnatic music education?", correct_answer: "Basic ascending/descending swara exercises — the first lessons every student learns", wrong_answers: ["A type of composition", "An advanced raga exploration technique", "A rhythmic cycle"], category: "Carnatic Theory", quiz_type: "indian_classical", difficulty: "beginner", explanation: "Sarali Varisai are the foundational exercises in Carnatic music — straight-line swara patterns that build pitch accuracy." },
    { question_text: "What is an 'Alankar' in Hindustani music practice?", correct_answer: "Melodic patterns/exercises using different swara combinations to build technique", wrong_answers: ["A type of ornament on the veena", "A rhythmic cycle", "A raga classification"], category: "Hindustani Theory", quiz_type: "indian_classical", difficulty: "beginner", explanation: "Alankars are the building blocks of practice — repetitive swara patterns that develop finger/vocal agility and pitch accuracy." },
    { question_text: "When learning a new raga, what should a student practice first?", correct_answer: "The aroha (ascending) and avaroha (descending) scales slowly, then the pakad", wrong_answers: ["A full composition immediately", "Only the tala pattern", "Random improvisation in the raga"], category: "Indian Classical Theory", quiz_type: "indian_classical", difficulty: "beginner", explanation: "Start with the skeleton (aroha/avaroha), then learn the raga's DNA (pakad), then move to compositions and improvisation." },
    // Practical tala
    { question_text: "In Adi Tala (8 beats), you clap on beat 1. When do you clap next?", correct_answer: "Beat 5 (after 4 finger counts)", wrong_answers: ["Beat 3", "Beat 2", "Beat 9"], category: "Carnatic Tala", quiz_type: "indian_classical", difficulty: "beginner", explanation: "Adi Tala is Chatusra Jati Triputa: Laghu(4) + Drutam(2) + Drutam(2). Clap on 1, finger counts on 2-3-4, then clap on 5." },
    { question_text: "In Teental (16 beats), where is the Khali (empty beat)?", correct_answer: "Beat 9", wrong_answers: ["Beat 5", "Beat 1", "Beat 13"], category: "Hindustani Tala", quiz_type: "indian_classical", difficulty: "beginner", explanation: "Teental: Sam(1) Tali(5) Khali(9) Tali(13). Khali on beat 9 is shown by waving the hand instead of clapping." },
    // Raga mood/feeling
    { question_text: "Which raga is traditionally associated with a peaceful, devotional morning mood?", correct_answer: "Bhairav (Hindustani) / Mayamalavagowla (Carnatic)", wrong_answers: ["Yaman / Kalyani (evening romance)", "Malkauns / Hindolam (deep night)", "Bhimpalasi / Kharaharapriya (afternoon)"], category: "Indian Classical Theory", quiz_type: "indian_classical", difficulty: "intermediate", explanation: "Morning ragas like Bhairav/Mayamalavagowla use komal Re and shuddha Ma, creating a serene, awakening quality." },
    { question_text: "You want to create a romantic, lyrical evening mood. Which raga family would be most appropriate?", correct_answer: "Kalyan/Yaman family (tivra Ma ragas)", wrong_answers: ["Bhairav family (komal Re ragas)", "Todi family (komal Re, Ga, Dha)", "Asavari family (komal Ga, Dha, Ni)"], category: "Hindustani Ragas", quiz_type: "indian_classical", difficulty: "intermediate", explanation: "The Kalyan thaat ragas (Yaman, Shuddh Kalyan, Hameer) use tivra Ma which creates warmth and romantic feeling, perfect for evening." },
    // Scale comparison
    { question_text: "Which Carnatic melakarta is equivalent to the Western major scale?", correct_answer: "Dheerasankarabharanam (29th melakarta)", wrong_answers: ["Mayamalavagowla (15th)", "Kharaharapriya (22nd)", "Mechakalyani (65th)"], category: "Carnatic Ragas", quiz_type: "indian_classical", difficulty: "intermediate", explanation: "Dheerasankarabharanam = Sa Ri2 Ga3 Ma1 Pa Da2 Ni3, which is the same interval pattern as the Western major scale." },
    { question_text: "What is the practical difference between Ri1 and Ri2 for a singer?", correct_answer: "Ri1 is a semitone above Sa (like a minor 2nd); Ri2 is a whole tone above Sa (like a major 2nd)", wrong_answers: ["They sound the same but are written differently", "Ri1 is higher than Ri2", "Ri1 is used only in Carnatic, Ri2 only in Hindustani"], category: "Carnatic Theory", quiz_type: "indian_classical", difficulty: "intermediate", explanation: "Ri1 (Shuddha Ri) = Western minor 2nd, Ri2 (Chatushruti Ri) = Western major 2nd. Hearing and producing this difference is fundamental." },
    // Composition structure
    { question_text: "In a Carnatic Kriti, what does the 'Pallavi' section establish?", correct_answer: "The main theme/refrain — the melodic and lyrical essence of the composition", wrong_answers: ["The rhythmic pattern only", "An improvised section with no fixed melody", "The concluding section"], category: "Carnatic Compositions", quiz_type: "indian_classical", difficulty: "beginner", explanation: "Pallavi is the opening section and main refrain that keeps returning throughout the kriti. It sets the mood and identity." },
    { question_text: "What is the difference between Bada Khayal and Chhota Khayal?", correct_answer: "Bada Khayal is slow (vilambit), Chhota Khayal is fast (drut) — both in the same raga during performance", wrong_answers: ["They are in different ragas", "Bada is longer in lyrics, Chhota is shorter", "There is no difference, they are the same form"], category: "Hindustani Compositions", quiz_type: "indian_classical", difficulty: "intermediate", explanation: "In a khayal performance, the artist typically starts with Bada Khayal (slow tempo, elaborate improvisation) then moves to Chhota Khayal (faster, more rhythmic)." },
    // Tuning and drone
    { question_text: "Why is Sa considered 'immovable' (achala) in Indian classical music?", correct_answer: "Sa is the tonic — all other notes are defined relative to it, so it never changes within a performance", wrong_answers: ["It's always the note C", "It cannot be sung", "It has no pitch"], category: "Indian Classical Theory", quiz_type: "indian_classical", difficulty: "beginner", explanation: "Unlike Western music where the key can change, in Indian classical music Sa is the constant reference. The tanpura drone holds it steady throughout." },
    { question_text: "A student is practicing and notices they are going out of tune. What should they check first?", correct_answer: "Their Sa — listen to the tanpura/drone and re-align with the tonic", wrong_answers: ["Their rhythm", "The volume of their instrument", "The room temperature"], category: "Indian Classical Theory", quiz_type: "indian_classical", difficulty: "beginner", explanation: "In Indian classical music, everything is relative to Sa. If you lose your Sa, every other note will sound wrong. Always come back to the drone." },
  ];

  for (const q of practicalReplacements) {
    q.wrong_answers = q.wrong_answers || [];
  }
  allQuestions.push(...practicalReplacements);

  // Renumber set_ids consistently
  const categoryCounts = {};
  for (const q of allQuestions) {
    const catKey = q.category.toLowerCase().replace(/\s+/g, "-");
    categoryCounts[catKey] = (categoryCounts[catKey] || 0) + 1;
    q.set_id = `gen-indian-${catKey}-${String(categoryCounts[catKey]).padStart(3, "0")}`;
    q.question_number = categoryCounts[catKey];
    q.notation_data = "";
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
  writeFileSync("indian_classical_generated.csv", csv);

  // Stats
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

  console.error(`\nOutput: indian_classical_generated.csv`);
}

main();
