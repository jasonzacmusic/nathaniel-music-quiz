/**
 * Gamification engine — XP, levels, streaks, achievements.
 * All data stored in localStorage. No account needed.
 */

const STORAGE_KEY = "nsm-player";

/* ═══ Levels ═══ */

export const LEVELS = [
  { name: "Beginner", minXP: 0, icon: "🎵" },
  { name: "Apprentice", minXP: 100, icon: "🎶" },
  { name: "Student", minXP: 300, icon: "🎸" },
  { name: "Instrumentalist", minXP: 750, icon: "🎹" },
  { name: "Performer", minXP: 1500, icon: "🎤" },
  { name: "Artist", minXP: 3000, icon: "🎼" },
  { name: "Virtuoso", minXP: 6000, icon: "🏆" },
  { name: "Maestro", minXP: 12000, icon: "👑" },
];

export function getLevel(xp: number) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXP) level = l;
  }
  const idx = LEVELS.indexOf(level);
  const nextLevel = idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  const progress = nextLevel
    ? (xp - level.minXP) / (nextLevel.minXP - level.minXP)
    : 1;
  return { ...level, index: idx, nextLevel, progress: Math.min(1, progress) };
}

/* ═══ Achievements ═══ */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (stats: PlayerStats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-quiz", name: "First Steps", description: "Complete your first quiz", icon: "👣", check: s => s.quizzesCompleted >= 1 },
  { id: "perfect", name: "Perfect Score", description: "Score 100% on any quiz", icon: "💯", check: s => s.perfectScores >= 1 },
  { id: "five-quizzes", name: "Committed", description: "Complete 5 quizzes", icon: "📚", check: s => s.quizzesCompleted >= 5 },
  { id: "ten-quizzes", name: "Dedicated", description: "Complete 10 quizzes", icon: "🔥", check: s => s.quizzesCompleted >= 10 },
  { id: "streak-5", name: "On Fire", description: "Get a 5-question streak", icon: "🔥", check: s => s.bestStreak >= 5 },
  { id: "streak-10", name: "Unstoppable", description: "Get a 10-question streak", icon: "⚡", check: s => s.bestStreak >= 10 },
  { id: "ear-gold", name: "Ear of Gold", description: "Score 90%+ on 3 ear training quizzes", icon: "👂", check: s => s.earTrainingAces >= 3 },
  { id: "theory-master", name: "Theory Master", description: "Score 90%+ on 3 theory quizzes", icon: "📖", check: s => s.theoryAces >= 3 },
  { id: "night-owl", name: "Night Owl", description: "Take a quiz after midnight", icon: "🦉", check: s => s.nightQuizzes >= 1 },
  { id: "globe-trotter", name: "Globe Trotter", description: "Try all quiz types", icon: "🌍", check: s => s.quizTypesPlayed.length >= 4 },
  { id: "century", name: "Century", description: "Answer 100 questions correctly", icon: "💎", check: s => s.totalCorrect >= 100 },
  { id: "five-hundred", name: "Scholar", description: "Answer 500 questions correctly", icon: "🎓", check: s => s.totalCorrect >= 500 },
  { id: "daily-3", name: "Consistent", description: "Maintain a 3-day practice streak", icon: "📅", check: s => s.dailyStreak >= 3 },
  { id: "daily-7", name: "Weekly Warrior", description: "Maintain a 7-day practice streak", icon: "🗓️", check: s => s.dailyStreak >= 7 },
];

/* ═══ Player Stats ═══ */

export interface TheorySession {
  date: string;      // YYYY-MM-DD
  category: string;  // primary category or "mixed"
  difficulty: string; // "beginner" | "intermediate" | "advanced" | "mixed"
  score: number;
  total: number;
}

export interface PathProgress {
  pathId: string;
  completedSteps: number[];
  lastPlayed: string; // YYYY-MM-DD
}

export interface PlayerStats {
  xp: number;
  totalCorrect: number;
  totalAnswered: number;
  quizzesCompleted: number;
  perfectScores: number;
  bestStreak: number;
  earTrainingAces: number;
  theoryAces: number;
  notationAces: number;
  nightQuizzes: number;
  quizTypesPlayed: string[];
  dailyStreak: number;
  lastPlayDate: string; // YYYY-MM-DD
  achievements: string[]; // unlocked achievement IDs
  joinDate: string;
  theoryHistory: TheorySession[];
  pathProgress: PathProgress[];
}

function defaultStats(): PlayerStats {
  return {
    xp: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    quizzesCompleted: 0,
    perfectScores: 0,
    bestStreak: 0,
    earTrainingAces: 0,
    theoryAces: 0,
    notationAces: 0,
    nightQuizzes: 0,
    quizTypesPlayed: [],
    dailyStreak: 0,
    lastPlayDate: "",
    achievements: [],
    joinDate: new Date().toISOString().slice(0, 10),
    theoryHistory: [],
    pathProgress: [],
  };
}

export function loadStats(): PlayerStats {
  if (typeof window === "undefined") return defaultStats();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats();
    return { ...defaultStats(), ...JSON.parse(raw) };
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: PlayerStats) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

/* ═══ XP Calculation ═══ */

export function calculateQuizXP(
  score: number,
  total: number,
  bestStreak: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  quizType?: string
): { baseXP: number; streakBonus: number; perfectBonus: number; totalXP: number } {
  const baseXP = score * 15;
  const streakBonus = bestStreak >= 5 ? bestStreak * 5 : bestStreak >= 3 ? bestStreak * 3 : 0;
  const perfectBonus = score === total && total >= 3 ? 50 : 0;
  return {
    baseXP,
    streakBonus,
    perfectBonus,
    totalXP: baseXP + streakBonus + perfectBonus,
  };
}

/* ═══ Record Quiz Result ═══ */

export function recordQuizResult(
  score: number,
  total: number,
  bestStreak: number,
  quizType: string // "ear_training", "music_theory", "staff_notation", "ear_training_interactive"
): { stats: PlayerStats; xpGained: number; newAchievements: Achievement[] } {
  const stats = loadStats();
  const xp = calculateQuizXP(score, total, bestStreak, quizType);

  stats.xp += xp.totalXP;
  stats.totalCorrect += score;
  stats.totalAnswered += total;
  stats.quizzesCompleted += 1;
  if (bestStreak > stats.bestStreak) stats.bestStreak = bestStreak;
  if (score === total && total >= 3) stats.perfectScores += 1;

  const percentage = total > 0 ? (score / total) * 100 : 0;
  if (percentage >= 90) {
    if (quizType === "ear_training" || quizType === "ear_training_interactive") stats.earTrainingAces += 1;
    if (quizType === "music_theory" || quizType === "indian_classical") stats.theoryAces += 1;
    if (quizType === "staff_notation") stats.notationAces += 1;
  }

  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) stats.nightQuizzes += 1;

  if (!stats.quizTypesPlayed.includes(quizType)) {
    stats.quizTypesPlayed = [...stats.quizTypesPlayed, quizType];
  }

  // Daily streak
  const today = new Date().toISOString().slice(0, 10);
  if (stats.lastPlayDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    stats.dailyStreak = stats.lastPlayDate === yesterday ? stats.dailyStreak + 1 : 1;
    stats.lastPlayDate = today;
  }

  // Check achievements
  const newAchievements: Achievement[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (!stats.achievements.includes(ach.id) && ach.check(stats)) {
      stats.achievements.push(ach.id);
      newAchievements.push(ach);
    }
  }

  saveStats(stats);
  return { stats, xpGained: xp.totalXP, newAchievements };
}

/* ═══ Theory Progress Tracking ═══ */

export function recordTheoryResult(
  score: number,
  total: number,
  category: string,
  difficulty: string
) {
  const stats = loadStats();
  stats.theoryHistory.push({
    date: new Date().toISOString().slice(0, 10),
    category: category || "mixed",
    difficulty: difficulty || "mixed",
    score,
    total,
  });
  // Keep last 50 sessions
  if (stats.theoryHistory.length > 50) {
    stats.theoryHistory = stats.theoryHistory.slice(-50);
  }
  saveStats(stats);
}

export function getTheoryProgress(stats: PlayerStats) {
  const history = stats.theoryHistory || [];
  if (history.length === 0) return null;

  const totalCorrect = history.reduce((s, h) => s + h.score, 0);
  const totalAnswered = history.reduce((s, h) => s + h.total, 0);
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Recent trend: last 5 vs previous 5
  let recentTrend: "up" | "down" | "stable" = "stable";
  if (history.length >= 6) {
    const recent5 = history.slice(-5);
    const prev5 = history.slice(-10, -5);
    if (prev5.length > 0) {
      const recentAcc = recent5.reduce((s, h) => s + h.score, 0) / recent5.reduce((s, h) => s + h.total, 0);
      const prevAcc = prev5.reduce((s, h) => s + h.score, 0) / prev5.reduce((s, h) => s + h.total, 0);
      if (recentAcc > prevAcc + 0.05) recentTrend = "up";
      else if (recentAcc < prevAcc - 0.05) recentTrend = "down";
    }
  }

  // Weakest categories
  const catStats: Record<string, { correct: number; total: number }> = {};
  for (const h of history) {
    if (!catStats[h.category]) catStats[h.category] = { correct: 0, total: 0 };
    catStats[h.category].correct += h.score;
    catStats[h.category].total += h.total;
  }
  const weakestCategories = Object.entries(catStats)
    .filter(([, s]) => s.total >= 3) // need at least 3 questions to judge
    .map(([cat, s]) => ({ category: cat, accuracy: Math.round((s.correct / s.total) * 100) }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  // Sessions this week
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const sessionsThisWeek = history.filter(h => h.date >= weekStartStr).length;

  const suggestedFocus = weakestCategories.length > 0 ? weakestCategories[0].category : null;

  return { overallAccuracy, recentTrend, weakestCategories, sessionsThisWeek, suggestedFocus };
}

/* ═══ Learning Path Progress ═══ */

export function completePathStep(pathId: string, stepIndex: number) {
  const stats = loadStats();
  let progress = stats.pathProgress.find(p => p.pathId === pathId);
  if (!progress) {
    progress = { pathId, completedSteps: [], lastPlayed: "" };
    stats.pathProgress.push(progress);
  }
  if (!progress.completedSteps.includes(stepIndex)) {
    progress.completedSteps.push(stepIndex);
  }
  progress.lastPlayed = new Date().toISOString().slice(0, 10);
  saveStats(stats);
}

export function getPathProgress(pathId: string): PathProgress | null {
  const stats = loadStats();
  return stats.pathProgress.find(p => p.pathId === pathId) || null;
}
