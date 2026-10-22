-- ==============================================================================
-- Migration: Plant Disease Detection Storage & History
-- ==============================================================================

-- 1. Create plant_detections table
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

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_plant_detections_user_id ON public.plant_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_plant_detections_created_at ON public.plant_detections(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.plant_detections ENABLE ROW LEVEL SECURITY;

-- RLS Policies on plant_detections
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

-- 2. Trigger for updated_at on plant_detections
DROP TRIGGER IF EXISTS on_plant_detections_updated ON public.plant_detections;
CREATE TRIGGER on_plant_detections_updated
  BEFORE UPDATE ON public.plant_detections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 3. Supabase Storage Bucket & Object RLS Policies
-- ==============================================================================
-- Insert the private bucket for plant disease images
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

-- Users can upload plant images only into their own user folder (auth.uid() / ...)
DROP POLICY IF EXISTS "Users can upload own plant images" ON storage.objects;
CREATE POLICY "Users can upload own plant images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'plant-disease-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can view only their own plant images
DROP POLICY IF EXISTS "Users can view own plant images" ON storage.objects;
CREATE POLICY "Users can view own plant images"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'plant-disease-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete only their own plant images
DROP POLICY IF EXISTS "Users can delete own plant images" ON storage.objects;
CREATE POLICY "Users can delete own plant images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'plant-disease-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
