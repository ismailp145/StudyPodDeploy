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

// Create or update user after Firebase authentication
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { firebaseId, email } = req.body;

  if (!firebaseId) {
    res.status(400).json({ error: 'Firebase ID is required' });
    return;
  }

  try {
    // Try to find existing user first
    let user = await prisma.user.findUnique({
      where: { firebaseId }
    });

    if (user) {
      // Update existing user if needed
      user = await prisma.user.update({
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
    } else {
      // Create new user
      const userData: Prisma.UserUncheckedCreateInput = {
        firebaseId,
        email
      };
      
      user = await prisma.user.create({
        data: userData,
        include: {
          playlistItems: {
            include: {
              audioFile: true
            }
          }
        }
      });
    }

    res.status(201).json({ user });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Failed to create/update user' });
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
