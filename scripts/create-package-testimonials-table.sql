-- Create package_testimonials junction table
CREATE TABLE IF NOT EXISTS package_testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES travel_packages(id) ON DELETE CASCADE,
  testimonial_id UUID NOT NULL REFERENCES testimonials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(package_id, testimonial_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_package_testimonials_package_id ON package_testimonials(package_id);
CREATE INDEX IF NOT EXISTS idx_package_testimonials_testimonial_id ON package_testimonials(testimonial_id); 