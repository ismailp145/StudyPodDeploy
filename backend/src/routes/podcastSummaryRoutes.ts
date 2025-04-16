import express, { Request, Response, Router } from 'express';
import { PodcastSummary } from '../types/PodcastSummary';

const router: Router = express.Router();

let podcastSummaries: PodcastSummary[] = [
  { id: 1, title: "Introduction to Physics", textContent: "Basic physics concepts"},
  { id: 2, title: "Advanced Mathematics", textContent: "Complex mathematical theorems"},
  { id: 3, title: "History Overview", textContent: "Major historical events"}
];

// GET - Retrieve all podcasts
router.get('/', (req: Request, res: Response): void => {
  res.json({ podcastSummaries });
});

// Create a new podcast
router.post('/', (req: Request, res: Response): void => {
  const { title, textContent } = req.body;
  
  if (!title || !textContent) {
    res.status(400).json({ error: "Title and content are required" });
    return;
  }
  
  const newPodcast: PodcastSummary = {
    id: podcastSummaries.length + 1,
    title,
    textContent,
  };
  
  podcastSummaries.push(newPodcast);
  res.status(201).json({ podcastSummaries });
});

// Remove a podcast by ID
router.delete('/:id', (req: Request, res: Response): void => {
  const id = parseInt(req.params.id);
  const initialLength = podcastSummaries.length;
  
  podcastSummaries = podcastSummaries.filter(podcastSummary => podcastSummary.id !== id);
  
  if (podcastSummaries.length === initialLength) {
    res.status(404).json({ error: "Podcast not found" });
    return;
  }
  
  res.json({ message: "Podcast deleted", podcastSummaries });
});

export default router;