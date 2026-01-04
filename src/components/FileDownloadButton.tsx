import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSignedUrlAsync } from '@/hooks/useSignedUrl';
import { useToast } from '@/hooks/use-toast';

interface FileDownloadButtonProps {
  fileUrl: string;
  fileName: string;
  variant?: 'ghost' | 'outline' | 'default';
  size?: 'icon' | 'sm' | 'default';
  className?: string;
}

export function FileDownloadButton({ fileUrl, fileName, variant = 'ghost', size = 'icon', className }: FileDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const signedUrl = await getSignedUrlAsync(fileUrl);
      if (signedUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = signedUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast({
          title: 'Error',
          description: 'Could not download file. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not download file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      onClick={handleClick}
      disabled={isLoading}
      title="Download"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}
