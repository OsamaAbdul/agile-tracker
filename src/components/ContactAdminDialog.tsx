import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSendSystemMessage } from '@/hooks/useSystemMessages';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactAdminDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ContactAdminDialog({ open, onOpenChange }: ContactAdminDialogProps) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const sendMessage = useSendSystemMessage();
    const { toast } = useToast();

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please enter both a subject and a message.',
                variant: 'destructive',
            });
            return;
        }

        try {
            await sendMessage.mutateAsync({ subject, message });
            setSubject('');
            setMessage('');
            onOpenChange(false);
        } catch (error) {
            // Error handled by hook
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Contact Administrator</DialogTitle>
                    <DialogDescription>
                        Send a message to the system administrators.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            placeholder="e.g., Request for role change"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="Type your message here..."
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button onClick={handleSend} disabled={sendMessage.isPending} className="w-full sm:w-auto">
                        {sendMessage.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Message'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
