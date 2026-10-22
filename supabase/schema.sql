-- ==============================================================================
-- Supabase Schema: Smart Agriculture Web Portal
-- Authentication, User Profiles, and Row Level Security (RLS)
-- ==============================================================================

-- 1. Create the `profiles` table linked to `auth.users`
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  avatar_url TEXT,
  phone TEXT,
  farm_name TEXT DEFAULT 'Punjab Agro-Hub — Ludhiana (Alluvial Basin)',
  role TEXT DEFAULT 'Agricultural Lead & Farm Manager',
  theme TEXT DEFAULT 'light',
  audio_muted BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{"notifications": true, "autoIrrigationAlerts": true, "weatherAlerts": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookups by email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. Enable Row Level Security (RLS) on `profiles`
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Row Level Security Policies for `profiles`
-- Policy 1: Users can view only their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Users can update only their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 4: Users can delete their own profile
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- 4. Automatically create user profile when a new user registers in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    farm_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.email,
    COALESCE(new.raw_user_meta_data->>'farm_name', 'Punjab Agro-Hub — Ludhiana (Alluvial Basin)'),
    COALESCE(new.raw_user_meta_data->>'role', 'Agricultural Lead & Farm Manager'),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    updated_at = timezone('utc'::text, now());

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the profile creation on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Automatically manage `updated_at` timestamp on profile updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- Optional helper table for persistent farm activity / audit log per user
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- e.g. 'VALVE_TOGGLE', 'DISEASE_SCAN', 'AI_QUERY'
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
CREATE POLICY "Users can view own activities"
  ON public.user_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;
CREATE POLICY "Users can insert own activities"
  ON public.user_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 6. Plant Disease Detections Table and Storage Integration
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.plant_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  crop_type TEXT DEFAULT 'Crop Leaf Specimen',
  detected_disease TEXT,
  confidence NUMERIC(5,2),
  severity TEXT DEFAULT 'Moderate',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_plant_detections_user_id ON public.plant_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_plant_detections_created_at ON public.plant_detections(created_at DESC);

ALTER TABLE public.plant_detections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own plant detections" ON public.plant_detections;
CREATE POLICY "Users can view own plant detections"
  ON public.plant_detections FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own plant detections" ON public.plant_detections;
CREATE POLICY "Users can insert own plant detections"
  ON public.plant_detections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own plant detections" ON public.plant_detections;
CREATE POLICY "Users can update own plant detections"
  ON public.plant_detections FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own plant detections" ON public.plant_detections;
CREATE POLICY "Users can delete own plant detections"
  ON public.plant_detections FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_plant_detections_updated ON public.plant_detections;
CREATE TRIGGER on_plant_detections_updated
  BEFORE UPDATE ON public.plant_detections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Supabase Storage: Bucket & Object RLS Policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'plant-disease-images',
  'plant-disease-images',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE
SET public = false, file_size_limit = 10485760;

DROP POLICY IF EXISTS "Users can upload own plant images" ON storage.objects;
CREATE POLICY "Users can upload own plant images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'plant-disease-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view own plant images" ON storage.objects;
CREATE POLICY "Users can view own plant images"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'plant-disease-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own plant images" ON storage.objects;
CREATE POLICY "Users can delete own plant images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'plant-disease-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

