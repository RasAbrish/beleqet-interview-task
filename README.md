# Beleqet Jobs — Full-Stack Hiring Platform

A production-ready hiring and freelance platform for the Ethiopian market: a **NestJS** API
(jobs, applications, AI screening, escrow, wallet, real-time chat) and a **Next.js 14** frontend
that consumes it live.

| Layer | Stack | Location |
|---|---|---|
| **Backend API** | NestJS · Prisma · PostgreSQL · Redis (BullMQ) · JWT · Swagger | [`backend/`](backend) |
| **Frontend** | Next.js 14 (App Router) · TypeScript · Tailwind · axios · zod | [`beleqet-jobs-nextjs/`](beleqet-jobs-nextjs) |
| **Deploy** | Neon (Postgres) · Render (API + Redis) · Vercel (frontend) | [`render.yaml`](render.yaml) |

---

## Live demo


> Fill these in after deploying (see [Deployment](#deployment)).

- **Frontend:** `https://<your-app>.vercel.app`
- **API + Swagger docs:** `https://<your-backend>.onrender.com/api/docs`
- **API base:** `https://<your-backend>.onrender.com/api/v1`

**Seeded demo login** (created automatically on deploy):

```
Email:    employer@beleqet.demo
Password: Password123!
```

---

## Features

**Backend**
- JWT auth (register / login / refresh / logout) with rotating refresh tokens and RBAC
  (`ADMIN` / `EMPLOYER` / `JOB_SEEKER` / `FREELANCER`)
- Jobs: CRUD + paginated public search & filtering
- Applications → event-driven AI screening pipeline (BullMQ workers)
- Freelance: gigs, bids, contracts, milestones
- BeleqetSafe escrow (Chapa webhook + auto-release) and freelancer wallet
- Hardening: `helmet`, global `ValidationPipe`, rate limiting (`@nestjs/throttler`),
  consistent exception filter, Swagger docs, graceful shutdown

**Frontend**
- Live data via **axios**, validated at the boundary with **zod** (no `any` from the API)
- Server-Component data fetching (SEO-friendly) with **ISR caching** (`revalidate`)
- **Skeleton** loading states + Suspense streaming, and route **error boundaries**
- Full **auth flow**: two-section login & register pages wired to the backend, with a
  client `AuthProvider`, token persistence, and auth-aware header

---

## Quick start (local)

Requirements: **Docker Desktop** and **Node.js 20+**.

### 1. Backend + database + Redis (Docker)

```bash
cd backend
docker compose up -d --build
```

This starts PostgreSQL, Redis, and the API, runs migrations, and seeds demo data.

- API → http://localhost:4000/api/v1
- Swagger → http://localhost:4000/api/docs

### 2. Frontend

```bash
cd beleqet-jobs-nextjs
npm install
cp .env.example .env.local        # NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
npm run dev
```

Open http://localhost:3000.

---

## Environment variables

**Frontend** (`beleqet-jobs-nextjs/.env.local`)

| Variable | Example |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api/v1` |

**Backend** — see [`backend/.env.example`](backend/.env.example). Required for boot:
`DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `JWT_ACCESS_SECRET`. Optional integrations
(`OPENAI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `CHAPA_*`) degrade gracefully with placeholders.

---

## Deployment

The stack deploys to three free-tier services. Deploy in order.

### 1. Database — Neon
1. Create a project at [neon.tech](https://neon.tech).
2. Copy the connection string (ends with `?sslmode=require`) — this is your `DATABASE_URL`.

### 2. API + Redis — Render (Blueprint)
1. [render.com](https://render.com) → **New ➜ Blueprint** → select this repo.
2. `render.yaml` provisions the Docker web service + managed Redis. Click **Apply**.
3. When prompted, set:
   - `DATABASE_URL` → the Neon string
   - `FRONTEND_URL` → `*` (update after step 3)
4. Once **Live**, note the URL, e.g. `https://beleqet-backend.onrender.com`.

### 3. Frontend — Vercel
1. [vercel.com](https://vercel.com) → **Add New ➜ Project** → import this repo.
2. Set **Root Directory** to `beleqet-jobs-nextjs`.
3. Add env var `NEXT_PUBLIC_API_URL` = `https://<your-backend>.onrender.com/api/v1`.
4. Deploy.

### 4. Connect (CORS)
In Render, set `FRONTEND_URL` to your Vercel URL and redeploy.

> Free-tier note: the Render service sleeps after ~15 min idle; the first request then takes
> ~50s to wake.

---

## Repository layout

```
backend/                 NestJS API (see backend/README.md)
beleqet-jobs-nextjs/     Next.js frontend (see its README.md)
render.yaml              Render Blueprint (API + Redis)
```

## Further docs
- Backend modules, routes, and workflow → [`backend/README.md`](backend/README.md)
- Frontend structure and design tokens → [`beleqet-jobs-nextjs/README.md`](beleqet-jobs-nextjs/README.md)
