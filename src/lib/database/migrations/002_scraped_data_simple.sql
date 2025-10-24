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
