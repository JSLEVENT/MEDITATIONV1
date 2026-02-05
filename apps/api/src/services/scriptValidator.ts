import { MeditationScript } from '@serenity/shared';

const requiredPhases = ['ground', 'acknowledg', 'reframe', 'integrat', 'return'];

const prohibitedPhrases = [
  'diagnose',
  'prescribe',
  'medication',
  'cure',
  'treatment plan'
];

export const validateScript = (script: MeditationScript, durationMinutes: number) => {
  const errors: string[] = [];

  const phaseNames = script.phases.map((phase) => phase.name.toLowerCase());

  requiredPhases.forEach((phaseToken) => {
    if (!phaseNames.some((name) => name.includes(phaseToken))) {
      errors.push(`Missing phase: ${phaseToken}`);
    }
  });

  const fullText = script.phases.map((phase) => phase.script_text).join(' ');
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  const minWords = Math.max(Math.round(durationMinutes * 120), 800);
  const maxWords = Math.round(durationMinutes * 300);

  if (wordCount < minWords || wordCount > maxWords) {
    errors.push(`Word count out of bounds: ${wordCount} (expected ${minWords}-${maxWords})`);
  }

  const lowerText = fullText.toLowerCase();
  prohibitedPhrases.forEach((phrase) => {
    if (lowerText.includes(phrase)) {
      errors.push(`Prohibited phrase detected: ${phrase}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};
