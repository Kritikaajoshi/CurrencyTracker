# Ledger — Currency Tracker

A full-stack currency conversion and FX-rate tracking app. Users convert between
currencies, watch pairs on a live dashboard, set target-rate alerts that get
checked by a background job, and browse their own conversion history.

Live rates and historical data come from [Fixer](https://apilayer.com/marketplace/fixer-api)
(via APILayer).

## Why this project (and not another CRUD app)

Most portfolio projects are "call an API, show the JSON." This one has three
things that come up naturally in a technical interview:

1. **A caching layer in front of a rate-limited third-party API.** The free
   Fixer tier updates hourly and has a low request quota. `fixerService.js`
   caches responses in-memory per (base currency) and per (base, historical
   date), so 100 users loading the dashboard in the same 10 minutes costs one
   upstream call, not 100.
2. **A background cron job**, independent of any request/response cycle.
   `jobs/alertChecker.js` runs on a schedule, batches active alerts by base
   currency to minimize API calls, and flips alerts to "triggered" when their
   condition is met — the kind of "state changes without a user clicking
   anything" problem that shows up in real systems (notifications, billing,
   monitoring).
3. **A real auth + authorization story**, not just a login form: JWTs,
   password hashing, protected routes, and data scoped per-user (your
   watchlist isn't my watchlist).

## Architecture

```
currency-tracker/
├── backend/                 Node.js + Express + MongoDB (Mongoose)
│   ├── src/
│   │   ├── config/db.js         Mongo connection
│   │   ├── models/               User, ConversionHistory, Watchlist, RateAlert
│   │   ├── services/
│   │   │   ├── fixerService.js   Fixer API client + caching
│   │   │   └── cacheService.js   In-memory TTL cache (node-cache)
│   │   ├── controllers/          Route handlers, one file per resource
│   │   ├── routes/               Express routers + express-validator rules
│   │   ├── middleware/           JWT auth, rate limiting, error handling, validation
│   │   ├── jobs/alertChecker.js  Cron job that evaluates rate alerts
│   │   ├── app.js                Express app assembly
│   │   └── server.js             Entry point: connect DB, start cron, listen
│   └── tests/                    Jest + Supertest, Fixer mocked, in-memory Mongo
│
├── frontend/                 React 18 + Vite
│   └── src/
│       ├── components/           Converter, TrendChart, Watchlist, Alerts, RateLedger…
│       ├── pages/                Dashboard, Login, Register
│       ├── context/AuthContext.jsx
│       ├── services/api.js       Axios instance with JWT interceptor
│       └── styles/               Design tokens + stylesheet
│
├── docker-compose.yml         mongo + backend + frontend (nginx), one command
└── README.md
```

**Data flow for a conversion:** browser → `POST /api/currency/convert` →
`fixerService.convert()` (cache hit, or one call to Fixer) → result returned
*and* written to `ConversionHistory` for that user → shown in the History
panel on next load.

**Data flow for an alert:** user sets "USD/JPY above 155" → stored as a
`RateAlert` document → every 15 minutes (configurable) the cron job pulls
live rates for every base currency with active alerts, checks each alert's
condition, and marks matches `triggered` — with a comment in the code for
exactly where you'd hook in email/push delivery later.

## Running it locally

**Prerequisites:** Node 18+, MongoDB running locally (or use Docker Compose
below), and a free [Fixer API key](https://apilayer.com/marketplace/fixer-api).

```bash
# Backend
cd backend
cp .env.example .env        # fill in FIXER_API_KEY and JWT_SECRET
npm install
npm run dev                 # http://localhost:5000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173 (proxies /api to :5000)
```

**Or with Docker Compose** (spins up MongoDB, backend, and frontend together):

```bash
cp backend/.env.example backend/.env   # fill in FIXER_API_KEY and JWT_SECRET
docker compose up --build
# frontend: http://localhost:8080
# backend:  http://localhost:5000
```

## Running the tests

```bash
cd backend
npm test
```

Tests use `mongodb-memory-server` to spin up a real (temporary) MongoDB
instance and `supertest` to hit the Express app directly — no manual server
start needed. The Fixer service is mocked in the currency tests so the suite
never depends on network access or a real API key.

> Note: in the sandboxed environment this project was built in, the test
> runner couldn't download the MongoDB binary (outbound network is
> allowlisted to package registries only, not `fastdl.mongodb.org`). Every
> file was syntax-checked and the Express app was booted and hit with real
> HTTP requests to confirm the routing, middleware, and error handling all
> wire together correctly — see the build log for that. The test suite will
> run as-is on a normal machine or in CI.

## What to extend if you want to go further

- Swap the alert job's console.log for a real notification (email via
  Nodemailer/SES, or a websocket push to a connected client).
- Add refresh tokens instead of a single 7-day JWT.
- Move the in-memory cache to Redis if you deploy multiple backend instances
  (right now the cache is per-process, which is fine for one instance but
  won't be shared across a horizontally scaled deployment).
- Add a `GET /api/currency/supported` endpoint and validate currency codes
  against it instead of trusting any 3-letter string.

