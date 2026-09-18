"use client";

import React, { useState } from "react";
import { FilterConfig, DEFAULT_FILTER_CONFIG } from "@/lib/colorGrading";
import {
  Sun,
  Contrast,
  Thermometer,
  Sparkles,
  Sliders,
  RotateCcw,
  BookmarkPlus,
  TreePine,
  CloudSun,
  Film,
  CircleDot,
} from "lucide-react";

interface AdjustControlsProps {
  config: FilterConfig;
  onChange: (newConfig: FilterConfig) => void;
  onSavePreset: (name: string) => void;
  activePresetName?: string;
}

export const AdjustControls: React.FC<AdjustControlsProps> = ({
  config,
  onChange,
  onSavePreset,
  activePresetName,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [saveName, setSaveName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const updateParam = (key: keyof FilterConfig, value: number) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  const handleReset = () => {
    onChange(DEFAULT_FILTER_CONFIG);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveName.trim()) {
      onSavePreset(saveName.trim());
      setSaveName("");
      setShowSaveDialog(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl mt-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-sakura-400" />
          <h3 className="font-semibold text-white text-base">전문가 미세 조정 패널</h3>
          {activePresetName && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sakura-500/20 text-sakura-300 border border-sakura-500/30">
              현재: {activePresetName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-sakura-400" />
            내 프리셋 저장
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            리셋
          </button>
        </div>
      </div>

      {/* Save Preset Dialog Modal */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSave}
            className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl"
          >
            <h4 className="text-base font-semibold text-white mb-2">커스텀 프리셋 저장</h4>
            <p className="text-xs text-slate-400 mb-4">
              현재 세부 조절된 색감 설정값을 나만의 프리셋으로 저장합니다.
            </p>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="예: 우리 가족 봄날 벚꽃톤"
              autoFocus
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-sakura-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveDialog(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!saveName.trim()}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-sakura-500 hover:bg-sakura-600 text-white disabled:opacity-50"
              >
                저장하기
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 pt-4">
        {/* Exposure */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              노출 (Exposure)
            </span>
            <span className="font-mono text-slate-400">{config.exposure > 0 ? `+${config.exposure}` : config.exposure}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={config.exposure}
            onChange={(e) => updateParam("exposure", Number(e.target.value))}
          />
        </div>

        {/* Contrast */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Contrast className="w-3.5 h-3.5 text-blue-400" />
              대비 (Contrast)
            </span>
            <span className="font-mono text-slate-400">{config.contrast > 0 ? `+${config.contrast}` : config.contrast}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={config.contrast}
            onChange={(e) => updateParam("contrast", Number(e.target.value))}
          />
        </div>

        {/* Warmth */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              색온도 (Warmth)
            </span>
            <span className="font-mono text-slate-400">{config.warmth > 0 ? `+${config.warmth}` : config.warmth}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={config.warmth}
            onChange={(e) => updateParam("warmth", Number(e.target.value))}
          />
        </div>

        {/* Tint */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              로지 틴트 (Pink/Green)
            </span>
            <span className="font-mono text-slate-400">{config.tint > 0 ? `+${config.tint}` : config.tint}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={config.tint}
            onChange={(e) => updateParam("tint", Number(e.target.value))}
          />
        </div>

        {/* Shadows (Lift) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CloudSun className="w-3.5 h-3.5 text-indigo-400" />
              섀도우 리프트 (매트 블랙)
            </span>
            <span className="font-mono text-slate-400">{config.shadows > 0 ? `+${config.shadows}` : config.shadows}</span>
          </div>
          <input
            type="range"
            min="-20"
            max="80"
            value={config.shadows}
            onChange={(e) => updateParam("shadows", Number(e.target.value))}
          />
        </div>

        {/* Highlights */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sun className="w-3.5 h-3.5 text-yellow-200" />
              하이라이트 소프트 압축
            </span>
            <span className="font-mono text-slate-400">{config.highlights > 0 ? `+${config.highlights}` : config.highlights}</span>
          </div>
          <input
            type="range"
            min="-20"
            max="60"
            value={config.highlights}
            onChange={(e) => updateParam("highlights", Number(e.target.value))}
          />
        </div>

        {/* Bloom / Orton Glow */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-sakura-400 animate-pulse" />
              몽환 글로우 (Orton Bloom)
            </span>
            <span className="font-mono text-slate-400">{config.bloom}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={config.bloom}
            onChange={(e) => updateParam("bloom", Number(e.target.value))}
          />
        </div>

        {/* Green Foliage Mute */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <TreePine className="w-3.5 h-3.5 text-emerald-400" />
              잔디 세이지 톤 조화
            </span>
            <span className="font-mono text-slate-400">{config.greenMute}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={config.greenMute}
            onChange={(e) => updateParam("greenMute", Number(e.target.value))}
          />
        </div>

        {/* Film Grain */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Film className="w-3.5 h-3.5 text-stone-400" />
              필름 그레인 (입자감)
            </span>
            <span className="font-mono text-slate-400">{config.grain}</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            value={config.grain}
            onChange={(e) => updateParam("grain", Number(e.target.value))}
          />
        </div>

        {/* Vignette */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CircleDot className="w-3.5 h-3.5 text-purple-400" />
              소프트 비네팅
            </span>
            <span className="font-mono text-slate-400">{config.vignette}</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={config.vignette}
            onChange={(e) => updateParam("vignette", Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};
