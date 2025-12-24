-- Create daily_top_picks table to store rotating top picks
CREATE TABLE public.daily_top_picks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  snippet TEXT,
  platform TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ai', 'devtools', 'gems')),
  search_term TEXT,
  rank INTEGER DEFAULT 1,
  score DOUBLE PRECISION DEFAULT 0,
  favicon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_for_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Create index for efficient querying by date
CREATE INDEX idx_daily_top_picks_valid_date ON public.daily_top_picks(valid_for_date);
CREATE INDEX idx_daily_top_picks_category ON public.daily_top_picks(category);

-- Enable RLS
ALTER TABLE public.daily_top_picks ENABLE ROW LEVEL SECURITY;

-- Anyone can read daily picks (public data)
CREATE POLICY "Anyone can read daily picks"
  ON public.daily_top_picks
  FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (via edge function)
CREATE POLICY "Service role can manage daily picks"
  ON public.daily_top_picks
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;