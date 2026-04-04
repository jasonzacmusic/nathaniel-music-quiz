import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff Notation Quiz — Read Notes, Chords, Scales & Rhythm",
  description: "Professional staff notation quiz with VexFlow rendering. Practice note reading, intervals, chords, key signatures, scales, modes, and rhythm patterns across beginner to advanced levels.",
};

export default function NotationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
