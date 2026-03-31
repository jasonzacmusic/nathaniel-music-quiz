/**
 * Fisher-Yates shuffle algorithm
 * Shuffles array in place and returns it
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Format seconds to mm:ss format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Score tier information based on percentage
 */
export interface ScoreTier {
  emoji: string;
  message: string;
  color: string;
  percentage: number;
}

/**
 * Get score tier info based on percentage correct
 */
export function getScoreTier(percentage: number): ScoreTier {
  if (percentage === 100) {
    return {
      emoji: '',
      message: 'Perfect Score!',
      color: 'text-yellow-500',
      percentage,
    };
  }
  if (percentage >= 90) {
    return {
      emoji: '',
      message: 'Outstanding!',
      color: 'text-purple-500',
      percentage,
    };
  }
  if (percentage >= 80) {
    return {
      emoji: '',
      message: 'Excellent!',
      color: 'text-blue-500',
      percentage,
    };
  }
  if (percentage >= 70) {
    return {
      emoji: '',
      message: 'Great Job!',
      color: 'text-green-500',
      percentage,
    };
  }
  if (percentage >= 60) {
    return {
      emoji: '',
      message: 'Good Effort!',
      color: 'text-cyan-500',
      percentage,
    };
  }
  if (percentage >= 50) {
    return {
      emoji: '',
      message: 'Keep Practicing!',
      color: 'text-orange-500',
      percentage,
    };
  }
  return {
    emoji: '',
    message: 'Try Again!',
    color: 'text-red-500',
    percentage,
  };
}

/**
 * Build Bunny CDN video URL
 * Pattern: https://quiz-nathaniel-music.b-cdn.net/{set_id}-q{num}.m4v
 */
export function getVideoUrl(setId: string, questionNumber: number): string {
  return `https://quiz-nathaniel-music.b-cdn.net/${setId}-q${questionNumber}.m4v`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}
