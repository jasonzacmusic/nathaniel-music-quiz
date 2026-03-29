"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play, X } from "lucide-react";

interface YouTubeCardProps {
  title: string;
  url: string;
  onClose?: () => void;
}

export default function YouTubeCard({
  title,
  url,
  onClose,
}: YouTubeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="bg-gradient-to-r from-red-600/90 to-red-700/90 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-red-500/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 p-2 sm:p-2.5 bg-white rounded-lg">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 fill-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-medium text-red-100 uppercase tracking-wide">
                Watch the full lesson
              </p>
              <p className="text-sm sm:text-base font-display font-700 text-white truncate">
                {title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 sm:px-5 py-2 rounded-lg bg-white text-red-600 font-bold hover:bg-red-50 transition-all font-display text-xs sm:text-sm"
            >
              Watch
            </Link>
            {onClose && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
