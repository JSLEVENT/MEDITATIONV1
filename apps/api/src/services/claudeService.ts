import Anthropic from '@anthropic-ai/sdk';
import { MeditationScript, PromptTemplate, SessionBrief } from '@serenity/shared';

const apiKey = process.env.ANTHROPIC_API_KEY || '';

const anthropic = apiKey
  ? new Anthropic({
      apiKey
    })
  : null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const extractJson = (text: string) => {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) {
    return trimmed;
  }

  const match = trimmed.match(/```json([\s\S]*?)```/i) || trimmed.match(/```([\s\S]*?)```/);
  if (match) {
    return match[1].trim();
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
};

const buildPrompt = (template: PromptTemplate, sessionBrief: SessionBrief, userHistory?: string) => {
  const contextBlock = [
    `User is dealing with: ${sessionBrief.themes.join(', ') || 'general stress'}.`,
    `User input: ${sessionBrief.raw_text}.`,
    `Intensity: ${sessionBrief.intensity}.`,
    `Duration target: ${sessionBrief.duration_minutes} minutes.`,
    userHistory ? `Session history: ${userHistory}.` : ''
  ]
    .filter(Boolean)
    .join('\n');

  return [
    template.system_prompt,
    '\n---\n',
    'User Context:',
    contextBlock,
    '\n---\n',
    'Script Structure:',
    template.structure_template,
    '\n---\n',
    'Safety Rails:',
    template.safety_rails,
    '\n---\n',
    'Output Format:',
    'Respond in JSON: { title, duration_estimate, phases: [{ name, duration_seconds, script_text, pacing_note }], tags, mood_target }'
  ].join('\n');
};

export const generateScript = async (
  sessionBrief: SessionBrief,
  promptTemplate: PromptTemplate,
  userHistory?: string
): Promise<MeditationScript> => {
  if (!anthropic) {
    throw new Error('Missing ANTHROPIC_API_KEY');
  }

  const prompt = buildPrompt(promptTemplate, sessionBrief, userHistory);
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content
        .map((item) => ('text' in item ? item.text : ''))
        .join('\n');

      const jsonString = extractJson(content);
      const parsed = JSON.parse(jsonString) as MeditationScript;

      return parsed;
    } catch (error) {
      lastError = error;
      const backoff = 500 * Math.pow(2, attempt - 1);
      await sleep(backoff);
    }
  }

  throw lastError || new Error('Failed to generate script');
};

export const classifySafety = async (input: string): Promise<'safe' | 'unsafe' | 'unknown'> => {
  if (!anthropic) {
    return 'unknown';
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 200,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content:
            `Classify if the following user input indicates imminent self-harm or suicidal intent. Reply only with SAFE or UNSAFE.\n\nInput: ${input}`
        }
      ]
    });

    const content = response.content
      .map((item) => ('text' in item ? item.text : ''))
      .join(' ')
      .toLowerCase();

    if (content.includes('unsafe')) {
      return 'unsafe';
    }

    if (content.includes('safe')) {
      return 'safe';
    }

    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
};
