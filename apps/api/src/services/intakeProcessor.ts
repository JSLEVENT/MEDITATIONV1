import { SessionBrief, SessionIntensity } from '@serenity/shared';

const themeKeywords: Record<string, string[]> = {
  anxiety: ['anxious', 'anxiety', 'panic', 'nervous', 'worried', 'worry'],
  sleep: ['sleep', 'insomnia', 'tired', 'restless', 'nightmare'],
  work: ['work', 'job', 'career', 'deadline', 'burnout', 'boss'],
  relationship: ['relationship', 'partner', 'breakup', 'divorce', 'love', 'lonely'],
  grief: ['grief', 'loss', 'mourning', 'passed away'],
  focus: ['focus', 'concentrate', 'distracted', 'adhd'],
  self_esteem: ['self-esteem', 'confidence', 'insecure', 'self worth'],
  health: ['health', 'illness', 'pain', 'chronic', 'body']
};

const intensitySignals: Record<SessionIntensity, string[]> = {
  high: ['panic', 'overwhelmed', 'can\'t cope', 'hopeless', 'desperate', 'terrified'],
  medium: ['stressed', 'worried', 'anxious', 'tense', 'restless'],
  low: ['uneasy', 'mild', 'a bit', 'somewhat']
};

const scoreIntensity = (text: string): SessionIntensity => {
  const lower = text.toLowerCase();

  if (intensitySignals.high.some((word) => lower.includes(word))) {
    return 'high';
  }

  if (intensitySignals.medium.some((word) => lower.includes(word))) {
    return 'medium';
  }

  return 'low';
};

const estimateMoodScore = (intensity: SessionIntensity): number => {
  switch (intensity) {
    case 'high':
      return 8;
    case 'medium':
      return 5;
    default:
      return 3;
  }
};

export const intakeProcessor = (rawText: string, durationMinutes: number): SessionBrief => {
  const lower = rawText.toLowerCase();
  const themes = Object.entries(themeKeywords)
    .filter(([, keywords]) => keywords.some((keyword) => lower.includes(keyword)))
    .map(([theme]) => theme);

  const intensity = scoreIntensity(rawText);

  return {
    raw_text: rawText,
    themes: themes.length ? themes : ['general stress'],
    mood_score: estimateMoodScore(intensity),
    intensity,
    duration_minutes: durationMinutes
  };
};
