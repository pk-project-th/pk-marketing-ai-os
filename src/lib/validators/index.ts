import { z } from "zod";

export const ContentIdeaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  concept: z.string().min(1, "Concept is required"),
  hook: z.string().min(1, "Hook is required"),
  target_audience: z.string().default("กลุ่มผู้ใช้รถยนต์ทั่วไป"),
  objective: z.string().default("สร้างการรับรู้แบรนด์"),
  content_pillar: z.string().default("Product Highlights"),
  platform: z.enum(["facebook", "instagram", "tiktok", "youtube", "linkedin", "x", "lemon8", "all"]).default("facebook"),
  format: z.string().default("Short Video"),
  key_message: z.string().default("ความคุ้มค่าและเทคโนโลยีล้ำสมัย"),
  cta: z.string().default("ทดลองขับได้แล้ววันนี้"),
  reasoning: z.string().default("ตอบโจทย์กลุ่มเป้าหมายในเมือง"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).default("HIGH"),
  funnel_stage: z.enum(["TOFU", "MOFU", "BOFU"]).default("TOFU"),
});

export const ContentIdeaListSchema = z.object({
  ideas: z.array(ContentIdeaSchema),
});

export const VideoSceneSchema = z.object({
  timestamp: z.string().default("00:00 - 00:05"),
  scene: z.string().default("Scene 1"),
  visual: z.string(),
  dialogue: z.string(),
  on_screen_text: z.string().default(""),
  camera_direction: z.string().default("Eye-level shot"),
  sound_suggestion: z.string().default("Upbeat automotive music"),
});

export const CreativeBriefSchema = z.object({
  creative_concept: z.string(),
  visual_direction: z.string(),
  mood: z.string(),
  composition: z.string(),
  subject: z.string(),
  environment: z.string(),
  lighting: z.string(),
  typography_direction: z.string(),
  color_direction: z.string(),
  negative_space: z.string(),
  aspect_ratio: z.string().default("16:9"),
  image_prompt: z.string().optional(),
  negative_prompt: z.string().optional(),
});

export const ProductionPackageSchema = z.object({
  framework: z.enum(["AIDA", "PAS", "FAB", "BAB", "HVPC", "PMTO", "WWHN", "STORY"]).default("PAS"),
  caption_short: z.string(),
  caption_long: z.string(),
  cta: z.string(),
  hashtags: z.array(z.string()).default([]),
  script_hook: z.string(),
  script_intro: z.string(),
  script_body: z.string(),
  script_proof: z.string(),
  script_cta: z.string(),
  video_scenes: z.array(VideoSceneSchema).default([]),
  creative_brief: CreativeBriefSchema,
  confidence: z.number().default(0.95),
  warnings: z.array(z.string()).default([]),
});

export const DocumentFieldSchema = z.object({
  source_field: z.string(),
  target_field: z.string(),
  extracted_value: z.string(),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]).default("HIGH"),
  confidence_score: z.number().default(0.9),
  verified: z.boolean().default(true),
  notes: z.string().optional(),
});

export const DocumentExtractionSchema = z.object({
  summary: z.string(),
  fields: z.array(DocumentFieldSchema),
});

export const RepurposedPlatformOutputSchema = z.object({
  platform: z.enum(["facebook", "instagram", "tiktok", "youtube", "linkedin", "x", "lemon8"]),
  title: z.string().optional(),
  content: z.string().optional(),
  hook: z.string().optional(),
  structure: z.string().optional(),
  cta: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  carousel_slides: z.array(z.string()).optional(),
  video_script: z.string().optional(),
  youtube_chapters: z.array(z.object({ time: z.string(), title: z.string() })).optional(),
  youtube_shorts_ideas: z.array(z.string()).optional(),
  x_thread: z.array(z.string()).optional(),
  lemon8_cover_title: z.string().optional(),
  lemon8_points: z.array(z.string()).optional(),
});

export const RepurposedPackageSchema = z.object({
  outputs: z.record(RepurposedPlatformOutputSchema),
});

export const AnalyticsDiagnosticSchema = z.object({
  executive_summary: z.string(),
  key_findings: z.array(z.string()),
  performance_patterns: z.array(z.string()),
  identified_problems: z.array(z.string()),
  what_performed_well: z.array(z.string()),
  what_performed_poorly: z.array(z.string()),
  content_themes_worked: z.array(z.string()),
  formats_worked: z.array(z.string()),
  hooks_worked: z.array(z.string()),
  platforms_worked: z.array(z.string()),
  what_to_repeat: z.array(z.string()),
  what_to_reduce: z.array(z.string()),
  what_to_test_next: z.array(z.string()),
  recommendations: z.array(z.string()),
  content_opportunities: z.array(z.object({
    title: z.string(),
    pillar: z.string(),
    platform: z.enum(["facebook", "instagram", "tiktok", "youtube", "linkedin", "x", "all"]),
    format: z.string(),
    rationale: z.string(),
  })),
  is_data_sufficient: z.boolean().default(true),
});
