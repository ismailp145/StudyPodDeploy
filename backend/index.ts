// server.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import podcastGenerateRoutes from './routes/generatePodcastRoutes';
import userRoutes from './routes/userRoutes';
import getFromMongoRoutes from './routes/getFromMongo';
import podcastRoutes from './routes/podcasts';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Mount your existing routers
app.use('/generate-podcast', podcastGenerateRoutes);
app.use('/user', userRoutes);
app.use('/podcasts', podcastRoutes);

// Mount the new "get from Mongo" routes
// GET /mongo/users
// GET /mongo/audio-files
// GET /mongo/podcast-summaries
// GET /mongo/user-audio-files
// GET /mongo/audio-file-keywords
app.use('/mongo', getFromMongoRoutes);

// Root health‐check
app.get('/', (_req: Request, res: Response) => {
  res.send('StudyPod API is running - Convert your study materials to podcasts!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
