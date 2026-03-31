"use client";

import { useEffect, useRef, useState } from "react";

interface NotationRendererProps {
  notation: string;
  width?: number;
}

export default function NotationRenderer({ notation, width }: NotationRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !notation) return;
    setError(false);

    let mounted = true;

    import("abcjs")
      .then((mod) => {
        const abcjs = mod.default || mod;
        if (!mounted || !containerRef.current) return;
        try {
          abcjs.renderAbc(containerRef.current, notation, {
            staffwidth: width || 280,
            responsive: "resize",
            paddingtop: 15,
            paddingbottom: 15,
            paddingleft: 20,
            paddingright: 20,
            add_classes: true,
            scale: 1.3,
          });
        } catch (e) {
          console.error("ABCjs render error:", e);
          if (mounted) setError(true);
        }
      })
      .catch((e) => {
        console.error("ABCjs import error:", e);
        if (mounted) setError(true);
      });

    return () => { mounted = false; };
  }, [notation, width]);

  if (error) {
    return (
      <div className="notation-container rounded-xl p-6 bg-amber-950/20 border border-amber-800/30 text-center">
        <p className="text-amber-400 text-sm font-display font-600">Notation could not be rendered</p>
        <p className="text-stone-500 text-xs mt-1">Try refreshing the page</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="notation-container rounded-xl overflow-hidden"
      style={{ minHeight: 100 }}
    />
  );
}
