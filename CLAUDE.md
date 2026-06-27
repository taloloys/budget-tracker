@AGENTS.md
# Budget Tracker Project Rules

## Tech Stack
- Frontend: Next.js (App Router, TypeScript)
- Styling: Tailwind CSS & shadcn/ui components
- Backend/Database: Supabase (PostgreSQL) + Supabase Auth

## Code Style & Architecture
- Use ES modules (`import`/`export`), prefer named exports over default exports.
- Database queries should utilize the Supabase Browser Client helper (`src/utils/supabase/client.ts`).
- Keep components modular and mobile-first (optimized for smartphones).

## Common Development Commands
- Install dependencies: `npm install`
- Local dev server: `npm run dev`
- Build project: `npm run build`

## Key Rules to Prevent Mistakes
- Never hardcode the Supabase URL or Anon key; always read them from `process.env`.
- Database schema changes must match the PostgreSQL tables in Supabase (`profiles`, `accounts`, `categories`, `transactions`).
- Always use proper PostgreSQL foreign keys (`user_id` mapped to `auth.users`) when logging transactions.