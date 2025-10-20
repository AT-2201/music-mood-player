import express from 'express';
export const router = express.Router();

// Simple sentiment heuristic mapping to mood
function textToMood(text) {
  if (!text) return { mood: 'relaxed', confidence: 0.4 };
  const t = text.toLowerCase();
  const pos = ['happy','great','awesome','excited','love','joy','win','good'];
  const neg = ['sad','tired','bad','angry','hate','down','lost','anxious'];
  let score = 0;
  pos.forEach(w => { if (t.includes(w)) score += 1; });
  neg.forEach(w => { if (t.includes(w)) score -= 1; });
  const mood = score > 0 ? 'happy' : score < 0 ? 'sad' : 'relaxed';
  const conf = Math.min(1, Math.abs(score) / 3 + 0.4);
  return { mood, confidence: conf };
}

router.post('/', async (req, res) => {
  const { text, manualMood } = req.body || {};
  if (manualMood) return res.json({ mood: manualMood, confidence: 1.0, source: 'manual' });
  const { mood, confidence } = textToMood(text || '');
  res.json({ mood, confidence, source: 'text-heuristic' });
});
