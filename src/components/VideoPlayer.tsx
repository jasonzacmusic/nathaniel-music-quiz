"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, AlertCircle } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  onReady?: () => void;
  className?: string;
}

export default function VideoPlayer({
  videoUrl,
  onReady,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleToggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-slate-900 ${className}`}>
      {/* Video element - fills container */}
      {!hasError ? (
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          loop
          playsInline
          muted={isMuted}
          onCanPlay={() => {
            setIsPlaying(true);
            onReady?.();
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={handleError}
          className="w-full h-full object-contain"
          style={{ maxHeight: "60vh" }}
          crossOrigin="anonymous"
          preload="auto"
        />
      ) : (
        <div className="w-full aspect-video flex items-center justify-center bg-slate-900/80">
          <div className="text-center p-6">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Video unavailable</p>
            <p className="text-xs text-slate-600 mt-1">Listen to the audio cues to answer</p>
          </div>
        </div>
      )}

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Mute/Unmute toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleMute}
        className="absolute bottom-4 right-4 z-10 p-2.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white hover:bg-black/60 transition-all"
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </motion.button>

      {/* Loading state */}
      {!isPlaying && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
