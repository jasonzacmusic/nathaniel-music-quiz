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

const siteUrl = "https://quiz.nathanielschool.com";
const siteTitle = "Nathaniel Music Quiz — Advanced Ear Training";
const siteDescription =
  "Can you identify Mixolydian ♭6 by ear? Count 19/8? Spot a secondary dominant? 330+ questions across chord progressions, modes, odd time signatures, and intervals — pulled from real teaching videos. Free.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Nathaniel Music Quiz",
  },
  description: siteDescription,
  keywords: [
    "ear training", "music theory quiz", "modes by ear", "chord progressions",
    "odd time signatures", "secondary dominants", "jazz extensions", "interval training",
    "Nathaniel School of Music", "music education", "Dorian Mixolydian", "bass piano lessons",
  ],
  authors: [{ name: "Nathaniel School of Music", url: "https://nathanielschool.com" }],
  creator: "Nathaniel School of Music",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Nathaniel Music Quiz",
    title: siteTitle,
    description: "Advanced ear training: modes, chord degrees, odd time signatures, jazz extensions — all from real teaching videos. Free.",
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: siteTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: "Modes, chord degrees, odd meters, jazz extensions — tested by ear. Free.",
    images: [`${siteUrl}/og-image.png`],
    creator: "@nathanielschool",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.ico",
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
