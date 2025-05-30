// routes/TTSRoute.ts
import { Router, Request, Response } from 'express';
import * as PlayHT from 'playht';
import dotenv from 'dotenv';

dotenv.config();

// Initialize PlayHT SDK
PlayHT.init({
  userId: process.env.PLAYHT_USER_ID!,
  apiKey: process.env.PLAYHT_API_KEY!,
});

const router = Router();


router.post('/', async (req: Request, res: Response): Promise <void>  => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Missing text' });
      return;
    }

    const stream = await PlayHT.stream(text, { voiceEngine: 'PlayDialog' });
    res.setHeader('Content-Type', 'audio/mpeg');
    stream.pipe(res);
    return;

  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: 'TTS failed' });
    return;
  }
});


router.get('/', (_req: Request, res: Response) => {
  res.send('TTS server OK');
});

export default router;
