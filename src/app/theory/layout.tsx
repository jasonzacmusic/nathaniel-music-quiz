import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Music Theory Quiz — Western, Jazz, Carnatic & Hindustani",
  description: "Interactive music theory quizzes covering Western classical harmony, jazz extensions, Carnatic ragas, and Hindustani traditions. Three difficulty levels, learning paths, and progress tracking.",
};

export default function TheoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
