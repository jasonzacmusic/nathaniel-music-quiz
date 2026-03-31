"use client";

import { useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import * as Tone from "tone";

const STORAGE_KEY = "nsm-volume";
const DEFAULT_DB = -2; // -2 dB default reduction

function getStoredVolume(): number {
  if (typeof window === "undefined") return DEFAULT_DB;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? parseFloat(stored) : DEFAULT_DB;
}

export function useVolume() {
  const [volume, setVolume] = useState(DEFAULT_DB);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const stored = getStoredVolume();
    setVolume(stored);
    Tone.getDestination().volume.value = stored;
  }, []);

  const changeVolume = useCallback((db: number) => {
    const clamped = Math.max(-30, Math.min(6, db));
    setVolume(clamped);
    Tone.getDestination().volume.value = clamped;
    localStorage.setItem(STORAGE_KEY, String(clamped));
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      Tone.getDestination().mute = next;
      return next;
    });
  }, []);

  return { volume, muted, changeVolume, toggleMute };
}

interface VolumeControlProps {
  className?: string;
  compact?: boolean;
}

export default function VolumeControl({ className = "", compact = false }: VolumeControlProps) {
  const { volume, muted, changeVolume, toggleMute } = useVolume();

  // Map dB (-30 to +6) to 0-100 slider
  const sliderValue = Math.round(((volume + 30) / 36) * 100);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    const db = (val / 100) * 36 - 30;
    changeVolume(Math.round(db));
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={toggleMute}
          className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.06] transition-all"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={muted ? 0 : sliderValue}
          onChange={handleSlider}
          className="vol-slider w-20 h-1.5 appearance-none bg-white/10 rounded-full cursor-pointer"
          aria-label="Volume"
        />
        <style jsx>{`
          .vol-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #f59e0b;
            border: 2px solid rgba(255,255,255,0.2);
            cursor: pointer;
          }
          .vol-slider::-moz-range-thumb {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #f59e0b;
            border: 2px solid rgba(255,255,255,0.2);
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] ${className}`}>
      <button
        onClick={toggleMute}
        className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.06] transition-all"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
      <input
        type="range"
        min="0"
        max="100"
        value={muted ? 0 : sliderValue}
        onChange={handleSlider}
        className="vol-slider flex-1 h-1.5 appearance-none bg-white/10 rounded-full cursor-pointer"
        aria-label="Volume"
      />
      <span className="text-[10px] text-stone-500 font-mono w-10 text-right">
        {muted ? "MUTE" : `${volume > 0 ? "+" : ""}${volume}dB`}
      </span>
      <style jsx>{`
        .vol-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #f59e0b;
          border: 2px solid rgba(255,255,255,0.2);
          box-shadow: 0 0 8px rgba(245,158,11,0.3);
          cursor: pointer;
        }
        .vol-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #f59e0b;
          border: 2px solid rgba(255,255,255,0.2);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
