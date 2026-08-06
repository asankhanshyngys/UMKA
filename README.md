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

## Security model

- Auth cookies are HTTP-only and secure in production.
- `/admin` requires an account with the `ADMIN` role.
- Admin server actions and APIs check the role independently of the UI.
- Learner course access is based on a valid course purchase, active subscription, or admin role.
