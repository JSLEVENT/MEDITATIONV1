import { SafetyScreenResult } from '@serenity/shared';
import { classifySafety } from './claudeService';

const crisisKeywords = [
  'suicide',
  'self-harm',
  'kill myself',
  'end it all',
  'i want to die',
  'hurt myself'
];

const ambiguousKeywords = ['hopeless', 'worthless', 'no way out', 'give up'];

const crisisResources = [
  {
    title: '988 Suicide & Crisis Lifeline',
    phone: '988',
    url: 'https://988lifeline.org'
  },
  {
    title: 'Crisis Text Line',
    text: 'Text HOME to 741741'
  }
];

export const safetyScreener = async (input: string): Promise<SafetyScreenResult> => {
  const lower = input.toLowerCase();

  if (crisisKeywords.some((keyword) => lower.includes(keyword))) {
    return {
      status: 'alert',
      message: 'It sounds like you might be in crisis. Please reach out for immediate help.',
      resources: crisisResources
    };
  }

  if (ambiguousKeywords.some((keyword) => lower.includes(keyword))) {
    const classification = await classifySafety(input);
    if (classification === 'unsafe') {
      return {
        status: 'alert',
        message: 'It sounds like you might be in crisis. Please reach out for immediate help.',
        resources: crisisResources
      };
    }
  }

  return { status: 'ok' };
};
