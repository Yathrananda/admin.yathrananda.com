-- Add departure details columns to travel_packages table
ALTER TABLE travel_packages
ADD COLUMN departure_place VARCHAR(255),
ADD COLUMN departure_date DATE,
ADD COLUMN departure_type VARCHAR(10) DEFAULT 'plane' CHECK (departure_type IN ('plane', 'train'));

-- Create index for departure date queries
CREATE INDEX idx_travel_packages_departure_date ON travel_packages (departure_date);

-- Create index for departure type queries
CREATE INDEX idx_travel_packages_departure_type ON travel_packages (departure_type); 