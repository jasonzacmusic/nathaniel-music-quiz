# Ear Training Feature — Strategy & Research

## The Opportunity

Ear training apps are a massive market. Rick Beato's ear training course sells for ~$100+. Apps like EarMaster, Teoria, and Tenuto charge subscriptions. But none of them combine:

1. Real teaching video context (Nathaniel already has this)
2. Modern web UX (not stuck in 2010 Flash-era design)
3. Progressive difficulty with AI-generated content
4. A warm, inviting brand (not clinical/academic)

This could be **the premium paid feature** of the Nathaniel School of Music platform.

## What Rick Beato's Ear Training Does

Beato's course covers:
- **Interval recognition** (ascending, descending, harmonic)
- **Chord quality** identification (major, minor, diminished, augmented, 7ths, extensions)
- **Scale/mode** identification by ear
- **Rhythm** dictation
- **Melody** dictation
- **Chord progression** identification (I-IV-V-I, ii-V-I, etc.)
- **Bass note** identification in context
- **Relative pitch** exercises

His approach: audio plays → you identify what you heard → immediate feedback.

## How We Beat It (5-10x Better)

### 1. Video Context (Our Unique Advantage)
Beato uses isolated audio clips. We use REAL teaching videos where you see the instrument being played. This provides:
- Visual cues that reinforce learning
- Context from actual lessons
- The feeling of being in a real music class

### 2. AI-Powered Adaptive Difficulty
Instead of fixed difficulty tiers, use an ELO-style rating system:
- Start at a baseline level
- Correct answers increase difficulty
- Wrong answers decrease it
- The system learns what you struggle with and targets those areas
- "You're weak on tritone intervals — here's a focused drill"

### 3. Spaced Repetition
Questions you got wrong come back at increasing intervals (like Anki for music). This builds permanent ear memory, not just short-term cramming.

### 4. Multi-Modal Exercises (Beyond Multiple Choice)

| Exercise Type | Description | Implementation |
|---------------|-------------|----------------|
| **Interval ID** | Hear two notes, name the interval | Audio playback + 4 choices |
| **Chord Quality** | Hear a chord, identify the quality | Audio + choices (maj7, m7, dom7, etc.) |
| **Scale/Mode ID** | Hear a scale played, name it | Audio + choices |
| **Progression ID** | Hear a chord progression, identify in Roman numerals | Audio + choices |
| **Note in Context** | "What degree of the scale is the melody on?" | Audio + choices |
| **Rhythm Tap** | Hear a rhythm, tap it back | Audio + tap interface (mobile-first) |
| **Pitch Match** | Hear a note, sing/play it back | Microphone input + pitch detection |
| **Dictation** | Hear a melody, write it on a staff | Staff notation input |

### 5. Learning Paths (Not Random Quizzes)

Structured courses like:
- **Path 1: Interval Mastery** (2nds → 3rds → 4ths → ... → compound intervals)
- **Path 2: Chord Ear** (triads → 7ths → extensions → alterations)
- **Path 3: Modal Hearing** (Ionian → Dorian → ... → melodic minor modes)
- **Path 4: Rhythm** (simple → compound → odd → polyrhythm)
- **Path 5: Jazz Ear** (ii-V-I → tritone subs → Coltrane changes)

Each path has levels, XP, and unlock progression.

### 6. Social/Competitive Features
- Daily challenge (everyone gets the same questions)
- Leaderboard (weekly, all-time)
- Streaks (consecutive days of practice)
- Share scores to social media

## Technical Implementation Plan

### Phase 1: Audio Engine (Foundation)
- Build a client-side audio engine using the Web Audio API
- Generate intervals, chords, scales programmatically (no pre-recorded audio needed for basic exercises)
- Piano/sine wave sounds for exercises
- Support for different timbres (piano, guitar, strings)

### Phase 2: Exercise Types
- Start with the core 4: Intervals, Chords, Scales, Progressions
- Multiple choice format (reuse existing AnswerButton component)
- Add audio playback controls (replay, speed)

### Phase 3: Progression System
- User accounts (needed for tracking progress)
- ELO rating per exercise type
- Spaced repetition queue
- Learning path unlocks
- XP and level system

### Phase 4: Premium Features
- Advanced exercise types (rhythm tap, pitch match, dictation)
- Custom practice sessions
- Detailed analytics ("Your weakest interval is m7 descending")
- Unlimited daily exercises (free tier gets 10/day?)
- Certificate of completion for paths

## Monetization Model

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Music theory quiz (unlimited), 10 ear training exercises/day, basic video quizzes |
| **Pro** | $9.99/mo | Unlimited ear training, all exercise types, progress tracking, analytics, learning paths |
| **Lifetime** | $99 | Everything in Pro, forever |

## DB Schema Additions for Ear Training

```sql
-- User accounts (needed for progress tracking)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ear training exercises (generated, not from DB)
CREATE TABLE ear_training_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  exercise_type TEXT NOT NULL,  -- 'interval', 'chord', 'scale', 'progression'
  difficulty_rating DECIMAL DEFAULT 1000,  -- ELO-style
  correct_count INT DEFAULT 0,
  total_count INT DEFAULT 0,
  last_practiced TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Individual exercise results (for spaced repetition)
CREATE TABLE ear_training_results (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  exercise_type TEXT NOT NULL,
  exercise_params JSONB NOT NULL,  -- e.g. {"interval": "P5", "direction": "ascending"}
  was_correct BOOLEAN NOT NULL,
  response_time_ms INT,
  next_review TIMESTAMP,  -- spaced repetition schedule
  created_at TIMESTAMP DEFAULT NOW()
);

-- Streaks and XP
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  total_xp INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active DATE,
  level INT DEFAULT 1
);
```

## Audio Generation (No Pre-Recorded Files Needed)

Using the Web Audio API, we can generate any musical content programmatically:

```typescript
// Example: Play an interval
function playInterval(rootFreq: number, intervalSemitones: number) {
  const ctx = new AudioContext();
  // Play root note
  playNote(ctx, rootFreq, 0, 1);
  // Play interval note after 1 second
  playNote(ctx, rootFreq * Math.pow(2, intervalSemitones / 12), 1, 1);
}

// Example: Play a chord
function playChord(rootFreq: number, semitones: number[]) {
  const ctx = new AudioContext();
  semitones.forEach(s => {
    playNote(ctx, rootFreq * Math.pow(2, s / 12), 0, 2);
  });
}
```

This means we don't need Bunny CDN for ear training — everything is generated in real-time in the browser. The exercises are unlimited and infinitely variable.

## Priority Order

1. **Now: Music theory quiz** (text-only, being built by the other Claude)
2. **Next: Basic ear training** — intervals + chord quality with Web Audio API
3. **Then: User accounts + progress tracking** — needed for premium features
4. **Then: Learning paths + spaced repetition**
5. **Then: Advanced exercises** (rhythm, dictation, pitch match)
6. **Then: Premium/paywall**

## Competitive Analysis Summary

| Feature | Rick Beato | EarMaster | Teoria | Nathaniel (Planned) |
|---------|-----------|-----------|--------|---------------------|
| Video context | No | No | No | Yes |
| Web-based | No (course) | Desktop | Yes | Yes |
| Mobile-first | No | No | Partial | Yes |
| AI adaptive | No | Basic | No | Yes (ELO) |
| Spaced repetition | No | No | No | Yes |
| Music theory quiz | No | Limited | Yes | Yes |
| Modern UI | Dated | Dated | Dated | Yes |
| Free tier | No | Trial | Free | Yes |
| Price | $100+ one-time | $60/yr | Free | $9.99/mo or $99 lifetime |
