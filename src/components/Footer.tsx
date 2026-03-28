"use client";

import Link from "next/link";
import { LINKS } from "@/config/links";

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="footer-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="55%" stopColor="#5b21b6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#footer-logo-grad)" />
      <rect x="5"  y="21" width="4" height="8"  rx="2" fill="white" opacity="0.65" />
      <rect x="11" y="15" width="4" height="14" rx="2" fill="white" opacity="0.82" />
      <rect x="17" y="10" width="4" height="19" rx="2" fill="white" />
      <rect x="23" y="14" width="4" height="15" rx="2" fill="white" opacity="0.82" />
      <rect x="29" y="20" width="4" height="9"  rx="2" fill="white" opacity="0.65" />
    </svg>
  );
}

function ShareButton() {
  const handleShare = async () => {
    const shareData = {
      title: "Nathaniel Music Quiz — Train Your Ear",
      text: "Test your music ear training with real clips from Nathaniel School of Music. It's free!",
      url: "https://quiz.nathanielschool.com",
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      } catch {
        // ignore
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all text-xs font-medium"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      Share This Quiz
    </button>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#080D1A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group w-fit">
              <LogoMark />
              <div className="flex flex-col leading-none">
                <span className="font-display font-700 text-sm text-white">Nathaniel</span>
                <span
                  className="font-display font-600 text-[10px] tracking-[0.16em] uppercase"
                  style={{
                    background: "linear-gradient(90deg, #a78bfa, #06B6D4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Music Quiz
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Advanced ear training — modes, chord degrees,<br />odd meters. Built by Nathaniel School of Music.
            </p>
            <ShareButton />
          </div>

          {/* Quiz */}
          <div>
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Quiz</h4>
            <div className="space-y-2.5">
              <Link href="/#categories" className="block text-sm text-slate-500 hover:text-white transition-colors">Browse Topics</Link>
              <Link href="/challenge" className="block text-sm text-slate-500 hover:text-white transition-colors">Build a Challenge</Link>
              <Link href="/contact" className="block text-sm text-slate-500 hover:text-white transition-colors">Contact Us</Link>
            </div>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Learn</h4>
            <div className="space-y-2.5">
              <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-500 hover:text-red-400 transition-colors">YouTube Lessons</a>
              <a href={LINKS.patreon} target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-500 hover:text-orange-400 transition-colors">Patreon Members</a>
              <a href={LINKS.website} target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-500 hover:text-white transition-colors">Main Website</a>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Connect</h4>
            <div className="space-y-2.5">
              <a href={`mailto:${LINKS.email}`} className="block text-sm text-slate-500 hover:text-white transition-colors truncate">{LINKS.email}</a>
              <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-500 hover:text-green-400 transition-colors">WhatsApp</a>
              <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-500 hover:text-pink-400 transition-colors">Instagram</a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Nathaniel School of Music. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {/* YouTube */}
            <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-white/[0.04] transition-all"
              title="YouTube">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            {/* Instagram */}
            <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-pink-400 hover:bg-white/[0.04] transition-all"
              title="Instagram">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            {/* WhatsApp */}
            <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-green-400 hover:bg-white/[0.04] transition-all"
              title="WhatsApp">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            {/* Patreon */}
            <a href={LINKS.patreon} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-orange-400 hover:bg-white/[0.04] transition-all"
              title="Patreon">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
