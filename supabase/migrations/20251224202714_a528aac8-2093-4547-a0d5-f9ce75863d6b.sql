-- Create table for indexed sites
CREATE TABLE public.indexed_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  platform TEXT NOT NULL,
  favicon_url TEXT,
  screenshot_url TEXT,
  indexed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  search_score FLOAT DEFAULT 0,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Create index for faster searches
CREATE INDEX idx_indexed_sites_platform ON public.indexed_sites(platform);
CREATE INDEX idx_indexed_sites_title_gin ON public.indexed_sites USING GIN(to_tsvector('english', title));
CREATE INDEX idx_indexed_sites_content_gin ON public.indexed_sites USING GIN(to_tsvector('english', COALESCE(content, '')));
CREATE INDEX idx_indexed_sites_tags ON public.indexed_sites USING GIN(tags);

-- Create table for search history (optional, for analytics)
CREATE TABLE public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  searched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.indexed_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Public read access for indexed sites (anyone can search)
CREATE POLICY "Anyone can read indexed sites"
ON public.indexed_sites
FOR SELECT
USING (true);

-- Public insert for search history (analytics)
CREATE POLICY "Anyone can log searches"
ON public.search_history
FOR INSERT
WITH CHECK (true);

-- Create full-text search function
CREATE OR REPLACE FUNCTION public.search_sites(search_query TEXT, platform_filter TEXT DEFAULT NULL, result_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  url TEXT,
  title TEXT,
  description TEXT,
  platform TEXT,
  favicon_url TEXT,
  search_score FLOAT,
  tags TEXT[],
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.url,
    s.title,
    s.description,
    s.platform,
    s.favicon_url,
    s.search_score,
    s.tags,
    ts_rank(
      setweight(to_tsvector('english', s.title), 'A') ||
      setweight(to_tsvector('english', COALESCE(s.description, '')), 'B') ||
      setweight(to_tsvector('english', COALESCE(s.content, '')), 'C'),
      plainto_tsquery('english', search_query)
    ) AS rank
  FROM public.indexed_sites s
  WHERE 
    (platform_filter IS NULL OR s.platform = platform_filter)
    AND (
      to_tsvector('english', s.title) @@ plainto_tsquery('english', search_query)
      OR to_tsvector('english', COALESCE(s.description, '')) @@ plainto_tsquery('english', search_query)
      OR to_tsvector('english', COALESCE(s.content, '')) @@ plainto_tsquery('english', search_query)
      OR s.title ILIKE '%' || search_query || '%'
      OR s.description ILIKE '%' || search_query || '%'
    )
  ORDER BY rank DESC, s.search_score DESC
  LIMIT result_limit;
END;
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_indexed_sites_updated_at
BEFORE UPDATE ON public.indexed_sites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();