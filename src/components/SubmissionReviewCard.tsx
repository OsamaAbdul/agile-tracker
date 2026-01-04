import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronDown, 
  FileText,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Submission } from '@/hooks/useSubmissions';
import { MONTHS } from '@/types';
import { cn } from '@/lib/utils';
import { getSignedUrlAsync } from '@/hooks/useSignedUrl';
import { useToast } from '@/hooks/use-toast';

interface SubmissionReviewCardProps {
  submission: Submission;
}

export function SubmissionReviewCard({ submission }: SubmissionReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const { toast } = useToast();
  
  const isReviewed = submission.reviewed_at !== null;
  const isApproved = submission.score !== null && submission.score >= 50;
  
  const getStatusInfo = () => {
    if (!isReviewed) {
      return {
        icon: Clock,
        label: 'Pending Review',
        color: 'text-muted-foreground',
        bg: 'bg-muted',
        border: 'border-border',
      };
    }
    if (isApproved) {
      return {
        icon: CheckCircle2,
        label: 'Approved',
        color: 'text-primary',
        bg: 'bg-primary/10',
        border: 'border-primary/20',
      };
    }
    return {
      icon: XCircle,
      label: 'Needs Revision',
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/20',
    };
  };
  
  const status = getStatusInfo();
  const StatusIcon = status.icon;

  const handleViewFile = async () => {
    setIsLoadingFile(true);
    try {
      const signedUrl = await getSignedUrlAsync(submission.file_url);
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
      setIsLoadingFile(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border overflow-hidden transition-all duration-200',
        status.border,
        isExpanded && 'shadow-lg'
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-4 p-4 text-left transition-colors',
          isExpanded ? status.bg : 'hover:bg-muted/50'
        )}
      >
        <div className={cn('p-2.5 rounded-xl', status.bg)}>
          <StatusIcon className={cn('h-5 w-5', status.color)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground">
              {MONTHS[submission.month - 1]} {submission.year}
            </p>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              status.bg,
              status.color
            )}>
              {status.label}
            </span>
            {submission.is_late && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 font-medium">
                Late
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {submission.file_name}
          </p>
        </div>
        
        {submission.score !== null && (
          <div className="text-right shrink-0">
            <p className={cn(
              'text-2xl font-bold',
              isApproved ? 'text-primary' : 'text-destructive'
            )}>
              {submission.score}
            </p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
        )}
        
        <ChevronDown className={cn(
          'h-5 w-5 text-muted-foreground transition-transform shrink-0',
          isExpanded && 'rotate-180'
        )} />
      </button>
      
      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              {/* Feedback */}
              {submission.feedback && (
                <div className={cn('p-4 rounded-xl', status.bg)}>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className={cn('h-4 w-4', status.color)} />
                    <p className={cn('text-sm font-semibold', status.color)}>
                      Reviewer Feedback
                    </p>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {submission.feedback}
                  </p>
                </div>
              )}
              
              {!isReviewed && (
                <div className="p-4 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground">
                    Your submission is currently being reviewed. You'll be notified once feedback is available.
                  </p>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewFile}
                  disabled={isLoadingFile}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isLoadingFile ? 'Loading...' : 'View Report'}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
              
              {/* Submission Details */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  Submitted: {new Date(submission.submitted_at).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {submission.reviewed_at && (
                  <p>
                    Reviewed: {new Date(submission.reviewed_at).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
