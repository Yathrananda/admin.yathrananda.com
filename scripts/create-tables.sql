-- Create hero_media table
CREATE TABLE IF NOT EXISTS hero_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('image', 'video')),
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create travel_packages table
CREATE TABLE IF NOT EXISTS travel_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_email VARCHAR(255),
  company_phone VARCHAR(50),
  company_address TEXT,
  emergency_contact VARCHAR(50),
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hero_media_active ON hero_media(is_active);
CREATE INDEX IF NOT EXISTS idx_travel_packages_created ON travel_packages(created_at);
CREATE INDEX IF NOT EXISTS idx_faqs_created ON faqs(created_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_created ON testimonials(created_at);
