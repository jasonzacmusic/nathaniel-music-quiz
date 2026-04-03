"use client";

import { useEffect, useRef, useCallback } from "react";

interface NotationRendererProps {
  notation: string;
  width?: number;
}

/** Normalize literal \n from DB into real newlines */
function normalizeAbc(raw: string): string {
  const bs = "\\" + "n";
  return raw.includes(bs) ? raw.split(bs).join("\n") : raw;
}

export default function NotationRenderer({ notation, width = 320 }: NotationRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const render = useCallback(async () => {
    const el = containerRef.current;
    if (!el || !notation) return;

    el.innerHTML = "";

    try {
      const abcjs = await import("abcjs");
      const abc = normalizeAbc(notation);

      abcjs.renderAbc(el, abc, {
        staffwidth: Math.min(width - 40, 280),
        paddingtop: 10,
        paddingbottom: 5,
        paddingleft: 10,
        paddingright: 10,
        scale: 1.3,
        add_classes: true,
        responsive: "resize",
      });

      // Style the rendered SVG for dark-mode readability
      const svg = el.querySelector("svg");
      if (svg) {
        svg.style.maxWidth = "100%";
        svg.style.height = "auto";
      }
    } catch (e) {
      console.error("abcjs render error:", e);
      el.innerHTML = '<p style="color:#f59e0b;text-align:center;padding:20px;font-size:14px;">Could not render notation</p>';
    }
  }, [notation, width]);

  useEffect(() => {
    const timer = setTimeout(render, 30);
    return () => clearTimeout(timer);
  }, [render]);

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden bg-white flex items-center justify-center"
      style={{ minHeight: 120, minWidth: Math.min(width, 320) }}
    />
  );
}
