import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import podcastGenerateRoutes from './routes/podcastGenerateRoutes';
import TTSandGemeniCombined from './routes/TTSandGemeniCombined';
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/podcast-generate', podcastGenerateRoutes);
app.use('/tts-gemini', TTSandGemeniCombined);

// Root test route
app.get('/', (req: Request, res: Response) => {
  res.send('StudyPod API is running - Convert your study materials to podcasts!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
