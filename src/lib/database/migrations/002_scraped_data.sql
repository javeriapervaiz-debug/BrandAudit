-- Create scraped_webpages table
CREATE TABLE IF NOT EXISTS scraped_webpages (
  id SERIAL PRIMARY KEY,
  url VARCHAR(1000) NOT NULL,
  domain VARCHAR(255),
  brand_id INTEGER REFERENCES brand_guidelines(id) ON DELETE SET NULL,
  colors JSONB,
  typography JSONB,
  logo JSONB,
  layout JSONB,
  imagery JSONB,
  metadata JSONB,
  compliance_score REAL,
  issues JSONB,
  recommendations JSONB,
  status VARCHAR(50) DEFAULT 'scraped',
  is_active BOOLEAN DEFAULT true,
  scraped_at TIMESTAMP DEFAULT NOW(),
  analyzed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create compliance_issues table
CREATE TABLE IF NOT EXISTS compliance_issues (
  id SERIAL PRIMARY KEY,
  webpage_id INTEGER NOT NULL REFERENCES scraped_webpages(id) ON DELETE CASCADE,
  issue_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  element TEXT,
  expected_value TEXT,
  actual_value TEXT,
  recommendation TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create audit_sessions table
CREATE TABLE IF NOT EXISTS audit_sessions (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES brand_guidelines(id) ON DELETE CASCADE,
  session_name VARCHAR(255),
  description TEXT,
  total_webpages INTEGER DEFAULT 0,
  compliant_webpages INTEGER DEFAULT 0,
  average_score REAL,
  status VARCHAR(50) DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create basic indexes first
CREATE INDEX IF NOT EXISTS idx_scraped_webpages_url ON scraped_webpages(url);
CREATE INDEX IF NOT EXISTS idx_scraped_webpages_domain ON scraped_webpages(domain);
CREATE INDEX IF NOT EXISTS idx_scraped_webpages_brand_id ON scraped_webpages(brand_id);
CREATE INDEX IF NOT EXISTS idx_scraped_webpages_status ON scraped_webpages(status);
CREATE INDEX IF NOT EXISTS idx_scraped_webpages_scraped_at ON scraped_webpages(scraped_at);
CREATE INDEX IF NOT EXISTS idx_scraped_webpages_compliance_score ON scraped_webpages(compliance_score);

CREATE INDEX IF NOT EXISTS idx_compliance_issues_webpage_id ON compliance_issues(webpage_id);
CREATE INDEX IF NOT EXISTS idx_compliance_issues_issue_type ON compliance_issues(issue_type);
CREATE INDEX IF NOT EXISTS idx_compliance_issues_severity ON compliance_issues(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_issues_is_resolved ON compliance_issues(is_resolved);
CREATE INDEX IF NOT EXISTS idx_compliance_issues_created_at ON compliance_issues(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_sessions_brand_id ON audit_sessions(brand_id);
CREATE INDEX IF NOT EXISTS idx_audit_sessions_status ON audit_sessions(status);
CREATE INDEX IF NOT EXISTS idx_audit_sessions_started_at ON audit_sessions(started_at);

-- Create GIN indexes for JSONB columns for better query performance
CREATE INDEX IF NOT EXISTS idx_scraped_webpages_colors_gin ON scraped_webpages USING GIN (colors);
CREATE INDEX IF NOT EXISTS idx_scraped_webpages_typography_gin ON scraped_webpages USING GIN (typography);
CREATE INDEX IF NOT EXISTS idx_scraped_webpages_logo_gin ON scraped_webpages USING GIN (logo);
CREATE INDEX IF NOT EXISTS idx_scraped_webpages_layout_gin ON scraped_webpages USING GIN (layout);
CREATE INDEX IF NOT EXISTS idx_scraped_webpages_imagery_gin ON scraped_webpages USING GIN (imagery);
CREATE INDEX IF NOT EXISTS idx_scraped_webpages_metadata_gin ON scraped_webpages USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_scraped_webpages_issues_gin ON scraped_webpages USING GIN (issues);
CREATE INDEX IF NOT EXISTS idx_scraped_webpages_recommendations_gin ON scraped_webpages USING GIN (recommendations);

-- Add comments for documentation
COMMENT ON TABLE scraped_webpages IS 'Stores scraped webpage data and compliance analysis results';
COMMENT ON TABLE compliance_issues IS 'Stores individual compliance issues found during analysis';
COMMENT ON TABLE audit_sessions IS 'Stores audit session metadata and results';

COMMENT ON COLUMN scraped_webpages.colors IS 'Extracted color palette and usage from webpage';
COMMENT ON COLUMN scraped_webpages.typography IS 'Extracted typography information from webpage';
COMMENT ON COLUMN scraped_webpages.logo IS 'Logo detection and analysis results';
COMMENT ON COLUMN scraped_webpages.layout IS 'Layout analysis and structure information';
COMMENT ON COLUMN scraped_webpages.imagery IS 'Image analysis and classification results';
COMMENT ON COLUMN scraped_webpages.compliance_score IS 'Overall compliance score (0-1)';
COMMENT ON COLUMN scraped_webpages.issues IS 'Array of compliance issues found';
COMMENT ON COLUMN scraped_webpages.recommendations IS 'Array of improvement recommendations';

COMMENT ON COLUMN compliance_issues.issue_type IS 'Type of compliance issue (color, typography, logo, layout)';
COMMENT ON COLUMN compliance_issues.severity IS 'Severity level (low, medium, high, critical)';
COMMENT ON COLUMN compliance_issues.element IS 'CSS selector or element description';
COMMENT ON COLUMN compliance_issues.expected_value IS 'Expected value according to brand guidelines';
COMMENT ON COLUMN compliance_issues.actual_value IS 'Actual value found on webpage';
