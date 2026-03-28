# Nathaniel Music Quiz

A Next.js 14 music quiz web application.

## Tech Stack
- **Framework**: Next.js 14 (App Router, `src/app/`)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Database**: Neon (serverless PostgreSQL) via `@neondatabase/serverless`
- **Package Manager**: npm

## Project Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/app/api/` - API routes (quiz, categories, leads, challenge, admin, overlay)
- `src/components/` - Shared React components
- `src/config/` - App configuration
- `src/lib/` - Utilities (db.ts for Neon, google-sheets.ts)

## Required Environment Variables
- `DATABASE_URL` - Neon PostgreSQL connection string
- `ADMIN_PASSWORD` - Password for the admin API route
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Google service account for Sheets integration
- `GOOGLE_PRIVATE_KEY` - Google service account private key
- `GOOGLE_SHEET_ID` - Target Google Sheet ID for leads

## Running the App
- Dev: `npm run dev` (port 5000, 0.0.0.0)
- Build: `npm run build`
- Start: `npm run start` (port 5000, 0.0.0.0)

## Replit Setup
- Workflow "Start application" runs `npm run dev` on port 5000
- Port and host configured for Replit preview pane compatibility
