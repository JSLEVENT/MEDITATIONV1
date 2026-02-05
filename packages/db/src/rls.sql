-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_members ENABLE ROW LEVEL SECURITY;

-- Users can only access their own rows
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_select_own" ON user_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "profiles_update_own" ON user_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "profiles_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "sessions_select_own" ON sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "sessions_insert_own" ON sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "sessions_update_own" ON sessions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "session_inputs_select_own" ON session_inputs
  FOR SELECT USING (session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid()));

CREATE POLICY "session_inputs_insert_own" ON session_inputs
  FOR INSERT WITH CHECK (session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid()));

CREATE POLICY "session_scripts_select_own" ON session_scripts
  FOR SELECT USING (session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid()));

CREATE POLICY "session_scripts_insert_own" ON session_scripts
  FOR INSERT WITH CHECK (session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid()));

CREATE POLICY "session_feedback_select_own" ON session_feedback
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "session_feedback_insert_own" ON session_feedback
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "subscriptions_update_own" ON subscriptions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "analytics_select_own" ON analytics_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "analytics_insert_own" ON analytics_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Enterprise members scoped to org
CREATE POLICY "enterprise_members_select_own" ON enterprise_members
  FOR SELECT USING (user_id = auth.uid());
