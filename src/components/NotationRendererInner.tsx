"use client";

import { useEffect, useRef } from "react";
import abcjs from "abcjs";

interface NotationRendererInnerProps {
  notation: string;
  width?: number;
}

function normalizeAbc(raw: string): string {
  const bs = "\\" + "n";
  return raw.includes(bs) ? raw.split(bs).join("\n") : raw;
}

export default function NotationRendererInner({ notation, width = 320 }: NotationRendererInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !notation) return;

    el.innerHTML = "";

    try {
      const abc = normalizeAbc(notation);

      abcjs.renderAbc(el, abc, {
        staffwidth: Math.min(width - 40, 280),
        paddingtop: 10,
        paddingbottom: 5,
        paddingleft: 10,
        paddingright: 10,
        scale: 1.3,
        add_classes: true,
        responsive: "resize" as const,
      });

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

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden bg-white flex items-center justify-center"
      style={{ minHeight: 120, minWidth: Math.min(width, 320) }}
    />
  );
}
