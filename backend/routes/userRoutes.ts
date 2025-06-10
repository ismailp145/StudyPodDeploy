import express, { Request, Response, Router } from 'express';
import { PrismaClient, Prisma } from '../generated/prisma';

const router: Router = express.Router();
const prisma = new PrismaClient();

// Get all users (might want to add auth middleware)
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

// Create new user
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { firebaseId, email } = req.body;

  if (!firebaseId) {
    res.status(400).json({ error: 'Firebase ID is required' });
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { firebaseId }
    });

    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    // Create new user
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

// Update existing user
router.put('/:firebaseId', async (req: Request, res: Response): Promise<void> => {
  const { firebaseId } = req.params;
  const { email } = req.body;

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { firebaseId }
    });

    if (!existingUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update user
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

// Get user by Firebase ID
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

// Delete user
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

export default router;
