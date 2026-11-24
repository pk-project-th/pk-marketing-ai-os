"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Music,
  Sparkles,
  Upload,
  Mic,
  Camera,
  Copy,
  Check,
  Download,
  Play,
  Pause,
  Subtitles,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  Clock,
  UserCheck
} from "lucide-react";
import { useHub, HubHandoffPayload, HubSceneItem } from "@/context/HubContext";
import { DepartmentHandoffBar } from "@/components/hub/DepartmentHandoffBar";
import { useToast } from "@/components/ui/ToastProvider";

const KHAOFA_SAMPLE_LYRICS = `[Intro] ฮืมม… ฮืมม…
[Verse] บ่ได้ตั้งใจสิฮัก บ่ได้เตรียมหัวใจ
[Verse] แค่เธอเข้ามาใกล้ ใจฉันก็เริ่มไหว
[Verse] แววตาเธอมองมา มันพาใจฉันลอย
[Verse] เหมือนเพลงเบา ๆ ที่เปิดซ้ำในใจ
[Pre-Chorus] ยิ่งคุยยิ่งเผลอ ยิ่งเจอยิ่งหวั่น
[Pre-Chorus] เหมือนหัวใจฉัน มันช้าไปหนึ่งจังหวะ
[Chorus] ใจมันไปทางเธอ ห้ามเท่าไหร่ก็แพ้
[Chorus] ยิ่งพยายามดูแล ใจยิ่งไปหาเธอ
[Chorus] ใจมันไปทางเธอ ไปแบบไม่รู้ตัว
[Chorus] บ่ได้เอื้อนคำว่าฮัก แต่ใจมันฮู้ดี
[Outro] ฮืมม… ฮืมม…`;

const MV_ACTS = [
  {
    actBadge: "☕ องก์ 1: คาเฟ่เรือนกระจกไม้ยามบ่าย",
    locationLock:
      "Inside a cozy sunlit wooden glasshouse café surrounded by lush green indoor plants, warm teak wood tables, sheer curtains, and golden afternoon sunlight streaming through glass windows with warm bokeh.",
    cameraMove: "Dolly Push-In ➔ Rack Focus Close-Up"
  },
  {
    actBadge: "🌅 องก์ 2: สวนดอกไม้ยามเย็น (Golden Hour)",
    locationLock:
      "Outdoors on a charming stone and wooden garden pathway outside the café during golden hour sunset, surrounded by blooming wildflowers and warm amber rim sunlight.",
    cameraMove: "Backward Walk Gimbal Tracking ➔ Subtle Orbit"
  },
  {
    actBadge: "✨ องก์ 3: ระเบียงไม้ประดับไฟยามค่ำ",
    locationLock:
      "An outdoor wooden terrace patio at twilight decorated with warm glowing amber string fairy lights, wooden railings, and a deep twilight blue sky.",
    cameraMove: "Intimate Bench Glide ➔ Shallow Bokeh Portrait"
  },
  {
    actBadge: "🌌 องก์ 4: ดาดฟ้าชมดาวยามค่ำคืน",
    locationLock:
      "On a romantic open rooftop terrace under a starry night sky with soft city bokeh lights in the distance and warm lantern glow.",
    cameraMove: "Slow Cinematic Orbit ➔ Crane Pull-Back Outro"
  }
];

function formatSrtTime(sec: number): string {
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = Math.floor(sec % 60);
  const ms = Math.round((sec - Math.floor(sec)) * 1000);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

export default function MVStudioPage() {
  const { activeHandoff, setActiveHandoff, saveToVault, sendToDepartment } = useHub();
  const { showToast } = useToast();

  const [songTitle, setSongTitle] = useState("ใจมันไปทางเธอ (Indie Acoustic MV)");
  const [singerAppearance, setSingerAppearance] = useState(
    "นักร้องหญิงไทยวัย 22 ปี ลุคสดใสละมุน ผมยาวประบ่าสีน้ำตาลธรรมชาติ สวมเสื้อคาร์ดิแกนไหมพรมสีครีมอบอุ่น"
  );
  const [singerPromptEn, setSingerPromptEn] = useState(
    "a single solo 22-year-old youthful cute fresh-faced Thai female singer with shoulder-length natural brown hair wearing a cozy cream knit cardigan"
  );
  const [singerRefImage, setSingerRefImage] = useState<string>("");
  const [lyricsInput, setLyricsInput] = useState(KHAOFA_SAMPLE_LYRICS);
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9">("16:9");
  const [songDurationSec, setSongDurationSec] = useState<number>(60);

  // Audio player & Tap-to-Sync state
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tapSyncIndex, setTapSyncIndex] = useState<number>(0);

  const [payload, setPayload] = useState<HubHandoffPayload | null>(null);
  const [imgBusyScene, setImgBusyScene] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const singerImgInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (activeHandoff && !payload) {
      setPayload(activeHandoff);
      setSongTitle(activeHandoff.title || activeHandoff.topic);
      if (activeHandoff.lyricsText) setLyricsInput(activeHandoff.lyricsText);
    }
  }, [activeHandoff, payload]);

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setSongTitle(file.name.replace(/\.[^.]+$/, ""));
    showToast(`โหลดไฟล์เพลง "${file.name}" สำเร็จ! กดฟังเพลงหรือเคาะจังหวะซับได้เลย`, "success");
  };

  const handleSingerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSingerRefImage(String(reader.result || ""));
      showToast("แนบรูปอ้างอิงนักร้องสำเร็จ! ระบบจะล็อกใบหน้าและตัดฉากสตูดิโอสีขาวทิ้งอัตโนมัติ", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleBuildMVStoryboard = () => {
    const rawLines = lyricsInput
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (rawLines.length === 0) {
      showToast("กรุณาวางเนื้อเพลงอย่างน้อย 1 บรรทัดก่อนครับ", "info");
      return;
    }

    const perSceneDur = Math.max(3, Math.round(songDurationSec / rawLines.length));
    const identityLock = `[Subject Identity Lock]: <Subject 1> is ${singerPromptEn}. Preserve ONLY facial structure, eyes, hairstyle, and outfit design from the character reference image. STRICTLY IGNORE any plain white or grey studio backdrop (strictly ONE solo person in frame, no duplicate clones).`;

    const scenes: HubSceneItem[] = rawLines.map((line, idx) => {
      const tagMatch = line.match(/^\[([^\]]+)\]\s*(.*)$/);
      const sectionTag = tagMatch ? tagMatch[1] : "Verse";
      const cleanLyric = (tagMatch ? tagMatch[2] : line).trim();
      const isVocal = !/intro|outro|solo|instru/i.test(sectionTag);

      const actIdx = Math.min(MV_ACTS.length - 1, Math.floor((idx / rawLines.length) * MV_ACTS.length));
      const act = MV_ACTS[actIdx];

      const startSec = idx * perSceneDur;
      const endSec = (idx + 1) * perSceneDur;
      const timecode = `${String(Math.floor(startSec / 60)).padStart(2, "0")}:${String(startSec % 60).padStart(2, "0")} - ${String(
        Math.floor(endSec / 60)
      ).padStart(2, "0")}:${String(endSec % 60).padStart(2, "0")}`;

      const beat1 = `[Shot 1 | 0.0-2.5s] Medium cinematic shot; camera glides smoothly as <Subject 1> ${
        isVocal
          ? `sings the lyric "${cleanLyric}" with natural expressive lip-sync and tender eye contact toward the camera lens`
          : "breathes softly with a gentle dreamy smile while golden light catches her hair"
      }.`;
      const beat2 = `[Shot 2 | 2.5-${perSceneDur}.0s] Smooth rack focus to a tight emotional close-up with shallow bokeh depth and natural head movement.`;

      return {
        sceneNumber: idx + 1,
        title: `[${sectionTag}] ${cleanLyric.slice(0, 32)}`,
        durationSec: perSceneDur,
        timecode,
        voiceoverThai: cleanLyric,
        onScreenText: cleanLyric,
        lyricLine: cleanLyric,
        isVocal,
        actBadge: act.actBadge,
        cameraAngle: `${act.cameraMove} | ${isVocal ? "🎤 Lip-Sync" : "🎶 B-Roll"}`,
        visualPromptEn: `${identityLock} [Environment]: ${act.locationLock} ${beat1} ${beat2} Photorealistic 8K cinema MV, ${aspectRatio} framing, zero in-image text.`,
        motionPromptEn: `${act.cameraMove}, 2-beat continuous camera flow at 60fps`
      };
    });

    const newPayload: HubHandoffPayload = {
      id: `mv-${Date.now()}`,
      title: songTitle,
      topic: songTitle,
      aspectRatio,
      hook3Sec: scenes[0]?.lyricLine || songTitle,
      concept: `MV เพลง "${songTitle}" จำนวน ${scenes.length} ฉาก พร้อมล็อกคาแรคเตอร์นักร้อง (${singerAppearance}) และซิงค์เนื้อเพลง`,
      fullScriptThai: scenes.map((s) => s.voiceoverThai).join("\n"),
      lyricsText: lyricsInput,
      scenes,
      characters: [
        {
          id: "singer-1",
          name: "นักร้องนำ (<Subject 1>)",
          role: "Solo Lead Vocalist",
          appearanceThai: singerAppearance,
          characterSheetPromptEn: singerPromptEn,
          imageUrl: singerRefImage
        }
      ],
      caption: `🎵 MV เพลง: ${songTitle}\n\n${scenes
        .slice(0, 4)
        .map((s) => `🎶 "${s.voiceoverThai}"`)
        .join("\n")}\n\n#MVเพลง #สร้างMVด้วยAI #GoogleFlow #PKCreativeHub`,
      hashtags: ["#MVเพลง", "#AIStudio", "#เพลงใหม่", "#PKCreativeHub"],
      sourceDept: "mv-studio",
      updatedAt: new Date().toISOString()
    };

    setPayload(newPayload);
    setActiveHandoff(newPayload);
    setTapSyncIndex(0);
    saveToVault({
      id: newPayload.id,
      title: newPayload.title,
      department: "mv-studio",
      departmentLabel: "MV & KARAOKE",
      aspectRatio,
      payload: newPayload
    });

    showToast(`สร้างสตอรี่บอร์ด MV ครบ ${scenes.length} ฉาก พร้อมซิงค์เวลาเนื้อเพลงอัตโนมัติแล้ว!`, "success");
  };

  // Easy Tap-to-Sync Lyric Timing while listening to the song!
  const handleTapNextLyricLine = () => {
    if (!payload || payload.scenes.length === 0) return;
    const nowSec = audioRef.current ? Number(audioRef.current.currentTime.toFixed(1)) : tapSyncIndex * 4;
    const idx = Math.min(tapSyncIndex, payload.scenes.length - 1);

    const updatedScenes = payload.scenes.map((s, i) => {
      if (i === idx) {
        const nextEnd = Number((nowSec + 3.8).toFixed(1));
        return {
          ...s,
          timecode: `${nowSec.toFixed(1)}s - ${nextEnd.toFixed(1)}s`,
          durationSec: 4
        };
      }
      if (i === idx - 1) {
        const prevStartMatch = s.timecode?.match(/^([\d.]+)s/);
        const prevStart = prevStartMatch ? Number(prevStartMatch[1]) : Math.max(0, nowSec - 3.5);
        const dur = Math.max(1.5, Number((nowSec - prevStart).toFixed(1)));
        return {
          ...s,
          timecode: `${prevStart.toFixed(1)}s - ${nowSec.toFixed(1)}s`,
          durationSec: dur
        };
      }
      return s;
    });

    const nextPayload = { ...payload, scenes: updatedScenes, updatedAt: new Date().toISOString() };
    setPayload(nextPayload);
    setActiveHandoff(nextPayload);
    setTapSyncIndex((prev) => (prev + 1) % payload.scenes.length);
    showToast(`ซิงค์เวลาท่อนที่ ${idx + 1} ที่วินาที ${nowSec.toFixed(1)}s เรียบร้อย!`, "success");
  };

  const handleExportKaraokeSrt = () => {
    if (!payload) return;
    const perDur = Math.max(3, Math.round(songDurationSec / Math.max(1, payload.scenes.length)));
    const srtBlocks = payload.scenes.map((s, idx) => {
      const m = s.timecode?.match(/^([\d.]+)s\s*-\s*([\d.]+)s$/);
      const start = m ? Number(m[1]) : idx * perDur;
      const end = m ? Number(m[2]) : (idx + 1) * perDur;
      return `${idx + 1}\n${formatSrtTime(start)} --> ${formatSrtTime(end)}\n${s.voiceoverThai}`;
    });

    const blob = new Blob([srtBlocks.join("\n\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${songTitle.replace(/\s+/g, "_")}_Lyrics.srt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("ดาวน์โหลดไฟล์ซับเนื้อเพลง (.SRT) สำหรับ CapCut / Premiere เรียบร้อย!", "success");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-lg">
              <Music className="w-3.5 h-3.5" />
              <span>แผนกที่ 3 · MV Creator Studio v5.1 (Chat ea01f6c5)</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              สตูดิโอสร้าง MV เพลงจากไฟล์เพลง & ระบบซิงค์ซับเนื้อร้องอัตโนมัติ
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              แตกฉาก MV อัตโนมัติจากเนื้อเพลง (2-Beat Lip-Sync + B-Roll) ล็อกใบหน้านักร้องเดี่ยวไม่หลุดฉากสตูดิโอ พร้อมปุ่มเคาะจังหวะซิงค์ซับเนื้อเพลงแบบง่ายที่สุด
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start">
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>อัปโหลดไฟล์เพลง (.MP3 / .WAV)</span>
            </button>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Audio Player + Easy Tap-to-Sync Lyric Tool */}
        {audioUrl && (
          <div className="p-4 rounded-xl bg-purple-950 text-white border border-purple-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-bold">
                  เครื่องเล่นเพลง & โหมดเคาะจังหวะซับเนื้อเพลง (Easy Lyric Tap-Sync)
                </span>
              </div>
              <span className="text-xs font-mono text-purple-300">
                เวลาปัจจุบัน: {currentTime.toFixed(1)} วินาที
              </span>
            </div>

            <audio
              ref={audioRef}
              controls
              src={audioUrl}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => {
                if (e.currentTarget.duration && isFinite(e.currentTarget.duration)) {
                  setSongDurationSec(Math.round(e.currentTarget.duration));
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-10"
            />

            {payload && payload.scenes.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="text-xs">
                  <span className="text-purple-300">ท่อนที่รอเคาะจังหวะถัดไป (#{tapSyncIndex + 1}):</span>{" "}
                  <b className="text-white underline">
                    &ldquo;{payload.scenes[tapSyncIndex]?.voiceoverThai}&rdquo;
                  </b>
                </div>
                <button
                  type="button"
                  onClick={handleTapNextLyricLine}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs inline-flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <Clock className="w-4 h-4" />
                  <span>🥁 เคาะซิงค์ท่อนที่ #{tapSyncIndex + 1} ที่เวลานี้ ({currentTime.toFixed(1)}s)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Singer Identity Lock + Lyrics Input */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Singer Character Sheet Studio */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>Character Sheet นักร้องนำ</span>
              </span>
              <button
                type="button"
                onClick={() => singerImgInputRef.current?.click()}
                className="text-[11px] font-bold text-purple-600 hover:underline cursor-pointer"
              >
                + แนบรูปนักร้อง
              </button>
              <input
                ref={singerImgInputRef}
                type="file"
                accept="image/*"
                onChange={handleSingerImageUpload}
                className="hidden"
              />
            </div>

            {singerRefImage && (
              <img
                src={singerRefImage}
                alt="Singer Ref"
                className="w-full h-36 object-cover rounded-lg border border-purple-200"
              />
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                ชื่อเพลง / โปรเจกต์ MV
              </label>
              <input
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                คาแรคเตอร์นักร้อง (ภาษาไทย)
              </label>
              <textarea
                rows={2}
                value={singerAppearance}
                onChange={(e) => setSingerAppearance(e.target.value)}
                className="w-full p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                Subject Identity Lock (English)
              </label>
              <textarea
                rows={2}
                value={singerPromptEn}
                onChange={(e) => setSingerPromptEn(e.target.value)}
                className="w-full p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[11px] font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as "9:16" | "16:9")}
                className="px-2.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
              >
                <option value="16:9">🖥️ 16:9 MV YouTube</option>
                <option value="9:16">📱 9:16 MV TikTok</option>
              </select>
              <input
                type="number"
                min={15}
                max={300}
                value={songDurationSec}
                onChange={(e) => setSongDurationSec(Number(e.target.value) || 60)}
                className="px-2.5 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
                title="ความยาวเพลงรวม (วินาที)"
              />
            </div>
          </div>

          {/* Right: Lyrics Editor */}
          <div className="lg:col-span-2 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  เนื้อเพลง (1 บรรทัด = 1 ฉาก MV · ใส่ [Intro], [Verse], [Chorus] ได้เลย)
                </label>
                <button
                  type="button"
                  onClick={() => setLyricsInput(KHAOFA_SAMPLE_LYRICS)}
                  className="text-[11px] font-bold text-purple-600 hover:underline cursor-pointer"
                >
                  โหลดเนื้อเพลงตัวอย่าง &ldquo;ใจมันไปทางเธอ&rdquo;
                </button>
              </div>
              <textarea
                rows={10}
                value={lyricsInput}
                onChange={(e) => setLyricsInput(e.target.value)}
                placeholder="วางเนื้อเพลงทีละท่อนบรรทัด..."
                className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white leading-relaxed"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">
                จำนวนท่อนเพลงปัจจุบัน:{" "}
                <b>
                  {
                    lyricsInput
                      .split("\n")
                      .map((l) => l.trim())
                      .filter(Boolean).length
                  }{" "}
                  ฉาก
                </b>
              </span>
              <button
                type="button"
                onClick={handleBuildMVStoryboard}
                className="min-h-[46px] px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>แตกฉาก MV + ซิงค์เวลาซับเนื้อเพลงอัตโนมัติ</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Generated MV Storyboard & Lyric Sync Table */}
      {payload && (
        <section className="space-y-4 animate-fade-in-up">
          <DepartmentHandoffBar currentDeptId="mv-studio" payload={payload} />

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  MV STORYBOARD & LYRIC SYNC · {payload.scenes.length} SCENES
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {payload.title}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportKaraokeSrt}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดซับเนื้อเพลง (.SRT)</span>
                </button>
                <button
                  type="button"
                  onClick={() => sendToDepartment("/subtitles", payload, "ซับคาราโอเกะ MV")}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Subtitles className="w-3.5 h-3.5" />
                  <span>ส่งเนื้อเพลงไปพรีวิวซับคาราโอเกะ 9:16</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {payload.scenes.map((scene) => (
                <div
                  key={scene.sceneNumber}
                  className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 p-3.5 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-mono text-[11px] font-bold">
                          MV {String(scene.sceneNumber).padStart(2, "0")}
                        </span>
                        <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 truncate">
                          {scene.actBadge}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                        ⏱️ {scene.timecode}
                      </span>
                    </div>

                    {scene.imageUrl && (
                      <div className="rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video">
                        <img src={scene.imageUrl} alt={scene.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Lyric Line */}
                    <div className="p-2.5 rounded-lg bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/70">
                      <div className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                        🎤 ท่อนเนื้อร้อง (Lyric Subtitle):
                      </div>
                      <input
                        type="text"
                        value={scene.voiceoverThai}
                        onChange={(e) => {
                          const nextScenes = payload.scenes.map((s) =>
                            s.sceneNumber === scene.sceneNumber
                              ? { ...s, voiceoverThai: e.target.value, onScreenText: e.target.value }
                              : s
                          );
                          const nextPayload = { ...payload, scenes: nextScenes };
                          setPayload(nextPayload);
                          setActiveHandoff(nextPayload);
                        }}
                        className="w-full mt-1 px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-purple-200 dark:border-zinc-700 text-xs font-extrabold text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Visual Prompt */}
                    <details className="text-xs text-slate-600 dark:text-zinc-400">
                      <summary className="cursor-pointer font-semibold">
                        🔍 ดู/แก้ไข 2-Beat Lip-Sync Prompt (EN)
                      </summary>
                      <textarea
                        rows={3}
                        value={scene.visualPromptEn}
                        onChange={(e) => {
                          const nextScenes = payload.scenes.map((s) =>
                            s.sceneNumber === scene.sceneNumber ? { ...s, visualPromptEn: e.target.value } : s
                          );
                          const nextPayload = { ...payload, scenes: nextScenes };
                          setPayload(nextPayload);
                          setActiveHandoff(nextPayload);
                        }}
                        className="w-full mt-1.5 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[11px] font-mono"
                      />
                    </details>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                    <button
                      type="button"
                      disabled={imgBusyScene === scene.sceneNumber}
                      onClick={async () => {
                        setImgBusyScene(scene.sceneNumber);
                        try {
                          const res = await fetch("/api/ai/image", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ prompt: scene.visualPromptEn, aspectRatio })
                          });
                          const data = await res.json();
                          if (res.ok && data.imageUrl) {
                            const nextScenes = payload.scenes.map((s) =>
                              s.sceneNumber === scene.sceneNumber ? { ...s, imageUrl: data.imageUrl } : s
                            );
                            const nextPayload = { ...payload, scenes: nextScenes };
                            setPayload(nextPayload);
                            setActiveHandoff(nextPayload);
                          }
                        } finally {
                          setImgBusyScene(null);
                        }
                      }}
                      className="min-h-[34px] px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                      <span>{imgBusyScene === scene.sceneNumber ? "กำลังวาด..." : "เจนภาพฉาก MV"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(scene.visualPromptEn);
                        setCopiedId(`mv-${scene.sceneNumber}`);
                        showToast(`ก๊อป Prompt ฉาก MV ที่ ${scene.sceneNumber} แล้ว!`, "success");
                        setTimeout(() => setCopiedId(null), 1800);
                      }}
                      className="min-h-[34px] px-3 py-1 rounded-lg bg-slate-900 dark:bg-purple-600 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === `mv-${scene.sceneNumber}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>ก๊อป Prompt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
