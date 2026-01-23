-- Create table for contact form submissions
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  contacto TEXT NOT NULL,
  interes TEXT NOT NULL,
  personas TEXT,
  mensaje TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can view submissions (admin)
CREATE POLICY "Authenticated users can view submissions"
  ON public.contact_submissions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);