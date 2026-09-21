"use client";

import React, { useState } from "react";
import { Sparkles, Copy, Check, Camera, Image as ImageIcon, Sliders, ShieldAlert, Send, CheckCircle2 } from "lucide-react";

export default function CreativeStudioPage() {
  const [contentType, setContentType] = useState("Automotive Commercial Photography");
  const [platform, setPlatform] = useState("Instagram & Facebook Ad");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [visualStyle, setVisualStyle] = useState("Cinematic Photorealistic Commercial");
  const [subject, setSubject] = useState("PK Sedan X, modern white hybrid sedan, gleaming reflections");
  const [environment, setEnvironment] = useState("Urban rooftop at sunset, Bangkok cityscape skyline in background");
  const [mood, setMood] = useState("Confident, Premium, Futuristic yet Warm");
  const [lighting, setLighting] = useState("Golden hour warm sunlight with subtle blue rim lighting on car contours");
  const [composition, setComposition] = useState("Three-quarter front view, 45-degree angle, rule of thirds");
  const [camera, setCamera] = useState("Hasselblad H6D-100c, 50mm f/2.8 lens, sharp focus, 8k resolution");
  const [negativeSpace, setNegativeSpace] = useState("30% clean open space at top-right for advertising copy");

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState<string | null>(null);

  // Generated results
  const [generatedPrompt, setGeneratedPrompt] = useState(
    "Commercial automotive photography of a sleek pearl white PK Sedan X hybrid parked on an urban rooftop at golden hour, Bangkok skyline in background, cinematic warm lighting, clean reflections on car body, 30% negative space on top-right, 8k resolution, shot on Hasselblad H6D-100c, 50mm lens --ar 16:9 --style raw"
  );
  const [negativePrompt, setNegativePrompt] = useState(
    "blurry, cartoon, 3d render, plastic look, deformed car body, distorted wheels, extra doors, unrealistic lighting, watermark, low quality, oversaturated"
  );
  const [visualNotes, setVisualNotes] = useState<string | null>(
    "Visual configured for Instagram & Facebook Ad (16:9). Preserves 30% negative space for advertising typography."
  );
  const [suggestedCopy, setSuggestedCopy] = useState<string | null>(
    "THE NEW STANDARD OF HYBRID ELEGANCE — PK SEDAN X"
  );

  const handleGeneratePrompt = async () => {
    setLoading(true);
    setQueueStatus(null);
    try {
      const res = await fetch("/api/ai/creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          platform,
          aspectRatio,
          visualStyle,
          subject,
          environment,
          mood,
          lighting,
          composition,
          camera,
          negativeSpace,
          sendToApproval: false
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedPrompt(data.data.prompt);
        setNegativePrompt(data.data.negative_prompt);
        setVisualNotes(data.data.visual_notes);
        setSuggestedCopy(data.data.suggested_copy);
      }
    } catch (err) {
      console.error("Creative generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToApproval = async () => {
    setQueueStatus("SENDING");
    try {
      const res = await fetch("/api/ai/creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          platform,
          aspectRatio,
          visualStyle,
          subject,
          environment,
          mood,
          lighting,
          composition,
          camera,
          negativeSpace,
          sendToApproval: true
        })
      });
      const data = await res.json();
      if (data.success && data.approval) {
        setQueueStatus("SENT");
        setTimeout(() => setQueueStatus(null), 5000);
      } else {
        setQueueStatus("ERROR");
      }
    } catch (err) {
      console.error(err);
      setQueueStatus("ERROR");
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#E8E9EC] pb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 font-bold text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CREATIVE PROMPT STUDIO</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ห้องออกแบบคำสั่งภาพ AI (Creative Studio)</h2>
        <p className="text-xs text-slate-700 mt-1">
          สร้างคำสั่งภาพ (Prompt) ภาษาอังกฤษระดับมืออาชีพสำหรับ Midjourney, Stable Diffusion และ Imagen โดยคำนึงถึงสเปกรถยนต์และหลักการโฆษณาจริง
        </p>
      </div>

      {/* Zero Hallucination Warning Note */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-700 font-bold flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-900 font-bold">หลักการทำงานแบบโปร่งใส (Zero Hallucination Principle):</span>{" "}
          ระบบจะสร้างคำสั่ง Prompt และ Negative Prompt อย่างแม่นยำเพื่อให้คุณนำไปใช้กับเครื่องมือสร้างภาพ AI ภายนอก โดยระบบจะไม่แกล้งทำเป็นเจนรูปเสร็จจนกว่าจะมีการเชื่อมต่อ API ตัวสร้างภาพจริงในหน้าการตั้งค่า
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Parameter Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="text-sm font-semibold text-slate-900 flex items-center gap-2 border-b border-[#E8E9EC] pb-3">
            <Sliders className="w-4 h-4 text-indigo-700 font-bold" />
            <span>ปรับแต่งพารามิเตอร์ด้านภาพ (Creative Parameters)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-800 font-medium mb-1">สัดส่วนภาพ (Aspect Ratio)</label>
              <select
                value={aspectRatio}
                onChange={e => setAspectRatio(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg text-xs text-slate-900 focus:outline-none"
              >
                <option value="16:9">16:9 (Landscape / YouTube / Web)</option>
                <option value="9:16">9:16 (Vertical / TikTok / Reels / Stories)</option>
                <option value="1:1">1:1 (Square / Instagram Post)</option>
                <option value="4:5">4:5 (Portrait / Facebook Feed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-800 font-medium mb-1">สไตล์ภาพ (Visual Style)</label>
              <select
                value={visualStyle}
                onChange={e => setVisualStyle(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg text-xs text-slate-900 focus:outline-none"
              >
                <option value="Cinematic Photorealistic Commercial">Cinematic Photorealistic Commercial</option>
                <option value="Minimalist Studio High-Key Photography">Minimalist Studio High-Key Photography</option>
                <option value="Atmospheric Moody Night Drive">Atmospheric Moody Night Drive</option>
                <option value="Dynamic Action Tracking Shot">Dynamic Action Tracking Shot</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-800 font-medium mb-1">ตัวแบบหลักและรุ่นรถ (Subject)</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg text-xs text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-800 font-medium mb-1">สภาพแวดล้อมและฉากหลัง (Environment)</label>
            <input
              type="text"
              value={environment}
              onChange={e => setEnvironment(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg text-xs text-slate-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-800 font-medium mb-1">การจัดแสง (Lighting)</label>
              <input
                type="text"
                value={lighting}
                onChange={e => setLighting(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-800 font-medium mb-1">อารมณ์ภาพ (Mood)</label>
              <input
                type="text"
                value={mood}
                onChange={e => setMood(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-800 font-medium mb-1">การจัดองค์ประกอบ (Composition)</label>
              <input
                type="text"
                value={composition}
                onChange={e => setComposition(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-800 font-medium mb-1">กล้องและเลนส์ (Camera Direction)</label>
              <input
                type="text"
                value={camera}
                onChange={e => setCamera(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-800 font-medium mb-1">พื้นที่เว้นว่างสำหรับข้อความ (Negative Space)</label>
            <input
              type="text"
              value={negativeSpace}
              onChange={e => setNegativeSpace(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7F8FA] border border-[#E8E9EC] rounded-lg text-xs text-slate-900 focus:outline-none"
            />
          </div>

          <div className="pt-3">
            <button
              onClick={handleGeneratePrompt}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-slate-900 text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              {loading ? "กำลังปรับปรุงคำสั่ง..." : "✨ สร้างคำสั่ง Prompt ด้วย Gemini 3.8"}
            </button>
          </div>
        </div>

        {/* Right Column: Output Prompt Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>คำสั่ง Prompt ภาษาอังกฤษ (Master Prompt)</span>
              </div>
              <button
                onClick={() => copyText(generatedPrompt, "prompt")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#17181A] hover:bg-slate-800 text-white font-bold text-xs font-medium transition-colors"
              >
                {copied === "prompt" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === "prompt" ? "คัดลอกแล้ว" : "คัดลอก Prompt"}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-200 leading-relaxed break-words select-all">
              {generatedPrompt}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-rose-400">Negative Prompt (คำสั่งตัดสิ่งแปลกปลอม):</span>
                <button
                  onClick={() => copyText(negativePrompt, "np")}
                  className="text-xs text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
                >
                  {copied === "np" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied === "np" ? "คัดลอกแล้ว" : "คัดลอก"}</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-rose-300 leading-relaxed">
                {negativePrompt}
              </div>
            </div>

            {suggestedCopy && (
              <div className="p-3.5 rounded-xl bg-[#F7F8FA]/80 border border-slate-800 text-xs space-y-1">
                <span className="text-[11px] font-semibold text-indigo-700 font-bold">ข้อความพาดหัวที่แนะนำสำหรับพื้นที่ว่าง (Suggested Copy):</span>
                <div className="text-slate-900 font-medium">{suggestedCopy}</div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-[#F7F8FA]/60 border border-slate-800 text-xs space-y-2">
              <div className="font-semibold text-slate-900">คำแนะนำการนำไปใช้งาน (Generation Notes):</div>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                <li>ใช้คำสั่ง <code className="text-indigo-700 font-bold">--style raw</code> ใน Midjourney v6 เพื่อคงความคมชัดสมจริงของลายเส้นตัวถังรถ</li>
                <li>หลีกเลี่ยงการระบุปีที่คลาดเคลื่อน เพื่อไม่ให้ AI ผสมชิ้นส่วนรถยนต์รุ่นเก่า</li>
                <li>สัดส่วน <code className="text-indigo-700 font-bold">{aspectRatio}</code> ถูกตั้งค่าเพื่อความเข้ากันได้ของ Layout สื่อโฆษณา</li>
                {visualNotes && <li>{visualNotes}</li>}
              </ul>
            </div>

            <div className="pt-2">
              {queueStatus === "SENT" ? (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ส่งคำสั่งภาพเข้าศูนย์อนุมัติ (Approval Center) เรียบร้อยแล้ว!</span>
                </div>
              ) : (
                <button
                  onClick={handleSendToApproval}
                  disabled={queueStatus === "SENDING"}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-indigo-500/40 text-indigo-300 hover:text-slate-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{queueStatus === "SENDING" ? "กำลังส่งเข้าคิว..." : "ส่งคำสั่งภาพเข้าศูนย์อนุมัติ (Send to Approval Queue)"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
