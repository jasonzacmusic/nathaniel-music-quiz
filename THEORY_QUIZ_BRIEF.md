# Music Theory Quiz — Brief for Claude Cowork

## What You're Building

You are generating music theory quiz questions for the Nathaniel School of Music quiz website. These are **text-only** questions (no video, no audio) that test music theory knowledge across three difficulty levels.

## The Database Format

Each question needs these fields inserted into the Neon PostgreSQL `questions` table:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `set_id` | text | yes | Use format `theory-{category-slug}-{batch}` e.g. `theory-scales-001` |
| `question_number` | int | yes | Sequential within the set |
| `question_text` | text | yes | The question itself |
| `correct_answer` | text | yes | The one correct answer |
| `wrong_answer_1` | text | yes | Plausible but incorrect |
| `wrong_answer_2` | text | yes | Plausible but incorrect |
| `wrong_answer_3` | text | yes | Plausible but incorrect |
| `category` | text | yes | One of the categories below |
| `quiz_type` | text | yes | Always `'music_theory'` |
| `difficulty` | text | yes | `'beginner'`, `'intermediate'`, or `'advanced'` |
| `explanation` | text | yes | 1-3 sentence explanation of WHY the answer is correct |
| `youtube_url` | text | optional | Link to a relevant Nathaniel School lesson if applicable |
| `youtube_title` | text | optional | Title for the YouTube link |
| `video_url` | text | no | Leave NULL — these are text-only questions |
| `patreon_url` | text | optional | Link to Patreon if relevant |
| `created_at` | timestamp | auto | Will default to NOW() |

## Categories to Cover

Generate questions across these categories:

1. **Scales & Modes** — Major, minor (natural/harmonic/melodic), church modes, melodic minor modes, symmetric scales (whole tone, diminished), pentatonic, blues
2. **Intervals** — Identification, inversion, compound intervals, enharmonic equivalents
3. **Chord Theory** — Triads, seventh chords, extended chords (9/11/13), altered chords, slash chords, chord symbols
4. **Harmony & Voice Leading** — Roman numeral analysis, cadences, part-writing rules, common progressions, modulation
5. **Rhythm & Meter** — Time signatures (simple, compound, odd, additive), note values, tuplets, syncopation, polyrhythm
6. **Form & Analysis** — Song forms (AABA, 12-bar blues, sonata, rondo), phrase structure, motivic development
7. **Jazz Theory** — ii-V-I, tritone substitution, modal jazz, chord-scale theory, bebop scales, reharmonization
8. **Key Signatures** — Major/minor key identification, relative/parallel keys, enharmonic keys, circle of fifths

## Difficulty Levels

### Beginner
- Basic interval identification (what is a perfect 5th?)
- Major/minor scale construction
- Key signature identification (how many sharps in D major?)
- Basic triad types (major, minor, diminished, augmented)
- Simple time signatures (4/4, 3/4, 6/8)
- Circle of fifths basics

### Intermediate
- All 7 church modes and their characteristics
- Seventh chord types and inversions
- Secondary dominants and their resolution
- Compound and odd time signatures (5/4, 7/8)
- Basic Roman numeral analysis
- Common chord progressions and cadence types
- Relative and parallel key relationships

### Advanced
- Modes of melodic minor (Lydian dominant, altered scale, etc.)
- Modes of harmonic minor
- Tritone substitution and reharmonization
- Messiaen's modes of limited transposition
- Polytonal and atonal concepts
- Advanced voice leading (Schenkerian analysis concepts)
- Complex modulation techniques (common tone, chromatic, enharmonic)
- Negative harmony
- Advanced jazz concepts (Coltrane changes, quartal harmony)

## Quality Guidelines

1. **All 4 answer choices MUST be filled in.** Never leave wrong_answer_1/2/3 empty. The current ear training quiz has 81 questions with missing answers — do NOT repeat this mistake.

2. **Wrong answers must be plausible.** Don't use obviously wrong answers. For "What is the 5th mode of the major scale?", wrong answers should be other modes (Dorian, Phrygian, Aeolian) not random words.

3. **Explanations are mandatory.** Every question needs a clear, concise explanation. This is what makes the quiz educational, not just a test.

4. **Match the vibe.** The website has a warm, vintage, rustic feel (amber/brown palette). The questions should feel like they come from a knowledgeable music teacher, not a dry textbook. Think approachable but rigorous.

5. **Use proper music notation in text.** Use ♭ for flat, # for sharp. Write chord symbols properly: Cmaj7, Dm7♭5, G7#9, etc.

6. **Vary question formats:**
   - "What is...?" (identification)
   - "Which of the following...?" (selection)
   - "In the key of X, what is...?" (application)
   - "How many...?" (counting)
   - "What would you call...?" (naming)

## Source Material

There are music theory textbooks and resources in the user's iCloud Drive. Use those as reference material to ensure accuracy and depth. But also use your own comprehensive knowledge of music theory — you should know this subject deeply.

## Target Volume

Generate at minimum:
- **50 beginner questions** across all categories
- **50 intermediate questions** across all categories
- **50 advanced questions** across all categories

That's 150 questions minimum to start. More is better. Aim for even distribution across categories.

## How to Insert

Option A: Output as a Google Sheet (the user's existing pipeline)
- Create rows matching the column format above
- The user will import to Neon DB

Option B: Generate SQL INSERT statements
```sql
INSERT INTO questions (set_id, question_number, question_text, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3, category, quiz_type, difficulty, explanation, created_at)
VALUES ('theory-scales-001', 1, 'What is the 5th mode of the major scale?', 'Mixolydian', 'Dorian', 'Phrygian', 'Lydian', 'Scales & Modes', 'music_theory', 'intermediate', 'The modes of the major scale in order are: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian. The 5th mode is Mixolydian, characterized by a dominant 7th (♭7) quality.', NOW());
```

Option C: Generate as JSON for programmatic insertion

**The user will tell you which format they prefer.** Ask them.

## Connection Info

The Neon database connection uses environment variable `NEON_DATABASE_URL`. The table is `questions` in the default schema. The columns `quiz_type`, `difficulty`, and `explanation` were just added — they exist and are ready.

## One More Thing

After generating questions, verify:
- Every question has exactly 4 answer options (1 correct + 3 wrong)
- No duplicate questions
- Explanations are present for every question
- Difficulty is appropriate for the level
- Category matches the content
- `quiz_type` is always `'music_theory'`
