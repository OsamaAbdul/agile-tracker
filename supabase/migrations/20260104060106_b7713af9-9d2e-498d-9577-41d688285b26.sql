-- Drop the conflicting policy if it exists and recreate admin access
DROP POLICY IF EXISTS "Admins can access all files" ON storage.objects;

CREATE POLICY "Admins can access all submission files"
ON storage.objects FOR ALL
USING (bucket_id = 'submissions' AND has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'submissions' AND has_role(auth.uid(), 'admin'));