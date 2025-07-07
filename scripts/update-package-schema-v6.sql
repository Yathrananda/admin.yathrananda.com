-- Add new category columns to travel_packages table
ALTER TABLE travel_packages
ADD COLUMN is_kerala_tours BOOLEAN DEFAULT false,
ADD COLUMN is_customized_tours BOOLEAN DEFAULT false;

-- Create indexes for better query performance
CREATE INDEX idx_travel_packages_kerala_tours ON travel_packages (is_kerala_tours) WHERE is_kerala_tours = true;
CREATE INDEX idx_travel_packages_customized_tours ON travel_packages (is_customized_tours) WHERE is_customized_tours = true; 