import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Ear Training — Intervals, Chords, Scales & Progressions",
  description: "Train your ear with real piano samples. Identify intervals, chords, scales, rhythm patterns, and chord progressions. Free interactive ear training from Nathaniel School of Music.",
};

export default function EarTrainingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
