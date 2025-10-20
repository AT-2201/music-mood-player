import express from 'express';
import { prisma } from '../index.js';
export const router = express.Router();

router.post('/', async (req, res) => {
  const { userId = 'demo', trackId, value } = req.body || {};
  if (!trackId || ![1, -1].includes(value)) {
    return res.status(400).json({ error: 'trackId and value (1|-1) required' });
  }
  // record feedback
  await prisma.feedback.create({ data: { userId, trackId, value } });
  // update aggregate score on the track
  await prisma.track.update({
    where: { id: trackId },
    data: { score: { increment: value } }
  });
  res.json({ ok: true });
});
