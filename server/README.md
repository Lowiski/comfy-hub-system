# ComfyHub API

Express + TypeScript backend using Neon PostgreSQL through Drizzle ORM.

## Structure

```text
src/
├── config/          environment
├── controllers/     HTTP handlers
├── db/              Neon client, schema, seed and local memory store
├── lib/             cookies, CSRF and JWT helpers
├── middlewares/     auth, CSRF, role and schema validation
├── repositories/    database queries
├── routes/          route definitions
├── schema/          Zod request schemas
├── services/
│   ├── auth/        login, session, refresh, logout, account creation
│   └── messages/    live conversations and messages
├── utils/           shared API result helpers
├── app.ts
└── server.ts
```

## Setup

```bash
cd server
copy .env.example .env
npm install
npm run db:migrate
npm run dev
```

Fill in `DATABASE_URL` with your Neon pooled connection string. Replace both
`JWT_SECRET` and `CSRF_SECRET` with two different long random values:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Run that twice. `JWT_SECRET` signs login tokens; `CSRF_SECRET` signs CSRF
tokens. Keep both private and server-side only. The generated migration is in
`drizzle/`.

To wipe the Neon tables and start fresh:

```bash
npm run db:reset
npm run db:migrate
npm run dev
```

Demo seeding (including the Louie/Michael conversation) is enabled by default in
development and disabled in production. Set `SEED_DEMO_DATA=true` only for a
controlled demo database.

If `DATABASE_URL` is blank, the API uses an in-memory seeded store for local
testing. Production refuses to start this way unless `ALLOW_IN_MEMORY_DB=true`
is explicitly set.

For a production start, install dependencies, set `NODE_ENV=production` and
`CLIENT_ORIGIN`, point `DATABASE_URL` at Neon, then run `npm start`.

## Auth flow

- `GET /api/auth/csrf` — get the CSRF token
- Send that token in the `x-csrf-token` header on every write request
- `POST /api/auth/login` — `{ identifier, password, loginAs }`
- `POST /api/auth/lookup-school-id`
- `POST /api/auth/verify-birthday`
- `POST /api/auth/reset-password` — school ID + birthday + new password
- `GET /api/auth/session` — current user
- `POST /api/auth/refresh` — rotate access/refresh cookies
- `POST /api/auth/logout`
- `PATCH /api/auth/profile` — save the signed-in user's editable profile fields
- `POST /api/auth/signup` — admin-only account creation

`loginAs` accepts `student`, `teacher`, or `admin`. Students and teachers log in
with their school ID; admin uses email at the hidden `/admin` frontend route.

## Messages

All messaging is stored in Neon and polled by the frontend for live updates.

- `GET /api/messages/people` — counselors for students, students for counselors
- `GET /api/messages/conversations` — conversations visible to the signed-in user
- `POST /api/messages/conversations` — `{ counselorId, subject, body }`
- `GET /api/messages/conversations/:id/messages`
- `POST /api/messages/conversations/:id/messages` — `{ body }`
- `POST /api/messages/conversations/:id/read`
- `DELETE /api/messages/conversations/:id`
