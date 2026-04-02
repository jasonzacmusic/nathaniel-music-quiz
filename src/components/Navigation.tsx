"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { LINKS } from "@/config/links";
import VolumeControl from "@/components/VolumeControl";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide nav entirely on immersive/full-screen pages
  const hiddenRoutes = ["/quiz", "/theory/quiz", "/results"];
  const isHidden = hiddenRoutes.some((r) => pathname.startsWith(r));

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#categories", label: "Topics" },
    { href: "/theory", label: "Theory" },
    { href: "/notation", label: "Notation" },
    { href: "/ear-training", label: "Ear Training" },
    { href: "/challenge", label: "Challenge" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  if (isHidden) return null;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0a0a08]/90 backdrop-blur-2xl border-b border-amber-900/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/nsm-logo.png" alt="NSM" width={28} height={28} className="object-contain" />
              <span className="font-display font-700 text-[15px] text-white">Nathaniel</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${
                      active ? "text-white bg-white/[0.06]" : "text-white/40 hover:text-white/80"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <VolumeControl compact />

              <div className="w-px h-4 bg-white/10 mx-2" />

              <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer"
                className="p-2 text-white/25 hover:text-red-400 transition-colors rounded-lg"
                title="YouTube">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              <Link href="/challenge"
                className="ml-2 px-5 py-2 rounded-full bg-amber-600 text-white text-[13px] font-display font-700 hover:bg-amber-500 transition-colors"
              >
                Start Quiz
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-white/50 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-[#0a0a08]/97 backdrop-blur-2xl" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="relative pt-24 px-6 pb-10"
            >
              <div className="space-y-1 mb-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3.5 text-lg font-display font-600 rounded-xl transition-colors ${
                      isActive(link.href)
                        ? "text-white bg-white/[0.05]"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-white/[0.06] pt-6 space-y-3">
                <VolumeControl />
                <div className="flex gap-3">
                  <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/[0.06] border border-red-500/15 rounded-xl text-red-400 text-sm font-medium"
                    onClick={() => setIsOpen(false)}>
                    YouTube
                  </a>
                  <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-pink-500/[0.06] border border-pink-500/15 rounded-xl text-pink-400 text-sm font-medium"
                    onClick={() => setIsOpen(false)}>
                    Instagram
                  </a>
                </div>
                <Link href="/challenge" onClick={() => setIsOpen(false)}
                  className="block text-center px-4 py-4 rounded-full bg-amber-600 text-white font-display font-700 text-base"
                >
                  Start Quiz Now
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
