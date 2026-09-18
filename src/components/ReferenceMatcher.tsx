"use client";

import React, { useState, useRef, useEffect } from "react";
import { Wand2, ImagePlus, RefreshCw, Sparkles } from "lucide-react";

interface ReferenceMatcherProps {
  onApplyReference: (refCanvas: HTMLCanvasElement, intensity: number) => void;
  isProcessing: boolean;
}

export const ReferenceMatcher: React.FC<ReferenceMatcherProps> = ({
  onApplyReference,
  isProcessing,
}) => {
  const [refImageSrc, setRefImageSrc] = useState<string>("/samples/target-reference.png");
  const [intensity, setIntensity] = useState<number>(85); // 0 ~ 100
  const refCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = refImageSrc;
    img.onload = () => {
      const canvas = refCanvasRef.current;
      if (!canvas) return;
      // limit max dimension for fast extraction
      const maxDim = 800;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
      }
    };
  }, [refImageSrc]);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setRefImageSrc(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExtractAndApply = () => {
    if (!refCanvasRef.current) return;
    onApplyReference(refCanvasRef.current, intensity / 100);
  };

  return (
    <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl mt-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-sakura-500/50 shadow-md flex-shrink-0 bg-black">
            <canvas ref={refCanvasRef} className="w-full h-full object-cover" />
            <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-center text-sakura-300 font-medium py-0.5">
              타깃 레퍼런스
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sakura-400" />
              <h4 className="text-sm font-semibold text-white">
                레퍼런스 사진 색감 자동 추출 (AI Color Transfer)
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              2번 타깃 사진(또는 직접 올린 감성 사진)의 색채 분포(Lab Space)를 분석하여 내 사진에 자동 주입합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleCustomUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <ImagePlus className="w-3.5 h-3.5 text-slate-400" />
            다른 사진 올리기
          </button>

          {/* Intensity Slider */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400">강도</span>
            <input
              type="range"
              min="20"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-16"
            />
            <span className="font-mono text-sakura-300 w-7 text-right">{intensity}%</span>
          </div>

          <button
            onClick={handleExtractAndApply}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-sakura-500 to-pink-600 hover:from-sakura-600 hover:to-pink-700 text-white shadow-lg shadow-sakura-500/25 transition disabled:opacity-50"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            이 사진 색감 그대로 입히기
          </button>
        </div>
      </div>
    </div>
  );
};
