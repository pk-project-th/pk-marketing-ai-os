import { WorkflowItem } from "@/types";

export const DEMO_WORKFLOWS: WorkflowItem[] = [
  {
    id: "wf-001",
    name: "Idea Generation Pipeline",
    slug: "idea-generation",
    description: "ดึงข้อมูลแบรนด์และสเปกรถจาก Knowledge Base แล้วสร้างชุดไอเดียตาม Framework การตลาด",
    trigger_type: "MANUAL",
    status: "ACTIVE",
    last_run: "2026-09-05T10:30:00Z",
    last_duration_ms: 2150,
    last_result: "SUCCESS",
    n8n_workflow_id: "n8n_wf_ideas_01"
  },
  {
    id: "wf-002",
    name: "Content Production Automation",
    slug: "content-production",
    description: "แปลงไอเดียที่อนุมัติเป็น แคปชัน สคริปต์วิดีโอ และ Creative Brief สำหรับทีมถ่ายทำ",
    trigger_type: "EVENT",
    status: "ACTIVE",
    last_run: "2026-09-05T09:15:00Z",
    last_duration_ms: 3840,
    last_result: "SUCCESS",
    n8n_workflow_id: "n8n_wf_prod_02"
  },
  {
    id: "wf-003",
    name: "Document Extraction & Field Mapping",
    slug: "doc-extraction",
    description: "วิเคราะห์เอกสาร PDF/DOCX/XLSX สกัดฟิลด์สำคัญ และจับคู่ลงฟอร์มอัตโนมัติ",
    trigger_type: "MANUAL",
    status: "ACTIVE",
    last_run: "2026-09-05T08:30:00Z",
    last_duration_ms: 4120,
    last_result: "SUCCESS"
  },
  {
    id: "wf-004",
    name: "Multi-Platform Repurposing",
    slug: "content-repurposing",
    description: "ปรับรูปแบบเนื้อหา 1 ชิ้นให้เข้ากับจริตและฟอร์แมตของ Facebook, IG, TikTok, YouTube, LinkedIn, X",
    trigger_type: "MANUAL",
    status: "ACTIVE",
    last_run: "2026-09-04T17:00:00Z",
    last_duration_ms: 3600,
    last_result: "SUCCESS"
  },
  {
    id: "wf-005",
    name: "Marketing Performance Analysis",
    slug: "analytics-diagnostic",
    description: "นำเข้าไฟล์ตัวเลขสถิติ วิเคราะห์ 9 มิติ และส่งผลลัพธ์ย้อนกลับเข้าคลังไอเดีย",
    trigger_type: "SCHEDULE",
    status: "ACTIVE",
    last_run: "2026-09-01T18:00:00Z",
    last_duration_ms: 4890,
    last_result: "SUCCESS"
  },
  {
    id: "wf-006",
    name: "Document-to-Form External Submission",
    slug: "doc-to-form-submission",
    description: "ส่งข้อมูลฟิลด์ที่ผ่านการอนุมัติแล้วไปยัง Google Forms หรือ ERP ภายนอกผ่าน Webhook",
    trigger_type: "WEBHOOK",
    status: "ACTIVE",
    last_run: "2026-09-01T14:30:00Z",
    last_duration_ms: 1200,
    last_result: "SUCCESS"
  },
  {
    id: "wf-007",
    name: "Knowledge Base Auto-Ingestion",
    slug: "knowledge-ingestion",
    description: "อัปเดตข้อมูลผลิตภัณฑ์ ตรวจสอบคำเคลม และแบ่งหมวดหมู่เอกสารอ้างอิง",
    trigger_type: "MANUAL",
    status: "ACTIVE",
    last_run: "2026-08-15T15:10:00Z",
    last_duration_ms: 1950,
    last_result: "SUCCESS"
  }
];
