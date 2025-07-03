-- Add new boolean columns to travel_packages table
ALTER TABLE travel_packages
ADD COLUMN is_trending BOOLEAN DEFAULT false,
ADD COLUMN is_international BOOLEAN DEFAULT false,
ADD COLUMN is_domestic BOOLEAN DEFAULT false,
ADD COLUMN is_upcoming BOOLEAN DEFAULT false;

-- First, update existing rows to have default values
-- Making all existing packages domestic by default
UPDATE travel_packages
SET 
  is_trending = false,
  is_international = false,
  is_domestic = true,
  is_upcoming = false;

-- Now we can safely add the check constraint
ALTER TABLE travel_packages
ADD CONSTRAINT check_package_category
CHECK (
  (is_domestic = true OR is_international = true) AND -- At least one must be true
  NOT (is_domestic = true AND is_international = true) -- Both cannot be true
);

-- Create indexes for better query performance
CREATE INDEX idx_travel_packages_trending ON travel_packages (is_trending) WHERE is_trending = true;
CREATE INDEX idx_travel_packages_upcoming ON travel_packages (is_upcoming) WHERE is_upcoming = true;
CREATE INDEX idx_travel_packages_domestic ON travel_packages (is_domestic) WHERE is_domestic = true;
CREATE INDEX idx_travel_packages_international ON travel_packages (is_international) WHERE is_international = true;