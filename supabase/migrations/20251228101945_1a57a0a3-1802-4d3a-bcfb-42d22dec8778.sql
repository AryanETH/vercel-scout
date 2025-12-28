-- Create bundles table for user-created website collections
CREATE TABLE public.bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'custom',
  websites JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT description_max_length CHECK (char_length(description) <= 100),
  CONSTRAINT websites_max_count CHECK (jsonb_array_length(websites) <= 10)
);

-- Enable Row Level Security
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;

-- Users can view their own bundles
CREATE POLICY "Users can view their own bundles"
ON public.bundles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can view public bundles
CREATE POLICY "Anyone can view public bundles"
ON public.bundles
FOR SELECT
USING (is_public = true);

-- Users can create their own bundles
CREATE POLICY "Users can create their own bundles"
ON public.bundles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bundles
CREATE POLICY "Users can update their own bundles"
ON public.bundles
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own bundles
CREATE POLICY "Users can delete their own bundles"
ON public.bundles
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_bundles_updated_at
BEFORE UPDATE ON public.bundles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();