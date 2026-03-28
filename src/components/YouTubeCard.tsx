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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
    >
      <motion.div
        className="max-w-2xl mx-auto px-4 pb-4 pointer-events-auto"
        layoutId="youtube-card"
      >
        <div className="bg-gradient-to-r from-red-600/90 to-red-700/90 backdrop-blur rounded-2xl p-4 md:p-6 shadow-2xl border border-red-500/30">
          <div className="flex items-start justify-between gap-4">
            {/* Content */}
            <div className="flex-1 flex items-center gap-4">
              {/* YouTube Icon */}
              <div className="flex-shrink-0 p-3 bg-white rounded-lg">
                <Play className="w-5 h-5 text-red-600 fill-red-600" />
              </div>

              {/* Title and CTA */}
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-red-100 uppercase tracking-wide">
                  Watch on YouTube
                </p>
                <p className="text-base md:text-lg font-display font-700 text-white truncate">
                  {title}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 md:px-6 py-2 rounded-lg bg-white text-red-600 font-bold hover:bg-red-50 transition-all hover:shadow-lg font-display text-sm md:text-base"
              >
                Watch
              </Link>

              {onClose && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Progress bar animation */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent rounded-b-2xl origin-left"
            style={{ transformOrigin: "left" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
