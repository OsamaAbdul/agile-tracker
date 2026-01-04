import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export interface SystemMessage {
    id: string;
    user_id: string;
    subject: string;
    message: string;
    is_read: boolean;
    created_at: string;
    user?: {
        email: string;
        full_name: string;
    };
}

export function useSystemMessages() {
    const { isAdmin } = useAuth();
    const queryClient = useQueryClient();

    // Real-time for admins
    useEffect(() => {
        if (!isAdmin) return;

        const channel = supabase
            .channel('system-messages-admin')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'system_messages' },
                () => queryClient.invalidateQueries({ queryKey: ['system_messages'] })
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isAdmin, queryClient]);

    return useQuery({
        queryKey: ['system_messages'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('system_messages')
                .select(`
          *,
          user:profiles(email, full_name)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            // Map the nested profile data to a simpler structure if needed, or stick with joined response
            return data.map(msg => ({
                ...msg,
                user: msg.user
            })) as unknown as SystemMessage[];
        },
        enabled: !!isAdmin,
    });
}

export function useSendSystemMessage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ subject, message }: { subject: string; message: string }) => {
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('system_messages')
                .insert([{
                    user_id: user.id,
                    subject,
                    message,
                }]);

            if (error) throw error;
        },
        onSuccess: () => {
            toast({
                title: 'Message Sent',
                description: 'Your message has been sent to the administrators.',
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

export function useMarkSystemMessageRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('system_messages')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system_messages'] });
        },
    });
}
