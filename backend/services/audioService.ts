import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import axios from 'axios';
import { PrismaClient } from '../generated/prisma';
import { uploadLocalFileToS3 } from './s3Service';

dotenv.config();
const prisma = new PrismaClient();

// Play.ht TTS streaming endpoint & credentials
const PLAYHT_URL = 'https://api.play.ht/api/v2/tts/stream';
const USER_ID = process.env.PLAYHT_USER_ID;
const API_KEY = process.env.PLAYHT_API_KEY;
const DEFAULT_VOICE = process.env.PLAYHT_VOICE;

if (!USER_ID || !API_KEY || !DEFAULT_VOICE) {
  throw new Error(
    'Missing one of PLAYHT_USER_ID, PLAYHT_API_KEY, or PLAYHT_VOICE in environment'
  );
}

// Base folder for temporary MP3 files
const OUTPUT_DIR = path.join(__dirname, '../../generated_audio');

// Ensure output directory exists
const ensureOutputDir = () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
};

// Generate a filesystem-safe filename
const generateSafeFilename = (filename: string): string => {
  const base = filename.replace(/[^a-zA-Z0-9_\-]/g, '_');
  return `${base}.mp3`;
};

export interface TTSResult {
  file: string;       // the sanitized filename written to disk/S3
  path: string;       // local disk path
  s3Url: string;      // URL returned by S3
  s3Key: string;      // S3 object key
  audioFileId: string;// Prisma audioFile ID
}

/**
 * Generate speech from text via Play.ht, upload to S3, and record in the database.
 * @param text     The text to synthesize
 * @param filename The raw title (will be sanitized for storage)
 * @param voice    Optional Play.ht voice; defaults to PLAYHT_VOICE
 */
export const createAndSaveToS3AudioFile = async (
  text: string,
  filename: string,
  voice?: string
): Promise<TTSResult> => {
  ensureOutputDir();

  // Determine which voice to use
  const voiceToUse = voice ?? DEFAULT_VOICE;

  // Sanitize filename for disk/S3
  const safeName = generateSafeFilename(filename);
  const outputFilePath = path.join(OUTPUT_DIR, safeName);

  // Prepare TTS payload
  const payload = {
    voice_engine: 'Play3.0',
    text,
    voice: voiceToUse,
    output_format: 'mp3',
    sample_rate: 44100,
    speed: 1,
  };

  try {
    // Request stream response
    const response = await axios({
      method: 'POST',
      url: PLAYHT_URL,
      data: payload,
      responseType: 'stream',
      headers: {
        accept: 'audio/mpeg',
        'content-type': 'application/json',
        'X-USER-ID': USER_ID,
        AUTHORIZATION: API_KEY,
      },
    });

    if (!(response.data instanceof Readable)) {
      throw new Error('Expected response to be a readable stream');
    }

    // Write stream to temp file
    const writer = fs.createWriteStream(outputFilePath);
    await pipeline(response.data, writer);

    // Upload file to S3
    const { key: s3Key, url: s3Url } = await uploadLocalFileToS3(outputFilePath);

    // Create record in database, storing the raw title as originalName
    const audioFile = await prisma.audioFile.create({
      data: {
        s3Key,
        originalName: filename,
        contentType: 'audio/mpeg',
        url: s3Url,
      },
    });

    // Clean up local temp file
    fs.unlinkSync(outputFilePath);

    return {
      file: safeName,
      path: outputFilePath,
      s3Url,
      s3Key,
      audioFileId: audioFile.id,
    };
  } catch (error) {
    // Remove partial file on error
    if (fs.existsSync(outputFilePath)) {
      fs.unlinkSync(outputFilePath);
    }
    throw error;
  }
};
