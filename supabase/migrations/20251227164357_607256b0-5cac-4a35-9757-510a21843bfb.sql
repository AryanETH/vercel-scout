-- Add username column to profiles
ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;

-- Create index for faster username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Allow public to view profiles by username (for public profile pages)
CREATE POLICY "Anyone can view profiles by username"
ON public.profiles
FOR SELECT
USING (username IS NOT NULL);

-- Allow public to view favorites for public profile pages
CREATE POLICY "Anyone can view user favorites for public profiles"
ON public.favorites
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = favorites.user_id 
    AND profiles.username IS NOT NULL
  )
);