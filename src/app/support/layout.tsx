import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Nathaniel School of Music",
  description: "Help keep music education free. Support Nathaniel School of Music on Patreon and help us create more lessons and quizzes.",
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
