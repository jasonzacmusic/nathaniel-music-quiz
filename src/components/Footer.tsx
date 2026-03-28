"use client";

import Link from "next/link";
import { LINKS } from "@/config/links";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-dark-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <span className="font-display font-700 text-sm text-white">Nathaniel Quiz</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Interactive ear training from Nathaniel School of Music.
            </p>
          </div>

          {/* Quiz */}
          <div>
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Quiz</h4>
            <div className="space-y-2">
              <Link href="/#categories" className="block text-sm text-slate-500 hover:text-white transition-colors">Categories</Link>
              <Link href="/challenge" className="block text-sm text-slate-500 hover:text-white transition-colors">Challenge</Link>
              <Link href="/contact" className="block text-sm text-slate-500 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Learn</h4>
            <div className="space-y-2">
              <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-500 hover:text-white transition-colors">YouTube</a>
              <a href={LINKS.patreon} target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-500 hover:text-white transition-colors">Patreon</a>
              <a href={LINKS.website} target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-500 hover:text-white transition-colors">Main Website</a>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Connect</h4>
            <div className="space-y-2">
              <a href={`mailto:${LINKS.email}`} className="block text-sm text-slate-500 hover:text-white transition-colors">{LINKS.email}</a>
              <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-500 hover:text-white transition-colors">WhatsApp</a>
              <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-500 hover:text-white transition-colors">Instagram</a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Nathaniel School of Music
          </p>
          <div className="flex items-center gap-4">
            <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href={LINKS.patreon} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
