import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Nathaniel Music Quiz",
  description:
    "Test your music theory knowledge with interactive quizzes from Nathaniel School of Music. Master music concepts through engaging, video-based learning.",
  keywords: [
    "music quiz",
    "music theory",
    "music education",
    "interactive learning",
  ],
  authors: [{ name: "Jason Zachariah", url: "https://nathanielschool.com" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nathanielschool.com",
    siteName: "Nathaniel Music Quiz",
    title: "Nathaniel Music Quiz",
    description:
      "Test your music theory knowledge with interactive quizzes from Nathaniel School of Music.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-body antialiased bg-dark-bg text-slate-100 flex flex-col min-h-screen"
      >
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
