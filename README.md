# Veyndrix AI Academy

Independent front-end starter for Veyndrix AI Academy. This project is separate from Luna Next.

## Included
- Responsive academy homepage
- White, silver, and royal-blue visual identity
- Initial course cards, including AI-Powered Small Business
- Mobile navigation
- No backend, student accounts, database, or payments connected yet

## Run locally
Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```
The production files are generated in `dist/`.

## Render deployment
Create a **new Static Site** in Render connected to this repository.
- Build command: `npm install && npm run build`
- Publish directory: `dist`

Do not connect this project to the Luna Next repository or service.

## Backend foundation
A first Supabase SQL migration is included at `supabase/migrations/001_initial_schema.sql`. It defines profiles, courses, modules, lessons, enrollments, and lesson progress, with Row Level Security policies. It is a schema foundation only: no Supabase project is connected and no student data is being stored yet.

When configuring Supabase:
- Create a completely separate project for Veyndrix AI Academy.
- Apply the migration only to that project.
- Keep the service-role key on trusted server-side infrastructure only; never put it in browser code.
- Grant enrollments through a trusted server-side payment webhook or administrator action, not a public client insert.

## Next stages
1. Review the course preview and curriculum.
2. Deploy as a new Render Static Site when the public preview is approved.
3. Create and connect a separate Supabase project; apply and test the migration.
4. Build secure student registration, login, enrollment, saved progress, and assessments.
5. Add hosted checkout and verified payment webhooks after course content, policies, and business setup are ready.

The site currently collects no personal information. Student registration and payments are not implemented.
