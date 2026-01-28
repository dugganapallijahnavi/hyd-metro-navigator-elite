-- Create metro_lines table
CREATE TABLE public.metro_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  color_class TEXT NOT NULL,
  route TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create metro_stations table
CREATE TABLE public.metro_stations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  line_id UUID NOT NULL REFERENCES public.metro_lines(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  is_interchange BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, line_id)
);

-- Create index for faster lookups
CREATE INDEX idx_metro_stations_line_id ON public.metro_stations(line_id);
CREATE INDEX idx_metro_stations_name ON public.metro_stations(name);

-- Enable Row Level Security
ALTER TABLE public.metro_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metro_stations ENABLE ROW LEVEL SECURITY;

-- Create public read policies (metro data is public)
CREATE POLICY "Metro lines are publicly readable"
  ON public.metro_lines FOR SELECT
  USING (true);

CREATE POLICY "Metro stations are publicly readable"
  ON public.metro_stations FOR SELECT
  USING (true);

-- Create policies for authenticated users to manage data (admin functionality)
CREATE POLICY "Authenticated users can insert metro lines"
  ON public.metro_lines FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update metro lines"
  ON public.metro_lines FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete metro lines"
  ON public.metro_lines FOR DELETE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert metro stations"
  ON public.metro_stations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update metro stations"
  ON public.metro_stations FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete metro stations"
  ON public.metro_stations FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_metro_lines_updated_at
  BEFORE UPDATE ON public.metro_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metro_stations_updated_at
  BEFORE UPDATE ON public.metro_stations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();