import React from "react";
import { ContentStatus, ApprovalStatus } from "@/types";

interface StatusBadgeProps {
  status: ContentStatus | ApprovalStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "SCHEDULED":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      case "AI_GENERATED":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "IN_REVIEW":
      case "HUMAN_REVIEW":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "DRAFT":
      case "IDEA":
        return "bg-slate-500/15 text-slate-300 border-slate-500/30";
      case "PUBLISHED":
      case "EXECUTED":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "REJECTED":
      case "ERROR":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "PARSED":
      case "MAPPED":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const getThaiLabel = () => {
    switch (status) {
      case "APPROVED": return "อนุมัติแล้ว (Approved)";
      case "SCHEDULED": return "ตั้งเวลาโพสต์แล้ว (Scheduled)";
      case "AI_GENERATED": return "สร้างโดย AI";
      case "IN_REVIEW":
      case "HUMAN_REVIEW": return "รอตรวจสอบ (Review)";
      case "DRAFT": return "ฉบับร่าง (Draft)";
      case "IDEA": return "ไอเดีย (Idea)";
      case "PUBLISHED": return "เผยแพร่แล้ว";
      case "EXECUTED": return "ดำเนินการแล้ว";
      case "REJECTED": return "ปฏิเสธ (Rejected)";
      case "PARSED": return "สกัดข้อมูลแล้ว";
      case "MAPPED": return "จับคู่ฟิลด์แล้ว";
      default: return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {getThaiLabel()}
    </span>
  );
};
