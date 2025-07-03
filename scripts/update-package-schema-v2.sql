-- Add order column to maintain sequence
ALTER TABLE package_itinerary 
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

ALTER TABLE itinerary_activities 
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

ALTER TABLE itinerary_images 
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

ALTER TABLE package_gallery 
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

ALTER TABLE package_booking_rules 
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

ALTER TABLE package_cancellation_rules 
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add status column to track soft deletes and active status
ALTER TABLE travel_packages 
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' 
  CHECK (status IN ('active', 'draft', 'archived', 'deleted'));

-- Add updated_at columns for tracking modifications
ALTER TABLE travel_packages 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE package_itinerary 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE itinerary_activities 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE itinerary_images 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE package_gallery 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE package_booking_rules 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE package_cancellation_rules 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_travel_packages_updated_at
    BEFORE UPDATE ON travel_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_itinerary_updated_at
    BEFORE UPDATE ON package_itinerary
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itinerary_activities_updated_at
    BEFORE UPDATE ON itinerary_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itinerary_images_updated_at
    BEFORE UPDATE ON itinerary_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_gallery_updated_at
    BEFORE UPDATE ON package_gallery
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_booking_rules_updated_at
    BEFORE UPDATE ON package_booking_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_cancellation_rules_updated_at
    BEFORE UPDATE ON package_cancellation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_package_itinerary_order ON package_itinerary(display_order);
CREATE INDEX IF NOT EXISTS idx_itinerary_activities_order ON itinerary_activities(display_order);
CREATE INDEX IF NOT EXISTS idx_itinerary_images_order ON itinerary_images(display_order);
CREATE INDEX IF NOT EXISTS idx_package_gallery_order ON package_gallery(display_order);
CREATE INDEX IF NOT EXISTS idx_package_booking_rules_order ON package_booking_rules(display_order);
CREATE INDEX IF NOT EXISTS idx_package_cancellation_rules_order ON package_cancellation_rules(display_order);
CREATE INDEX IF NOT EXISTS idx_travel_packages_status ON travel_packages(status); 