// getFromMongo.ts
import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';

const router: Router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /mongo/users
 * Returns all users + their saved playlist items
 *http://localhost:8080/mongo/users
*/
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        playlistItems: {
          include: { audioFile: true }
        }
      }
    });
    res.json(users);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /mongo/audio-files
 * Returns all audio files + their summary, keywords, who saved them, and any keywords relation
 */
router.get('/audio-files', async (_req: Request, res: Response) => {
  try {
    const audioFiles = await prisma.audioFile.findMany({
      include: {
        summary: true,
        savedBy: {
          include: { user: true }
        },
        AudioFileKeyword: true
      }
    });
    res.json(audioFiles);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /mongo/podcast-summaries
 * Returns all podcast summaries + their linked audio file
 */
router.get('/podcast-summaries', async (_req: Request, res: Response) => {
  try {
    const summaries = await prisma.podcastSummary.findMany({
      include: { audio: true }
    });
    res.json(summaries);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /mongo/user-audio-files
 * Returns all UserAudioFile join entries (i.e. who saved what, and when)
 */
router.get('/user-audio-files', async (_req: Request, res: Response) => {
  try {
    const entries = await prisma.userAudioFile.findMany({
      include: {
        user: true,
        audioFile: true
      }
    });
    res.json(entries);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /mongo/audio-file-keywords
 * Returns all AudioFileKeyword entries + their parent audioFile
 */
router.get('/audio-file-keywords', async (_req: Request, res: Response) => {
  try {
    const keywords = await prisma.audioFileKeyword.findMany({
      include: { audioFile: true }
    });
    res.json(keywords);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
