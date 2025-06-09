import { s3, bucketName } from '../config/awsConfig';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

export const uploadLocalFileToS3 = async (localFilePath: string): Promise<{ key: string; url: string }> => {
  const fileId = uuidv4();
  const fileName = `audio-${fileId}.mp3`;
  const fileContent = fs.readFileSync(localFilePath);

  const params = {
    Bucket: bucketName,
    Key: `uploads/${fileName}`,
    Body: fileContent,
    ContentType: 'audio/mpeg',
  };

  const result = await s3.upload(params).promise();

  return {
    key: params.Key,
    url: result.Location,
  };
};

