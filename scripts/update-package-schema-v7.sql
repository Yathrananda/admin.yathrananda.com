-- Add inclusion and exclusion tables for travel packages

-- Create package_inclusions table
CREATE TABLE IF NOT EXISTS package_inclusions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES travel_packages(id) ON DELETE CASCADE,
  inclusion TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create package_exclusions table
CREATE TABLE IF NOT EXISTS package_exclusions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID REFERENCES travel_packages(id) ON DELETE CASCADE,
  exclusion TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_package_inclusions_package ON package_inclusions(package_id);
CREATE INDEX IF NOT EXISTS idx_package_exclusions_package ON package_exclusions(package_id);
CREATE INDEX IF NOT EXISTS idx_package_inclusions_order ON package_inclusions(package_id, display_order);
CREATE INDEX IF NOT EXISTS idx_package_exclusions_order ON package_exclusions(package_id, display_order);

-- Add triggers for updated_at (reuse existing function)
CREATE TRIGGER trigger_package_inclusions_updated_at
    BEFORE UPDATE ON package_inclusions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_package_exclusions_updated_at
    BEFORE UPDATE ON package_exclusions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 