"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface EraSliderProps {
  value: number;
  onChange: (value: number) => void;
}

/* ═══════ ZONE DEFINITIONS ═══════ */

const ZONES = [
  {
    name: "Western Classical",
    range: [0, 25],
    color1: "rgba(180, 83, 9, 0.35)",   // warm amber
    color2: "rgba(120, 53, 15, 0.2)",
    accent: "#f59e0b",
    accentMuted: "rgba(245, 158, 11, 0.6)",
    textColor: "text-amber-400",
    topics: "Intervals · Key Signatures · Form · Scales",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 19V6l12-3v13M9 19c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm12-3c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z" />
      </svg>
    ),
  },
  {
    name: "Jazz & Modern",
    range: [25, 50],
    color1: "rgba(124, 58, 237, 0.3)",   // cool violet
    color2: "rgba(6, 182, 212, 0.15)",   // cyan tint
    accent: "#7c3aed",
    accentMuted: "rgba(124, 58, 237, 0.6)",
    textColor: "text-violet-400",
    topics: "Jazz Theory · Chord Voicings · Harmony",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
      </svg>
    ),
  },
  {
    name: "Carnatic",
    range: [50, 75],
    color1: "rgba(234, 88, 12, 0.3)",    // saffron/deep orange
    color2: "rgba(220, 38, 38, 0.15)",   // deep red
    accent: "#f97316",
    accentMuted: "rgba(249, 115, 22, 0.6)",
    textColor: "text-orange-400",
    topics: "Ragas · Tala · Melakarta · Compositions",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    name: "Hindustani",
    range: [75, 100],
    color1: "rgba(67, 56, 202, 0.3)",    // royal indigo
    color2: "rgba(16, 185, 129, 0.12)",  // emerald accent
    accent: "#6366f1",
    accentMuted: "rgba(99, 102, 241, 0.6)",
    textColor: "text-indigo-400",
    topics: "Thaat · Raga · Taal · Gharana",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
];

/* ═══════ DECORATIVE PATTERNS ═══════ */

function ClassicalPattern({ opacity }: { opacity: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: opacity * 0.12 }}>
      {/* Staff lines */}
      {[30, 38, 46, 54, 62].map((y) => (
        <line key={y} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#f59e0b" strokeWidth="0.5" />
      ))}
      {/* Treble clef hint */}
      <text x="5%" y="50%" fill="#f59e0b" fontSize="32" fontFamily="serif" opacity="0.3">𝄞</text>
    </svg>
  );
}

function JazzPattern({ opacity }: { opacity: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: opacity * 0.1 }}>
      {/* Smoky circles */}
      <circle cx="80%" cy="30%" r="60" fill="none" stroke="#7c3aed" strokeWidth="0.5" opacity="0.4" />
      <circle cx="85%" cy="35%" r="45" fill="none" stroke="#06b6d4" strokeWidth="0.5" opacity="0.3" />
      <circle cx="75%" cy="40%" r="30" fill="none" stroke="#7c3aed" strokeWidth="0.5" opacity="0.5" />
      {/* Sharp symbol */}
      <text x="90%" y="65%" fill="#7c3aed" fontSize="24" opacity="0.3">♯</text>
    </svg>
  );
}

function CarnaticPattern({ opacity }: { opacity: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: opacity * 0.08 }}>
      {/* Kolam-inspired dots */}
      {[20, 40, 60, 80].map((x) =>
        [30, 50, 70].map((y) => (
          <circle key={`${x}-${y}`} cx={`${x}%`} cy={`${y}%`} r="2" fill="#f97316" opacity="0.5" />
        ))
      )}
      {/* Connecting arcs */}
      <path d="M 20% 30% Q 30% 40% 40% 30%" fill="none" stroke="#f97316" strokeWidth="0.5" opacity="0.3" />
      <path d="M 60% 50% Q 70% 60% 80% 50%" fill="none" stroke="#dc2626" strokeWidth="0.5" opacity="0.3" />
      {/* Om symbol hint */}
      <text x="88%" y="40%" fill="#f97316" fontSize="20" opacity="0.25">ॐ</text>
    </svg>
  );
}

function HindustaniPattern({ opacity }: { opacity: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: opacity * 0.08 }}>
      {/* Mughal arch / jali lattice */}
      <path d="M 10% 80% Q 10% 20% 50% 20% Q 90% 20% 90% 80%" fill="none" stroke="#6366f1" strokeWidth="0.5" opacity="0.4" />
      <path d="M 20% 80% Q 20% 30% 50% 30% Q 80% 30% 80% 80%" fill="none" stroke="#6366f1" strokeWidth="0.5" opacity="0.3" />
      {/* Diamond lattice points */}
      {[30, 50, 70].map((x) =>
        [40, 55, 70].map((y) => (
          <rect key={`${x}-${y}`} x={`${x - 1}%`} y={`${y - 1}%`} width="6" height="6" rx="1" fill="none" stroke="#6366f1" strokeWidth="0.5" opacity="0.3" transform={`rotate(45, ${x}%, ${y}%)`} />
        ))
      )}
    </svg>
  );
}

/* ═══════ MAIN COMPONENT ═══════ */

export default function EraSlider({ value, onChange }: EraSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Calculate zone opacities based on slider position
  const zoneOpacities = useMemo(() => {
    return ZONES.map((zone) => {
      const mid = (zone.range[0] + zone.range[1]) / 2;
      const distance = Math.abs(value - mid);
      const halfWidth = (zone.range[1] - zone.range[0]) / 2;
      // Full opacity at center of zone, fading out over 30 units
      return Math.max(0, 1 - distance / (halfWidth + 20));
    });
  }, [value]);

  // Active zone (highest opacity)
  const activeZoneIndex = zoneOpacities.indexOf(Math.max(...zoneOpacities));
  const activeZone = ZONES[activeZoneIndex];

  // Blended background gradient
  const bgGradient = useMemo(() => {
    let r = 0, g = 0, b = 0, a = 0;
    const colors = [
      [180, 83, 9],   // classical amber
      [124, 58, 237],  // jazz violet
      [234, 88, 12],   // carnatic saffron
      [67, 56, 202],   // hindustani indigo
    ];
    zoneOpacities.forEach((op, i) => {
      r += colors[i][0] * op;
      g += colors[i][1] * op;
      b += colors[i][2] * op;
      a += op;
    });
    if (a > 0) { r /= a; g /= a; b /= a; }
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.15)`;
  }, [zoneOpacities]);

  // Slider track gradient
  const trackGradient = `linear-gradient(to right,
    rgba(245, 158, 11, 0.6) 0%,
    rgba(245, 158, 11, 0.3) 20%,
    rgba(124, 58, 237, 0.5) 30%,
    rgba(124, 58, 237, 0.3) 45%,
    rgba(249, 115, 22, 0.5) 55%,
    rgba(249, 115, 22, 0.3) 70%,
    rgba(99, 102, 241, 0.5) 80%,
    rgba(99, 102, 241, 0.6) 100%)`;

  // Thumb color blends with active zone
  const thumbColor = activeZone.accent;

  return (
    <div className="relative rounded-2xl border border-white/[0.08] overflow-hidden">
      {/* Shifting background */}
      <motion.div
        className="absolute inset-0 transition-colors duration-500"
        style={{ background: bgGradient }}
      />
      <div className="absolute inset-0 bg-[#0a0a08]/70" />

      {/* Decorative patterns — fade in/out per zone */}
      <ClassicalPattern opacity={zoneOpacities[0]} />
      <JazzPattern opacity={zoneOpacities[1]} />
      <CarnaticPattern opacity={zoneOpacities[2]} />
      <HindustaniPattern opacity={zoneOpacities[3]} />

      <div className="relative z-10 p-6 sm:p-8">
        {/* Active tradition display */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-[11px] text-stone-500 uppercase tracking-[0.2em] font-medium">
            Tradition Focus
          </p>
          <motion.div
            key={activeZone.name}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.04]`}
          >
            <span className={activeZone.textColor}>{activeZone.icon}</span>
            <span className={`text-xs font-display font-600 ${activeZone.textColor}`}>
              {activeZone.name}
            </span>
          </motion.div>
        </div>

        {/* Zone markers */}
        <div className="flex mb-2">
          {ZONES.map((zone, i) => (
            <button
              key={zone.name}
              onClick={() => onChange((zone.range[0] + zone.range[1]) / 2)}
              className="flex-1 text-center group cursor-pointer"
            >
              <motion.div
                animate={{ opacity: zoneOpacities[i] > 0.3 ? 1 : 0.35 }}
                className="flex flex-col items-center gap-1"
              >
                <span className={`${zone.textColor} transition-all duration-300`}>
                  {zone.icon}
                </span>
                <span className={`text-[10px] font-display font-600 ${zone.textColor} transition-all duration-300 hidden sm:block`}>
                  {zone.name.split(" ").slice(-1)[0]}
                </span>
              </motion.div>
            </button>
          ))}
        </div>

        {/* Slider track */}
        <div className="relative mt-3 mb-4">
          {/* Custom track */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2.5 rounded-full overflow-hidden">
            <div className="absolute inset-0" style={{ background: trackGradient }} />
            {/* Zone dividers */}
            {[25, 50, 75].map((pos) => (
              <div
                key={pos}
                className="absolute top-0 bottom-0 w-px bg-white/20"
                style={{ left: `${pos}%` }}
              />
            ))}
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className="tradition-slider relative w-full h-7 appearance-none bg-transparent cursor-pointer z-10"
            aria-label="Music tradition balance"
          />
        </div>

        {/* Active zone topics */}
        <motion.div
          key={activeZone.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <p className="text-[11px] text-stone-500 leading-relaxed">
            {activeZone.topics}
          </p>
        </motion.div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .tradition-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${thumbColor};
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 ${isDragging ? "20px" : "12px"} ${activeZone.accentMuted},
            0 2px 8px rgba(0, 0, 0, 0.4);
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.15s, background 0.3s;
          transform: scale(${isDragging ? "1.2" : "1"});
        }

        .tradition-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 18px ${activeZone.accentMuted},
            0 2px 8px rgba(0, 0, 0, 0.4);
          transform: scale(1.1);
        }

        .tradition-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${thumbColor};
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 12px ${activeZone.accentMuted},
            0 2px 8px rgba(0, 0, 0, 0.4);
          cursor: pointer;
        }

        .tradition-slider::-webkit-slider-runnable-track {
          height: 10px;
          background: transparent;
          border-radius: 5px;
        }

        .tradition-slider::-moz-range-track {
          height: 10px;
          background: transparent;
          border-radius: 5px;
          border: none;
        }
      `}</style>
    </div>
  );
}
