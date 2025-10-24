-- Create brand_guidelines table
CREATE TABLE IF NOT EXISTS brand_guidelines (
  id SERIAL PRIMARY KEY,
  brand_name VARCHAR(255) NOT NULL UNIQUE,
  company_name VARCHAR(255),
  industry VARCHAR(100),
  colors JSONB,
  typography JSONB,
  logo JSONB,
  ui JSONB,
  spacing JSONB,
  layout JSONB,
  imagery JSONB,
  tone JSONB,
  accessibility JSONB,
  global_rules JSONB,
  metadata JSONB,
  source_file VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create analysis_results table
CREATE TABLE IF NOT EXISTS analysis_results (
  id SERIAL PRIMARY KEY,
  brand_guideline_id INTEGER REFERENCES brand_guidelines(id) ON DELETE CASCADE,
  website_url TEXT NOT NULL,
  website_title VARCHAR(255),
  violations JSONB,
  correct_elements JSONB,
  score INTEGER,
  total_violations INTEGER,
  severity_breakdown JSONB,
  analysis_type VARCHAR(50),
  processing_time INTEGER,
  elements_analyzed INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_brand_name ON brand_guidelines(brand_name);
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_is_active ON brand_guidelines(is_active);
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_created_at ON brand_guidelines(created_at);
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_updated_at ON brand_guidelines(updated_at);

CREATE INDEX IF NOT EXISTS idx_analysis_results_brand_id ON analysis_results(brand_guideline_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_website_url ON analysis_results(website_url);
CREATE INDEX IF NOT EXISTS idx_analysis_results_created_at ON analysis_results(created_at);
CREATE INDEX IF NOT EXISTS idx_analysis_results_score ON analysis_results(score);
CREATE INDEX IF NOT EXISTS idx_analysis_results_analysis_type ON analysis_results(analysis_type);

-- Create GIN indexes for JSONB columns for better query performance
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_colors_gin ON brand_guidelines USING GIN (colors);
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_typography_gin ON brand_guidelines USING GIN (typography);
CREATE INDEX IF NOT EXISTS idx_analysis_results_violations_gin ON analysis_results USING GIN (violations);
CREATE INDEX IF NOT EXISTS idx_analysis_results_severity_gin ON analysis_results USING GIN (severity_breakdown);

-- Add comments for documentation
COMMENT ON TABLE brand_guidelines IS 'Stores brand guideline data in structured JSON format';
COMMENT ON TABLE analysis_results IS 'Stores website analysis results against brand guidelines';
COMMENT ON COLUMN brand_guidelines.colors IS 'Brand color palette and usage rules';
COMMENT ON COLUMN brand_guidelines.typography IS 'Typography system and hierarchy rules';
COMMENT ON COLUMN brand_guidelines.logo IS 'Logo usage and placement guidelines';
COMMENT ON COLUMN brand_guidelines.ui IS 'UI component specifications and states';
COMMENT ON COLUMN brand_guidelines.spacing IS 'Spacing system and layout rules';
COMMENT ON COLUMN brand_guidelines.layout IS 'Layout patterns and grid system';
COMMENT ON COLUMN brand_guidelines.imagery IS 'Imagery and iconography guidelines';
COMMENT ON COLUMN brand_guidelines.tone IS 'Tone of voice and content guidelines';
COMMENT ON COLUMN brand_guidelines.accessibility IS 'Accessibility and inclusive design rules';
COMMENT ON COLUMN brand_guidelines.global_rules IS 'Cross-cutting brand rules and constraints';
COMMENT ON COLUMN brand_guidelines.metadata IS 'Brand guideline metadata and versioning';
