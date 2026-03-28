"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

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

  const handleUnmute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative w-full max-w-md mx-auto aspect-video rounded-3xl overflow-hidden shadow-2xl ${className}`}
    >
      {/* Video Container with aspect ratio 9:16 */}
      <div className="relative w-full bg-black/80 aspect-video rounded-3xl overflow-hidden">
        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          loop
          playsInline
          muted={isMuted}
          onCanPlay={onReady}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          className="w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 pointer-events-none" />

        {/* Unmute Button */}
        {isMuted && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUnmute}
            className="absolute bottom-6 right-6 p-3 rounded-full bg-gradient-to-br from-electric-violet to-deep-purple text-white shadow-lg hover:shadow-glow-purple transition-all z-10"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </motion.button>
        )}

        {/* Play Indicator */}
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="absolute inset-0 bg-black/30 flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="p-4 rounded-full bg-white/20 backdrop-blur-sm"
            >
              <div className="w-8 h-8 border-3 border-white rounded-full border-r-transparent animate-spin" />
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Enhanced Shadow */}
      <div className="absolute -inset-2 bg-gradient-to-br from-electric-violet/20 to-deep-purple/20 rounded-3xl -z-10 blur-2xl" />
    </motion.div>
  );
}
