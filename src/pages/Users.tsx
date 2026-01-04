import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MoreVertical, Mail, Shield, User, Loader2, UserPlus } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { useProfiles, useSetUserRole } from '@/hooks/useProfiles';
import { useComponents } from '@/hooks/useComponents';
import { InviteAdminDialog } from '@/components/InviteAdminDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserProfileDialog } from '@/components/UserProfileDialog';
import { ProfileWithRole } from '@/hooks/useProfiles';

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProfileWithRole | null>(null);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const { data: profiles, isLoading: isLoadingProfiles } = useProfiles();
  const { data: components } = useComponents();
  const setUserRole = useSetUserRole();

  const filteredUsers = profiles?.filter(profile =>
    profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getComponentName = (componentId: string | null) => {
    if (!componentId) return null;
    const component = components?.find(c => c.id === componentId);
    return component?.name;
  };

  const handleSetRole = async (userId: string, role: 'admin' | 'member') => {
    await setUserRole.mutateAsync({ userId, role });
  };

  if (isLoadingProfiles) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Users"
        description="Manage system users and their access"
      >
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Admin
        </Button>
      </PageHeader>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg shadow-sm"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="data-table-header">User</TableHead>
              <TableHead className="data-table-header">Email</TableHead>
              <TableHead className="data-table-header">Role</TableHead>
              <TableHead className="data-table-header">Component</TableHead>
              <TableHead className="data-table-header">Joined</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((profile, index) => {
              const componentName = getComponentName(profile.component_id);

              return (
                <motion.tr
                  key={profile.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border last:border-0"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                        {profile.role === 'admin' ? (
                          <Shield className="h-5 w-5 text-primary" />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <span className="font-medium text-foreground">{profile.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{profile.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                      {profile.role === 'admin' ? 'Administrator' : 'Member'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {componentName ? (
                      <span className="text-sm">{componentName}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedUser(profile);
                          setIsViewProfileOpen(true);
                        }}>
                          View Profile
                        </DropdownMenuItem>
                        {profile.role === 'member' ? (
                          <DropdownMenuItem onClick={() => handleSetRole(profile.id, 'admin')}>
                            Promote to Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSetRole(profile.id, 'member')}>
                            Demote to Member
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </motion.div>

      <InviteAdminDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />

      <UserProfileDialog
        user={selectedUser}
        open={isViewProfileOpen}
        onOpenChange={setIsViewProfileOpen}
        componentName={selectedUser ? getComponentName(selectedUser.component_id) : null}
      />
    </DashboardLayout>
  );
}
