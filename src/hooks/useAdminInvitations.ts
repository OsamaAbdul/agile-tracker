import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminInvitation {
  id: string;
  email: string;
  invited_by: string;
  token: string;
  used: boolean;
  expires_at: string;
  created_at: string;
}

export function useAdminInvitations() {
  return useQuery({
    queryKey: ['admin-invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_invitations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminInvitation[];
    },
  });
}

export function useCreateAdminInvitation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (email: string) => {
      if (!user) throw new Error('Not authenticated');
      
      // Check if invitation already exists
      const { data: existing } = await supabase
        .from('admin_invitations')
        .select('id')
        .eq('email', email)
        .eq('used', false)
        .maybeSingle();
      
      if (existing) {
        throw new Error('An active invitation already exists for this email');
      }
      
      const { data, error } = await supabase
        .from('admin_invitations')
        .insert([{
          email,
          invited_by: user.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as AdminInvitation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] });
      
      const inviteUrl = `${window.location.origin}/admin-setup?token=${data.token}`;
      
      toast({
        title: 'Invitation Created',
        description: 'Admin invitation link has been generated.',
      });
      
      return inviteUrl;
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteAdminInvitation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_invitations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] });
      toast({
        title: 'Invitation Deleted',
        description: 'The invitation has been removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
