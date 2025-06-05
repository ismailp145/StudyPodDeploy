import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import podcastGenerateRoutes from './routes/generatePodcastRoutes';
import userRoutes from './routes/userRoutes';
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/generate-podcast', podcastGenerateRoutes);
app.use('/user', userRoutes);

// Root test route
app.get('/', (req: Request, res: Response) => {
  res.send('StudyPod API is running - Convert your study materials to podcasts!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
