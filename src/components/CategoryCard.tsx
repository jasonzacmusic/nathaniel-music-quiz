"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

interface CategoryCardProps {
  name: string;
  questionCount: number;
  icon: string;
  color: string;
  href: string;
  index?: number;
}

const colorMap: Record<string, { bg: string; glow: string; badge: string }> = {
  "from-violet-600 to-purple-500": {
    bg: "from-violet-700/60 via-purple-700/40 to-violet-900/20",
    glow: "rgba(139,92,246,0.5)",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  },
  "from-blue-600 to-cyan-500": {
    bg: "from-blue-700/60 via-cyan-700/40 to-blue-900/20",
    glow: "rgba(6,182,212,0.5)",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  "from-emerald-600 to-teal-500": {
    bg: "from-emerald-700/60 via-teal-700/40 to-emerald-900/20",
    glow: "rgba(16,185,129,0.5)",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  "from-orange-600 to-amber-500": {
    bg: "from-orange-700/60 via-amber-700/40 to-orange-900/20",
    glow: "rgba(245,158,11,0.5)",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  "from-pink-600 to-rose-500": {
    bg: "from-pink-700/60 via-rose-700/40 to-pink-900/20",
    glow: "rgba(244,63,94,0.5)",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
  "from-indigo-600 to-blue-500": {
    bg: "from-indigo-700/60 via-blue-700/40 to-indigo-900/20",
    glow: "rgba(99,102,241,0.5)",
    badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
  "from-red-600 to-orange-500": {
    bg: "from-red-700/60 via-orange-700/40 to-red-900/20",
    glow: "rgba(239,68,68,0.5)",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
  },
  "from-purple-600 to-violet-500": {
    bg: "from-purple-700/60 via-violet-700/40 to-purple-900/20",
    glow: "rgba(168,85,247,0.5)",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
};

const fallbackStyle = {
  bg: "from-violet-700/50 via-purple-700/30 to-violet-900/10",
  glow: "rgba(124,58,237,0.4)",
  badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

export default function CategoryCard({
  name,
  questionCount,
  icon,
  color,
  href,
  index = 0,
}: CategoryCardProps) {
  const style = colorMap[color] || fallbackStyle;
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: "easeOut" }}
      style={{ perspective: "1000px" }}
    >
      <Link href={href} className="block h-full">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br ${style.bg} backdrop-blur-sm p-5 cursor-pointer h-full min-h-[100px] flex flex-col justify-between`}
        >
          {/* Inner glow on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
            style={{
              background: `radial-gradient(ellipse at top right, ${style.glow.replace("0.5", "0.15")}, transparent 70%)`,
            }}
          />

          {/* Border glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-white/15 transition-colors duration-300"
          />

          {/* Content */}
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <span className="text-2xl leading-none shrink-0 mt-0.5">{icon}</span>
              <div className="min-w-0">
                <h3 className="font-display font-700 text-sm text-white leading-tight truncate group-hover:text-white transition-colors">
                  {name}
                </h3>
              </div>
            </div>
            <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${style.badge}`}>
              {questionCount}q
            </span>
          </div>

          {/* Bottom accent bar */}
          <div className={`relative z-10 mt-4 h-0.5 w-0 group-hover:w-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`} />

          {/* Arrow */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0">
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
