import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getSubmissionDeadline, isSubmissionLate } from '@/types';

export interface Submission {
  id: string;
  component_id: string;
  month: number;
  year: number;
  file_url: string;
  file_name: string;
  submitted_at: string;
  is_late: boolean;
  score: number | null;
  feedback: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface CreateSubmissionData {
  component_id: string;
  month: number;
  year: number;
  file: File;
}

export interface ReviewSubmissionData {
  id: string;
  score: number;
  feedback: string;
}

export function useSubmissions(filters?: {
  month?: number;
  year?: number;
  componentId?: string;
}) {
  const { isAdmin, profile } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('submissions-all-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions' },
        () => queryClient.invalidateQueries({ queryKey: ['submissions'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['submissions', filters],
    queryFn: async () => {
      let query = supabase
        .from('submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (filters?.month) {
        query = query.eq('month', filters.month);
      }
      if (filters?.year) {
        query = query.eq('year', filters.year);
      }
      if (filters?.componentId) {
        query = query.eq('component_id', filters.componentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Submission[];
    },
  });
}

export function useComponentSubmissions(componentId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!componentId) return;

    const channel = supabase
      .channel(`submissions-component-${componentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions',
          filter: `component_id=eq.${componentId}`
        },
        () => queryClient.invalidateQueries({ queryKey: ['submissions', 'component', componentId] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [componentId, queryClient]);

  return useQuery({
    queryKey: ['submissions', 'component', componentId],
    queryFn: async () => {
      if (!componentId) return [];

      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('component_id', componentId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      return data as Submission[];
    },
    enabled: !!componentId,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ component_id, month, year, file }: CreateSubmissionData) => {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${component_id}/${year}/${month}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get file URL
      const { data: urlData } = supabase.storage
        .from('submissions')
        .getPublicUrl(fileName);

      // Check if submission is late
      const deadline = getSubmissionDeadline(month, year);
      const isLate = new Date() > deadline;

      // Create submission record
      const { data, error } = await supabase
        .from('submissions')
        .insert([{
          component_id,
          month,
          year,
          file_url: urlData.publicUrl,
          file_name: file.name,
          is_late: isLate,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Submission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast({
        title: 'Report Submitted',
        description: 'Your activity report has been uploaded successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useReviewSubmission() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, score, feedback }: ReviewSubmissionData) => {
      const { data, error } = await supabase
        .from('submissions')
        .update({
          score,
          feedback,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Submission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast({
        title: 'Review Saved',
        description: 'Your review has been saved successfully.',
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

export function useSubmissionStats(month?: number, year?: number) {
  const { data: submissions } = useSubmissions({ month, year });
  const { data: components } = useQuery({
    queryKey: ['components'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('components')
        .select('id');
      if (error) throw error;
      return data;
    },
  });

  if (!submissions || !components) {
    return { submitted: 0, late: 0, missing: 0, total: 0 };
  }

  const submitted = submissions.filter(s => !s.is_late).length;
  const late = submissions.filter(s => s.is_late).length;
  const missing = components.length - submissions.length;

  return { submitted, late, missing, total: components.length };
}
