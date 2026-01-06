import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemSetting {
    id: string;
    key: string;
    value: string;
    description: string;
    updated_at: string;
}

export function useSettings() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: settings, isLoading } = useQuery({
        queryKey: ['system_settings'],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('system_settings')
                .select('*');

            if (error) throw error;
            return data as SystemSetting[];
        }
    });

    const updateSetting = useMutation({
        mutationFn: async ({ key, value }: { key: string; value: string }) => {
            const { error } = await (supabase as any)
                .from('system_settings')
                .update({ value, updated_at: new Date().toISOString() })
                .eq('key', key);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system_settings'] });
            toast({
                title: 'Setting updated',
                description: 'The system setting has been updated successfully.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Update failed',
                description: error.message,
                variant: 'destructive',
            });
        }
    });

    const isSubmissionsOpenOverride = settings?.find(s => s.key === 'submissions_open')?.value === 'true';

    return {
        settings,
        isLoading,
        updateSetting,
        isSubmissionsOpenOverride
    };
}
