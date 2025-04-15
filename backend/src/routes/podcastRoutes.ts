import express, { Request, Response, Router } from 'express';
import { Podcast } from '../types/Podcast';

const router: Router = express.Router();

// Hard coded data - you might want to move this to a separate file later
let podcasts: Podcast[] = [
  { id: 1, title: "Introduction to Physics", content: "Basic physics concepts", voiceStyle: "casual", speed: 1.0 },
  { id: 2, title: "Advanced Mathematics", content: "Complex mathematical theorems", voiceStyle: "formal", speed: 0.9 },
  { id: 3, title: "History Overview", content: "Major historical events", voiceStyle: "narrative", speed: 1.1 }
];

// GET - Retrieve all podcasts
router.get('/', (req: Request, res: Response): void => {
  res.json({ podcasts });
});

// Create a new podcast
router.post('/', (req: Request, res: Response): void => {
  const { title, content, voiceStyle, speed } = req.body;
  
  if (!title || !content) {
    res.status(400).json({ error: "Title and content are required" });
    return;
  }
  
  const newPodcast: Podcast = {
    id: podcasts.length + 1,
    title,
    content,
    voiceStyle: voiceStyle || "casual",
    speed: speed || 1.0
  };
  
  podcasts.push(newPodcast);
  res.status(201).json({ podcasts });
});

// Remove a podcast by ID
router.delete('/:id', (req: Request, res: Response): void => {
  const id = parseInt(req.params.id);
  const initialLength = podcasts.length;
  
  podcasts = podcasts.filter(podcast => podcast.id !== id);
  
  if (podcasts.length === initialLength) {
    res.status(404).json({ error: "Podcast not found" });
    return;
  }
  
  res.json({ message: "Podcast deleted", podcasts });
});

export default router;