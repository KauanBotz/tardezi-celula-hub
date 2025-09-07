-- Create devotionals table
CREATE TABLE public.devotionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view devotionals" 
ON public.devotionals 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own devotionals" 
ON public.devotionals 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own devotionals" 
ON public.devotionals 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own devotionals" 
ON public.devotionals 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_devotionals_updated_at
BEFORE UPDATE ON public.devotionals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for devotional images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('devotionals', 'devotionals', true);

-- Create storage policies for devotional images
CREATE POLICY "Devotional images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'devotionals');

CREATE POLICY "Users can upload devotional images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'devotionals' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own devotional images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'devotionals' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own devotional images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'devotionals' AND auth.uid()::text = (storage.foldername(name))[1]);