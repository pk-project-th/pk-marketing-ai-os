"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Repeat,
  Sparkles,
  Copy,
  Check,
  Facebook,
  Instagram,
  Video,
  Twitter,
  RefreshCw,
  Citrus,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkle,
  Image as ImageIcon
} from "lucide-react";
import { Platform, ContentIdea } from "@/types";

const TARGET_PLATFORMS: {
  id: Platform;
  name: string;
  desc: string;
  icon: any;
  accentBg: string;
  accentText: string;
  badge: string;
}[] = [
  {
    id: "facebook",
    name: "Facebook",
    desc: "สตอรี่เทลลิ่ง บรรยายลึก รายละเอียดครบ พร้อม CTA",
    icon: Facebook,
    accentBg: "bg-blue-500/10 border-blue-500/30",
    accentText: "text-blue-700 font-bold",
    badge: "Long Post"
  },
  {
    id: "tiktok",
    name: "TikTok",
    desc: "สคริปต์วิดีโอสั้น 30-60 วิ Hook แรง จังหวะตัดต่อ",
    icon: Video,
    accentBg: "bg-rose-500/10 border-rose-500/30",
    accentText: "text-rose-700 font-bold",
    badge: "Video Script"
  },
  {
    id: "instagram",
    name: "Instagram",
    desc: "แคปชันกระชับ พร้อมโครงสร้างภาพสไลด์ Carousel",
    icon: Instagram,
    accentBg: "bg-fuchsia-500/10 border-fuchsia-500/30",
    accentText: "text-fuchsia-700 font-bold",
    badge: "Carousel"
  },
  {
    id: "x",
    name: "X (Twitter)",
    desc: "เธรด 4-5 ทวีต ย่อยประเด็น สั้น คม ไวรัลง่าย",
    icon: Twitter,
    accentBg: "bg-sky-500/10 border-sky-500/30",
    accentText: "text-sky-400",
    badge: "Thread"
  },
  {
    id: "lemon8",
    name: "Lemon8",
    desc: "สไตล์ไลฟ์สไตล์รีวิว พาดหัวหน้าปก + สรุปข้อดีบอกต่อ",
    icon: Citrus,
    accentBg: "bg-amber-500/10 border-amber-500/30",
    accentText: "text-amber-800 font-bold",
    badge: "Review Guide"
  }
];

function RepurposeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const [availableItems, setAvailableItems] = useState<ContentIdea[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentIdea | null>(null);

  const [sourceText, setSourceText] = useState(
    "รถยนต์ไฮบริดรุ่นใหม่ PK Sedan X 2026 ออกแบบมาเพื่อการเดินทางในเมืองที่แท้จริง ด้วยเครื่องยนต์ 1.5L VTEC Turbo Hybrid กำลังรวม 190 แรงม้า ประหยัดน้ำมันสูงสุด 26.5 กม./ลิตร วิ่งทางไกลถังเดียวกว่า 900 กิโลเมตร ภายในติดตั้งระบบกรองอากาศ PM2.5, Auto Brake Hold สำหรับรถติด และรับประกันแบตเตอรี่ไฮบริดนาน 8 ปี ผ่อนเริ่มต้นวันละประมาณ 300 บาท"
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "facebook",
    "tiktok",
    "instagram",
    "x",
    "lemon8"
  ]);

  const [loading, setLoading] = useState(false);
  const [queueing, setQueueing] = useState(false);
  const [repurposedOutputs, setRepurposedOutputs] = useState<Record<string, any> | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("facebook");
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/ai/ideas");
        const data = await res.json();
        if (data.ideas) {
          // Items in REPURPOSE stage or ACCEPTED
          const pool = data.ideas.filter((i: ContentIdea) => i.pipeline_stage === "REPURPOSE" || i.status === "ACCEPTED" || i.media_url);
          setAvailableItems(pool);

          let target = pool[0] || null;
          if (idParam) {
            const matched = pool.find((i: ContentIdea) => i.id === idParam);
            if (matched) target = matched;
          }
          if (target) {
            setSelectedItem(target);
            setSourceText(target.caption || target.concept || target.title);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [idParam]);

  const handleRepurpose = async () => {
    if (!sourceText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceText,
          sourceType: "article",
          targetPlatforms: selectedPlatforms
        })
      });
      const data = await res.json();
      if (data.success && data.repurposed) {
        setRepurposedOutputs(data.repurposed.outputs);
        const firstKey = Object.keys(data.repurposed.outputs)[0] || "facebook";
        setActiveTab(firstKey);
        setNotification("AI แปลงจริตเนื้อหาเป็น 5 แพลตฟอร์มสำเร็จแล้ว!");
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Move to Step 4: Add into Publishing Queue
  const handleSendToQueue = async () => {
    if (!repurposedOutputs) return;
    setQueueing(true);
    try {
      // Create an approval / queue record for each platform
      const promises = Object.entries(repurposedOutputs).map(([platformKey, item]) => {
        let content = item.content || "";
        if (platformKey === "lemon8") {
          content = `${item.lemon8_cover_title ? `[พาดหัวหน้าปก: ${item.lemon8_cover_title}]\n\n` : ""}${item.content || ""}${item.lemon8_points ? `\n\nจุดเด่น:\n${item.lemon8_points.map((p: string) => `• ${p}`).join("\n")}` : ""}`;
        } else if (item.carousel_slides) {
          content = `${item.content ? `${item.content}\n\n` : ""}${item.carousel_slides.map((s: string, idx: number) => `[Slide ${idx + 1}] ${s}`).join("\n")}`;
        } else if (item.x_thread) {
          content = item.x_thread.join("\n\n---\n\n");
        } else if (item.video_script) {
          content = item.video_script;
        }

        return fetch("/api/approvals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `[${platformKey.toUpperCase()}] ${selectedItem?.title || item.title || "Marketing Post"}`,
            content_preview: content,
            entity_type: platformKey.toUpperCase(),
            entity_id: selectedItem?.id || `rep-${Date.now()}`,
            source: `STAGE 03 · ADAPT: Repurpose Studio (${platformKey})`,
            image_url: selectedItem?.media_url
          })
        });
      });

      await Promise.all(promises);

      // Advance idea stage to QUEUE
      if (selectedItem) {
        await fetch("/api/ai/ideas", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedItem.id,
            action: "ADVANCE_STAGE",
            updates: { pipeline_stage: "QUEUE" }
          })
        });
      }

      setNotification("🚀 ส่งทั้ง 5 แพลตฟอร์มเข้าสู่ Step 4: คิวรอโพสต์เรียบร้อย!");
      setTimeout(() => {
        router.push("/approvals");
      }, 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setQueueing(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentPlatformMeta = TARGET_PLATFORMS.find(p => p.id === activeTab) || TARGET_PLATFORMS[0];
  const ActiveIcon = currentPlatformMeta.icon;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Step Indicator Header */}
      <div className="bg-white border border-[#E8E9EC] rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              <span>STAGE 03 · ADAPT / 5: REPURPOSE STUDIO</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              3. ดัดแปลงคอนเทนต์ 5 แพลตฟอร์ม
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              นำคอนเทนต์และภาพจาก Step 2 มาปรับจริตให้เหมาะกับ <strong className="text-slate-800 font-medium">Facebook, TikTok, IG, X, Lemon8</strong> เมื่อแปลงเสร็จแล้ว สามารถกดปุ่มส่งเข้าสู่ <strong className="text-emerald-400">Step 4 (คิวรอโพสต์แยกแพลตฟอร์ม)</strong> ได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/content"
              className="text-xs text-slate-700 hover:text-slate-950 font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-[#E8E9EC]"
            >
              ← กลับไป Step 2 (สร้างสื่อ)
            </Link>
          </div>
        </div>

        {notification && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs shadow-md animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Main Workspace */}
      <div className="bg-white border border-[#E8E9EC] rounded-2xl p-6 shadow-xl space-y-5">
        {/* Source Media & Text Summary */}
        <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] flex flex-col sm:flex-row items-start gap-4">
          {selectedItem?.media_url && (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-white shrink-0 border border-[#E8E9EC]">
              <img
                src={selectedItem.media_url}
                alt="Source Visual"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">เนื้อหาต้นทางที่กำลังดัดแปลง:</span>
              {availableItems.length > 1 && (
                <select
                  value={selectedItem?.id || ""}
                  onChange={e => {
                    const found = availableItems.find(i => i.id === e.target.value);
                    if (found) {
                      setSelectedItem(found);
                      setSourceText(found.caption || found.concept || found.title);
                    }
                  }}
                  className="bg-white border border-[#D1D5DB] rounded-lg px-2.5 py-1 text-xs text-slate-800"
                >
                  {availableItems.map(i => (
                    <option key={i.id} value={i.id}>{i.title}</option>
                  ))}
                </select>
              )}
            </div>
            <textarea
              rows={3}
              value={sourceText}
              onChange={e => setSourceText(e.target.value)}
              className="w-full p-3 bg-white border border-[#E8E9EC] rounded-xl text-xs text-slate-900 leading-relaxed font-sans focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Action Button: Repurpose with Gemini */}
        <div className="flex justify-end pt-1">
          <button
            onClick={handleRepurpose}
            disabled={loading || !sourceText.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-[#17181A] hover:bg-slate-800 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI กำลังปรับจริต 5 แพลตฟอร์ม...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>🔄 แปลงเป็น 5 แพลตฟอร์ม (FB, TikTok, IG, X, Lemon8)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Tabs Display */}
      {repurposedOutputs && (
        <div className="bg-white border border-[#E8E9EC] rounded-2xl overflow-hidden shadow-xl space-y-0">
          {/* Top Tabs */}
          <div className="flex border-b border-[#E8E9EC] bg-[#F7F8FA]/70 px-4 overflow-x-auto gap-1">
            {TARGET_PLATFORMS.filter(p => repurposedOutputs[p.id]).map(p => {
              const Icon = p.icon;
              const isActive = activeTab === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveTab(p.id)}
                  className={`flex items-center gap-2 py-3.5 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? `border-purple-500 ${p.accentText} bg-white font-bold`
                      : "border-transparent text-slate-400 hover:text-slate-800 font-medium"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab && repurposedOutputs[activeTab] && (
              <div className="space-y-5">
                {/* Platform Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8E9EC]">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${currentPlatformMeta.accentBg}`}>
                      <ActiveIcon className={`w-5 h-5 ${currentPlatformMeta.accentText}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>ผลลัพธ์สำหรับ {currentPlatformMeta.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                          {currentPlatformMeta.badge}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">{currentPlatformMeta.desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const item = repurposedOutputs[activeTab];
                      let fullText = item.content || "";
                      if (activeTab === "lemon8") {
                        fullText = `${item.lemon8_cover_title ? `[หน้าปก: ${item.lemon8_cover_title}]\n\n` : ""}${item.content}\n\nจุดเด่น:\n${item.lemon8_points?.map((p: string) => `• ${p}`).join("\n") || ""}`;
                      } else if (item.carousel_slides) {
                        fullText = item.carousel_slides.join("\n\n");
                      } else if (item.x_thread) {
                        fullText = item.x_thread.join("\n\n---\n\n");
                      }
                      copyText(fullText, activeTab);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-[#E8E9EC] transition-colors"
                  >
                    {copiedKey === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === activeTab ? "คัดลอกแล้ว" : "คัดลอกข้อความ"}</span>
                  </button>
                </div>

                {/* LEMON8 DISPLAY */}
                {activeTab === "lemon8" && (
                  <div className="space-y-4">
                    {repurposedOutputs.lemon8.lemon8_cover_title && (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="text-xs font-bold text-amber-800 font-bold flex items-center gap-1.5 mb-1">
                          <Citrus className="w-4 h-4" />
                          <span>พาดหัวหน้าปกสไตล์ Lemon8 (Cover Headline)</span>
                        </div>
                        <div className="text-base font-bold text-slate-900">
                          {repurposedOutputs.lemon8.lemon8_cover_title}
                        </div>
                      </div>
                    )}

                    {repurposedOutputs.lemon8.lemon8_points && (
                      <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC]">
                        <div className="text-xs font-bold text-amber-800 font-bold mb-2 flex items-center gap-1.5">
                          <Sparkle className="w-3.5 h-3.5 text-amber-800 font-bold" />
                          <span>จุดเด่นสรุปย่อย (Key Highlights):</span>
                        </div>
                        <div className="space-y-1.5 text-xs text-slate-800">
                          {repurposedOutputs.lemon8.lemon8_points.map((pt: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-amber-800 font-bold font-bold">✨</span>
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] text-xs text-[#17181A] whitespace-pre-line leading-relaxed font-sans">
                      {repurposedOutputs.lemon8.content}
                    </div>
                  </div>
                )}

                {/* TIKTOK DISPLAY */}
                {activeTab === "tiktok" && (
                  <div className="space-y-3">
                    {repurposedOutputs.tiktok.hook && (
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs">
                        <span className="font-bold text-rose-700 font-bold">3-Second Hook:</span>
                        <div className="text-sm font-semibold text-slate-900 mt-1">
                          &ldquo;{repurposedOutputs.tiktok.hook}&rdquo;
                        </div>
                      </div>
                    )}
                    <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] text-xs text-[#17181A] whitespace-pre-line leading-relaxed font-mono">
                      {repurposedOutputs.tiktok.video_script || repurposedOutputs.tiktok.content}
                    </div>
                  </div>
                )}

                {/* INSTAGRAM DISPLAY */}
                {activeTab === "instagram" && (
                  <div className="space-y-3">
                    {repurposedOutputs.instagram.carousel_slides && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {repurposedOutputs.instagram.carousel_slides.map((slide: string, idx: number) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] text-xs">
                            <span className="text-[10px] font-bold text-fuchsia-700 font-bold mb-1 block">Slide #{idx + 1}</span>
                            <p className="text-slate-800 font-medium whitespace-pre-line leading-relaxed">{slide}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] text-xs text-[#17181A] whitespace-pre-line leading-relaxed font-sans">
                      {repurposedOutputs.instagram.content}
                    </div>
                  </div>
                )}

                {/* X / TWITTER DISPLAY */}
                {activeTab === "x" && (
                  <div className="space-y-2.5">
                    {repurposedOutputs.x.x_thread?.map((tweet: string, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] text-xs text-slate-800 flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 whitespace-pre-line leading-relaxed">{tweet}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* FACEBOOK DISPLAY */}
                {activeTab === "facebook" && (
                  <div className="space-y-3">
                    {repurposedOutputs.facebook.title && (
                      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs">
                        <span className="font-bold text-blue-700 font-bold">พาดหัวโพสต์:</span>
                        <div className="text-sm font-bold text-slate-900 mt-1">{repurposedOutputs.facebook.title}</div>
                      </div>
                    )}
                    <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E8E9EC] text-xs text-[#17181A] whitespace-pre-line leading-relaxed font-sans">
                      {repurposedOutputs.facebook.content}
                    </div>
                  </div>
                )}

                {/* ADVANCE TO STEP 4 BUTTON */}
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 pt-4">
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>ขั้นตอนถัดไป: ส่งคอนเทนต์เข้าคิวรอโพสต์</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ระบบจะจัดคอนเทนต์แยก 5 แพลตฟอร์มเข้าสู่ Step 4 (Publishing Queue) เพื่อให้คุณตรวจทานและเตรียมโพสต์
                    </p>
                  </div>

                  <button
                    onClick={handleSendToQueue}
                    disabled={queueing}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                  >
                    {queueing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>กำลังจัดคิว...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀 ยืนยันและส่งเข้าคิวรอโพสต์ (ไป Step 4)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RepurposePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">กำลังโหลด Repurpose Studio...</div>}>
      <RepurposeContent />
    </Suspense>
  );
}
