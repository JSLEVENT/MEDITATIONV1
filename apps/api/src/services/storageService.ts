import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl as presignUrl } from '@aws-sdk/s3-request-presigner';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
  // Allow module load for non-audio environments.
}

const client = accountId
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || ''
      }
    })
  : null;

export const uploadAudio = async (buffer: Buffer, key: string) => {
  if (!client || !bucket) {
    throw new Error('Missing R2 configuration');
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: 'audio/mpeg'
    })
  );

  if (publicUrl) {
    return `${publicUrl}/${key}`;
  }

  return key;
};

export const getSignedAudioUrl = async (key: string, expiresIn = 3600) => {
  if (!client || !bucket) {
    throw new Error('Missing R2 configuration');
  }

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  });

  return presignUrl(client, command, { expiresIn });
};

export const downloadStem = async (key: string) => {
  if (!client || !bucket) {
    throw new Error('Missing R2 configuration');
  }

  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key
    })
  );

  if (!response.Body) {
    throw new Error('Missing stem body');
  }

  const chunks: Buffer[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};
