import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface SubmissionMessage {
  id: string;
  submission_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  user_name?: string;
}

export function useSubmissionMessages(submissionId: string | undefined) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['submission-messages', submissionId],
    queryFn: async () => {
      if (!submissionId) return [];
      
      const { data, error } = await supabase
        .from('submission_messages')
        .select('*')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Fetch user names for messages
      const userIds = [...new Set(data.map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
      
      return data.map(msg => ({
        ...msg,
        user_name: profileMap.get(msg.user_id) || 'Unknown User'
      })) as SubmissionMessage[];
    },
    enabled: !!submissionId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!submissionId) return;

    const channel = supabase
      .channel(`submission-messages-${submissionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submission_messages',
          filter: `submission_id=eq.${submissionId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['submission-messages', submissionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [submissionId, queryClient]);

  return query;
}

export function useAddSubmissionMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ submissionId, message }: { submissionId: string; message: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('submission_messages')
        .insert([{
          submission_id: submissionId,
          user_id: user.id,
          message,
          is_admin: isAdmin
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { submissionId }) => {
      queryClient.invalidateQueries({ queryKey: ['submission-messages', submissionId] });
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

export function useUnreadMessages(submissionIds: string[]) {
  return useQuery({
    queryKey: ['unread-messages', submissionIds],
    queryFn: async () => {
      if (submissionIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('submission_messages')
        .select('submission_id')
        .in('submission_id', submissionIds);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach(msg => {
        counts[msg.submission_id] = (counts[msg.submission_id] || 0) + 1;
      });
      
      return counts;
    },
    enabled: submissionIds.length > 0,
  });
}
