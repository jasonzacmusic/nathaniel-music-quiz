# Component Usage Guide

## Quick Reference

### Navigation Component
```tsx
import Navigation from "@/components/Navigation";

// Already included in root layout.tsx
// Sticky top navigation with responsive mobile menu
```

### Video Player
```tsx
import VideoPlayer from "@/components/VideoPlayer";

<VideoPlayer
  videoUrl="/videos/lesson.mp4"
  onReady={() => console.log("Video ready")}
  className="custom-class"
/>
```

### Question Overlay
```tsx
import QuestionOverlay from "@/components/QuestionOverlay";

<QuestionOverlay
  question="What is the dominant chord?"
  answers={["IV", "V", "vi", "I"]}
  onAnswer={(answer) => handleAnswer(answer)}
  answered={false}
  correctAnswer="V"
  overlaySettings={{ height: 55, blur: 8 }}
/>
```

### Answer Button
```tsx
import AnswerButton from "@/components/AnswerButton";

<AnswerButton
  text="Major Scale"
  onClick={() => handleClick()}
  state="default" // default | selected | correct | wrong | reveal
  index={0}
  disabled={false}
/>
```

### Score Display
```tsx
import ScoreDisplay from "@/components/ScoreDisplay";

<ScoreDisplay
  correct={8}
  total={10}
  streak={3}
/>
```

### Streak Counter
```tsx
import StreakCounter from "@/components/StreakCounter";

<StreakCounter streak={5} />
// Only displays when streak >= 2
```

### Confetti Effect
```tsx
import Confetti from "@/components/Confetti";

const [showConfetti, setShowConfetti] = useState(false);

<Confetti trigger={showConfetti} />
// Trigger becomes true when user answers correctly
```

### Category Card
```tsx
import CategoryCard from "@/components/CategoryCard";

<CategoryCard
  name="Scales"
  questionCount={15}
  icon="🎼"
  color="from-blue-600 to-cyan-500"
  href="/quiz/scales"
/>
```

### YouTube Card
```tsx
import YouTubeCard from "@/components/YouTubeCard";

<YouTubeCard
  title="Learn About Intervals"
  url="https://youtube.com/watch?v=..."
  onClose={() => setShowYouTube(false)}
/>
```

### WhatsApp Button
```tsx
// Already included in root layout.tsx
// Fixed floating button in bottom-right
// Links to: https://wa.me/917760456847
```

### Footer
```tsx
// Already included in root layout.tsx
// Displays at bottom of every page
```

## Example: Complete Quiz Page

```tsx
"use client";

import { useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import QuestionOverlay from "@/components/QuestionOverlay";
import ScoreDisplay from "@/components/ScoreDisplay";
import Confetti from "@/components/Confetti";
import YouTubeCard from "@/components/YouTubeCard";

export default function QuizPage() {
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === "V";

    if (isCorrect) {
      setScore(score + 1);
      setShowConfetti(true);
      setShowYouTube(true);
    }

    setTotal(total + 1);
    setAnswered(true);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 bg-dark-bg border-b border-white/10">
        <ScoreDisplay
          correct={score}
          total={total}
          streak={2}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <VideoPlayer
            videoUrl="/videos/lesson.mp4"
          />

          {answered && (
            <QuestionOverlay
              question="What is this chord?"
              answers={["IV", "V", "vi", "I"]}
              onAnswer={handleAnswer}
              answered={answered}
              correctAnswer="V"
            />
          )}
        </div>
      </div>

      {/* Confetti */}
      <Confetti trigger={showConfetti} />

      {/* YouTube Tutorial Card */}
      {showYouTube && (
        <YouTubeCard
          title="Learn About Dominants"
          url="https://youtube.com/watch?v=..."
          onClose={() => setShowYouTube(false)}
        />
      )}
    </div>
  );
}
```

## Color Usage

### Apply Colors in Components
```tsx
// Use Tailwind classes from extended config
className="text-electric-violet"    // #7C3AED
className="bg-warm-amber"           // #F59E0B
className="border-rose"             // #F43F5E
className="text-deep-purple"        // #4C1D95

// Or use CSS variables
className="bg-[var(--color-electric-violet)]"
```

## Animation Classes

```tsx
// Apply animations via className
className="animate-fadeIn"
className="animate-slideUp"
className="animate-shake"
className="animate-pulse-glow"
className="animate-float"
className="animate-scale-in"
className="animate-bounce"
```

## Responsive Design

All components are fully responsive:
- **Mobile**: Touch-friendly (56px+ tap targets)
- **Tablet**: Optimized spacing and sizing
- **Desktop**: Full-featured with hover states

Use Tailwind breakpoints:
```tsx
className="text-sm md:text-base lg:text-lg"
className="px-4 md:px-6 lg:px-8"
```

## Accessibility

- ✓ Focus states on all interactive elements
- ✓ Semantic HTML (buttons, links, headers)
- ✓ ARIA labels where needed
- ✓ Keyboard navigation support
- ✓ High contrast colors (WCAG AA)

## Performance Tips

1. **Code splitting**: Components are already split
2. **Lazy loading**: Import components only where needed
3. **Image optimization**: Use Next.js Image for media
4. **Animation performance**: Framer-motion is GPU-accelerated
5. **Bundle size**: Minified components included

## Customization

### Change Color Palette
Edit `/src/app/globals.css` CSS variables:
```css
:root {
  --color-electric-violet: #YOUR_COLOR;
}
```

### Modify Animations
Edit `/tailwind.config.ts` animation keyframes:
```ts
keyframes: {
  customAnimation: { /* your keyframes */ }
}
```

### Update Fonts
Edit `/src/app/layout.tsx`:
```tsx
const yourFont = YourFont({
  subsets: ["latin"],
  variable: "--font-display",
});
```

## Need Help?

All components include TypeScript interfaces for better IDE support and type safety.

Hover over component names in your editor to see full prop documentation.
