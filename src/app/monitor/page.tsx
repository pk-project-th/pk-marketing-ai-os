"use client";

import React, { useState, useEffect } from "react";
import { Activity, Zap, DollarSign, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { AIGenerationLog } from "@/types";

export default function AIMonitorPage() {
  const [logs, setLogs] = useState<AIGenerationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.aiGenerations) setLogs(data.aiGenerations);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalTokens = logs.reduce((acc, l) => acc + (l.total_tokens || 0), 0);
  const totalCost = logs.reduce((acc, l) => acc + (l.cost_usd || 0), 0);
  const avgLatency = logs.length > 0 ? Math.round(logs.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / logs.length) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E9EC] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>AI USAGE & COST ENGINE</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">มอนิเตอร์การใช้งาน AI (AI Agent Monitor)</h2>
          <p className="text-xs text-slate-700 mt-1">
            ติดตามจำนวนครั้งการเรียกใช้งาน AI, ปริมาณ Token, ความเร็วในการตอบสนอง (Latency) และค่าใช้จ่ายประมาณการ
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-800 text-xs font-medium border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>รีเฟรชสถิติ</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E9EC] rounded-xl p-5">
          <div className="text-xs text-slate-700 font-medium">จำนวนครั้งที่เรียก AI</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">{logs.length} ครั้ง</div>
          <div className="text-[10px] text-emerald-400 mt-1">อัตราสำเร็จ 100%</div>
        </div>

        <div className="bg-white border border-[#E8E9EC] rounded-xl p-5">
          <div className="text-xs text-slate-700 font-medium">ปริมาณ Tokens สะสม</div>
          <div className="mt-2 text-2xl font-bold text-cyan-400 font-mono">{totalTokens.toLocaleString()}</div>
          <div className="text-[10px] text-slate-700 mt-1">Prompt + Completion</div>
        </div>

        <div className="bg-white border border-[#E8E9EC] rounded-xl p-5">
          <div className="text-xs text-slate-700 font-medium">ความเร็วเฉลี่ย (Avg Latency)</div>
          <div className="mt-2 text-2xl font-bold text-indigo-400 font-mono">{avgLatency} ms</div>
          <div className="text-[10px] text-slate-700 mt-1">Gemini 3.8 Flash</div>
        </div>

        <div className="bg-white border border-[#E8E9EC] rounded-xl p-5">
          <div className="text-xs text-slate-700 font-medium">ค่าใช้จ่ายประมาณการ (USD)</div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">${totalCost.toFixed(6)}</div>
          <div className="text-[10px] text-slate-700 mt-1">โมเดลคุ้มค่าที่สุด</div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-900">บันทึกการเรียกใช้งานแต่ละรอบ (Call Records)</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#E8E9EC] rounded-xl overflow-hidden">
            <thead className="bg-slate-850 text-slate-700 border-b border-[#E8E9EC]">
              <tr>
                <th className="p-3">เวลา</th>
                <th className="p-3">โมเดล</th>
                <th className="p-3">เวิร์กโฟลว์</th>
                <th className="p-3">Prompt Tokens</th>
                <th className="p-3">Completion</th>
                <th className="p-3">รวม Tokens</th>
                <th className="p-3">ความเร็ว</th>
                <th className="p-3">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-800 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/40 transition-colors font-sans">
                  <td className="p-3 font-mono text-slate-700 whitespace-nowrap">{log.timestamp.split("T")[1]?.slice(0, 8)}</td>
                  <td className="p-3 text-slate-900 font-medium">{log.model}</td>
                  <td className="p-3 text-cyan-400 font-medium">{log.workflow}</td>
                  <td className="p-3 font-mono">{log.prompt_tokens}</td>
                  <td className="p-3 font-mono">{log.completion_tokens}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">{log.total_tokens}</td>
                  <td className="p-3 font-mono text-slate-800">{log.latency_ms} ms</td>
                  <td className="p-3">
                    {log.status === "SUCCESS" ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1 font-sans text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> สำเร็จ
                      </span>
                    ) : (
                      <span className="text-rose-400 font-medium flex items-center gap-1 font-sans text-xs">
                        <XCircle className="w-3.5 h-3.5" /> ล้มเหลว
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
