// server.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import podcastAudioRoutes from './routes/podcastAudioRoutes';
import ttsRoutes from './routes/TTSRoute';    // <— import the router you just exported

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5008;

// Middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/podcast-audio', podcastAudioRoutes);
app.use('/tts-server', ttsRoutes);          // <— mount the PlayHT router here

// Root test route
app.get('/', (req: Request, res: Response) => {
  res.send('StudyPod API is running - Convert your study materials to podcasts!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
