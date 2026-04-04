import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Your Video Quiz — Custom Ear Training Challenge",
  description: "Create a custom ear training quiz from real video lessons. Choose topics, set question count, and challenge yourself or friends.",
};

export default function ChallengeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
