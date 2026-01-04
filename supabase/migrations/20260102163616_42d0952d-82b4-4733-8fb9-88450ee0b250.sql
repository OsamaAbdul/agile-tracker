-- Create table for submission feedback messages
CREATE TABLE public.submission_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.submission_messages ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with messages
CREATE POLICY "Admins can manage all messages"
ON public.submission_messages
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Members can view messages for their component's submissions
CREATE POLICY "Members can view their submission messages"
ON public.submission_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_id
    AND s.component_id = get_user_component_id(auth.uid())
  )
);

-- Members can add messages to their component's submissions
CREATE POLICY "Members can add messages to their submissions"
ON public.submission_messages
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.submissions s
    WHERE s.id = submission_id
    AND s.component_id = get_user_component_id(auth.uid())
  )
);

-- Create admin invitations table
CREATE TABLE public.admin_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL,
  token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email, used)
);

-- Enable RLS
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

-- Only admins can manage invitations
CREATE POLICY "Admins can manage invitations"
ON public.admin_invitations
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Anyone can read their own invitation by token (for signup validation)
CREATE POLICY "Anyone can read invitation by token"
ON public.admin_invitations
FOR SELECT
USING (true);

-- Enable realtime for submissions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.submission_messages;

-- Add index for faster message lookups
CREATE INDEX idx_submission_messages_submission_id ON public.submission_messages(submission_id);
CREATE INDEX idx_admin_invitations_token ON public.admin_invitations(token);
CREATE INDEX idx_admin_invitations_email ON public.admin_invitations(email);