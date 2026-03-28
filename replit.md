# Nathaniel Music Quiz — Sonic Studio

A Next.js 14 music quiz web application with a cinematic "Sonic Studio" UI/UX.

## Tech Stack
- **Framework**: Next.js 14 (App Router, `src/app/`)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Database**: Neon (serverless PostgreSQL) via `@neondatabase/serverless`
- **Fonts**: Space Grotesk + Inter via `next/font/google`
- **Package Manager**: npm

## Design System — Sonic Studio
- **Background**: `#080D1A` (near-black deep blue)
- **Primary**: Electric Violet `#7C3AED` + Electric Cyan `#06B6D4`
- **Accent**: Warm Amber `#F59E0B`
- **Typography**: Space Grotesk (display/headings, weights 300–700) + Inter (body)
- **Effects**: Glass morphism, radial gradients, CSS waveform animations, 3D card tilts

## Project Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/app/api/` - API routes (quiz, categories, leads, challenge, admin, overlay)
- `src/components/` - Shared React components
- `src/config/` - App configuration (LINKS)
- `src/hooks/` - Custom React hooks (useQuiz, useOverlay)
- `src/lib/` - Utilities (db.ts, queries.ts, utils.ts)

## Key Components
- `Navigation.tsx` - Fixed navbar with animated active-link underline (layoutId), social icons, "Start Quiz" CTA
- `HeroSection.tsx` - Full-screen hero: "Hear More. Play Better." headline, animated CSS waveform, floating note particles, stats tape, "Now Playing" vinyl widget
- `CategoryCard.tsx` - Album-cover style cards with 3D mouse-tilt (framer-motion spring), gradient backgrounds, stagger entry
- `AnswerButton.tsx` - A/B/C/D labeled buttons with correct/wrong state animations
- `QuizPlayerClient.tsx` - Quiz player: waveform progress bar, screen flash overlay on correct/wrong
- `results/page.tsx` - Cinematic results: animated SVG score ring, tier badge, animated percentage counter
- `challenge/page.tsx` - Quiz builder: length selector, topic toggle cards, live summary strip

## Required Environment Variables
- `NEON_DATABASE_URL` - Neon PostgreSQL connection string (falls back to `DATABASE_URL`)
- `ADMIN_PASSWORD` - Password for the admin API route
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Google service account for Sheets integration
- `GOOGLE_PRIVATE_KEY` - Google service account private key
- `GOOGLE_SHEET_ID` - Target Google Sheet ID for leads

Note: `DATABASE_URL` is runtime-managed by Replit (points to Replit's own Postgres). Use `NEON_DATABASE_URL` to override with the Neon database.

## Running the App
- Dev: `npm run dev` (port 5000, 0.0.0.0)
- Build: `npm run build`
- Start: `npm run start` (port 5000, 0.0.0.0)

## Replit Setup
- Workflow "Start application" runs `npm run dev` on port 5000
- Port and host configured for Replit preview pane compatibility
- `NEON_DATABASE_URL` set as a shared env var via Replit secrets
