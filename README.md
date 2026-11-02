# Currency Tracker

[![CI](https://github.com/Kritikaajoshi/CurrencyTracker/actions/workflows/ci.yml/badge.svg)](https://github.com/Kritikaajoshi/CurrencyTracker/actions/workflows/ci.yml)

Live app: https://ledger-currency-tracker.netlify.app/
Backend API: https://currencytracker-uv2p.onrender.com
Source code: https://github.com/Kritikaajoshi/CurrencyTracker

Note: the backend is hosted on Render's free tier, so the first request after a period of inactivity can take 30 to 60 seconds while it wakes up.

## Description

A full-stack web application for currency conversion and exchange rate tracking. Users can convert between currencies, view historical rate trends, maintain a watchlist of currency pairs, set target-rate alerts, and view their conversion history. Exchange rate data comes from the Fixer API (via APILayer).

## Features

- User registration and login (JWT authentication, bcrypt password hashing)
- Currency conversion with live exchange rates
- 14-day historical rate trend chart
- Watchlist for tracking specific currency pairs
- Rate alerts that are checked automatically in the background every 15 minutes
- Conversion history saved per user
- In-memory caching of exchange rate data to reduce third-party API calls

## Tech stack

- Frontend: React, Vite, Recharts
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- External API: Fixer (APILayer)
- Testing: Jest, Supertest, mongodb-memory-server
- Deployment: Netlify (frontend), Render (backend), MongoDB Atlas (database)

## Architecture

```
currency-tracker/
├── backend/
│   ├── src/
│   │   ├── config/db.js          MongoDB connection
│   │   ├── models/                User, ConversionHistory, Watchlist, RateAlert
│   │   ├── services/
│   │   │   ├── fixerService.js    Fixer API client with caching
│   │   │   └── cacheService.js    In-memory TTL cache
│   │   ├── controllers/           Route handlers
│   │   ├── routes/                Express routers with validation rules
│   │   ├── middleware/            Auth, rate limiting, error handling, validation
│   │   ├── jobs/alertChecker.js   Background cron job for rate alerts
│   │   ├── app.js
│   │   └── server.js
│   └── tests/
│
├── frontend/
│   └── src/
│       ├── components/            Converter, TrendChart, Watchlist, Alerts, etc.
│       ├── pages/                 Dashboard, Login, Register
│       ├── context/AuthContext.jsx
│       ├── services/api.js
│       └── styles/
│
├── docker-compose.yml
└── README.md
```

## How it works

When a user converts currency, the request goes to the backend, which checks its cache for recent rate data before calling Fixer. The result is returned to the user and saved to their conversion history.

For rate alerts, a background job runs every 15 minutes, checks current rates against each active alert's target, and marks matching alerts as triggered.

## Running locally

Requirements: Node 18+, MongoDB (local or via Docker Compose below), and a free Fixer API key from apilayer.com.

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Or with Docker Compose:

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

## Running tests

```bash
cd backend
npm test
```

Tests use an in-memory MongoDB instance and mock the Fixer API, so they run without needing a real database or API key.

## Deployment

- Frontend is deployed on Netlify, built from the `frontend` directory.
- Backend is deployed on Render, running `node src/server.js`.
- Database is hosted on MongoDB Atlas.
- The frontend and backend are connected through environment variables: `VITE_API_URL` on the frontend points to the backend, and `CLIENT_ORIGIN` on the backend is set to the frontend URL to allow cross-origin requests.