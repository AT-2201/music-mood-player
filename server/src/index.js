import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { router as detectRouter } from './routes/detect.js';
import { router as playlistRouter } from './routes/playlist.js';
import { router as feedbackRouter } from './routes/feedback.js';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

export const prisma = new PrismaClient();

app.get('/', (req, res) => res.json({ ok: true, service: 'music-mood-player-api' }));
app.use('/api/detect', detectRouter);
app.use('/api/playlist', playlistRouter);
app.use('/api/feedback', feedbackRouter);

// image emotion detection placeholder
app.post('/api/detect-image', async (req, res) => {
  // TODO: run a real model; for now return neutral
  res.json({ mood: 'relaxed', confidence: 0.5, source: 'image-placeholder' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
