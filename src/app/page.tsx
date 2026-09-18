"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  Upload,
  Download,
  Copy,
  Sparkles,
  Wand2,
  Check,
  RotateCcw,
  Sliders,
  Share2,
  Database,
  Image as ImageIcon,
  Heart,
  Palette,
} from "lucide-react";
import { PRESETS, PresetItem } from "@/lib/presets";
import {
  FilterConfig,
  DEFAULT_FILTER_CONFIG,
  applyColorGrading,
  transferColorFromReference,
} from "@/lib/colorGrading";
import { CompareSlider } from "@/components/CompareSlider";
import { AdjustControls } from "@/components/AdjustControls";
import { ReferenceMatcher } from "@/components/ReferenceMatcher";
import {
  isSupabaseConfigured,
  getLocalPresets,
  saveLocalPreset,
  deleteLocalPreset,
  UserPreset,
} from "@/lib/supabaseClient";

export default function Home() {
  const [currentImageSrc, setCurrentImageSrc] = useState<string>("/samples/original.jpg");
  const [activePresetId, setActivePresetId] = useState<string>("sakura-picnic");
  const [filterConfig, setFilterConfig] = useState<FilterConfig>(PRESETS[0].config);
  const [customPresets, setCustomPresets] = useState<UserPreset[]>([]);
  const [viewMode, setViewMode] = useState<"split" | "side" | "hold">("split");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [imgSize, setImgSize] = useState<{ width: number; height: number }>({ width: 1024, height: 683 });
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  // References
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const gradedCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Load custom presets on mount
  useEffect(() => {
    setCustomPresets(getLocalPresets());
  }, []);

  // Initialize and load image into original canvas
  const loadImage = useCallback((src: string) => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      imageElementRef.current = img;
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      setImgSize({ width: w, height: h });

      // Draw original canvas
      const origCanvas = originalCanvasRef.current;
      const gradCanvas = gradedCanvasRef.current;
      if (origCanvas && gradCanvas) {
        origCanvas.width = w;
        origCanvas.height = h;
        gradCanvas.width = w;
        gradCanvas.height = h;

        const origCtx = origCanvas.getContext("2d");
        if (origCtx) {
          origCtx.drawImage(img, 0, 0, w, h);
        }
      }
      setIsProcessing(false);
      // Trigger grading
      renderGradedImage(filterConfig);
    };
  }, []);

  useEffect(() => {
    loadImage(currentImageSrc);
  }, [currentImageSrc]);

  // Render graded image
  const renderGradedImage = useCallback(
    (config: FilterConfig) => {
      const origCanvas = originalCanvasRef.current;
      const gradCanvas = gradedCanvasRef.current;
      if (!origCanvas || !gradCanvas) return;

      const w = origCanvas.width;
      const h = origCanvas.height;
      if (w === 0 || h === 0) return;

      setIsProcessing(true);
      requestAnimationFrame(() => {
        const gradCtx = gradCanvas.getContext("2d");
        if (!gradCtx) return;

        // Reset to original image
        gradCtx.drawImage(origCanvas, 0, 0, w, h);

        // Apply Color Grading
        applyColorGrading(gradCtx, w, h, config);

        setIsProcessing(false);
      });
    },
    []
  );

  // Re-render when config changes
  useEffect(() => {
    renderGradedImage(filterConfig);
  }, [filterConfig, renderGradedImage]);

  // One-click Preset selection
  const handleSelectPreset = (preset: PresetItem) => {
    setActivePresetId(preset.id);
    setFilterConfig(preset.config);

    if (preset.id === "sakura-picnic") {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#fda4b8", "#f43f6e", "#ffe6eb", "#fff"],
        });
      } catch {}
    }
  };

  // Custom User Preset selection
  const handleSelectCustomPreset = (preset: UserPreset) => {
    setActivePresetId(preset.id);
    setFilterConfig(preset.config);
  };

  // Save new custom preset
  const handleSaveCustomPreset = (name: string) => {
    const created = saveLocalPreset(name, filterConfig);
    setCustomPresets(getLocalPresets());
    setActivePresetId(created.id);
  };

  // Upload user's own photo
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setCurrentImageSrc(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Reference Color Transfer
  const handleApplyReferenceTransfer = (refCanvas: HTMLCanvasElement, intensity: number) => {
    const origCanvas = originalCanvasRef.current;
    const gradCanvas = gradedCanvasRef.current;
    if (!origCanvas || !gradCanvas) return;

    setIsProcessing(true);
    requestAnimationFrame(() => {
      const gradCtx = gradCanvas.getContext("2d");
      if (!gradCtx) return;

      // 1. Reset to original
      gradCtx.drawImage(origCanvas, 0, 0, origCanvas.width, origCanvas.height);

      // 2. Transfer color from reference
      transferColorFromReference(gradCanvas, refCanvas, intensity);

      // 3. Add soft cherry bloom & light lift
      applyColorGrading(gradCtx, gradCanvas.width, gradCanvas.height, {
        ...DEFAULT_FILTER_CONFIG,
        bloom: 30,
        highlights: 15,
        shadows: 20,
      });

      setActivePresetId("reference-transferred");
      setIsProcessing(false);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          colors: ["#fbcfe8", "#fb7185", "#fef08a"],
        });
      } catch {}
    });
  };

  // Download high-resolution image
  const handleDownload = (format: "image/jpeg" | "image/png" = "image/jpeg") => {
    const gradCanvas = gradedCanvasRef.current;
    if (!gradCanvas) return;
    const ext = format === "image/png" ? "png" : "jpg";
    const dataUrl = gradCanvas.toDataURL(format, 0.95);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `sakura_graded_${Date.now()}.${ext}`;
    a.click();
    setShowExportMenu(false);
  };

  // Copy to clipboard
  const handleCopyClipboard = async () => {
    const gradCanvas = gradedCanvasRef.current;
    if (!gradCanvas) return;
    try {
      gradCanvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch (e) {
      console.error("Clipboard copy error:", e);
      alert("클립보드 복사를 지원하지 않는 브라우저입니다. 다운로드 버튼을 이용해주세요.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen pb-16 px-3 sm:px-6">
      {/* Top Navigation */}
      <header className="w-full max-w-6xl py-5 flex items-center justify-between border-b border-slate-800/80 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sakura-600 via-pink-500 to-rose-400 flex items-center justify-center shadow-lg shadow-sakura-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">SakuraFilm Studio</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sakura-500/20 text-sakura-400 border border-sakura-500/30">
                PRO V1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">원클릭 벚꽃 파스텔 감성 사진 보정 스튜디오</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleUploadImage}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-md transition"
          >
            <Upload className="w-4 h-4 text-sakura-400" />
            <span className="hidden sm:inline">내 사진 업로드</span>
            <span className="sm:hidden">업로드</span>
          </button>

          <button
            onClick={handleCopyClipboard}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="클립보드에 복사"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span className="hidden md:inline">{copied ? "복사 완료!" : "복사"}</span>
          </button>

          {/* Export / Download Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-sakura-500 to-pink-600 hover:from-sakura-600 hover:to-pink-700 text-white shadow-lg shadow-sakura-500/25 transition"
            >
              <Download className="w-4 h-4" />
              <span>고화질 저장</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-40 flex flex-col gap-1">
                <button
                  onClick={() => handleDownload("image/jpeg")}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg transition flex items-center justify-between"
                >
                  <span>JPG 고화질 저장</span>
                  <span className="text-[10px] text-slate-400">95% 압축</span>
                </button>
                <button
                  onClick={() => handleDownload("image/png")}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg transition flex items-center justify-between"
                >
                  <span>PNG 무손실 저장</span>
                  <span className="text-[10px] text-slate-400">최고화질</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl flex flex-col items-center">
        {/* Sample Switcher Banner */}
        <div className="flex flex-wrap items-center justify-between w-full max-w-4xl mb-4 px-4 py-2.5 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-slate-800 rounded-2xl text-xs text-slate-300 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-sakura-400 animate-pulse" />
            <span className="font-medium text-white">현재 사진:</span>
            <span className="text-slate-400">
              {currentImageSrc === "/samples/original.jpg" ? "아빠와 아이 벚꽃 사진 (1번 사진)" : "사용자 업로드 사진"}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {currentImageSrc !== "/samples/original.jpg" && (
              <button
                onClick={() => setCurrentImageSrc("/samples/original.jpg")}
                className="text-sakura-400 hover:text-sakura-300 font-medium underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                샘플 1번 사진으로 복구
              </button>
            )}
            <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>{isSupabaseConfigured() ? "Supabase 클라우드 연동" : "로컬 스토리지 저장 모드"}</span>
            </div>
          </div>
        </div>

        {/* ONE-CLICK PRESET PICKER TRAY */}
        <section className="w-full max-w-4xl mb-5">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-sakura-400" />
              원클릭 감성 프리셋 선택
            </h2>
            <span className="text-[11px] text-slate-400">클릭 즉시 실시간 변환</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {PRESETS.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`relative p-3 rounded-2xl text-left transition-all duration-200 border flex flex-col justify-between overflow-hidden group ${
                    isActive
                      ? "bg-slate-800/95 border-sakura-500 shadow-xl shadow-sakura-500/20 scale-[1.02]"
                      : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60"
                  }`}
                >
                  {/* Subtle Gradient Glow Indicator */}
                  <div
                    className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${preset.previewColor} opacity-20 blur-xl group-hover:opacity-40 transition`}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          preset.tag === "추천 원클릭"
                            ? "bg-sakura-500 text-white shadow-sm"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {preset.tag}
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-sakura-400" />}
                    </div>
                    <div className="font-bold text-xs text-white group-hover:text-sakura-200 transition line-clamp-1">
                      {preset.name}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-tight">
                    {preset.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Custom Presets Pill Tray if any */}
          {customPresets.length > 0 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              <span className="text-[11px] font-medium text-slate-400 flex-shrink-0">
                내 커스텀 프리셋:
              </span>
              {customPresets.map((cp) => (
                <div
                  key={cp.id}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border transition flex-shrink-0 cursor-pointer ${
                    activePresetId === cp.id
                      ? "bg-sakura-500/20 border-sakura-500 text-sakura-200"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                  onClick={() => handleSelectCustomPreset(cp)}
                >
                  <span>✨ {cp.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLocalPreset(cp.id);
                      setCustomPresets(getLocalPresets());
                    }}
                    className="text-slate-500 hover:text-red-400 text-xs ml-1"
                    title="삭제"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* COMPARE SLIDER PREVIEW */}
        <CompareSlider
          originalCanvasRef={originalCanvasRef}
          gradedCanvasRef={gradedCanvasRef}
          width={imgSize.width}
          height={imgSize.height}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isProcessing={isProcessing}
        />

        {/* REFERENCE COLOR MATCHER (TRANSFER) */}
        <ReferenceMatcher
          onApplyReference={handleApplyReferenceTransfer}
          isProcessing={isProcessing}
        />

        {/* FINE-TUNING CONTROLS */}
        <AdjustControls
          config={filterConfig}
          onChange={(newConfig) => {
            setFilterConfig(newConfig);
            setActivePresetId("custom-tuned");
          }}
          onSavePreset={handleSaveCustomPreset}
          activePresetName={
            activePresetId === "sakura-picnic"
              ? "🌸 벚꽃 피크닉 감성"
              : activePresetId === "reference-transferred"
              ? "🪄 레퍼런스 색감 자동 추출"
              : activePresetId === "custom-tuned"
              ? "직접 조절 중"
              : PRESETS.find((p) => p.id === activePresetId)?.name || "커스텀"
          }
        />
      </main>
    </div>
  );
}
