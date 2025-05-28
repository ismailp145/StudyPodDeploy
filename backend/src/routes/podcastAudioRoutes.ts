import express, { Request, Response, Router } from 'express';
import { PodcastAudio } from '../types/PodcastAudio';
import { testGenerate } from '../types/testGenerate';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const gemini_api_key = process.env.GOOGLE_API_KEY;
if (!gemini_api_key) {
  throw new Error("API_KEY is not defined in the environment variables");
}
const googleAI = new GoogleGenerativeAI(gemini_api_key);


const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});


const router: Router = express.Router();

let podcastAudios: PodcastAudio[] = [
  { id: 1, audio: "placeholder for audio content", voiceStyle: "casual", speed: 1.0 }
];

let geminiResp: testGenerate = {
  id: 1,
  content: "placeholder for audio content",
  
}

// GET – Retrieve all podcast audios
router.get('/', (req: Request, res: Response): void => {
  res.json({ podcastAudios });
});

// POST – Create a new podcast audio
router.post('/', (req: Request, res: Response): void => {
  const { audio, voiceStyle, speed } = req.body;
  if (!audio || !voiceStyle || speed === undefined) {
    res.status(400).json({ error: "Audio, voiceStyle and speed are required" });
    return;
  }

  const newAudio: PodcastAudio = {
    id: podcastAudios.length + 1,
    audio,
    voiceStyle,
    speed,
  };

  podcastAudios.push(newAudio);
  res.status(201).json({ podcastAudios });
});

// DELETE – Remove a podcast audio by ID
router.delete('/:id', (req: Request, res: Response): void => {
  const id = parseInt(req.params.id, 10);
  const before = podcastAudios.length;
  podcastAudios = podcastAudios.filter(pa => pa.id !== id);

  if (podcastAudios.length === before) {
    res.status(404).json({ error: "Podcast audio not found" });
    return;
  }

  res.json({ message: "Podcast audio deleted", podcastAudios });
});


router.get('/generate', async (req: Request, res: Response): Promise<void> => {
  const prompt = req.query.prompt as string;

  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
    return;
  }

  let test = "Still Generating..."; 

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    test = response.text(); // Assign the generated content to `test`
    console.log("Generated content:", test);
  } catch (error) {
    console.error("Response error:", error);
    res.status(500).json({ error: "Failed to generate content" });
    return;
  }

  // Send the response after the asynchronous operation completes
  res.json({ test });
});

export default router;