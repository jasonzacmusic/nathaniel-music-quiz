"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Sync muted state to DOM (React's muted prop can be unreliable)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleUnmute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      // If autoplay was blocked and video is paused, try to play now
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    if (videoRef.current) {
      const next = !isMuted;
      videoRef.current.muted = next;
      setIsMuted(next);
    }
  }, [isMuted]);

  const handleCanPlay = useCallback(() => {
    setHasLoaded(true);
    setIsPlaying(true);
    onReady?.();
  }, [onReady]);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <div className={`relative w-full aspect-video flex items-center justify-center bg-[#0a0f1e] rounded-2xl ${className}`}>
        <div className="text-center p-6">
          <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-medium">Video unavailable</p>
          <p className="text-xs text-slate-600 mt-1">Use the audio cues to answer</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full bg-black overflow-hidden ${className}`}>
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        loop
        playsInline
        muted
        onCanPlay={handleCanPlay}
        onLoadedMetadata={() => setHasLoaded(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={handleError}
        className="w-full h-full object-contain"
        style={{ maxHeight: "52vh", minHeight: "200px" }}
        preload="auto"
      />

      {/* Spinner while loading */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-[#080D1A]"
          >
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 border-r-cyan-400 animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROMINENT UNMUTE OVERLAY — shown when muted and video has loaded */}
      <AnimatePresence>
        {isMuted && hasLoaded && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25 }}
            onClick={handleUnmute}
            className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
            aria-label="Tap to unmute audio"
          >
            {/* Subtle dark vignette to make the button pop */}
            <div className="absolute inset-0 bg-black/30" />

            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex items-center gap-3 px-6 py-3.5 rounded-2xl border border-white/20 backdrop-blur-md"
              style={{ background: "rgba(8,13,26,0.75)" }}
            >
              {/* Pulsing ring */}
              <div className="relative flex-shrink-0">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(124,58,237,0.4)" }}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-left">
                <p className="text-white font-display font-700 text-sm leading-none mb-0.5">Tap to Hear the Music</p>
                <p className="text-slate-400 text-xs">Audio off — unmute to answer</p>
              </div>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Corner mute toggle — visible after unmuting */}
      {!isMuted && hasLoaded && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleToggleMute}
          className="absolute bottom-3 right-3 z-10 p-2 rounded-full bg-black/50 backdrop-blur border border-white/10 text-white/70 hover:text-white transition-all"
          aria-label="Mute"
        >
          <VolumeX className="w-3.5 h-3.5" />
        </motion.button>
      )}
    </div>
  );
}
