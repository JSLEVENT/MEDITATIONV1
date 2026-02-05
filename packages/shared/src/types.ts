export type SessionIntensity = 'low' | 'medium' | 'high';

export type SessionStatus = 'generating' | 'ready' | 'failed' | 'played' | 'archived';

export type SubscriptionPlan = 'free' | 'monthly' | 'annual' | 'enterprise';

export type MeditationPhase = {
  name: string;
  duration_seconds: number;
  script_text: string;
  pacing_note?: string;
};

export type MeditationScript = {
  title: string;
  duration_estimate: number;
  phases: MeditationPhase[];
  tags: string[];
  mood_target: string;
};

export type PromptTemplate = {
  id: string;
  version: number;
  name: string;
  system_prompt: string;
  structure_template: string;
  safety_rails: string;
  active: boolean;
};

export type SessionBrief = {
  raw_text: string;
  themes: string[];
  mood_score: number;
  intensity: SessionIntensity;
  duration_minutes: number;
  preferred_voice?: string;
  preferred_frequency?: string;
};

export type UserProfile = {
  user_id: string;
  onboarding_answers: Record<string, unknown> | null;
  preferred_duration: number;
  preferred_voice: string;
  preferred_frequency: string;
  goals: string[] | null;
};

export type SessionRecord = {
  id: string;
  user_id: string;
  title: string | null;
  status: SessionStatus;
  duration_seconds: number | null;
  audio_url: string | null;
  created_at: string;
};

export type SessionInputRecord = {
  id: string;
  session_id: string;
  raw_text: string;
  parsed_themes: Record<string, unknown> | null;
  mood_score: number | null;
  intensity: SessionIntensity | null;
};

export type SessionScriptRecord = {
  id: string;
  session_id: string;
  full_script: string;
  phases: MeditationPhase[];
  prompt_version: number;
  model_used: string;
  token_count: number;
};

export type SessionFeedbackRecord = {
  id: string;
  session_id: string;
  user_id: string;
  rating: number;
  helpful: boolean | null;
  too_long: boolean | null;
  too_short: boolean | null;
  notes: string | null;
};

export type CrisisResource = {
  title: string;
  phone?: string;
  text?: string;
  url?: string;
};

export type SafetyScreenResult =
  | { status: 'ok' }
  | { status: 'alert'; message: string; resources: CrisisResource[] };
