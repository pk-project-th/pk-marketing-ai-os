-- ==========================================================
-- PK Marketing AI OS v1.0 - Initial Relational Schema
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles & Users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'marketing_manager',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  status TEXT DEFAULT 'ACTIVE', -- DRAFT, ACTIVE, PAUSED, COMPLETED
  objective TEXT,
  budget NUMERIC(12, 2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  target_audience TEXT,
  key_message TEXT,
  kpis JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products (Automotive specifications & approved claims)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand TEXT NOT NULL DEFAULT 'PK Auto',
  model_name TEXT NOT NULL,
  variant TEXT,
  price_msrp NUMERIC(12, 2),
  specifications JSONB DEFAULT '{}'::jsonb,
  key_features JSONB DEFAULT '[]'::jsonb,
  approved_claims JSONB DEFAULT '[]'::jsonb,
  disclaimers JSONB DEFAULT '[]'::jsonb,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Content Ideas (Agent 01 - Idea Agent)
CREATE TABLE IF NOT EXISTS content_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  concept TEXT NOT NULL,
  hook TEXT NOT NULL,
  target_audience TEXT,
  objective TEXT,
  content_pillar TEXT,
  platform TEXT NOT NULL, -- facebook, instagram, tiktok, youtube, linkedin, x, all
  format TEXT,
  key_message TEXT,
  cta TEXT,
  reasoning TEXT,
  priority TEXT DEFAULT 'HIGH', -- HIGH, MEDIUM, LOW
  funnel_stage TEXT DEFAULT 'TOFU', -- TOFU, MOFU, BOFU
  status TEXT DEFAULT 'IDEA', -- IDEA, DRAFT, AI_GENERATED, IN_REVIEW, APPROVED, PUBLISHED, ARCHIVED
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Content Assets & Scripts (Agent 02 - Production Agent)
CREATE TABLE IF NOT EXISTS content_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES content_ideas(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  framework TEXT DEFAULT 'PAS', -- AIDA, PAS, FAB, BAB, HVPC, PMTO, WWHN, STORY
  caption_short TEXT,
  caption_long TEXT,
  cta TEXT,
  hashtags JSONB DEFAULT '[]'::jsonb,
  script_hook TEXT,
  script_intro TEXT,
  script_body TEXT,
  script_proof TEXT,
  script_cta TEXT,
  video_scenes JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'DRAFT',
  confidence NUMERIC(4, 2) DEFAULT 0.95,
  warnings JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Creative Briefs
CREATE TABLE IF NOT EXISTS creative_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES content_assets(id) ON DELETE CASCADE,
  creative_concept TEXT,
  visual_direction TEXT,
  mood TEXT,
  composition TEXT,
  subject TEXT,
  environment TEXT,
  lighting TEXT,
  typography_direction TEXT,
  color_direction TEXT,
  negative_space TEXT,
  aspect_ratio TEXT DEFAULT '16:9',
  image_prompt TEXT,
  negative_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Repurposed Content (Agent 04 - Repurposing Agent)
CREATE TABLE IF NOT EXISTS repurposed_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_asset_id UUID REFERENCES content_assets(id) ON DELETE CASCADE,
  source_text TEXT NOT NULL,
  outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Documents & Dynamic Form Mapping (Agent 03 - Document Agent)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_type TEXT,
  summary TEXT,
  raw_text TEXT,
  status TEXT DEFAULT 'PARSED',
  integration_status TEXT DEFAULT 'NOT_CONNECTED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  source_field TEXT NOT NULL,
  target_field TEXT NOT NULL,
  extracted_value TEXT,
  confidence TEXT DEFAULT 'HIGH', -- HIGH, MEDIUM, LOW
  confidence_score NUMERIC(4, 2) DEFAULT 0.9,
  verified BOOLEAN DEFAULT TRUE,
  notes TEXT
);

-- 9. Knowledge Base (Source-of-Truth RAG)
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL, -- BRAND, PRODUCT, CAMPAIGN, CONTENT, TEMPLATES
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  verified BOOLEAN DEFAULT TRUE,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Approvals (Human-in-the-loop Guardrail)
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- CONTENT, SCRIPT, DOCUMENT_FORM, CAMPAIGN, WORKFLOW
  entity_id UUID NOT NULL,
  content_preview TEXT,
  source TEXT,
  ai_generated_fields JSONB DEFAULT '{}'::jsonb,
  confidence TEXT DEFAULT 'HIGH',
  warnings JSONB DEFAULT '[]'::jsonb,
  recommended_action TEXT,
  status TEXT DEFAULT 'HUMAN_REVIEW', -- DRAFT, AI_CHECK, HUMAN_REVIEW, APPROVED, REJECTED, EXECUTED
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Workflows & Execution Runs (n8n integration)
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  trigger_type TEXT DEFAULT 'MANUAL',
  status TEXT DEFAULT 'ACTIVE',
  n8n_workflow_id TEXT,
  webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'SUCCESS',
  duration_ms INT DEFAULT 0,
  trigger TEXT,
  input_payload JSONB,
  output_result JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Analytics & Insights (Agent 05 - Analytics Agent)
CREATE TABLE IF NOT EXISTS analytics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  period TEXT,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  diagnostic JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AI Generations & Token Usage Monitor
CREATE TABLE IF NOT EXISTS ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model TEXT NOT NULL,
  workflow TEXT NOT NULL,
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  latency_ms INT DEFAULT 0,
  status TEXT DEFAULT 'SUCCESS',
  cost_usd NUMERIC(8, 6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  actor TEXT DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Target Audiences & Personas
CREATE TABLE IF NOT EXISTS audiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  segment_type TEXT DEFAULT 'B2C', -- B2C, B2B, LUXURY, ECO_CONSCIOUS
  demographics JSONB DEFAULT '{}'::jsonb,
  pain_points JSONB DEFAULT '[]'::jsonb,
  desires JSONB DEFAULT '[]'::jsonb,
  preferred_channels JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Form Templates (Document-to-Form Dynamic Mapping)
CREATE TABLE IF NOT EXISTS form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  platform TEXT DEFAULT 'GOOGLE_FORMS',
  fields JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. System Settings & Integration Status
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gemini_model TEXT DEFAULT 'gemini-3.8-flash',
  gemini_thinking_effort TEXT DEFAULT 'high',
  google_drive_status TEXT DEFAULT 'NOT_CONNECTED',
  google_sheets_status TEXT DEFAULT 'NOT_CONNECTED',
  google_forms_status TEXT DEFAULT 'NOT_CONNECTED',
  image_gen_provider TEXT DEFAULT 'NONE',
  social_publisher_status TEXT DEFAULT 'NOT_CONNECTED',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_campaign ON content_ideas(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON content_ideas(status);
CREATE INDEX IF NOT EXISTS idx_assets_idea ON content_assets(idea_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow ON workflow_runs(workflow_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Standard Permissive Policies for Authenticated Application Users
CREATE POLICY "Allow authenticated full access to profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access to campaigns" ON campaigns FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access to products" ON products FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access to content_ideas" ON content_ideas FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access to content_assets" ON content_assets FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access to approvals" ON approvals FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access to workflows" ON workflows FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access to knowledge_documents" ON knowledge_documents FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access to audiences" ON audiences FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access to form_templates" ON form_templates FOR ALL USING (true);
CREATE POLICY "Allow authenticated full access to system_settings" ON system_settings FOR ALL USING (true);

