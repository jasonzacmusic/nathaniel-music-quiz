import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nathaniel Music Quiz — Train Your Ear",
  description:
    "Real ear training quizzes built from YouTube music lessons. Master chords, intervals, rhythm, and more with Nathaniel School of Music.",
  keywords: [
    "music quiz",
    "ear training",
    "music theory",
    "music education",
    "interactive learning",
    "chord recognition",
  ],
  authors: [{ name: "Jason Zachariah", url: "https://nathanielschool.com" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://quiz.nathanielschool.com",
    siteName: "Nathaniel Music Quiz",
    title: "Nathaniel Music Quiz — Train Your Ear",
    description:
      "Real ear training quizzes built from actual YouTube lessons. Hear more. Play better.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${spaceGrotesk.variable} ${inter.variable}`}>
      <body
        className="font-body antialiased bg-[#080D1A] text-slate-100 flex flex-col min-h-screen"
      >
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
