// server/src/routes/generatePodcast.ts
import express, { Request, Response, Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { PrismaClient } from '../generated/prisma';
import { createAndSaveToS3AudioFile } from '../services/audioService';

dotenv.config();
const prisma = new PrismaClient();

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('API_KEY is not defined in the environment variables');
}

const googleAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = googleAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
});

interface PodcastGenerationResponse {
  title: string;
  content: string;
  keywords: string[];
  summary: string;
}

const systemPrompt = `
  You are a podcast content generator. Given a user request, generate comprehensive podcast content, create an engaging title, and extract relevant keywords. Return your response in JSON format with four fields: "title", "content", "keywords", and "summary".
  
  Requirements:
  - Generate an engaging, descriptive title that captures the essence of the content
  - Generate engaging, conversational podcast content that sounds natural when spoken
  - Content should be informative, well-structured, and appropriate for the requested duration
  - Extract 4-6 relevant keywords from the input that capture the main topics and concepts
  - Generate a concise summary of the content that captures the main points and insights
  
  - Use a conversational tone with natural transitions
  - Include specific examples and practical insights where relevant
  - NO opening greetings or closing remarks - dive straight into content
  - IMPORTANT: Return response as valid JSON only
  - IMPORTANT: Do NOT include any markdown formatting such as triple backticks or code blocks in your response.
  - IMPORTANT: Your response should be 50 words or less

  Example Inputs and Outputs:
  Input: "Give me a podcast on React"
  Output:
  {
    "title": "React Fundamentals: Building Modern UIs with Components and Virtual DOM",
    "content": "...",
    "keywords": ["React", "virtual DOM", "component-based architecture", "useEffect", "state management", "UI development"],
    "summary": "This episode explores how React's component model and virtual DOM optimize UI development and performance."
  }

  Input: "Why is React more performant than Angular and describe all the details at a low level"
  Output:
  {
    "title": "React vs Angular: The Performance Battle Under the Hood",
    "content": "...",
    "keywords": ["React performance", "Angular performance", "virtual DOM", "reconciliation algorithm", "change detection", "rendering optimization"],
    "summary": "We break down the performance differences between React and Angular, diving into change detection, rendering strategies, and architecture."
  }
`;

const router: Router = express.Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { prompt, firebaseId, voice } = req.body;
  if (!prompt || !firebaseId) {
    res.status(400).json({ error: 'Both prompt and firebaseId are required' });
    return;
  }

  try {
    // 1) Generate the text response
    const result = await geminiModel.generateContent([systemPrompt, prompt]);
    const raw = result.response.text();
    const cleaned = raw.replace(/^```json\s*|```$/g, '').trim();
    const parsed = JSON.parse(cleaned) as PodcastGenerationResponse;

    // 2) Create & upload audio
    const audioResult = await createAndSaveToS3AudioFile(
      parsed.content,
      parsed.title,
      voice
    );

    // 3) Save the PodcastSummary linked to that AudioFile
    const savedSummary = await prisma.podcastSummary.create({
      data: {
        title:    parsed.title,
        content:  parsed.content,
        summary:  parsed.summary,
        keywords: parsed.keywords,
        audio: {
          connect: { id: audioResult.audioFileId }
        }
      },
      include: { audio: true }
    });

    // 4) Find the user by their Firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseId }
    });
    if (!user) {
      res.status(404).json({ error: 'User not found for that firebaseId' });
      return;
    }

    // 5) Link the audio to that user
    await prisma.userAudioFile.create({
      data: {
        userId:  user.id,
        audioId: audioResult.audioFileId
      }
    });

    await prisma.user.update({
    where: { id: user.id },
    data: {
      Audios: {
        push: audioResult.audioFileId
      }
    }
  });
  
    // 6) Respond with full payload
    res.json({
      ...parsed,
      id:       savedSummary.id,
      audioUrl: audioResult.s3Url,
      s3Key:    audioResult.s3Key
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      error:   'Failed to generate podcast content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;