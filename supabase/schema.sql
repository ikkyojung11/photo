-- Supabase SQL Schema for SakuraFilm Presets Studio
-- Run this in your Supabase SQL Editor to enable cloud preset sharing

CREATE TABLE IF NOT EXISTS presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- Allow public read access to presets
CREATE POLICY "Public presets are viewable by everyone" 
  ON presets FOR SELECT 
  USING (true);

-- Allow public insertion of presets
CREATE POLICY "Anyone can create presets" 
  ON presets FOR INSERT 
  WITH CHECK (true);
