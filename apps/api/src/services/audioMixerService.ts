import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
}

const writeTempFile = async (prefix: string, data: Buffer) => {
  const filePath = path.join(os.tmpdir(), `${prefix}-${Date.now()}-${Math.random()}.mp3`);
  await fs.writeFile(filePath, data);
  return filePath;
};

const cleanupFiles = async (paths: string[]) => {
  await Promise.all(
    paths.map(async (filePath) => {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // ignore cleanup errors
      }
    })
  );
};

export const mixAudio = async (
  voiceBuffer: Buffer,
  backgroundBuffer: Buffer,
  targetDurationSeconds: number
): Promise<Buffer> => {
  const voicePath = await writeTempFile('voice', voiceBuffer);
  const backgroundPath = await writeTempFile('background', backgroundBuffer);
  const outputPath = path.join(os.tmpdir(), `mix-${Date.now()}-${Math.random()}.mp3`);

  const fadeOutStart = Math.max(targetDurationSeconds - 5, 0);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(voicePath)
      .input(backgroundPath)
      .inputOptions(['-stream_loop', '-1'])
      .outputOptions([
        '-filter_complex',
        `[1:a]volume=0.125[bg];[0:a][bg]amix=inputs=2:duration=shortest,afade=t=in:st=0:d=5,afade=t=out:st=${fadeOutStart}:d=5,loudnorm=I=-16:TP=-1.5:LRA=11[mix]`,
        '-map',
        '[mix]',
        '-t',
        `${targetDurationSeconds}`,
        '-b:a',
        '128k'
      ])
      .audioCodec('libmp3lame')
      .on('error', async (err) => {
        await cleanupFiles([voicePath, backgroundPath, outputPath]);
        reject(err);
      })
      .on('end', async () => {
        try {
          const outputBuffer = await fs.readFile(outputPath);
          await cleanupFiles([voicePath, backgroundPath, outputPath]);
          resolve(outputBuffer);
        } catch (error) {
          await cleanupFiles([voicePath, backgroundPath, outputPath]);
          reject(error);
        }
      })
      .save(outputPath);
  });
};
