import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Shield, User, MessageSquare } from 'lucide-react';
import { useSubmissionMessages, useAddSubmissionMessage } from '@/hooks/useSubmissionMessages';
import { useAuth } from '@/contexts/AuthContext';
import { Submission } from '@/hooks/useSubmissions';
import { MONTHS } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SubmissionFeedbackDialogProps {
  submission: Submission | null;
  componentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmissionFeedbackDialog({
  submission,
  componentName,
  open,
  onOpenChange,
}: SubmissionFeedbackDialogProps) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useAuth();
  
  const { data: messages, isLoading } = useSubmissionMessages(submission?.id);
  const addMessage = useAddSubmissionMessage();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !submission) return;
    
    await addMessage.mutateAsync({
      submissionId: submission.id,
      message: message.trim(),
    });
    
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!submission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Submission Feedback
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {componentName} — {MONTHS[submission.month - 1]} {submission.year}
          </p>
          {submission.score !== null && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Score:</span>
              <span className="font-semibold text-primary">{submission.score}/100</span>
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="py-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : messages && messages.length > 0 ? (
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex gap-3 ${msg.is_admin ? '' : 'flex-row-reverse'}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.is_admin ? 'bg-primary' : 'bg-secondary'
                    }`}>
                      {msg.is_admin ? (
                        <Shield className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <User className="h-4 w-4 text-secondary-foreground" />
                      )}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${msg.is_admin ? '' : 'text-right'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground">
                          {msg.user_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className={`inline-block rounded-lg px-4 py-2 text-sm ${
                        msg.is_admin 
                          ? 'bg-primary/10 text-foreground' 
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation about this submission</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-border">
          <div className="flex gap-2">
            <Textarea
              placeholder={isAdmin ? "Add feedback for the component..." : "Reply to feedback..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className="resize-none"
            />
            <Button
              size="icon"
              className="h-auto"
              onClick={handleSend}
              disabled={!message.trim() || addMessage.isPending}
            >
              {addMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
