import express from 'express';
import { prisma } from '../index.js';
export const router = express.Router();

// Mock tracks by mood
const MOCK = {
  happy: [
    { id: 'h1', title: 'Sunrise Drive', artist: 'Neon Waves' },
    { id: 'h2', title: 'Glow Up', artist: 'Skyline' },
    { id: 'h3', title: 'Good Vibes Only', artist: 'Astra' },
  ],
  sad: [
    { id: 's1', title: 'Rain on Glass', artist: 'Low Tide' },
    { id: 's2', title: 'Quiet Rooms', artist: 'Nocturne' },
    { id: 's3', title: 'Falling Leaves', artist: 'Autumn Grey' },
  ],
  relaxed: [
    { id: 'r1', title: 'LoFi Breeze', artist: 'Midnight Latte' },
    { id: 'r2', title: 'Velvet Clouds', artist: 'Slow Orbit' },
    { id: 'r3', title: 'Cafe Stillness', artist: 'Analog Bloom' },
  ],
  energetic: [
    { id: 'e1', title: 'Circuit Breaker', artist: 'Pulse Runner' },
    { id: 'e2', title: 'Nitro Mode', artist: 'Hyperlane' },
    { id: 'e3', title: 'Crank It', artist: 'Kickstart' },
  ]
};

router.post('/', async (req, res) => {
  const { userId = 'demo', mood = 'relaxed' } = req.body || {};
  // ensure tracks exist in DB (idempotent seed)
  for (const m of Object.keys(MOCK)) {
    for (const t of MOCK[m]) {
      await prisma.track.upsert({
        where: { id: t.id },
        create: { id: t.id, title: t.title, artist: t.artist, mood: m },
        update: {}
      });
    }
  }
  // pick top tracks by feedback score for the mood
  const tracks = await prisma.track.findMany({
    where: { mood },
    orderBy: { score: 'desc' }
  });
  // create a mood history record
  await prisma.moodHistory.create({
    data: { userId, mood }
  });
  res.json({ mood, tracks });
});
