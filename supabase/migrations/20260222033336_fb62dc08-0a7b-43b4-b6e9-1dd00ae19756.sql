
-- Drop restrictive SELECT policies
DROP POLICY "Anyone can view user favorites for public profiles" ON public.favorites;
DROP POLICY "Users can view their own favorites" ON public.favorites;
DROP POLICY "Users can add their own favorites" ON public.favorites;
DROP POLICY "Users can delete their own favorites" ON public.favorites;

-- Recreate as PERMISSIVE (default) so they use OR logic
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view user favorites for public profiles"
  ON public.favorites FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = favorites.user_id
    AND profiles.username IS NOT NULL
  ));

CREATE POLICY "Users can add their own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);
