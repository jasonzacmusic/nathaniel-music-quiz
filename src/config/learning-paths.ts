export interface LearningPathStep {
  category: string;
  count: number;
  description: string;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  tradition: "western" | "jazz" | "carnatic" | "hindustani";
  color: string;
  icon: string;
  steps: LearningPathStep[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "western-foundations",
    name: "Western Theory Foundations",
    description: "Master the building blocks of Western music theory",
    difficulty: "beginner",
    tradition: "western",
    color: "amber",
    icon: "🎼",
    steps: [
      { category: "Key Signatures", count: 10, description: "Learn major and minor key signatures" },
      { category: "Intervals", count: 10, description: "Identify intervals by size and quality" },
      { category: "Scales & Modes", count: 10, description: "Major, minor, and modal scales" },
      { category: "Chord Theory", count: 10, description: "Triads, inversions, and basic progressions" },
    ],
  },
  {
    id: "jazz-harmony",
    name: "Jazz Harmony Journey",
    description: "Explore jazz chords, voicings, and harmonic concepts",
    difficulty: "intermediate",
    tradition: "jazz",
    color: "violet",
    icon: "🎷",
    steps: [
      { category: "Jazz Theory", count: 15, description: "Chord symbols, extensions, and substitutions" },
      { category: "Chord Theory", count: 15, description: "Seventh chords, altered dominants, voicings" },
      { category: "Harmony & Voice Leading", count: 15, description: "ii-V-I progressions and voice leading" },
    ],
  },
  {
    id: "carnatic-essentials",
    name: "Carnatic Essentials",
    description: "Foundation of South Indian classical music",
    difficulty: "beginner",
    tradition: "carnatic",
    color: "orange",
    icon: "🪷",
    steps: [
      { category: "Carnatic Theory", count: 10, description: "Swaras, srutis, and basic concepts" },
      { category: "Carnatic Ragas", count: 10, description: "Melakarta system and fundamental ragas" },
      { category: "Carnatic Tala", count: 10, description: "Suladi sapta tala and rhythmic patterns" },
      { category: "Carnatic Compositions", count: 10, description: "Trinity composers and major kritis" },
    ],
  },
  {
    id: "hindustani-foundations",
    name: "Hindustani Foundations",
    description: "Explore the rich tradition of North Indian classical music",
    difficulty: "beginner",
    tradition: "hindustani",
    color: "indigo",
    icon: "🎵",
    steps: [
      { category: "Hindustani Theory", count: 10, description: "Thaat system and fundamental concepts" },
      { category: "Hindustani Ragas", count: 10, description: "Major ragas and their characteristics" },
      { category: "Hindustani Tala", count: 10, description: "Teental, jhaptaal, and tala structures" },
    ],
  },
  {
    id: "advanced-western",
    name: "Advanced Western Mastery",
    description: "Deep analysis, complex harmony, and advanced theory",
    difficulty: "advanced",
    tradition: "western",
    color: "rose",
    icon: "🏆",
    steps: [
      { category: "Form & Analysis", count: 15, description: "Sonata form, fugue, and structural analysis" },
      { category: "Harmony & Voice Leading", count: 15, description: "Chromatic harmony and modulation" },
      { category: "Scales & Modes", count: 15, description: "Symmetric scales, altered modes, exotic scales" },
    ],
  },
];
