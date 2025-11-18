diff --git a/README.md b/README.md
index 14bab0272a40bbc31d9eff29f0e94338cad576a5..ce09ca03ebed5258f3ec7e7a7600be08599383c5 100644
--- a/README.md
+++ b/README.md
@@ -1,44 +1,52 @@
 # Music Mood Player (Starter Kit)
 
 A full‑stack starter to detect a user's mood (manual or from text), generate a mood‑based playlist, and learn from thumbs up/down feedback.

+This starter connects to the **Spotify API** (client credentials flow) to build playlists that match the detected mood. If
+you don't have credentials yet, the server falls back to a small built-in sample playlist so the app still runs.
 
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
+# Add Spotify credentials in server/.env
+# SPOTIFY_CLIENT_ID=...
+# SPOTIFY_CLIENT_SECRET=...
 npx prisma migrate dev --name init
 npm run dev
 
 # 2) Frontend (new terminal)
 cd ../client
 npm install
 npm run dev
 ```
 
 - Open the frontend at the URL Vite prints (usually http://localhost:5173).
 - Backend runs on http://localhost:4000
 
+### Spotify API setup
+- Create a free **Spotify Developer** application and copy its Client ID and Client Secret.
+- Add them to `server/.env` as shown above. The server uses the client credentials flow to request a playlist based on the detected mood.
+
 ## Features
 - Pick mood manually or type text to detect mood.
+- Get a generated playlist based on mood (Spotify search-based playlist with album art, Spotify links, and previews when available).
 - Thumbs up/down feedback updates track scores.
 - History saved to SQLite file `server/prisma/dev.db`.
 
 
 ## Project Structure
 ```
 music-mood-player/
   client/              # React (Vite) app
   server/              # Express API + Prisma (SQLite)
   README.md
 ```
