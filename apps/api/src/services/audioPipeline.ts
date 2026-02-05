import { MeditationScript } from '@serenity/shared';
import { synthesizeSpeech } from './deepgramService';
import { downloadStem, uploadAudio } from './storageService';
import { mixAudio } from './audioMixerService';

export const generateAudio = async ({
  script,
  ttsModel,
  backgroundStemKey,
  targetDurationSeconds,
  sessionId
}: {
  script: MeditationScript;
  ttsModel: string;
  backgroundStemKey: string;
  targetDurationSeconds: number;
  sessionId: string;
}) => {
  const text = script.phases.map((phase) => phase.script_text).join('\n\n');
  const voiceBuffer = await synthesizeSpeech(text, ttsModel);
  const backgroundBuffer = await downloadStem(backgroundStemKey);
  const mixedBuffer = await mixAudio(voiceBuffer, backgroundBuffer, targetDurationSeconds);
  const key = `sessions/${sessionId}.mp3`;
  const url = await uploadAudio(mixedBuffer, key);
  return { url, key };
};
