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
- Budgets are defined as monthly_budget_limit fields inside the categories table and are modified directly by the user per Space.

## Common Development Commands
- Install dependencies: `npm install`
- Local dev server: `npm run dev`
- Build project: `npm run build`

## Key Rules to Prevent Mistakes
- Never hardcode the Supabase URL or Anon key; always read them from `process.env`.
- Database Schema: Multi-Space architecture via `budget_spaces` and `space_members`. Tables (`accounts`, `categories`, `transactions`) filter data dynamically using a `space_id` context.
- Currency: All numbers throughout the UI must be formatted using the Philippine Peso symbol (₱) and standard decimal syntax (e.g., ₱1,500.00).
- Always use proper PostgreSQL foreign keys (`user_id` mapped to `auth.users`) when logging transactions.