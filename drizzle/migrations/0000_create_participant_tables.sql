-- Participant profile (team) data
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY,
  team_name TEXT NOT NULL DEFAULT '',
  team_id TEXT NOT NULL DEFAULT '',
  team_size TEXT NOT NULL DEFAULT '1',
  college TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  about TEXT NOT NULL DEFAULT '',
  motto TEXT NOT NULL DEFAULT '',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Participant progress (attempts, simulations, submissions, activity)
CREATE TABLE public.participant_state (
  user_id UUID PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.participant_state TO authenticated;
GRANT ALL ON public.participant_state TO service_role;

ALTER TABLE public.participant_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own state"
  ON public.participant_state FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own state"
  ON public.participant_state FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own state"
  ON public.participant_state FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Contact form messages
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a message"
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own messages"
  ON public.contact_messages FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
