import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSignedUrl(filePath: string | undefined) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!filePath) {
      setSignedUrl(null);
      return;
    }

    // Extract the path from the full URL if needed
    let path = filePath;
    if (filePath.includes('/storage/v1/object/public/submissions/')) {
      path = filePath.split('/storage/v1/object/public/submissions/')[1];
    }

    const getSignedUrl = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: signedUrlError } = await supabase.storage
          .from('submissions')
          .createSignedUrl(path, 3600); // 1 hour expiry
        
        if (signedUrlError) throw signedUrlError;
        setSignedUrl(data.signedUrl);
      } catch (err) {
        setError(err as Error);
        console.error('Error getting signed URL:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getSignedUrl();
  }, [filePath]);

  return { signedUrl, isLoading, error };
}

export async function getSignedUrlAsync(fileUrl: string): Promise<string | null> {
  try {
    // Extract the path from the full URL
    let path = fileUrl;
    if (fileUrl.includes('/storage/v1/object/public/submissions/')) {
      path = fileUrl.split('/storage/v1/object/public/submissions/')[1];
    }
    
    const { data, error } = await supabase.storage
      .from('submissions')
      .createSignedUrl(path, 3600);
    
    if (error) throw error;
    return data.signedUrl;
  } catch (err) {
    console.error('Error getting signed URL:', err);
    return null;
  }
}
