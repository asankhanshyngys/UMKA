# UMKA English

UMKA is a Russian-language English-learning platform. Learners can browse courses, buy access or subscribe, and study structured modules and video lessons. Administrators manage courses and modules from `/admin`.

## Project structure

- `src/app` — Next.js pages and HTTP route handlers.
- `src/components` — reusable presentation components.
- `src/features/catalog` — catalog-specific types and database queries.
- `src/lib` — shared infrastructure, including Prisma and authentication.
- `prisma` — database schema, migrations, and seed data.

This is a single Next.js application. Features are separated into modules inside `src`, rather than independent npm packages, because they share the same database, authentication, and deployment lifecycle.

## Local setup

1. Copy `.env.example` to `.env` and set a PostgreSQL `DATABASE_URL` and a strong `JWT_SECRET`.
2. Install dependencies: `npm ci`.
3. Generate Prisma client: `npx prisma generate`.
4. Run migrations: `npx prisma migrate deploy`.
5. Optionally seed development data: `npx prisma db seed`.
6. Start the app: `npm run dev`.

## Checks

Run `npm run lint` before committing and `npm run build` before deployment.

## Deployment preparation

The app is ready to deploy to a Next.js host such as Vercel once you have a production PostgreSQL database and domain.

1. Create a production PostgreSQL database and copy its connection string into `DATABASE_URL`.
2. Add production environment variables in your hosting dashboard: `DATABASE_URL`, a new strong `JWT_SECRET`, `APP_URL`, and later the Resend and Cloudflare Stream values.
3. Set `APP_URL` to the final HTTPS address, for example `https://umka.kz`.
4. Run `npx prisma migrate deploy` against the production database. Do not run the development seed in production.
5. Deploy the app, then check `https://your-domain/api/health` returns `{ "status": "ok" }`.
6. Before opening sales, configure a verified email sender domain, private video streaming, and a real payment provider.

Never commit `.env` or production API keys. Back up the production database before schema changes.

## Temporary local video testing

For development only, copy a small MP4 file to `public/videos/`, for example `public/videos/test-lesson.mp4`. In the admin video form, set **Storage key or video path** to `videos/test-lesson.mp4`. After a learner receives test access, their dashboard opens `/learn/[course-id]` and plays the file.

Files in `public/` are not protected. This local player is only a bridge for testing the learning flow; production lessons must use private streaming with expiring signed playback tokens.

## Private video playback with Cloudflare Stream

1. Upload a video to Cloudflare Stream and turn on **Require Signed URLs**. Restrict its allowed origin to your site domain.
2. Set `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_STREAM_API_TOKEN`, and `CLOUDFLARE_STREAM_CUSTOMER_CODE` in `.env`. The API token needs permission to create Stream playback tokens.
3. In the admin video form, enter the storage key as `cfstream:VIDEO_UID` (for example, `cfstream:abc123`).

The player requests `/api/videos/[id]/playback` only after the user selects a lesson. The route verifies the signed-in learner has a valid subscription or course purchase (or is an admin), then makes a Cloudflare token that expires in five minutes. The Cloudflare credentials are never sent to the browser.

## Security model

- Auth cookies are HTTP-only and secure in production.
- `/admin` requires an account with the `ADMIN` role.
- Admin server actions and APIs check the role independently of the UI.
- Learner course access is based on a valid course purchase, active subscription, or admin role.
