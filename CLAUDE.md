# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://0.0.0.0:5000
npm run build    # Production build
npm run start    # Start production server at http://0.0.0.0:5000
npm run lint     # ESLint via next lint
```

There is no test suite configured.

## Architecture

**Nathaniel Music Quiz — Sonic Studio** is a Next.js 14 App Router application for interactive music ear training quizzes.

### Data Flow

- **Database:** Neon serverless PostgreSQL via `@neondatabase/serverless`. Connection in `src/lib/db.ts` reads `NEON_DATABASE_URL` or `DATABASE_URL`.
- **Queries:** `src/lib/queries.ts` contains all DB query functions (`getCategories`, `getQuizStats`, etc.).
- **API Routes:** All DB access from client components must go through `src/app/api/` routes — do not call DB directly from client components (this caused a prior crash in the challenge page, fixed by moving to `/api/challenge/route.ts`).
- **Server pages** (e.g. `src/app/page.tsx`) can call query functions directly since they run server-side.

### Quiz Flow

1. **Home** (`/`) — shows categories and stats
2. **Challenge Builder** (`/challenge`) — client component, fetches `/api/categories`, builds query params
3. **Quiz Player** (`/quiz/[setId]`) — uses `QuizPlayerClient.tsx`, fetches questions from `/api/quiz`
4. **Results** (`/results`) — reads quiz data from `sessionStorage` (key: `quizResults`); redirects home if missing

### Key Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEON_DATABASE_URL` / `DATABASE_URL` | PostgreSQL connection |
| `ADMIN_PASSWORD` | Authenticates `/api/admin` routes |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google Sheets leads integration |
| `GOOGLE_PRIVATE_KEY` | Google Sheets leads integration |
| `GOOGLE_SHEET_ID` | Target sheet for lead capture |

### Design System

Defined in `tailwind.config.ts`:
- **Background:** `dark-bg` (#080D1A), `dark-surface` (#0F172A), `dark-elevated` (#162032)
- **Primary palette:** `electric-violet` (#7C3AED), `electric-cyan` (#06B6D4), `warm-amber` (#F59E0B), `deep-purple` (#4C1D95)
- **Effects:** glass morphism, radial gradients, custom glow shadows (`glow-purple`, `glow-cyan`, etc.), Framer Motion animations
- **Fonts:** Space Grotesk (display headings) + Inter (body), loaded via `next/font/google`

### Component Conventions

- Shared UI components live in `src/components/` with a barrel export at `src/components/index.ts`
- Custom hooks in `src/hooks/` (`useQuiz.ts`, `useOverlay.ts`)
- Static config (external links, social URLs) in `src/config/links.ts`
- All pages use `export const dynamic = "force-dynamic"` where real-time DB data is needed
