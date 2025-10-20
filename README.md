# Music Mood Player (Starter Kit)

A full‑stack starter to detect a user's mood (manual or from text), generate a mood‑based playlist, and learn from thumbs up/down feedback.

This starter is **self‑contained** and runs without external APIs (uses mocked tracks). It also includes drop‑in placeholders to connect the Spotify API later.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- DB: SQLite via Prisma (users, moods, feedback, tracks)
- Auth: Demo email-only (no real auth) — keep or replace with your favorite (Clerk/Auth0/NextAuth/Passport)
- ML: Simple text sentiment (VADER-like heuristic). Image emotion placeholder included.

## Quick Start
```bash
# 1) Backend
cd server
npm install
npx prisma migrate dev --name init
npm run dev

# 2) Frontend (new terminal)
cd ../client
npm install
npm run dev
```

- Open the frontend at the URL Vite prints (usually http://localhost:5173).
- Backend runs on http://localhost:4000

## Features
- Pick mood manually or type text to detect mood.
- Get a generated playlist based on mood (mock dataset).
- Thumbs up/down feedback updates track scores.
- History saved to SQLite file `server/prisma/dev.db`.


## Project Structure
```
music-mood-player/
  client/              # React (Vite) app
  server/              # Express API + Prisma (SQLite)
  README.md
```
