import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MoreVertical, Mail, Shield, User, Loader2, UserPlus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { useProfiles, useSetUserRole, useDeleteUser } from '@/hooks/useProfiles';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserProfileDialog } from '@/components/UserProfileDialog';
import { ProfileWithRole } from '@/hooks/useProfiles';

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProfileWithRole | null>(null);
  const [userToDelete, setUserToDelete] = useState<ProfileWithRole | null>(null);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const { data: profiles, isLoading: isLoadingProfiles } = useProfiles();
  const { data: components } = useComponents();
  const setUserRole = useSetUserRole();
  const deleteUser = useDeleteUser();

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

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser.mutateAsync(userToDelete.id);
      setUserToDelete(null);
    } catch (error) {
      // Error handled by mutation
    }
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setUserToDelete(profile)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
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

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account for <span className="font-medium text-foreground">{userToDelete?.full_name}</span>.
              They will no longer be able to sign in or access any data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UserProfileDialog
        user={selectedUser}
        open={isViewProfileOpen}
        onOpenChange={setIsViewProfileOpen}
        componentName={selectedUser ? getComponentName(selectedUser.component_id) : null}
      />
    </DashboardLayout>
  );
}
