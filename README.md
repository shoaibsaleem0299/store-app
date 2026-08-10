# Store App

Single-vendor e-commerce storefront built with Next.js, Supabase (Postgres), shadcn/ui, Redux Toolkit, and TypeScript.

## Structure
- `src/app` — routes: `(storefront)`, `(admin)`, `(auth)`, `api`
- `src/controllers` / `src/models` — backend MVC layer (extend `base.controller.ts` / `base.model.ts`)
- `src/services-client` — frontend API clients (extend `baseApiService.ts`)
- `src/store` — Redux slices
- `src/components` — `ui` (shadcn), `shared` (reusable), `features` (page-specific), `layout`
- `supabase/migrations` — SQL schema

## Setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase project URL + anon key
3. Run the migration in `supabase/migrations/0001_init.sql` against your Supabase project
4. `npx shadcn@latest init` (if `components.json` needs regenerating) then add components as needed, e.g. `npx shadcn@latest add button dialog table`
5. `npm run dev`
