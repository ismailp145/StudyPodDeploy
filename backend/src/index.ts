import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import podcastSummaryRoutes from './routes/podcastSummaryRoutes';

const app: Express = express();
const PORT = process.env.PORT || 5008;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/podcast-summary', podcastSummaryRoutes);

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

// Root test route
app.get('/', (req: Request, res: Response): void => {
  res.send('StudyPod API is running - Convert your study materials to podcasts!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});