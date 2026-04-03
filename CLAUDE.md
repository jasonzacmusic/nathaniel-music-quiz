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

**Nathaniel Music Quiz — Sonic Studio** is a Next.js 14 App Router application for interactive music ear training quizzes, music theory, Indian classical theory, and staff notation.

### Data Source — Google Sheets (Single Source of Truth)

All quiz content lives in a single Google Spreadsheet (`1QpCaISHeccQga17igp3ekDz-nJUFwsgSOi2wwXQLyJ8`) with 6 tabs:

| GID | Tab Name | Quiz Type |
|-----|----------|-----------|
| `0` | Video Ear Training | `ear_training` (video-based) |
| `741041831` | Theory Quiz v1 | `music_theory` |
| `113832903` | Theory Quiz v2 | `music_theory` |
| `1865314571` | Indian Music Theory | `indian_classical` |
| `1861222925` | Staff Notation Quiz | `staff_notation` |
| `1929581885` | Ear Training Quiz | `ear_training_text` |

### Data Sync: Google Sheets → Database

- **Sync endpoint:** `POST /api/sync-sheets` (also accepts GET for cron compatibility)
- **Auth:** Bearer token or `?secret=` query param, validated against `SYNC_SECRET` or `ADMIN_PASSWORD` env var
- **Process:** Fetches all 6 tabs as CSV via Google Visualizations API → parses → validates (min 50 rows, valid quiz_types) → deduplicates by question_text → deletes existing rows for synced quiz_types → inserts fresh data
- **Auto-sync:** A Google Apps Script (`google-apps-script.js`) can be installed in the spreadsheet to trigger sync on edit (30s debounce) or on a scheduled interval
- **IMPORTANT:** If the database appears empty (pages show "coming soon" or zero questions), the fix is to trigger the sync endpoint. The database does NOT persist independently — it is always repopulated from the Google Sheet.

### Database

- **Neon serverless PostgreSQL** via `@neondatabase/serverless`. Connection in `src/lib/db.ts` reads `NEON_DATABASE_URL` or `DATABASE_URL`.
- **Tables:**
  - `quiz_sets` — set_id (PK), quiz_mode, original_title, num_questions, category, quiz_type, upload_date, status
  - `questions` — id (PK), set_id (FK), question_number, question_text, correct_answer, wrong_answer_1/2/3, youtube_title, youtube_url, video_url, category, patreon_url, quiz_type, difficulty, explanation, improvement_note, notation_data
  - `overlay_settings` — set_id (PK), height, offset, opacity, blur (created dynamically)
  - `leads` — id, name, email, phone, instrument, message, created_at

### Queries & API Routes

- **Queries:** `src/lib/queries.ts` contains all DB query functions. Key quiz_type filters:
  - Ear training (challenge/home): `quiz_type = 'ear_training'`
  - Music theory: `quiz_type IN ('music_theory', 'indian_classical')`
  - Staff notation: `quiz_type = 'staff_notation'`
- **API Routes:** All DB access from client components must go through `src/app/api/` routes — do not call DB directly from client components (this caused a prior crash in the challenge page).
- **Server pages** (e.g. `src/app/page.tsx`) can call query functions directly since they run server-side.

### Quiz Modes & Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Categories, stats, quiz set cards |
| Challenge Builder | `/challenge` | Pick count + topics, builds custom ear training quiz |
| Quiz Player | `/quiz/[setId]` | Video-based quiz player (`QuizPlayerClient.tsx`) |
| Theory | `/theory` | Music theory quiz with tradition slider (EraSlider), difficulty picker |
| Theory Quiz | `/theory/quiz` | Theory quiz player (server-rendered questions) |
| Notation | `/notation` | Staff notation quiz with category picker + inline quiz player |
| Results | `/results` | Reads from `sessionStorage` key `quizResults`; redirects home if missing |
| Admin | `/admin` | Password-protected: quiz set browser, overlay editor, leads viewer |

### Key API Routes

| Route | Purpose |
|-------|---------|
| `/api/categories` | Ear training categories (quiz_type='ear_training') |
| `/api/quiz` | Questions by setId, random, or stats |
| `/api/theory` | Theory categories + stats |
| `/api/theory/quiz` | Theory questions with difficulty/category/tradition filters |
| `/api/notation` | Notation questions + stats + categories |
| `/api/sync-sheets` | Google Sheets → DB sync (requires auth) |
| `/api/admin` | Admin password auth |
| `/api/admin/leads` | Retrieve lead submissions |
| `/api/leads` | Lead capture form submission (saves to DB + Google Sheet + sends emails via Resend) |
| `/api/overlay` | Get/set video overlay settings per quiz set |

### Key Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEON_DATABASE_URL` / `DATABASE_URL` | PostgreSQL connection |
| `ADMIN_PASSWORD` | Authenticates admin routes and sync endpoint |
| `SYNC_SECRET` | Alternative auth for sync endpoint |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google Sheets service account (for leads write-back) |
| `GOOGLE_PRIVATE_KEY` | Google Sheets service account key (PEM) |
| `GOOGLE_SHEET_ID` | Target sheet for lead capture append |
| `RESEND_API_KEY` | Email sending via Resend (lead confirmation + internal notification) |

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
- `style jsx` is used for custom slider thumb styling in components (VolumeControl, EraSlider, QuizPlayerClient)
