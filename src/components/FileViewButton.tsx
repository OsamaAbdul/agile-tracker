import { useState } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSignedUrlAsync } from '@/hooks/useSignedUrl';
import { useToast } from '@/hooks/use-toast';

interface FileViewButtonProps {
  fileUrl: string;
  variant?: 'ghost' | 'outline' | 'default';
  size?: 'icon' | 'sm' | 'default';
  className?: string;
}

export function FileViewButton({ fileUrl, variant = 'ghost', size = 'icon', className }: FileViewButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const signedUrl = await getSignedUrlAsync(fileUrl);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        toast({
          title: 'Error',
          description: 'Could not access file. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not access file. Please try again.',
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
      title="View File"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </Button>
  );
}
