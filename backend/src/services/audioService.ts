import { Router, Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { uploadLocalFileToS3 } from '../services/s3Service';
import { PrismaClient } from '../generated/prisma';

interface TTSResult {
    file: string;
    path: string;
    s3Url?: string;
    s3Key?: string;
    audioFileId: string;
}

dotenv.config();
const prisma = new PrismaClient();

const router = Router();
const PLAYHT_URL = 'https://api.play.ht/api/v2/tts/stream';

const USER_ID = process.env.PLAYHT_USER_ID;
const API_KEY = process.env.PLAYHT_API_KEY;
const VOICE = process.env.PLAYHT_VOICE;

if (!USER_ID || !API_KEY || !VOICE) {
  throw new Error(
    'Missing one of PLAYHT_USER_ID, PLAYHT_API_KEY, or PLAYHT_VOICE in environment'
  );
}

// Base folder where we'll save the MP3 files
const OUTPUT_DIR = path.join(__dirname, '../../generated_audio');

// Create output directory if it doesn't exist
const ensureOutputDir = () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
};

// Generate a safe filename
const generateSafeFilename = (filename?: string): string => {
  return filename
    ? `${filename.replace(/[^a-zA-Z0-9_\-]/g, '_')}.mp3`
    : `${Date.now()}.mp3`;
};

// Main TTS generation function
export const createAndSaveToS3AudioFile = async (text: string, filename?: string): Promise<TTSResult> => {
  ensureOutputDir();
  const safeName = generateSafeFilename(filename);
  const outputFilePath = path.join(OUTPUT_DIR, safeName);

  const payload = {
    voice_engine: 'Play3.0',
    text,
    voice: VOICE,
    output_format: 'mp3',
    sample_rate: 44100,
    speed: 1,
  };

  try {
    const response = await axios({
      method: 'POST',
      url: PLAYHT_URL,
      data: payload,
      responseType: 'stream',
      headers: {
        'accept': 'audio/mpeg',
        'content-type': 'application/json',
        'X-USER-ID': USER_ID,
        'AUTHORIZATION': API_KEY,
      },
    });

    // Ensure the response is a stream
    if (!(response.data instanceof Readable)) {
      throw new Error('Expected response to be a readable stream');
    }
    
    // write to a temp file
    const writer = fs.createWriteStream(outputFilePath);
    await pipeline(response.data, writer);

     // Upload to S3
     const { key, url } = await uploadLocalFileToS3(outputFilePath);

     // Save to database
    // TODO: ISSUE IS RIGHT HERE
    const audioFile = await prisma.audioFile.create({
        data: {
          s3Key: key,
          originalName: safeName,
          contentType: 'audio/mpeg',
          url,
        }
      });

    // Clean up the local file
    fs.unlinkSync(outputFilePath);

    return { 
      file: safeName,
      path: outputFilePath,
      s3Url: url,
      s3Key: key,
      audioFileId: audioFile.id
    };
  } catch (error) {
    // Clean up the file if it was partially written
    if (fs.existsSync(outputFilePath)) {
      fs.unlinkSync(outputFilePath);
    }
    throw error;
  }
};

export default router;