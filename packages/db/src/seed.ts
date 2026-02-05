import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { audio_stems, prompt_templates, app_settings } from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing DATABASE_URL for seed');
}

const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function main() {
  await db.insert(prompt_templates).values({
    version: 1,
    name: 'v1-therapeutic-calm',
    system_prompt:
      'You are a calm, experienced meditation guide. Never diagnose. Never prescribe. Always validate emotions. Use second person (you/your). Pace: 1 sentence per 5 seconds of audio.',
    structure_template:
      'Phase 1 - Grounding (2 min): breathing exercise. Phase 2 - Acknowledgment (3 min): validate specific problems. Phase 3 - Reframe (5 min): guided visualization. Phase 4 - Integration (3 min): affirmations. Phase 5 - Return (2 min): gradual awareness restoration.',
    safety_rails:
      'NEVER suggest stopping medication. NEVER claim to cure conditions. If user mentions self-harm, output SAFETY_FLAG token and redirect to resources. Always include grounding techniques.',
    active: true
  });

  await db.insert(audio_stems).values([
    {
      name: '528hz',
      category: 'frequency',
      frequency_hz: 528,
      duration_seconds: 900,
      r2_key: 'stems/528hz.mp3'
    },
    {
      name: '432hz',
      category: 'frequency',
      frequency_hz: 432,
      duration_seconds: 900,
      r2_key: 'stems/432hz.mp3'
    },
    {
      name: 'rain',
      category: 'nature',
      duration_seconds: 900,
      r2_key: 'stems/rain.mp3'
    },
    {
      name: 'ocean',
      category: 'nature',
      duration_seconds: 900,
      r2_key: 'stems/ocean.mp3'
    },
    {
      name: 'forest',
      category: 'nature',
      duration_seconds: 900,
      r2_key: 'stems/forest.mp3'
    }
  ]);

  await db.insert(app_settings).values({
    key: 'tts_model',
    value: 'aura-asteria-en'
  });

  await pool.end();
  console.log('Seed data inserted');
}

main().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});
