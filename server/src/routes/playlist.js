import axios from 'axios';
import express from 'express';
import { prisma } from '../index.js';
export const router = express.Router();

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_SEARCH_URL = 'https://api.spotify.com/v1/search';
let tokenCache = { accessToken: null, expiresAt: 0 };

const hasSpotifyCredentials = () =>
  Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);

async function getSpotifyToken() {
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Spotify client ID/secret not configured');
  }

  const payload = new URLSearchParams();
  payload.append('grant_type', 'client_credentials');

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const { data } = await axios.post(SPOTIFY_TOKEN_URL, payload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${authHeader}`
    }
  });

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000 // refresh 1m early
  };
  return tokenCache.accessToken;
}

async function fetchSpotifyTracksForMood(mood) {
  if (!hasSpotifyCredentials()) {
    console.warn('Spotify credentials missing — serving fallback playlist.');
    return [
      {
        id: `mock-${mood}-1`,
        title: 'Midnight Breeze',
        artist: 'Royal Ocean',
        albumArt: null,
        spotifyUrl: null,
        previewUrl: null
      },
      {
        id: `mock-${mood}-2`,
        title: 'City Lights',
        artist: 'Neon Streets',
        albumArt: null,
        spotifyUrl: null,
        previewUrl: null
      },
      {
        id: `mock-${mood}-3`,
        title: 'Echoes & Waves',
        artist: 'Glass Harbor',
        albumArt: null,
        spotifyUrl: null,
        previewUrl: null
      }
    ];
  }

  const accessToken = await getSpotifyToken();
  const query = `${mood} mood`;

  const { data } = await axios.get(SPOTIFY_SEARCH_URL, {
    params: { q: query, type: 'track', limit: 15, market: 'US' },
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const items = data?.tracks?.items || [];
  return items.map(track => ({
    id: track.id,
    title: track.name,
    artist: track.artists?.map(a => a.name).join(', ') || 'Unknown artist',
    albumArt: track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || null,
    spotifyUrl: track.external_urls?.spotify || null,
    previewUrl: track.preview_url || null
  }));
}

router.post('/', async (req, res) => {
  try {
    const { userId = 'demo', mood = 'relaxed' } = req.body || {};

    const spotifyTracks = await fetchSpotifyTracksForMood(mood);
    if (!spotifyTracks.length) {
      return res.status(502).json({ error: 'No tracks returned from Spotify' });
    }

    const albumArtById = {};
    const spotifyUrlById = {};
    const previewUrlById = {};
    for (const t of spotifyTracks) {
      albumArtById[t.id] = t.albumArt;
      spotifyUrlById[t.id] = t.spotifyUrl;
      previewUrlById[t.id] = t.previewUrl;
      await prisma.track.upsert({
        where: { id: t.id },
        create: { id: t.id, title: t.title, artist: t.artist, mood, albumArt: t.albumArt, spotifyUrl: t.spotifyUrl, previewUrl: t.previewUrl },
        update: { title: t.title, artist: t.artist, mood, albumArt: t.albumArt, spotifyUrl: t.spotifyUrl, previewUrl: t.previewUrl }
      });
    }

    const tracks = await prisma.track.findMany({
      where: { mood },
      orderBy: [
        { score: 'desc' },
        { title: 'asc' }
      ]
    });

    await prisma.moodHistory.create({ data: { userId, mood } });

    const hydratedTracks = tracks.map(t => ({
      ...t,
      albumArt: albumArtById[t.id] || t.albumArt || null,
      spotifyUrl: spotifyUrlById[t.id] || t.spotifyUrl || null,
      previewUrl: previewUrlById[t.id] || t.previewUrl || null
    }));

    res.json({ mood, tracks: hydratedTracks });
  } catch (err) {
    console.error('Failed to build playlist', err.response?.data || err.message);
    res.status(500).json({ error: 'Unable to fetch playlist', details: err.message });
  }
});
export default router;
