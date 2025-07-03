-- Add new columns to travel_packages table
ALTER TABLE travel_packages 
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS overview TEXT,
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS hero_image_alt TEXT,
  ADD COLUMN IF NOT EXISTS group_size VARCHAR(100),
  ADD COLUMN IF NOT EXISTS advance_payment VARCHAR(100),
  ADD COLUMN IF NOT EXISTS balance_payment VARCHAR(100);

-- Create package_itinerary table
CREATE TABLE IF NOT EXISTS package_itinerary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES travel_packages(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  route VARCHAR(255),
  meal_plan VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create itinerary_activities table
CREATE TABLE IF NOT EXISTS itinerary_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id UUID REFERENCES package_itinerary(id) ON DELETE CASCADE,
  activity TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create itinerary_images table
CREATE TABLE IF NOT EXISTS itinerary_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id UUID REFERENCES package_itinerary(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create package_gallery table
CREATE TABLE IF NOT EXISTS package_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES travel_packages(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create package_booking_rules table
CREATE TABLE IF NOT EXISTS package_booking_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES travel_packages(id) ON DELETE CASCADE,
  rule TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create package_cancellation_rules table
CREATE TABLE IF NOT EXISTS package_cancellation_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES travel_packages(id) ON DELETE CASCADE,
  rule TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_package_itinerary_package ON package_itinerary(package_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_activities_itinerary ON itinerary_activities(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_images_itinerary ON itinerary_images(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_package_gallery_package ON package_gallery(package_id);
CREATE INDEX IF NOT EXISTS idx_booking_rules_package ON package_booking_rules(package_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_rules_package ON package_cancellation_rules(package_id);

-- Drop the highlights table and its index if they exist
DROP INDEX IF EXISTS idx_package_highlights_package;
DROP TABLE IF EXISTS package_highlights; 