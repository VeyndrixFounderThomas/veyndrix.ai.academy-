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

## Next stages
1. Deploy as a new Render Static Site.
2. Create a separate Supabase project for student authentication and course data.
3. Build lessons, student dashboard, progress tracking, and assessments.
4. Add secure payments after course content, policies, and business setup are ready.

The site currently collects no personal information. Student registration and payments are not implemented.
