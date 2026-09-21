export type Platform = "facebook" | "instagram" | "tiktok" | "youtube" | "linkedin" | "x" | "lemon8" | "all";

export type ContentStatus = 
  | "IDEA"
  | "DRAFT"
  | "ACCEPTED"
  | "REJECTED"
  | "AI_GENERATED"
  | "MEDIA_READY"
  | "REPURPOSED"
  | "IN_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED";

export type ApprovalStatus = 
  | "DRAFT"
  | "AI_CHECK"
  | "HUMAN_REVIEW"
  | "APPROVED"
  | "SCHEDULED"
  | "REJECTED"
  | "EXECUTED";

export type CopyFramework = 
  | "AIDA"
  | "PAS"
  | "FAB"
  | "BAB" // Before-After-Bridge
  | "HVPC" // Hook-Value-Proof-CTA
  | "PMTO" // Problem-Myth-Truth-Offer
  | "WWHN" // Why-What-How-Now
  | "STORY";

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export interface ContentIdea {
  id: string;
  title: string;
  concept: string;
  hook: string;
  target_audience: string;
  objective: string;
  content_pillar: string;
  platform: Platform;
  format: string;
  key_message: string;
  cta: string;
  reasoning?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  funnel_stage?: "TOFU" | "MOFU" | "BOFU";
  status: ContentStatus;
  pipeline_stage?: "IDEA" | "MEDIA" | "REPURPOSE" | "QUEUE" | "PUBLISHED";
  media_type?: "IMAGE" | "VIDEO";
  media_url?: string;
  media_urls?: string[];
  media_blueprint?: MediaBlueprint;
  media_prompt?: string;
  video_script?: string;
  spoken_script?: string;
  caption?: string;
  hashtags?: string[];
  ai_engine?: "gemini" | "chatgpt" | "groq";
  campaign_id?: string;
  brand_name?: string;
  rating?: number;
  virality_score?: string;
  is_series?: boolean;
  episode?: number;
  platform_prompts?: Record<string, { prompt: string; aspect_ratio: string; format_type: string }>;
  platform_captions?: Record<string, string>;
  music_prompt?: MusicPromptData;
  created_at: string;
  updated_at: string;
}

export interface MusicPromptData {
  song_title: string;
  genre_style: string;
  instruments: string;
  lyrics_structure: string;
  full_prompt: string;
}

export interface MediaSlideDirective {
  slide_no: number;
  visual: string;
  text_overlay: string;
  camera_angle?: string; // มุมกล้องสำหรับถ่ายจริง เช่น "หน้าตรง 90° ขนานระนาบ", "ซูมมาโคร 10x ส่องมวลสาร"
  real_photo_tip?: string; // คำแนะนำการถ่ายจริงด้วยกล้อง/มือถือ เช่น "ส่องแสงเฉียง 45° เลี่ยงเงาสะท้อน"
  shoot_instruction?: string;
  prompt?: string;
}

export interface MediaBlueprint {
  count_recommended: number;
  format: string;
  visual_direction: string;
  real_shoot_guide?: string; // คำแนะนำภาพรวมสำหรับการถ่ายรูปจริงด้วยกล้อง/มือถือ
  equipment_needed?: string; // อุปกรณ์ที่แนะนำ เช่น "มือถือโหมดมาโคร + ขาตั้งโต๊ะ + ไฟวงแหวน"
  slides?: MediaSlideDirective[];
}

export interface VideoScene {
  timestamp: string;
  scene: string;
  visual: string;
  dialogue: string;
  on_screen_text: string;
  camera_direction: string;
  sound_suggestion: string;
}

export interface CreativeBrief {
  id: string;
  idea_id?: string;
  creative_concept: string;
  visual_direction: string;
  mood: string;
  composition: string;
  subject: string;
  environment: string;
  lighting: string;
  typography_direction: string;
  color_direction: string;
  negative_space: string;
  aspect_ratio: string;
  image_prompt?: string;
  negative_prompt?: string;
  created_at: string;
}

export interface ContentAsset {
  id: string;
  idea_id?: string;
  campaign_id?: string;
  framework: CopyFramework;
  caption_short: string;
  caption_long: string;
  cta: string;
  hashtags: string[];
  script_hook: string;
  script_intro: string;
  script_body: string;
  script_proof: string;
  script_cta: string;
  video_scenes: VideoScene[];
  creative_brief?: CreativeBrief;
  image_url?: string;
  status: ContentStatus;
  confidence: number;
  warnings?: string[];
  created_at: string;
  updated_at: string;
}

export interface RepurposedPlatformOutput {
  platform: Platform;
  title?: string;
  content?: string;
  hook?: string;
  structure?: string;
  cta?: string;
  hashtags?: string[];
  carousel_slides?: string[];
  video_script?: string;
  youtube_chapters?: { time: string; title: string }[];
  youtube_shorts_ideas?: string[];
  x_thread?: string[];
  lemon8_cover_title?: string;
  lemon8_points?: string[];
}

export interface RepurposedContent {
  id: string;
  source_content_id?: string;
  source_text: string;
  outputs: Record<string, RepurposedPlatformOutput>;
  status: ContentStatus;
  created_at: string;
}

export interface DocumentFieldMapping {
  source_field: string;
  target_field: string;
  extracted_value: string;
  confidence: ConfidenceLevel;
  confidence_score: number;
  verified: boolean;
  notes?: string;
}

export interface ExtractedDocument {
  id: string;
  filename: string;
  file_type: string;
  upload_date: string;
  raw_text?: string;
  summary: string;
  fields: DocumentFieldMapping[];
  mapped_template?: string;
  status: "PARSED" | "MAPPED" | "REVIEW_PENDING" | "SUBMITTED" | "ERROR";
  integration_status: "NOT_CONNECTED" | "CONNECTED" | "PENDING";
  created_at: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  target_fields: { key: string; label: string; required: boolean; type: string }[];
}

export interface MarketingMetrics {
  reach: number;
  impressions: number;
  engagement: number;
  engagement_rate: number;
  ctr: number;
  views: number;
  watch_time_hours: number;
  conversions: number;
  leads: number;
  cost: number;
  roas: number;
  cpc: number;
  cpm: number;
}

export interface AnalyticsReport {
  id: string;
  campaign_id?: string;
  brand_name?: string;
  title: string;
  period: string;
  data_source: "CSV" | "XLSX" | "MANUAL" | "API";
  metrics: MarketingMetrics;
  executive_summary: string;
  key_findings: string[];
  performance_patterns: string[];
  identified_problems: string[];
  what_performed_well: string[];
  what_performed_poorly: string[];
  content_themes_worked: string[];
  formats_worked: string[];
  hooks_worked: string[];
  platforms_worked: string[];
  what_to_repeat: string[];
  what_to_reduce: string[];
  what_to_test_next: string[];
  recommendations: string[];
  content_opportunities: {
    title: string;
    pillar: string;
    platform: Platform;
    format: string;
    rationale: string;
  }[];
  notes?: string;
  is_data_sufficient: boolean;
  created_at: string;
}

export interface HistoricalComparisonResult {
  id: string;
  brand_name?: string;
  past_period: string;
  current_period: string;
  past_report_id?: string;
  current_report_id?: string;
  metric_deltas: {
    reach_diff_pct: number;
    engagement_diff_pct: number;
    ctr_diff_pct: number;
    leads_diff_pct: number;
    views_diff_pct: number;
  };
  why_past_performed_better: string[];
  what_changed_negatively: string[];
  winning_elements_to_revive: string[];
  action_plan_to_regain_traction: string[];
  content_ideas_to_revive: {
    title: string;
    hook: string;
    format: string;
    reason: string;
  }[];
  created_at: string;
}

export interface KnowledgeDocument {
  id: string;
  category: "BRAND" | "PRODUCT" | "CAMPAIGN" | "CONTENT" | "TEMPLATES";
  title: string;
  content: string;
  verified: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ApprovalItem {
  id: string;
  title: string;
  entity_type: "CONTENT" | "SCRIPT" | "DOCUMENT_FORM" | "CAMPAIGN" | "WORKFLOW" | "CREATIVE_PROMPT";
  entity_id: string;
  content_preview: string;
  source: string;
  ai_generated_fields: Record<string, any>;
  confidence: ConfidenceLevel;
  warnings: string[];
  recommended_action: string;
  status: ApprovalStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  image_url?: string;
  media_urls?: string[];
  media_blueprint?: MediaBlueprint;
  platform?: Platform | string;
  media_type?: "IMAGE" | "VIDEO";
  scheduled_at?: string;
  publish_mode?: "AUTO" | "MANUAL";
  recommended_time?: string;
  connection_status?: "CONNECTED" | "NOT_CONNECTED";
  brand_name?: string;
  is_series?: boolean;
  episode?: number;
  created_at: string;
}

export interface WorkflowItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  trigger_type: "MANUAL" | "WEBHOOK" | "SCHEDULE" | "EVENT";
  status: "ACTIVE" | "PAUSED" | "RUNNING" | "ERROR";
  last_run?: string;
  last_duration_ms?: number;
  last_result?: "SUCCESS" | "FAILED";
  n8n_workflow_id?: string;
  webhook_url?: string;
}

export interface WorkflowRunLog {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: "SUCCESS" | "RUNNING" | "FAILED";
  started_at: string;
  finished_at?: string;
  duration_ms: number;
  trigger: string;
  input_payload: any;
  output_result?: any;
  error_message?: string;
}

export interface AIGenerationLog {
  id: string;
  model: string;
  workflow: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  status: "SUCCESS" | "ERROR";
  timestamp: string;
  cost_usd: number;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  actor: string;
  timestamp: string;
}

export interface SystemSettings {
  gemini_api_key?: string;
  gemini_backup_api_key?: string;
  openai_api_key?: string;
  openai_backup_api_key?: string;
  groq_api_key?: string;
  openrouter_api_key?: string;
  auto_failover_enabled?: boolean;
  default_ai_engine?: "groq" | "chatgpt" | "gemini";
  gemini_model: string;
  gemini_thinking_effort: "high" | "low";
  n8n_base_url?: string;
  n8n_api_key?: string;
  n8n_webhook_url?: string;
  google_drive_status: "NOT_CONNECTED" | "CONNECTED";
  google_sheets_status: "NOT_CONNECTED" | "CONNECTED";
  google_forms_status: "NOT_CONNECTED" | "CONNECTED";
  image_gen_provider: "NONE" | "IMAGEN" | "MIDJOURNEY_PROXY" | "STABLE_DIFFUSION";
  custom_image_api_key?: string;
  social_publisher_status: "NOT_CONNECTED" | "CONNECTED";
  has_gemini_key?: boolean;
  has_gemini_backup_key?: boolean;
  has_openai_key?: boolean;
  has_openai_backup_key?: boolean;
  has_groq_key?: boolean;
  has_openrouter_key?: boolean;
  has_custom_image_key?: boolean;
  has_n8n_webhook?: boolean;
  storage_mode?: string;
  supabase_status?: any;
}

export interface SocialPageAccount {
  id: string;
  brand_name: string;
  platform: "facebook" | "instagram" | "tiktok" | "youtube" | "x";
  page_name: string;
  page_id: string;
  access_token?: string;
  status: "CONNECTED" | "NOT_CONNECTED" | "SIMULATED";
  last_synced_at?: string;
  auto_sync_enabled: boolean;
}
