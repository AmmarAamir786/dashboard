-- RHI Dashboard Database Schema for Supabase

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS interactions CASCADE;
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS agents CASCADE;

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'senior_agent', 'team_lead', 'hod', 'manager', 'admin')),
  department TEXT,
  performance_rating TEXT DEFAULT 'Good' CHECK (performance_rating IN ('Excellent', 'Good', 'Average', 'Needs Improvement')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  sector TEXT,
  category TEXT CHECK (category IN ('A', 'B', 'C', 'D')),
  plot TEXT,
  file_number TEXT,
  promise_funnel TEXT DEFAULT 'pending' CHECK (promise_funnel IN ('promised', 'kept', 'partial', 'broken', 'pending')),
  notes TEXT,
  -- CRFES Scores
  contactability_score INTEGER DEFAULT 50 CHECK (contactability_score >= 0 AND contactability_score <= 100),
  responsiveness_score INTEGER DEFAULT 50 CHECK (responsiveness_score >= 0 AND responsiveness_score <= 100),
  financial_score INTEGER DEFAULT 50 CHECK (financial_score >= 0 AND financial_score <= 100),
  engagement_score INTEGER DEFAULT 50 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  sentiment_score INTEGER DEFAULT 50 CHECK (sentiment_score >= 0 AND sentiment_score <= 100),
  health_score INTEGER DEFAULT 50 CHECK (health_score >= 0 AND health_score <= 100),
  tier TEXT DEFAULT 'Amber' CHECK (tier IN ('Green', 'Amber', 'Red')),
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_action TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interactions table
CREATE TABLE IF NOT EXISTS interactions (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agent_id BIGINT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call', 'wa', 'sms', 'visit', 'email')),
  disposition TEXT NOT NULL CHECK (disposition IN ('success', 'callback', 'refusal', 'pending')),
  sentiment_num DECIMAL(3,1) DEFAULT 0.0 CHECK (sentiment_num >= -1.0 AND sentiment_num <= 1.0),
  promised_amount DECIMAL(12,2),
  notes TEXT,
  next_action_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create checklist_items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  item_label TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  done_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, item_key)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(active);
CREATE INDEX IF NOT EXISTS idx_clients_tier ON clients(tier);
CREATE INDEX IF NOT EXISTS idx_clients_health_score ON clients(health_score);
CREATE INDEX IF NOT EXISTS idx_clients_last_interaction ON clients(last_interaction DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_client_id ON interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_interactions_agent_id ON interactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checklist_client_id ON checklist_items(client_id);

-- Enable Row Level Security (RLS)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your needs)
CREATE POLICY "Enable all access for agents" ON agents FOR ALL USING (true);
CREATE POLICY "Enable all access for clients" ON clients FOR ALL USING (true);
CREATE POLICY "Enable all access for interactions" ON interactions FOR ALL USING (true);
CREATE POLICY "Enable all access for checklist_items" ON checklist_items FOR ALL USING (true);

-- Insert sample agents
INSERT INTO agents (name, email, phone, role, department, performance_rating, active) VALUES 
  ('Maryam', 'maryam@company.com', '0301-1234567', 'agent', 'Sales', 'Good', true),
  ('Rameen', 'rameen@company.com', '0301-1234568', 'agent', 'Sales', 'Excellent', true),
  ('Samra', 'samra@company.com', '0301-1234569', 'senior_agent', 'Sales', 'Good', true),
  ('Nisa', 'nisa@company.com', '0301-1234570', 'team_lead', 'Sales', 'Excellent', true),
  ('Umair', 'umair@company.com', '0301-1234571', 'agent', 'Sales', 'Average', true),
  ('HOD Tayyab', 'tayyab.hod@company.com', '0301-1234572', 'hod', 'Management', 'Excellent', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample clients
INSERT INTO clients (name, phone, email, sector, category, plot, file_number, promise_funnel, contactability_score, responsiveness_score, financial_score, engagement_score, sentiment_score, health_score, tier, notes) VALUES 
  ('Client 1', '03001234567', 'client1@email.com', 'B1', 'A', '101', 'F-0001', 'promised', 85, 75, 90, 80, 85, 83, 'Green', 'Sample notes for client 1'),
  ('Client 2', '03001234568', 'client2@email.com', 'Tulip 1', 'B', '102', 'F-0002', 'kept', 60, 55, 45, 50, 60, 54, 'Amber', 'Sample notes for client 2'),
  ('Client 3', '03001234569', 'client3@email.com', 'Tulip 2', 'C', '103', 'F-0003', 'broken', 30, 25, 20, 35, 40, 30, 'Red', 'Sample notes for client 3')
ON CONFLICT DO NOTHING;

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interactions_updated_at BEFORE UPDATE ON interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON checklist_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
