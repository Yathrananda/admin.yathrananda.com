-- Add activities display type column to travel_packages table
ALTER TABLE travel_packages
ADD COLUMN activities_display_type VARCHAR(20) DEFAULT 'points' CHECK (activities_display_type IN ('points', 'description'));

-- Create index for activities display type queries
CREATE INDEX idx_travel_packages_activities_display ON travel_packages (activities_display_type); 