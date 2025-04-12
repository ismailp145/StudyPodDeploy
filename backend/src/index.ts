import express, { Express, Request, Response } from 'express';
import cors from 'cors';

const app: Express = express();
const PORT = process.env.PORT || 5008;

// Middleware
app.use(cors());
app.use(express.json());

interface Podcast {
  id: number;
  title: string;
  content: string;
  voiceStyle: string;
  speed: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

let users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@test.org' },
  { id: 3, name: 'Charlie', email: 'charlie@something.net' },
];

app.get('/users', (req: Request, res: Response) => {
  res.json(users);
});

app.post('/users', (req: Request, res: Response) => {
  const newUser: User = {
    id: Date.now(), // simplistic unique ID
    name: req.body.name,
    email: req.body.email,
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.delete('/users/:id', (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  users = users.filter((user) => user.id !== userId);
  res.status(204).send();
});

// Hard coded data
let podcasts: Podcast[] = [
  { id: 1, title: "Introduction to Physics", content: "Basic physics concepts", voiceStyle: "casual", speed: 1.0 },
  { id: 2, title: "Advanced Mathematics", content: "Complex mathematical theorems", voiceStyle: "formal", speed: 0.9 },
  { id: 3, title: "History Overview", content: "Major historical events", voiceStyle: "narrative", speed: 1.1 }
];



// GET - Retrieve all podcasts
app.get('/podcasts', (req: Request, res: Response): void => {
  res.json({ podcasts });
});

// Create a new podcast
app.post('/podcasts', (req: Request, res: Response): void => {
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
app.delete('/podcasts/:id', (req: Request, res: Response): void => {
  const id = parseInt(req.params.id);
  const initialLength = podcasts.length;
  
  podcasts = podcasts.filter(podcast => podcast.id !== id);
  
  if (podcasts.length === initialLength) {
    res.status(404).json({ error: "Podcast not found" });
    return;
  }
  
  res.json({ message: "Podcast deleted", podcasts });
});

// Root test route
app.get('/', (req: Request, res: Response): void => {
  res.send('StudyPod API is running - Convert your study materials to podcasts!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});