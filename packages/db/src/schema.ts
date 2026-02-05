import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  pgEnum,
  index,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const subscriptionTierEnum = pgEnum('subscription_tier', [
  'free',
  'monthly',
  'annual',
  'enterprise'
]);

export const sessionStatusEnum = pgEnum('session_status', [
  'generating',
  'ready',
  'failed',
  'played',
  'archived'
]);

export const intensityEnum = pgEnum('session_intensity', ['low', 'medium', 'high']);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'cancelled',
  'past_due',
  'trialing'
]);

export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'free',
  'monthly',
  'annual',
  'enterprise'
]);

export const audioCategoryEnum = pgEnum('audio_category', ['frequency', 'nature', 'ambient']);

export const enterpriseRoleEnum = pgEnum('enterprise_role', ['admin', 'member']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    name: text('name'),
    subscription_tier: subscriptionTierEnum('subscription_tier').notNull().default('free'),
    stripe_customer_id: text('stripe_customer_id'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    emailUnique: uniqueIndex('users_email_unique').on(table.email)
  })
);

export const user_profiles = pgTable('user_profiles', {
  user_id: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  onboarding_answers: jsonb('onboarding_answers'),
  preferred_duration: integer('preferred_duration').notNull().default(15),
  preferred_voice: text('preferred_voice').notNull().default('therapeutic-calm'),
  preferred_frequency: text('preferred_frequency').notNull().default('528hz'),
  goals: text('goals').array()
});

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title'),
    status: sessionStatusEnum('status').notNull().default('generating'),
    duration_seconds: integer('duration_seconds'),
    audio_url: text('audio_url'),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    userIdIdx: index('sessions_user_id_idx').on(table.user_id)
  })
);

export const session_inputs = pgTable(
  'session_inputs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    session_id: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    raw_text: text('raw_text').notNull(),
    parsed_themes: jsonb('parsed_themes'),
    mood_score: integer('mood_score'),
    intensity: intensityEnum('intensity')
  },
  (table) => ({
    sessionIdIdx: index('session_inputs_session_id_idx').on(table.session_id)
  })
);

export const session_scripts = pgTable(
  'session_scripts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    session_id: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    full_script: text('full_script').notNull(),
    phases: jsonb('phases').notNull(),
    prompt_version: integer('prompt_version').notNull(),
    model_used: text('model_used').notNull(),
    token_count: integer('token_count').notNull()
  },
  (table) => ({
    sessionIdIdx: index('session_scripts_session_id_idx').on(table.session_id)
  })
);

export const session_feedback = pgTable(
  'session_feedback',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    session_id: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    helpful: boolean('helpful'),
    too_long: boolean('too_long'),
    too_short: boolean('too_short'),
    notes: text('notes')
  },
  (table) => ({
    sessionIdIdx: index('session_feedback_session_id_idx').on(table.session_id)
  })
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    stripe_subscription_id: text('stripe_subscription_id'),
    plan: subscriptionPlanEnum('plan').notNull().default('free'),
    status: subscriptionStatusEnum('status').notNull().default('active'),
    current_period_end: timestamp('current_period_end', { withTimezone: true })
  },
  (table) => ({
    userIdIdx: index('subscriptions_user_id_idx').on(table.user_id),
    stripeSubUnique: uniqueIndex('subscriptions_stripe_subscription_unique').on(
      table.stripe_subscription_id
    )
  })
);

export const audio_stems = pgTable('audio_stems', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  category: audioCategoryEnum('category').notNull(),
  frequency_hz: integer('frequency_hz'),
  duration_seconds: integer('duration_seconds').notNull(),
  r2_key: text('r2_key').notNull()
});

export const prompt_templates = pgTable('prompt_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  version: integer('version').notNull(),
  name: text('name').notNull(),
  system_prompt: text('system_prompt').notNull(),
  structure_template: text('structure_template').notNull(),
  safety_rails: text('safety_rails').notNull(),
  active: boolean('active').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const analytics_events = pgTable(
  'analytics_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    event_type: text('event_type').notNull(),
    properties: jsonb('properties'),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    userIdIdx: index('analytics_events_user_id_idx').on(table.user_id)
  })
);

export const enterprise_orgs = pgTable('enterprise_orgs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  admin_email: text('admin_email').notNull(),
  seat_count: integer('seat_count').notNull().default(0),
  stripe_subscription_id: text('stripe_subscription_id'),
  settings: jsonb('settings')
});

export const enterprise_members = pgTable(
  'enterprise_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    org_id: uuid('org_id')
      .notNull()
      .references(() => enterprise_orgs.id, { onDelete: 'cascade' }),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: enterpriseRoleEnum('role').notNull().default('member'),
    invited_at: timestamp('invited_at', { withTimezone: true }),
    joined_at: timestamp('joined_at', { withTimezone: true })
  },
  (table) => ({
    orgIdIdx: index('enterprise_members_org_id_idx').on(table.org_id),
    userIdIdx: index('enterprise_members_user_id_idx').on(table.user_id)
  })
);

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type UserProfile = InferSelectModel<typeof user_profiles>;
export type NewUserProfile = InferInsertModel<typeof user_profiles>;

export type Session = InferSelectModel<typeof sessions>;
export type NewSession = InferInsertModel<typeof sessions>;

export type SessionInput = InferSelectModel<typeof session_inputs>;
export type NewSessionInput = InferInsertModel<typeof session_inputs>;

export type SessionScript = InferSelectModel<typeof session_scripts>;
export type NewSessionScript = InferInsertModel<typeof session_scripts>;

export type SessionFeedback = InferSelectModel<typeof session_feedback>;
export type NewSessionFeedback = InferInsertModel<typeof session_feedback>;

export type Subscription = InferSelectModel<typeof subscriptions>;
export type NewSubscription = InferInsertModel<typeof subscriptions>;

export type AudioStem = InferSelectModel<typeof audio_stems>;
export type NewAudioStem = InferInsertModel<typeof audio_stems>;

export type PromptTemplateRow = InferSelectModel<typeof prompt_templates>;
export type NewPromptTemplateRow = InferInsertModel<typeof prompt_templates>;

export type AnalyticsEvent = InferSelectModel<typeof analytics_events>;
export type NewAnalyticsEvent = InferInsertModel<typeof analytics_events>;

export type EnterpriseOrg = InferSelectModel<typeof enterprise_orgs>;
export type NewEnterpriseOrg = InferInsertModel<typeof enterprise_orgs>;

export type EnterpriseMember = InferSelectModel<typeof enterprise_members>;
export type NewEnterpriseMember = InferInsertModel<typeof enterprise_members>;
