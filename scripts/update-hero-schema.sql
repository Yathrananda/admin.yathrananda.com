-- Add carousel_order column if it doesn't exist
ALTER TABLE hero_media ADD COLUMN IF NOT EXISTS carousel_order INTEGER DEFAULT 0;

-- Create index for carousel ordering
CREATE INDEX IF NOT EXISTS idx_hero_media_carousel_order ON hero_media(carousel_order);

-- Update existing active media to have proper carousel order
UPDATE hero_media 
SET carousel_order = 1 
WHERE is_active = true AND carousel_order = 0;
