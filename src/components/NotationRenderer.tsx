"use client";

import dynamic from "next/dynamic";

interface NotationRendererProps {
  notation: string;
  width?: number;
}

// Dynamically import the actual renderer to avoid SSR issues with abcjs
const NotationRendererInner = dynamic(
  () => import("./NotationRendererInner"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl overflow-hidden bg-white flex items-center justify-center" style={{ minHeight: 120 }}>
        <div className="w-6 h-6 border-2 border-stone-300 border-t-amber-500 rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function NotationRenderer(props: NotationRendererProps) {
  return <NotationRendererInner {...props} />;
}
