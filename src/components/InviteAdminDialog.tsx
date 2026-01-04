import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Loader2, Shield, Trash2 } from 'lucide-react';
import { useAdminInvitations, useCreateAdminInvitation, useDeleteAdminInvitation } from '@/hooks/useAdminInvitations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface InviteAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteAdminDialog({ open, onOpenChange }: InviteAdminDialogProps) {
  const [email, setEmail] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  
  const { data: invitations, isLoading } = useAdminInvitations();
  const createInvitation = useCreateAdminInvitation();
  const deleteInvitation = useDeleteAdminInvitation();
  const { toast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    const result = await createInvitation.mutateAsync(email.trim());
    if (result) {
      setEmail('');
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/admin-setup?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    toast({
      title: 'Link Copied',
      description: 'Invitation link copied to clipboard.',
    });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const activeInvitations = invitations?.filter(inv => !inv.used && new Date(inv.expires_at) > new Date()) || [];
  const expiredOrUsed = invitations?.filter(inv => inv.used || new Date(inv.expires_at) <= new Date()) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Invite New Admin
          </DialogTitle>
          <DialogDescription>
            Create an invitation link to register a new administrator
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Email address</Label>
            <div className="flex gap-2">
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@agile.gov.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={createInvitation.isPending}
              />
              <Button type="submit" disabled={!email.trim() || createInvitation.isPending}>
                {createInvitation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Invite'
                )}
              </Button>
            </div>
          </div>
        </form>

        {activeInvitations.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-foreground mb-3">Active Invitations</h4>
            <div className="space-y-2">
              {activeInvitations.map((inv, index) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Expires {new Date(inv.expires_at).toLocaleDateString('en-NG')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyInviteLink(inv.token)}
                    >
                      {copiedToken === inv.token ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteInvitation.mutate(inv.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {expiredOrUsed.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Used/Expired</h4>
            <div className="space-y-2">
              {expiredOrUsed.slice(0, 3).map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg opacity-60"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{inv.email}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {inv.used ? 'Used' : 'Expired'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
