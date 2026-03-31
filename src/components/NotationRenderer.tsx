"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Volume2 } from "lucide-react";

interface NotationRendererProps {
  notation: string;
  width?: number;
  showPlayback?: boolean;
}

export default function NotationRenderer({ notation, width, showPlayback = false }: NotationRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const synthRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visualObjRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !notation) return;

    import("abcjs").then((abcjs) => {
      if (!containerRef.current) return;
      const result = abcjs.renderAbc(containerRef.current, notation, {
        staffwidth: width || 280,
        responsive: "resize",
        paddingtop: 15,
        paddingbottom: 15,
        paddingleft: 20,
        paddingright: 20,
        add_classes: true,
        scale: 1.3,
      });
      visualObjRef.current = result?.[0] || null;
    });
  }, [notation, width]);

  const handlePlay = useCallback(async () => {
    if (!visualObjRef.current || isPlaying) return;

    const abcjs = await import("abcjs");

    if (synthRef.current) {
      try { synthRef.current.stop(); } catch { /* ignore */ }
    }

    try {
      const synth = new abcjs.synth.CreateSynth();
      await synth.init({
        visualObj: visualObjRef.current,
        options: {
          soundFontUrl: "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/",
        },
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      await synth.prime();
      synthRef.current = synth;
      setIsPlaying(true);
      synth.start();

      const duration = visualObjRef.current?.getTotalTime?.() || 3;
      setTimeout(() => setIsPlaying(false), duration * 1000 + 500);
    } catch (err) {
      console.error("Playback error:", err);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  return (
    <div className="notation-wrapper">
      <div
        ref={containerRef}
        className="notation-container rounded-xl overflow-hidden"
        style={{ minHeight: 100 }}
      />
      {showPlayback && (
        <button
          onClick={handlePlay}
          disabled={isPlaying}
          className={`mt-2 flex items-center gap-2 mx-auto px-4 py-2 rounded-lg text-sm font-display font-600 transition-all ${
            isPlaying
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
              : "bg-violet-500/15 border border-violet-500/30 text-violet-300 hover:bg-violet-500/25"
          }`}
        >
          <Volume2 className="w-4 h-4" />
          {isPlaying ? "Playing..." : "Play"}
        </button>
      )}
    </div>
  );
}
