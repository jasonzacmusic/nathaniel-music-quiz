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
const siteTitle = "Music Quiz — Ear Training, Theory & Notation | Nathaniel School of Music";
const siteDescription =
  "Free music quiz for ear training, music theory, Indian classical, staff notation, and interactive piano exercises. Video-based learning from Nathaniel School of Music.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Nathaniel Music Quiz",
  },
  description: siteDescription,
  keywords: [
    "music quiz", "ear training quiz", "music theory quiz", "free music quiz",
    "interval training", "chord identification", "staff notation quiz",
    "video ear training", "piano ear training", "bass ear training",
    "modes by ear", "chord progressions", "jazz theory quiz",
    "Carnatic music quiz", "Hindustani music quiz", "Indian classical theory",
    "sight reading", "music education", "learn music online",
    "Nathaniel School of Music", "interactive music quiz",
  ],
  authors: [{ name: "Nathaniel School of Music", url: "https://nathanielschool.com" }],
  creator: "Nathaniel School of Music",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Nathaniel School of Music",
    title: siteTitle,
    description: siteDescription,
    images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: siteTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [`${siteUrl}/opengraph-image`],
    creator: "@nathanielschool",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon",
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
        className="font-body antialiased bg-[#0a0a08] text-stone-100 flex flex-col min-h-screen"
      >
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
