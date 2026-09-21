"use client";

import React, { useState, useEffect } from "react";
import {
  Network,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Sliders,
  Terminal,
  ExternalLink,
  Zap,
  Radio
} from "lucide-react";
import { WorkflowItem, WorkflowRunLog } from "@/types";

export default function WorkflowCenterPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [runs, setRuns] = useState<WorkflowRunLog[]>([]);
  const [selectedRun, setSelectedRun] = useState<WorkflowRunLog | null>(null);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch("/api/workflows");
      const data = await res.json();
      if (data.workflows) setWorkflows(data.workflows);
      if (data.runs) {
        setRuns(data.runs);
        if (data.runs.length > 0) setSelectedRun(data.runs[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTrigger = async (wf: WorkflowItem) => {
    setTriggeringId(wf.id);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: wf.id,
          slug: wf.slug,
          name: wf.name,
          triggerType: wf.trigger_type,
          payload: { trigger_source: "Manual UI trigger", timestamp: new Date().toISOString() }
        })
      });
      const data = await res.json();
      if (data.success && data.run) {
        setRuns(prev => [data.run, ...prev]);
        setSelectedRun(data.run);
        setNotification(`สั่งรันเวิร์กโฟลว์ '${wf.name}' สำเร็จ (${data.run.duration_ms}ms)`);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTriggeringId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E9EC] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
            <Network className="w-3.5 h-3.5" />
            <span>AUTOMATION & N8N HUB</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ศูนย์ควบคุมเวิร์กโฟลว์ (Workflow Center)</h2>
          <p className="text-xs text-slate-700 mt-1">
            บริหารจัดการและสั่งรันกระบวนการอัตโนมัติ 7 สายงาน รองรับการเชื่อมต่อ Webhook ของ n8n และระบบประมวลผล Local สำรอง
          </p>
        </div>

        {notification && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-700 font-semibold text-xs shadow-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map(wf => (
          <div key={wf.id} className="bg-white border border-[#E8E9EC] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#E8E9EC] transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                  {wf.trigger_type}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {wf.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{wf.name}</h3>
              <p className="mt-1 text-xs text-slate-700 line-clamp-2 leading-relaxed">{wf.description}</p>
            </div>

            <div className="pt-3 border-t border-[#E8E9EC]/80 flex items-center justify-between">
              <div className="text-[11px] text-slate-700">
                {wf.last_duration_ms ? `${wf.last_duration_ms} ms` : "พร้อมทำงาน"}
              </div>
              <button
                onClick={() => handleTrigger(wf)}
                disabled={triggeringId === wf.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-slate-900 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {triggeringId === wf.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>{triggeringId === wf.id ? "กำลังประมวลผล..." : "สั่งรันงาน (Execute)"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Logs Section */}
      <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#E8E9EC] pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>ประวัติการทำงานและผลลัพธ์ (Execution Logs & Results)</span>
          </div>
          <button onClick={fetchWorkflows} className="text-xs text-slate-700 hover:text-slate-900 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>รีเฟรช</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Runs Table */}
          <div className="lg:col-span-6 space-y-2">
            <div className="text-xs font-semibold text-slate-700 mb-2">ประวัติรอบการทำงานล่าสุด:</div>
            {runs.map(run => (
              <div
                key={run.id}
                onClick={() => setSelectedRun(run)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                  selectedRun?.id === run.id
                    ? "bg-slate-850 border-cyan-500/60 shadow"
                    : "bg-white border-[#E8E9EC] hover:border-[#E8E9EC] text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {run.status === "SUCCESS" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-900">{run.workflow_name}</div>
                    <div className="text-[11px] text-slate-700">{run.trigger} • {run.duration_ms}ms</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-700 font-mono">
                  {run.started_at?.split("T")[1]?.slice(0, 8)}
                </div>
              </div>
            ))}
          </div>

          {/* Payload Inspector */}
          <div className="lg:col-span-6">
            {selectedRun ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-[#E8E9EC] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{selectedRun.workflow_name}</span>
                  <span className="text-[10px] font-mono text-cyan-400">{selectedRun.id}</span>
                </div>
                <div className="text-xs font-semibold text-slate-700">Output Result Payload:</div>
                <pre className="p-3 bg-white border border-[#E8E9EC] rounded-lg text-xs font-mono text-emerald-700 font-semibold overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedRun.output_result || selectedRun.input_payload, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="p-10 text-center text-slate-700 text-xs border border-dashed border-[#E8E9EC] rounded-xl">
                เลือกประวัติการรันเพื่อดู Payload
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
