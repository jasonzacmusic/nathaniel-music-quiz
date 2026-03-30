"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  isMuted: boolean;
  onReady?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export default function VideoPlayer({
  videoUrl,
  isMuted,
  onReady,
  className = "",
  children,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = isMuted;
    if (!isMuted && v.paused) v.play().catch(() => {});
  }, [isMuted]);

  const handleCanPlay = useCallback(() => {
    setHasLoaded(true);
    setIsPlaying(true);
    onReady?.();
  }, [onReady]);

  if (hasError) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-[#0a0a08] ${className}`}>
        <div className="text-center p-6">
          <AlertCircle className="w-10 h-10 text-stone-600 mx-auto mb-3" />
          <p className="text-base text-stone-400 font-medium">Video unavailable</p>
          <p className="text-sm text-stone-600 mt-1">Use the audio cues to answer</p>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-black overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        loop
        playsInline
        muted
        onCanPlay={handleCanPlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
        className="absolute inset-0 w-full h-full object-contain object-top"
        preload="auto"
      />

      {/* Loading spinner */}
      <AnimatePresence>
        {!hasLoaded && !isPlaying && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-[#0a0a08] z-10"
          >
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-amber-800/30" />
              <div className="absolute inset-0 rounded-full border-2 border-t-amber-500 border-r-amber-600 animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}
