"use client";

import Link from "next/link";
import { LINKS } from "@/config/links";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Big CTA band */}
      <div className="relative bg-gradient-to-b from-[#080D1A] via-violet-950/20 to-[#0c0416]">
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #7C3AED22 0%, transparent 50%), radial-gradient(circle at 80% 50%, #06B6D422 0%, transparent 50%)" }}
        />
        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-28 text-center relative">
          <p className="text-violet-400/70 text-xs font-mono uppercase tracking-[0.3em] mb-6">
            Free forever. No sign-up. No ads.
          </p>
          <h2 className="font-display font-700 text-3xl sm:text-5xl md:text-6xl text-white leading-[1.1] mb-8">
            Ready to find out what<br className="hidden sm:block" />
            <span className="text-violet-400">your ears</span> actually know?
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/challenge"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-[#080D1A] font-display font-700 text-base hover:bg-violet-100 transition-colors"
            >
              <svg className="w-5 h-5 text-violet-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Start a Quiz
            </Link>
            <a
              href={LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/15 text-white/80 font-display font-600 text-base hover:border-white/30 hover:text-white transition-all"
            >
              Watch on YouTube
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Footer body */}
      <div className="bg-[#060a14] border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-8">

          {/* Top row: logo + socials */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="1" y="11" width="3" height="6" rx="1.5" fill="white" opacity="0.6" />
                  <rect x="5.5" y="7" width="3" height="10" rx="1.5" fill="white" opacity="0.8" />
                  <rect x="10" y="4" width="3" height="13" rx="1.5" fill="white" />
                  <rect x="14.5" y="6" width="3" height="11" rx="1.5" fill="white" opacity="0.8" />
                </svg>
              </div>
              <div>
                <span className="font-display font-700 text-white text-base">Nathaniel</span>
                <span className="font-display font-700 text-violet-400 text-base ml-1">Music Quiz</span>
              </div>
            </Link>

            {/* Social row */}
            <div className="flex items-center gap-1">
              {[
                { href: LINKS.youtube, label: "YouTube", color: "hover:bg-red-500/15 hover:text-red-400", icon: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/> },
                { href: LINKS.instagram, label: "Instagram", color: "hover:bg-pink-500/15 hover:text-pink-400", icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/> },
                { href: LINKS.whatsapp, label: "WhatsApp", color: "hover:bg-green-500/15 hover:text-green-400", icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/> },
                { href: LINKS.patreon, label: "Patreon", color: "hover:bg-orange-500/15 hover:text-orange-400", icon: <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003"/> },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-white/30 transition-all duration-200 ${s.color}`}
                  title={s.label}
                >
                  <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">{s.icon}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns — horizontal on desktop, stacked on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-6 mb-12">
            {[
              {
                title: "Quiz",
                links: [
                  { label: "Browse Topics", href: "/#categories" },
                  { label: "Custom Challenge", href: "/challenge" },
                  { label: "Contact", href: "/contact" },
                ],
              },
              {
                title: "Learn",
                links: [
                  { label: "YouTube Lessons", href: LINKS.youtube, ext: true },
                  { label: "Patreon", href: LINKS.patreon, ext: true },
                  { label: "Main Website", href: LINKS.website, ext: true },
                ],
              },
              {
                title: "Connect",
                links: [
                  { label: LINKS.email, href: `mailto:${LINKS.email}` },
                  { label: "WhatsApp", href: LINKS.whatsapp, ext: true },
                  { label: "Instagram", href: LINKS.instagram, ext: true },
                ],
              },
              {
                title: "Support",
                links: [
                  { label: "Patreon Membership", href: LINKS.patreon, ext: true },
                  { label: "PayPal Tip", href: LINKS.paypal, ext: true },
                  { label: "Share with a friend", href: "/#categories" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/25 mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => {
                    const Comp = link.href.startsWith("/") || link.href.startsWith("#") ? Link : "a";
                    const extProps = (link as { ext?: boolean }).ext ? { target: "_blank", rel: "noopener noreferrer" } : {};
                    return (
                      <li key={link.label}>
                        <Comp
                          href={link.href}
                          className="text-sm text-white/40 hover:text-white transition-colors duration-200"
                          {...extProps}
                        >
                          {link.label}
                        </Comp>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-white/20 font-mono">
              {new Date().getFullYear()} Nathaniel School of Music
            </p>
            <p className="text-[11px] text-white/20 font-mono">
              Built with care. Ear training from real lessons.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
