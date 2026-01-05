import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Component {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  registration_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateComponentData {
  name: string;
  email?: string | null;
  phone?: string;
}

export function useComponents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('components-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'components' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['components'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['components'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Component[];
    },
  });
}

export function useComponent(id: string | undefined) {
  return useQuery({
    queryKey: ['components', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Component | null;
    },
    enabled: !!id,
  });
}

export function useComponentByToken(token: string | undefined) {
  return useQuery({
    queryKey: ['components', 'token', token],
    queryFn: async () => {
      if (!token) return null;

      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('registration_token', token)
        .maybeSingle();

      if (error) throw error;
      return data as Component | null;
    },
    enabled: !!token,
  });
}

export function useCreateComponent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateComponentData) => {
      const { data: component, error } = await supabase
        .from('components')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return component as Component;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast({
        title: 'Component Created',
        description: 'The new component has been added successfully.',
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

export function useUpdateComponent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Component> & { id: string }) => {
      const { data: component, error } = await supabase
        .from('components')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return component as Component;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast({
        title: 'Component Updated',
        description: 'The component has been updated successfully.',
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

export function useDeleteComponent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('components')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast({
        title: 'Component Deleted',
        description: 'The component has been deleted successfully.',
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
