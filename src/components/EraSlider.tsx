"use client";

import { useState, useCallback } from "react";

interface EraSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const CLASSICAL_TOPICS = ["Key Signatures", "Intervals", "Scales & Modes", "Form & Analysis", "Rhythm & Meter"];
const CONTEMPORARY_TOPICS = ["Jazz Theory", "Chord Theory", "Harmony & Voice Leading"];

export default function EraSlider({ value, onChange }: EraSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const classical = 100 - value;
  const contemporary = value;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseInt(e.target.value));
    },
    [onChange]
  );

  // Gradient position based on slider value
  const gradientPosition = value;

  return (
    <div className="relative rounded-2xl border border-white/[0.08] overflow-hidden">
      {/* Shifting gradient background */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          background: `linear-gradient(to right,
            rgba(180, 83, 9, ${0.08 + (classical / 100) * 0.12}),
            rgba(120, 60, 10, 0.04) ${gradientPosition}%,
            rgba(124, 58, 237, ${0.06 + (contemporary / 100) * 0.1}))`,
        }}
      />
      <div className="absolute inset-0 bg-[#0a0a08]/60" />

      <div className="relative z-10 p-6 sm:p-8">
        {/* Section label */}
        <p className="text-[11px] text-amber-600/50 uppercase tracking-[0.2em] font-medium mb-5">
          Era Focus
        </p>

        {/* Labels row */}
        <div className="flex items-start justify-between mb-4">
          {/* Classical label */}
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1.5">
              <svg className="w-4 h-4 text-amber-500/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 19V6l12-3v13" />
                <circle cx="6" cy="19" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              <span
                className="text-sm font-semibold text-amber-400/90 tracking-wide"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Classical
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              {CLASSICAL_TOPICS.join(" / ")}
            </p>
          </div>

          {/* Contemporary label */}
          <div className="flex-1 pl-4 text-right">
            <div className="flex items-center gap-2 justify-end mb-1.5">
              <span className="text-sm font-semibold text-electric-violet/90 font-display tracking-wide">
                Jazz & Modern
              </span>
              <svg className="w-4 h-4 text-electric-violet/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
              </svg>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              {CONTEMPORARY_TOPICS.join(" / ")}
            </p>
          </div>
        </div>

        {/* Slider track */}
        <div className="relative mt-2 mb-3">
          {/* Custom track background */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right,
                  rgba(245, 158, 11, 0.5),
                  rgba(245, 158, 11, 0.15) 40%,
                  rgba(124, 58, 237, 0.15) 60%,
                  rgba(124, 58, 237, 0.5))`,
              }}
            />
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={value}
            onChange={handleChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className="era-slider relative w-full h-6 appearance-none bg-transparent cursor-pointer z-10"
            aria-label="Era balance between Classical and Contemporary"
          />
        </div>

        {/* Current split display */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <span
            className={`text-xs font-medium transition-colors duration-200 ${
              classical >= 50 ? "text-amber-400" : "text-amber-600/60"
            }`}
          >
            {classical}% Classical
          </span>
          <span className="text-stone-700 text-xs">
            {"\u00b7"}
          </span>
          <span
            className={`text-xs font-medium transition-colors duration-200 ${
              contemporary >= 50 ? "text-electric-violet" : "text-violet-600/60"
            }`}
          >
            {contemporary}% Contemporary
          </span>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .era-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 12px rgba(245, 158, 11, ${isDragging ? "0.5" : "0.3"}),
            0 2px 8px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.15s;
          transform: scale(${isDragging ? "1.15" : "1"});
        }

        .era-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 16px rgba(245, 158, 11, 0.5),
            0 2px 8px rgba(0, 0, 0, 0.3);
          transform: scale(1.1);
        }

        .era-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.3),
            0 2px 8px rgba(0, 0, 0, 0.3);
          cursor: pointer;
        }

        .era-slider::-webkit-slider-runnable-track {
          height: 8px;
          background: transparent;
          border-radius: 4px;
        }

        .era-slider::-moz-range-track {
          height: 8px;
          background: transparent;
          border-radius: 4px;
          border: none;
        }
      `}</style>
    </div>
  );
}
