-- Add UPDATE policy for favorites table to support upsert operations
CREATE POLICY "Users can update their own favorites"
ON public.favorites
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
