# Nigeria Gala Fashion Week — Modeling & Voting Platform

A full MERN-stack platform for the Nigeria Gala Fashion Week Award Night: browse
categories, vote for your favorite contestants (₦100/vote via Paystack), watch
live leaderboards update over WebSockets, and give the host + platform full
financial transparency through two role-based dashboards.

## Tech Stack

**Backend:** Node.js, Express, MongoDB/Mongoose, Socket.IO, JWT auth, Cloudinary,
Paystack, Helmet/rate-limiting/sanitization.

**Frontend:** React 19 + Vite, Tailwind CSS v4, Redux Toolkit + RTK Query,
React Router v6 (nested routes + `<Outlet/>`), Framer Motion, Sonner (toasts),
Lucide React icons, Socket.IO client, Google Fonts (Playfair Display + Manrope).

## Project Structure

```
nigeria-gala-fashion-week/
├── backend/
│   └── src/
│       ├── config/        # DB + Cloudinary config
│       ├── models/        # User, Category, Contestant, Transaction, Settings
│       ├── controllers/   # Route handlers
│       ├── routes/        # Express routers
│       ├── middleware/    # auth, upload, global error handler
│       ├── sockets/       # Socket.IO setup + emit helpers
│       └── utils/         # AppError, Paystack wrapper, seed script, etc.
└── frontend/
    └── src/
        ├── app/            # Redux store + RTK Query base
        ├── features/       # RTK Query endpoint slices (auth, categories, ...)
        ├── components/     # layout, dashboard, public, ui
        ├── pages/          # public/ and dashboard/ route pages
        └── hooks/          # useVotingStatus, useLiveLeaderboard, etc.
```

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env   # fill in your real values (see below)
npm install
npm run seed            # creates the first super admin account + settings doc
npm run dev              # starts on http://localhost:5000
```

**Required `.env` values:**
- `MONGO_URI` — your MongoDB connection string (MongoDB Atlas recommended)
- `JWT_SECRET` — any long random string
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — from your Cloudinary dashboard
- `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` — from your Paystack dashboard (use test keys first)
- `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` — used only once by `npm run seed`

**Paystack webhook:** In your Paystack dashboard, set the webhook URL to
`https://your-backend-domain.com/api/votes/webhook`. This is a safety net —
votes are also verified/credited on the callback redirect, and the webhook
guarantees votes get credited even if the user closes the browser mid-redirect.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:5173, proxies /api and /socket.io to :5000
```

For production, set `VITE_SOCKET_URL` in `frontend/.env` to your deployed
backend URL (see `.env.example`).

### 3. First login

After `npm run seed`, log in at `/login` with the `SUPERADMIN_EMAIL` /
`SUPERADMIN_PASSWORD` you set in `backend/.env`. From
**Dashboard → Admins & Hosts** you can then create host accounts for the
event organizers, and from **Dashboard → Event Settings** set the real
voting start/end times, vote price, and revenue split.

### Homepage sections & where they come from

- **Hero slider** — upload up to 6 images in **Dashboard → Event Settings**.
  With none uploaded, the hero falls back to the default gold/black gradient.
- **Live stats bar** (votes / categories / contestants) — automatic, no setup;
  updates in real time over Socket.IO as votes come in.
- **Heritage pillars row** (Fashion, Beauty, Culture, Heritage, Innovation) —
  static, matches the flyer footer.
- **Trending Now carousel** — automatic, shows the top contestants by vote count.
- **Sponsors & Partners strip** — add logos in **Dashboard → Sponsors**. The
  strip only renders once at least one sponsor exists.

## How Voting Works

1. Visitor picks a contestant and chooses a vote quantity on `/vote/:contestantId`
2. Backend creates a `pending` Transaction and initializes a Paystack transaction
3. Visitor completes payment on Paystack's hosted page
4. Paystack redirects to `/vote/callback?reference=...`, which calls
   `GET /api/votes/verify/:reference` — the backend re-verifies with Paystack
   server-side (never trusts the client), credits the vote count atomically,
   and emits a `vote:updated` Socket.IO event
5. Every connected leaderboard for that category updates live, no polling
6. The Paystack webhook (`/api/votes/webhook`) independently verifies the same
   transaction as a safety net — the vote-crediting logic is idempotent, so
   there's no risk of double-counting even if both paths fire

## Voting Window States

Computed **server-side only** (never trust a client clock), exposed via
`GET /api/settings/public` and pushed live over Socket.IO on transition:

- **`upcoming`** — before `votingStartTime`: "Voting Opens In" countdown, vote buttons disabled
- **`live`** — between start/end: "Voting Ends In" countdown, voting open
- **`ended`** — after `votingEndTime`: "Voting Has Ended" banner, all vote buttons disabled, leaderboard becomes final results

## Revenue Transparency

Every successful transaction snapshots the platform/host split at the time of
purchase (`platformSharePercent`, `platformShareAmount`, `hostShareAmount`) so
historical records stay accurate even if the split percentage changes later.
Both the **superadmin dashboard** and the **host dashboard** see the same
overview, transaction log, and payout breakdown — full transparency, no
hidden numbers.

## Error Handling

The global Express error handler (`backend/src/middleware/errorHandler.js`)
normalizes every error — Mongoose validation/cast errors, JWT errors, Mongo
timeouts, Multer upload errors, unknown crashes — into a clean, safe message:
- `404` → "The requested resource was not found."
- `500` / unknown → "Something went wrong on our end. Please try again shortly."
- Raw database/stack details are **never** sent to the client, only logged server-side.

On the frontend, every mutation (login, vote, create/update/delete) shows a
Sonner toast on both success and failure, and every page has a loading state,
an empty state, and a retry-capable error state.
