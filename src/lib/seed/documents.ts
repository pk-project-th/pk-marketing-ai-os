import { ExtractedDocument, FormTemplate } from "@/types";

export const DEMO_DOCUMENTS: ExtractedDocument[] = [
  {
    id: "doc-001",
    filename: "PK_Sedan_X_Q4_Campaign_Brief_Official.pdf",
    file_type: "PDF",
    upload_date: "2026-09-01",
    summary: "เอกสารสรุปข้อกำหนดแคมเปญเปิดตัวไตรมาสที่ 4 ของ PK Sedan X พร้อมงบประมาณ สเปกหลัก และเป้าหมาย KPI ยอดจอง",
    fields: [
      { source_field: "Campaign Name", target_field: "campaign_name", extracted_value: "Urban Mobility 2026 - PK Sedan X Launch", confidence: "HIGH", confidence_score: 0.99, verified: true },
      { source_field: "Product / Model", target_field: "model_name", extracted_value: "PK Sedan X (Ultra Smart Hybrid)", confidence: "HIGH", confidence_score: 0.98, verified: true },
      { source_field: "Campaign Period", target_field: "start_date", extracted_value: "2026-09-01", confidence: "HIGH", confidence_score: 0.95, verified: true },
      { source_field: "Campaign Period", target_field: "end_date", extracted_value: "2026-10-31", confidence: "HIGH", confidence_score: 0.95, verified: true },
      { source_field: "Approved Budget", target_field: "total_budget", extracted_value: "850,000 THB", confidence: "HIGH", confidence_score: 0.96, verified: true },
      { source_field: "Target Audience", target_field: "audience_segment", extracted_value: "คนเมือง อายุ 25-35 ปี First-Jobber & Young Pro", confidence: "HIGH", confidence_score: 0.92, verified: true },
      { source_field: "Primary Objective", target_field: "objective", extracted_value: "สร้างยอดจอง 250 คัน และนัดทดลองขับ 1,200 สิทธิ์", confidence: "HIGH", confidence_score: 0.94, verified: true },
      { source_field: "Main Media Channels", target_field: "media_mix", extracted_value: "Meta 45%, TikTok 30%, YouTube 15%, Programmatic 10%", confidence: "MEDIUM", confidence_score: 0.88, verified: true },
      { source_field: "Key Deliverables", target_field: "deliverables", extracted_value: "15 Social Posts, 4 Video Shorts, 1 Long Review, 2 LP Banners", confidence: "HIGH", confidence_score: 0.93, verified: true },
      { source_field: "Person in Charge", target_field: "manager", extracted_value: "กิตติพงษ์ การตลาด (Marketing Lead)", confidence: "HIGH", confidence_score: 0.97, verified: true }
    ],
    mapped_template: "Template: Motor Show Campaign Submission Form",
    status: "MAPPED",
    integration_status: "NOT_CONNECTED",
    created_at: "2026-09-01T14:20:00Z"
  }
];

export const DEMO_FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "tpl-001",
    name: "แบบฟอร์มขออนุมัติงบประมาณและเริ่มแคมเปญการตลาด (Campaign Budget Approval Form)",
    description: "ฟอร์มมาตรฐานสำหรับการเสนอผู้บริหารฝ่ายการตลาดและจัดซื้อ",
    target_fields: [
      { key: "campaign_name", label: "ชื่อโครงการ/แคมเปญ", required: true, type: "text" },
      { key: "model_name", label: "รุ่นรถยนต์/ผลิตภัณฑ์", required: true, type: "text" },
      { key: "start_date", label: "วันที่เริ่มต้น", required: true, type: "date" },
      { key: "end_date", label: "วันที่สิ้นสุด", required: true, type: "date" },
      { key: "total_budget", label: "งบประมาณรวมที่เสนอขอ (บาท)", required: true, type: "number" },
      { key: "audience_segment", label: "กลุ่มเป้าหมายหลัก", required: true, type: "text" },
      { key: "objective", label: "วัตถุประสงค์และ KPI", required: true, type: "text" },
      { key: "media_mix", label: "สัดส่วนงบประมาณสื่อ", required: false, type: "text" },
      { key: "deliverables", label: "ชิ้นงานที่ต้องส่งมอบ", required: true, type: "text" },
      { key: "manager", label: "ผู้รับผิดชอบโครงการ", required: true, type: "text" }
    ]
  },
  {
    id: "tpl-002",
    name: "แบบฟอร์มส่งมอบบรีฟงานฝ่ายผลิตสื่อ (Production Creative Request Form)",
    description: "ฟอร์มสำหรับส่งมอบงานให้ทีมกราฟิกและโปรดักชันเฮาส์",
    target_fields: [
      { key: "campaign_name", label: "ชื่องาน", required: true, type: "text" },
      { key: "deliverables", label: "ประเภทชิ้นงานที่ต้องการ", required: true, type: "text" },
      { key: "end_date", label: "กำหนดส่งงาน (Deadline)", required: true, type: "date" },
      { key: "manager", label: "ผู้ประสานงาน", required: true, type: "text" }
    ]
  }
];
