"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface NotationRendererProps {
  notation: string;
  width?: number;
}

/**
 * Normalize ABC notation strings.
 * Some DB rows store literal backslash-n instead of real newlines.
 * We use split/join because regex escaping gets mangled by the webpack bundler.
 */
function normalizeAbc(raw: string): string {
  const bs = "\\" + "n";
  return raw.includes(bs) ? raw.split(bs).join("\n") : raw;
}

export default function NotationRenderer({ notation, width }: NotationRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "rendered" | "error">("loading");

  const render = useCallback(() => {
    const el = containerRef.current;
    if (!el || !notation) return;

    const abc = normalizeAbc(notation);

    import("abcjs")
      .then((mod) => {
        if (!containerRef.current) return;
        const abcjs = mod.default || mod;
        if (typeof abcjs.renderAbc !== "function") {
          setStatus("error");
          return;
        }
        abcjs.renderAbc(containerRef.current, abc, {
          staffwidth: width || 280,
          responsive: "resize",
          paddingtop: 15,
          paddingbottom: 15,
          paddingleft: 20,
          paddingright: 20,
          add_classes: true,
          scale: 1.3,
        });
        // Verify something was actually rendered
        if (containerRef.current.querySelector("svg")) {
          setStatus("rendered");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [notation, width]);

  useEffect(() => {
    setStatus("loading");
    // Small delay to ensure DOM is ready after AnimatePresence transitions
    const timer = setTimeout(render, 50);
    return () => clearTimeout(timer);
  }, [render]);

  if (status === "error") {
    return (
      <div className="rounded-xl p-6 bg-amber-950/20 border border-amber-800/30 text-center" style={{ minWidth: 280 }}>
        <p className="text-amber-400 text-sm font-display font-600">Notation could not be rendered</p>
        <p className="text-stone-500 text-xs mt-1">Try refreshing the page</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden bg-white p-2"
      style={{ minHeight: 120, minWidth: width || 280 }}
    />
  );
}
