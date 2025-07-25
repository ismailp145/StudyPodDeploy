import express, { Request, Response, Router } from 'express';
import { PrismaClient, Prisma } from '../generated/prisma';

const router: Router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firebaseId: true,
        playlistItems: {
          include: {
            audioFile: true
          }
        }
      }
    });
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { firebaseId, email } = req.body;

  if (!firebaseId) {
    res.status(400).json({ error: 'Firebase ID is required' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { firebaseId }
    });

    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const user = await prisma.user.create({
      data: { firebaseId, email },
      include: {
        playlistItems: {
          include: {
            audioFile: true
          }
        }
      }
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/:firebaseId', async (req: Request, res: Response): Promise<void> => {
  const { firebaseId } = req.params;
  const { email } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { firebaseId }
    });

    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = await prisma.user.update({
      where: { firebaseId },
      data: { email },
      include: {
        playlistItems: {
          include: {
            audioFile: true
          }
        }
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.get('/:firebaseId', async (req: Request, res: Response): Promise<void> => {
  const { firebaseId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { firebaseId },
      include: {
        playlistItems: {
          include: {
            audioFile: true
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

router.delete('/:firebaseId', async (req: Request, res: Response): Promise<void> => {
  const { firebaseId } = req.params;

  try {
    const deletedUser = await prisma.user.delete({
      where: { firebaseId },
      include: {
        playlistItems: true
      }
    });

    res.json({ message: 'User deleted', deletedUser });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(404).json({ error: 'User not found or could not be deleted' });
  }
});

router.post('/interests/:firebaseId', async (req: Request, res: Response): Promise<void> => {
  const { firebaseId } = req.params;
  const { interests } = req.body;

  if (!interests || !Array.isArray(interests)) {
    res.status(400).json({ error: 'Interests must be an array' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { firebaseId }
    });

    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = await prisma.user.update({
      where: { firebaseId },
      data: { interests },
      include: {
        playlistItems: {
          include: {
            audioFile: true
          }
        }
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Error updating user interests:', error);
    res.status(500).json({ error: 'Failed to update user interests' });
  }
});

router.post('/:firebaseId/playlist', async (req: Request, res: Response): Promise<void> => {
  const { firebaseId } = req.params;
  const { audioId } = req.body;

  if (!audioId) {
    res.status(400).json({ error: 'Audio ID is required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { firebaseId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const audioFile = await prisma.audioFile.findUnique({
      where: { id: audioId }
    });

    if (!audioFile) {
      res.status(404).json({ error: 'Audio file not found' });
      return;
    }

    const existingPlaylistItem = await prisma.userAudioFile.findFirst({
      where: {
        userId: user.id,
        audioId: audioId
      }
    });

    if (existingPlaylistItem) {
      res.status(409).json({ error: 'Audio file already in playlist' });
      return;
    }

    const playlistItem = await prisma.userAudioFile.create({
      data: {
        userId: user.id,
        audioId: audioId
      },
      include: {
        audioFile: true
      }
    });

    res.status(201).json({ playlistItem });
  } catch (error) {
    console.error('Error adding to playlist:', error);
    res.status(500).json({ error: 'Failed to add to playlist' });
  }
});

router.delete('/:firebaseId/playlist/:audioId', async (req: Request, res: Response): Promise<void> => {
  const { firebaseId, audioId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { firebaseId }
    });

    if (!user) {
      res.status(409).json({ error: 'User not found' });
      return;
    }

    const playlistItem = await prisma.userAudioFile.findFirst({
      where: {
        userId: user.id,
        audioId: audioId
      }
    });

    if (!playlistItem) {
      res.status(409).json({ error: 'Audio not found in playlist' });
      return;
    }

    await prisma.userAudioFile.delete({
      where: {
        id: playlistItem.id
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        Audios: {
          set: user.Audios.filter(id => id !== audioId)
        }
      }
    });

    res.json({ message: 'Audio removed from playlist' });
  } catch (error) {
    console.error('Error removing from playlist:', error);
    res.status(500).json({ error: 'Failed to remove from playlist' });
  }
});

export default router;
