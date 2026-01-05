import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Phone, Users, MoreVertical, Plus, Copy, Link, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { useComponents, useCreateComponent, useUpdateComponent, useDeleteComponent, Component } from '@/hooks/useComponents';
import { ComponentSubmissionsDialog } from '@/components/ComponentSubmissionsDialog';
import { ComponentMembersDialog } from '@/components/ComponentMembersDialog';
import { useProfiles } from '@/hooks/useProfiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function Components() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [viewingSubmissionsComponent, setViewingSubmissionsComponent] = useState<Component | null>(null);
  const [viewingMembersComponent, setViewingMembersComponent] = useState<Component | null>(null);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);

  // Form states
  const [newComponent, setNewComponent] = useState({ name: '', email: '', phone: '' });
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [deletingComponent, setDeletingComponent] = useState<Component | null>(null);

  const { data: components, isLoading } = useComponents();

  const { data: profiles } = useProfiles();
  const createComponent = useCreateComponent();
  const updateComponent = useUpdateComponent();
  const deleteComponent = useDeleteComponent();
  const { toast } = useToast();

  const filteredComponents = components?.filter(component =>
    component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getMemberCount = (componentId: string) => {
    return profiles?.filter(p => p.component_id === componentId).length || 0;
  };

  const handleCreateComponent = async () => {
    if (!newComponent.name) {
      toast({
        title: 'Validation Error',
        description: 'Please enter component name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createComponent.mutateAsync(newComponent);
      setNewComponent({ name: '', email: '', phone: '' });
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };
  const handleUpdateComponent = async () => {
    if (!editingComponent || !editForm.name) return;

    try {
      await updateComponent.mutateAsync({
        id: editingComponent.id,
        name: editForm.name,
        email: editForm.email || null,
        phone: editForm.phone || null,
      });
      setIsEditDialogOpen(false);
      setEditingComponent(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openEditDialog = (component: Component) => {
    setEditingComponent(component);
    setEditForm({
      name: component.name,
      email: component.email || '',
      phone: component.phone || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteComponent = async () => {
    if (!deletingComponent) return;

    try {
      await deleteComponent.mutateAsync(deletingComponent.id);
      setDeletingComponent(null);
    } catch (error) {
      // Error handled by mutation
    }
  };


  const copyRegistrationLink = (component: Component) => {
    const link = `${window.location.origin}/auth?token=${component.registration_token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copied',
      description: 'Registration link has been copied to clipboard.',
    });
  };

  if (isLoading) {
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
        title="Components"
        description="Manage all AGILE program components"
      >
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Component
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Component</DialogTitle>
              <DialogDescription>
                Create a new AGILE program component.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Component Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Education Support Unit"
                  value={newComponent.name}
                  onChange={(e) => setNewComponent(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., education@agile.gov.ng"
                  value={newComponent.email}
                  onChange={(e) => setNewComponent(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +234 803 123 4567"
                  value={newComponent.phone}
                  onChange={(e) => setNewComponent(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleCreateComponent} disabled={createComponent.isPending} className="w-full sm:w-auto">
                {createComponent.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Component'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Search */}
      <div className="mb-6">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Components - Mobile Cards / Desktop Table */}
      <div className="lg:hidden space-y-3">
        {filteredComponents.map((component, index) => (
          <motion.div
            key={component.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="premium-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary">
                    {component.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{component.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{component.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => copyRegistrationLink(component)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Registration Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setViewingMembersComponent(component);
                  }}>
                    View Members
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setViewingSubmissionsComponent(component);
                  }}>
                    View Submissions
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openEditDialog(component)}>
                    Edit Component
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeletingComponent(component)}
                  >
                    Delete Component
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{getMemberCount(component.id)} members</span>
              </div>
              {component.phone && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="truncate">{component.phone}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden lg:block premium-card overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="data-table-header">Component Name</TableHead>
              <TableHead className="data-table-header">Contact Email</TableHead>
              <TableHead className="data-table-header">Phone</TableHead>
              <TableHead className="data-table-header">Members</TableHead>
              <TableHead className="data-table-header">Registered</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComponents.map((component, index) => (
              <motion.tr
                key={component.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-border last:border-0"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {component.name.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium text-foreground">{component.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{component.email || '—'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{component.phone || '—'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{getMemberCount(component.id)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(component.created_at).toLocaleDateString('en-NG', {
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
                      <DropdownMenuItem onClick={() => copyRegistrationLink(component)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Registration Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setViewingMembersComponent(component);
                      }}>
                        View Members
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setViewingSubmissionsComponent(component);
                      }}>
                        View Submissions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(component)}>
                        Edit Component
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeletingComponent(component)}
                      >
                        Delete Component
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      {/* Registration Link Dialog */}
      {selectedComponent && (
        <Dialog open={!!selectedComponent} onOpenChange={() => setSelectedComponent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registration Link</DialogTitle>
              <DialogDescription>
                Share this link with members of {selectedComponent.name} to allow them to register.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
                <Link className="h-4 w-4 text-muted-foreground shrink-0" />
                <code className="text-sm flex-1 truncate">
                  {`${window.location.origin}/auth?token=${selectedComponent.registration_token}`}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyRegistrationLink(selectedComponent)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Component Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Component</DialogTitle>
            <DialogDescription>
              Update component details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Component Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Contact Email (Optional)</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number (Optional)</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleUpdateComponent} disabled={updateComponent.isPending} className="w-full sm:w-auto">
              {updateComponent.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submissions Dialog */}
      <ComponentSubmissionsDialog
        open={!!viewingSubmissionsComponent}
        onOpenChange={(open) => !open && setViewingSubmissionsComponent(null)}
        componentId={viewingSubmissionsComponent?.id || null}
        componentName={viewingSubmissionsComponent?.name || ''}
      />

      {/* Members Dialog */}
      <ComponentMembersDialog
        open={!!viewingMembersComponent}
        onOpenChange={(open) => !open && setViewingMembersComponent(null)}
        componentId={viewingMembersComponent?.id || null}
        componentName={viewingMembersComponent?.name || ''}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingComponent} onOpenChange={() => setDeletingComponent(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Component</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">{deletingComponent?.name}</span>?
              This action cannot be undone and will delete all associated data including submissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeletingComponent(null)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteComponent}
              disabled={deleteComponent.isPending}
              className="w-full sm:w-auto"
            >
              {deleteComponent.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Component'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
