import { ApprovalItem } from "@/types";

export const DEMO_APPROVALS: ApprovalItem[] = [
  {
    id: "app-001",
    title: "[DEMO] อนุมัติเผยแพร่: แคปชันและสคริปต์วิดีโอ TikTok '3 ปุ่มแก้ง่วงรถติดสาทร'",
    entity_type: "CONTENT",
    entity_id: "idea-002",
    content_preview: "ถ้าคุณต้องติดไฟแดงวันละ 2 ชั่วโมง... นี่คือ 3 ปุ่มที่คุณจะกดขอบคุณวิศวกรทุกวัน (Auto Brake Hold, Air Purifier PM2.5, Massage Seat)",
    source: "Agent 02 — Production Agent",
    ai_generated_fields: {
      framework: "PAS",
      platform: "tiktok",
      format: "Short Video 45s",
      hashtags: ["#PKSedanX", "#รถติด", "#รีวิวรถ", "#TikTokUni"]
    },
    confidence: "HIGH",
    warnings: ["ตรวจสอบว่าไม่มีการเคลมว่าระบบขับขี่อัตโนมัติ 100% เพื่อให้ถูกต้องตามกฎหมาย"],
    recommended_action: "อนุมัติเพื่อส่งต่อไปยังคิวตั้งเวลาเผยแพร่",
    status: "HUMAN_REVIEW",
    created_at: "2026-09-04T16:00:00Z"
  },
  {
    id: "app-002",
    title: "[DEMO] อนุมัติส่งข้อมูลแบบฟอร์ม: เอกสารบรีฟ Motor Show Campaign 2026",
    entity_type: "DOCUMENT_FORM",
    entity_id: "doc-001",
    content_preview: "แมปปิ้ง 10 ฟิลด์จากเอกสาร PDF เข้าสู่แบบฟอร์มขออนุมัติงบประมาณกลาง 850,000 บาท",
    source: "Agent 03 — Document Agent",
    ai_generated_fields: {
      budget_match: "850,000 THB",
      period: "2026-09-01 ถึง 2026-10-31",
      lead_kpi: "342 Leads"
    },
    confidence: "HIGH",
    warnings: [],
    recommended_action: "ตรวจสอบความถูกต้องของรหัสโครงการก่อนกดยืนยัน",
    status: "HUMAN_REVIEW",
    created_at: "2026-09-05T08:30:00Z"
  },
  {
    id: "app-003",
    title: "[DEMO] อนุมัติแคปชัน Carousel เงินเดือน 35,000 ขับ PK Sedan X ได้ไหม?",
    entity_type: "CONTENT",
    entity_id: "asset-001",
    content_preview: "ถอดตัวเลขผ่อนเริ่มต้นวันละ 300 บ. ประหยัดน้ำมันกิโลละ 1.4 บาท คุ้มค่าที่สุด",
    source: "Agent 02 — Production Agent",
    ai_generated_fields: {
      framework: "PAS",
      platform: "facebook"
    },
    confidence: "HIGH",
    warnings: [],
    recommended_action: "อนุมัติแล้ว",
    status: "APPROVED",
    reviewed_by: "Marketing Director",
    reviewed_at: "2026-09-05T09:00:00Z",
    created_at: "2026-09-02T10:10:00Z"
  }
];
