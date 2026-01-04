import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Mail, Shield, User, Calendar, Building, Clock } from 'lucide-react';
import { ProfileWithRole } from '@/hooks/useProfiles';

interface UserProfileDialogProps {
    user: ProfileWithRole | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    componentName?: string | null;
}

export function UserProfileDialog({ user, open, onOpenChange, componentName }: UserProfileDialogProps) {
    if (!user) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                            {user.role === 'admin' ? (
                                <Shield className="h-5 w-5 text-primary" />
                            ) : (
                                <User className="h-5 w-5 text-primary" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-semibold leading-tight">{user.full_name}</span>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="w-fit mt-1">
                                {user.role === 'admin' ? 'Administrator' : 'Member'}
                            </Badge>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Account Information</h4>
                        <div className="grid gap-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Email:</span>
                                <span className="text-foreground">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Joined:</span>
                                <span className="text-foreground">{formatDate(user.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Last Updated:</span>
                                <span className="text-foreground">{formatDate(user.updated_at)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Organization</h4>
                        <div className="flex items-center gap-3 text-sm p-3 bg-accent/50 rounded-lg">
                            <Building className="h-4 w-4 text-primary" />
                            <div>
                                <p className="font-medium text-foreground">Assigned Component</p>
                                <p className="text-muted-foreground">{componentName || 'No component assigned'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Security & Access</h4>
                        <div className="flex items-center gap-3 text-sm p-3 bg-accent/50 rounded-lg">
                            <Shield className="h-4 w-4 text-primary" />
                            <div>
                                <p className="font-medium text-foreground">System Role</p>
                                <p className="text-muted-foreground">
                                    {user.role === 'admin'
                                        ? 'Full administrative access to manage users, components, and submissions.'
                                        : 'Standard member access to submit reports for assigned components.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
