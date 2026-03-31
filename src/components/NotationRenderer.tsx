"use client";

import { useEffect, useRef } from "react";

interface NotationRendererProps {
  notation: string;
  width?: number;
}

export default function NotationRenderer({ notation, width }: NotationRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !notation) return;

    // Dynamic import to avoid SSR issues
    import("abcjs").then((abcjs) => {
      if (!containerRef.current) return;
      abcjs.renderAbc(containerRef.current, notation, {
        staffwidth: width || 300,
        responsive: "resize",
        paddingtop: 10,
        paddingbottom: 10,
        paddingleft: 15,
        paddingright: 15,
        add_classes: true,
      });
    });
  }, [notation, width]);

  return (
    <div
      ref={containerRef}
      className="notation-container rounded-xl overflow-hidden flex items-center justify-center"
      style={{ minHeight: 120 }}
    />
  );
}
