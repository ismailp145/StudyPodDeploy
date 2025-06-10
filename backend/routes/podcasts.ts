import { Router, Request, Response, RequestHandler } from 'express';
import { PrismaClient } from '../generated/prisma';

const router: Router = Router();
const prisma = new PrismaClient();

// Static podcast data
const STATIC_PODCASTS = [
  {
    title: "The Wonders of Science",
    content: "A deep dive into the fascinating world of scientific discoveries...",
    summary: "Explore the latest breakthroughs in science and their impact on our understanding of the universe.",
    keywords: ["science", "discovery", "research"],
    audioUrl: "https://team5-study-pod-s3-bucket.s3.us-east-2.amazonaws.com/initialize/science-podcast.mp3"
  },
  {
    title: "Journey Through History",
    content: "Uncovering the pivotal moments that shaped our world...",
    summary: "A captivating exploration of key historical events and their lasting influence on modern society.",
    keywords: ["history", "culture", "civilization"],
    audioUrl: "https://team5-study-pod-s3-bucket.s3.us-east-2.amazonaws.com/initialize/history-podcast.mp3"
  },
  {
    title: "Programming Fundamentals",
    content: "Master the basics of programming and software development...",
    summary: "Learn essential programming concepts and best practices for modern software development.",
    keywords: ["programming", "coding", "software"],
    audioUrl: "https://team5-study-pod-s3-bucket.s3.us-east-2.amazonaws.com/initialize/programming-podcast.mp3"
  },
  {
    title: "The AI Revolution",
    content: "Understanding artificial intelligence and its transformative potential...",
    summary: "Discover how AI is reshaping industries and what it means for the future of technology.",
    keywords: ["AI", "machine learning", "technology"],
    audioUrl: "https://team5-study-pod-s3-bucket.s3.us-east-2.amazonaws.com/initialize/ai-podcast.mp3"
  },
  {
    title: "Art and Creativity",
    content: "Exploring the intersection of art, design, and human expression...",
    summary: "Dive into the world of art and discover how creativity shapes our cultural landscape.",
    keywords: ["art", "creativity", "design"],
    audioUrl: "https://team5-study-pod-s3-bucket.s3.us-east-2.amazonaws.com/initialize/art-podcast.mp3"
  },
  {
    title: "Entrepreneurship Essentials",
    content: "Building and growing successful businesses in the modern world...",
    summary: "Learn the key principles of entrepreneurship and how to navigate the startup landscape.",
    keywords: ["entrepreneurship", "business", "startup"],
    audioUrl: "https://team5-study-pod-s3-bucket.s3.us-east-2.amazonaws.com/initialize/entrepreneurship-podcast.mp3"
  }
];

// Initialize static podcasts
router.post('/initialize', async (req: Request, res: Response): Promise<void> => {
  try {
    for (const podcast of STATIC_PODCASTS) {
      const s3Key = `initialize/${podcast.audioUrl.split('/').pop()}` || '';

      // Check if a podcast with this s3Key already exists
      const existingAudioFile = await prisma.audioFile.findFirst({
        where: {
          s3Key: s3Key
        }
      });

      if (!existingAudioFile) {
        // Create AudioFile entry if it doesn't exist
        const audioFile = await prisma.audioFile.create({
          data: {
            s3Key: s3Key,
            contentType: 'audio/mpeg',
            url: podcast.audioUrl,
            originalName: `${podcast.title.toLowerCase().replace(/\s+/g, '-')}.mp3`,
          }
        });

        // Create PodcastSummary entry
        await prisma.podcastSummary.create({
          data: {
            title: podcast.title,
            content: podcast.content,
            summary: podcast.summary,
            keywords: podcast.keywords,
            audioId: audioFile.id
          }
        });
      }
    }

    // Return all static podcasts that have been initialized (based on s3Key prefix)
    const allStaticPodcasts = await prisma.podcastSummary.findMany({
      where: {
        audio: {
          s3Key: {
            startsWith: 'initialize/'
          }
        }
      },
      include: {
        audio: true
      }
    });

    res.status(200).json(allStaticPodcasts);
  } catch (error) {
    console.error('Error initializing podcasts:', error);
    res.status(500).json({ error: 'Failed to initialize podcasts' });
  }
});

// Get all podcasts
router.get('/', async (req: Request, res: Response) : Promise<void> => {
  try {
    const podcasts = await prisma.podcastSummary.findMany({
      include: {
        audio: true
      }
    });
    res.json(podcasts);
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
});

// Get podcast by ID
router.get('/:id', async (req: Request, res: Response) : Promise<void> => {
  try {
    const podcast = await prisma.podcastSummary.findUnique({
      where: { id: req.params.id },
      include: {
        audio: true
      }
    });
    
    if (!podcast) {
        res.status(404).json({ error: 'Podcast not found' });
    }
    
    res.json(podcast);
  } catch (error) {
    console.error('Error fetching podcast:', error);
    res.status(500).json({ error: 'Failed to fetch podcast' });
  }
});

export default router; 