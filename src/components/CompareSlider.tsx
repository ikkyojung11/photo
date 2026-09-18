"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Eye, ChevronsLeftRight, SplitSquareVertical, Columns } from "lucide-react";

interface CompareSliderProps {
  originalCanvasRef: React.RefObject<HTMLCanvasElement>;
  gradedCanvasRef: React.RefObject<HTMLCanvasElement>;
  width: number;
  height: number;
  viewMode: "split" | "side" | "hold";
  setViewMode: (mode: "split" | "side" | "hold") => void;
  isProcessing: boolean;
}

export const CompareSlider: React.FC<CompareSliderProps> = ({
  originalCanvasRef,
  gradedCanvasRef,
  width,
  height,
  viewMode,
  setViewMode,
  isProcessing,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHoldingOriginal, setIsHoldingOriginal] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateSlider(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  return (
    <div className="flex flex-col items-center w-full select-none">
      {/* View Mode Controls */}
      <div className="flex items-center justify-between w-full max-w-4xl px-4 py-2 mb-3 bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800 text-sm">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode("split")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === "split"
                ? "bg-sakura-500 text-white shadow-lg shadow-sakura-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <SplitSquareVertical className="w-4 h-4" />
            분할 슬라이더
          </button>
          <button
            onClick={() => setViewMode("side")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === "side"
                ? "bg-sakura-500 text-white shadow-lg shadow-sakura-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Columns className="w-4 h-4" />
            나란히 비교
          </button>
        </div>

        {/* Hold to preview original */}
        <button
          onMouseDown={() => setIsHoldingOriginal(true)}
          onMouseUp={() => setIsHoldingOriginal(false)}
          onMouseLeave={() => setIsHoldingOriginal(false)}
          onTouchStart={() => setIsHoldingOriginal(true)}
          onTouchEnd={() => setIsHoldingOriginal(false)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
            isHoldingOriginal
              ? "bg-amber-500/20 text-amber-300 border-amber-500"
              : "border-slate-700 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>꾹 눌러 원본 보기</span>
        </button>
      </div>

      {/* Main Preview Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black/40 flex items-center justify-center min-h-[360px] md:min-h-[500px]"
      >
        {isProcessing && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs">
            <div className="w-8 h-8 border-3 border-sakura-500 border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-xs text-sakura-200 font-medium">색감 렌더링 중...</span>
          </div>
        )}

        {/* View Mode: Split Slider */}
        {viewMode === "split" && (
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-ew-resize"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Graded Image (Underneath, full view unless hold active) */}
            <div
              className={`w-full flex justify-center items-center ${
                isHoldingOriginal ? "opacity-0" : "opacity-100"
              }`}
            >
              <canvas
                ref={gradedCanvasRef}
                className="max-w-full max-h-[70vh] object-contain rounded-lg pointer-events-none"
              />
            </div>

            {/* Original Image (Clipped by slider position or shown 100% on hold) */}
            <div
              className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden"
              style={{
                clipPath: isHoldingOriginal
                  ? "inset(0% 0% 0% 0%)"
                  : `inset(0% ${100 - sliderPos}% 0% 0%)`,
              }}
            >
              <canvas
                ref={originalCanvasRef}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>

            {/* Split Handle & Line */}
            {!isHoldingOriginal && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-0.5 h-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.7)]" />
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border-2 border-sakura-500">
                  <ChevronsLeftRight className="w-4 h-4 text-sakura-600" />
                </div>
              </div>
            )}

            {/* Labels */}
            {!isHoldingOriginal && (
              <>
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-slate-300 pointer-events-none border border-white/10">
                  원본 (Before)
                </div>
                <div className="absolute bottom-4 right-4 bg-sakura-600/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-white pointer-events-none border border-sakura-300/30">
                  보정 후 (After)
                </div>
              </>
            )}

            {isHoldingOriginal && (
              <div className="absolute top-4 bg-amber-500/90 text-black px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-lg">
                원본 사진 확인 중
              </div>
            )}
          </div>
        )}

        {/* View Mode: Side by Side */}
        {viewMode === "side" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full p-3">
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black/50 flex flex-col items-center">
              <span className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md text-xs font-semibold text-slate-300 px-2.5 py-1 rounded-md border border-white/10">
                원본 (Before)
              </span>
              <canvas
                ref={originalCanvasRef}
                className="max-w-full max-h-[60vh] object-contain"
              />
            </div>
            <div className="relative rounded-xl overflow-hidden border border-sakura-500/30 bg-black/50 flex flex-col items-center">
              <span className="absolute top-3 left-3 z-10 bg-sakura-600/90 backdrop-blur-md text-xs font-semibold text-white px-2.5 py-1 rounded-md shadow-lg">
                보정 후 (After)
              </span>
              <canvas
                ref={gradedCanvasRef}
                className="max-w-full max-h-[60vh] object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
