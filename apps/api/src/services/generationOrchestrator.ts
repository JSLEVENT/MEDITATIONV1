import { db } from '../lib/db';
import {
  sessions,
  session_inputs,
  session_scripts,
  prompt_templates,
  audio_stems
} from '@serenity/db';
import { eq } from 'drizzle-orm';
import { intakeProcessor } from './intakeProcessor';
import { safetyScreener } from './safetyScreener';
import { generateScript } from './claudeService';
import { validateScript } from './scriptValidator';
import { PromptTemplate, SessionBrief } from '@serenity/shared';
import { generateAudio } from './audioPipeline';

const fallbackTemplate: PromptTemplate = {
  id: 'fallback',
  version: 1,
  name: 'fallback-therapeutic',
  system_prompt:
    'You are a calm, experienced meditation guide. Never diagnose. Never prescribe. Always validate emotions. Use second person (you/your). Pace: 1 sentence per 5 seconds of audio.',
  structure_template:
    'Phase 1 - Grounding (2 min): breathing exercise. Phase 2 - Acknowledgment (3 min): validate specific problems. Phase 3 - Reframe (5 min): guided visualization. Phase 4 - Integration (3 min): affirmations. Phase 5 - Return (2 min): gradual awareness restoration.',
  safety_rails:
    'NEVER suggest stopping medication. NEVER claim to cure conditions. If user mentions self-harm, output SAFETY_FLAG token and redirect to resources. Always include grounding techniques.',
  active: true
};

const getActiveTemplate = async () => {
  const [template] = await db.select().from(prompt_templates).where(eq(prompt_templates.active, true));
  if (!template) {
    return fallbackTemplate;
  }

  return {
    id: template.id,
    version: template.version,
    name: template.name,
    system_prompt: template.system_prompt,
    structure_template: template.structure_template,
    safety_rails: template.safety_rails,
    active: template.active
  } as PromptTemplate;
};

export const generationOrchestrator = async ({
  sessionId,
  rawText,
  durationMinutes,
  soundPreference
}: {
  sessionId: string;
  rawText: string;
  durationMinutes: number;
  soundPreference?: string;
}) => {
  try {
    const brief: SessionBrief = intakeProcessor(rawText, durationMinutes);

    await db.insert(session_inputs).values({
      session_id: sessionId,
      raw_text: brief.raw_text,
      parsed_themes: { themes: brief.themes, sound: soundPreference || '528hz' },
      mood_score: brief.mood_score,
      intensity: brief.intensity
    });

    const safety = await safetyScreener(rawText);
    if (safety.status === 'alert') {
      await db
        .update(session_inputs)
        .set({
          parsed_themes: {
            themes: brief.themes,
            sound: soundPreference || '528hz',
            safety_alert: true,
            resources: safety.resources
          }
        })
        .where(eq(session_inputs.session_id, sessionId));

      await db
        .update(sessions)
        .set({
          status: 'failed',
          title: 'Crisis support resources',
          duration_seconds: durationMinutes * 60
        })
        .where(eq(sessions.id, sessionId));
      return;
    }

    const template = await getActiveTemplate();
    const script = await generateScript(brief, template);
    const validation = validateScript(script, durationMinutes);

    if (!validation.valid) {
      await db
        .update(sessions)
        .set({
          status: 'failed',
          title: 'Session generation failed',
          duration_seconds: durationMinutes * 60
        })
        .where(eq(sessions.id, sessionId));
      return;
    }

    const fullScript = script.phases.map((phase) => phase.script_text).join('\n\n');
    const tokenCount = fullScript.split(/\s+/).filter(Boolean).length;

    await db.insert(session_scripts).values({
      session_id: sessionId,
      full_script: fullScript,
      phases: script.phases,
      prompt_version: template.version,
      model_used: 'claude-sonnet-4-5-20250929',
      token_count: tokenCount
    });

    let audioUrl: string | null = null;
    const ttsModel = process.env.DEEPGRAM_MODEL || 'aura-asteria-en';

    if (process.env.DEEPGRAM_API_KEY && process.env.R2_BUCKET_NAME) {
      try {
        const [stem] = await db
          .select()
          .from(audio_stems)
          .where(eq(audio_stems.name, soundPreference || '528hz'));

        if (stem?.r2_key) {
          const audio = await generateAudio({
            script,
            ttsModel,
            backgroundStemKey: stem.r2_key,
            targetDurationSeconds: durationMinutes * 60,
            sessionId
          });
          audioUrl = audio.url;
        }
      } catch (error) {
        audioUrl = null;
      }
    }

    await db
      .update(sessions)
      .set({
        status: 'ready',
        title: script.title,
        duration_seconds: Math.round(script.duration_estimate * 60),
        audio_url: audioUrl
      })
      .where(eq(sessions.id, sessionId));
  } catch (error) {
    await db
      .update(sessions)
      .set({
        status: 'failed',
        title: 'Session generation failed'
      })
      .where(eq(sessions.id, sessionId));

    throw error;
  }
};
