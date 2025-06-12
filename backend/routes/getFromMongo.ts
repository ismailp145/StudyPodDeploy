// getFromMongo.ts
import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma';
import { filterKeywords } from '../services/keywordService';

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
        }
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
    audioFile: {
      include: { summary: true },
    },
    user: true
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
// router.get('/audio-file-keywords', async (_req: Request, res: Response) => {
//   try {
//     const keywords = await prisma.audioFileKeyword.findMany({
//       include: { audioFile: true }
//     });
//     res.json(keywords);
//   } catch (err: any) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// --------------------------------------------------------------------
// GET /generate-podcast?prompt=...&firebaseId=...
// – Looks for an existing podcast whose keyword set overlaps with
//   the keywords extracted from the prompt.
// – If found, returns it (including the audio URL) and *does not*
//   create anything new.
// – If not found, responds with 404 so that the client can fall
//   back to the POST route to create a brand-new episode.
// --------------------------------------------------------------------
router.get('/audio-file-by-keywords', async (req: Request, res: Response): Promise<void> => {
  try {
    const prompt     = String(req.query.prompt ?? '').trim();
    const firebaseId = String(req.query.firebaseId ?? '').trim();

    if (!prompt || !firebaseId) {
      res.status(400).json({ error: 'Both prompt and firebaseId are required' });
      return;
    }

    const keywords = filterKeywords(prompt);   // e.g. ["React", "virtual DOM"]

    
    const existing = await prisma.podcastSummary.findFirst({
      where: { keywords: { hasSome: keywords } },
      include: { audio: true },                // pull the AudioFile row too
    });

    if (existing && existing.audio) {
      
    const user = await prisma.user.findUnique({
      where: { firebaseId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found for that firebaseId' });
      return;
    }
        await prisma.userAudioFile.create({
          data: {
            userId:  user.id,
            audioId: existing.audio.id
          }
        });

        await prisma.user.update({
        where: { id: user.id },
        data: {
          Audios: {
            push: existing.audio.id
          }
        }
      });

      res.json({
        id:        existing.id,
        title:     existing.title,
        content:   existing.content,
        summary:   existing.summary,
        keywords:  existing.keywords,
        audioUrl:  existing.audio.url,   // public / signed S3 URL
        s3Key:     existing.audio.s3Key,
      });

    } else {
      res.status(404).json({ message: 'No cached podcast found' });
    } 

    
  } catch (error) {
    console.error('GET /generate-podcast error:', error);
    res.status(500).json({ error: 'Failed to look up podcast' });
  }
});


export default router;
