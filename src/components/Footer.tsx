"use client";

import Link from "next/link";
import { Mail, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-gradient-to-b from-dark-bg to-slate border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* About */}
          <div>
            <h3 className="font-display font-700 text-lg text-cream mb-4">
              Nathaniel School
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Music education reimagined. Interactive quizzes to master music
              theory, harmony, and more.
            </p>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display font-700 text-lg text-cream mb-4">
              Support Us
            </h3>
            <div className="space-y-2">
              <Link
                href="https://patreon.com/nathanielschool"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-slate-400 hover:text-electric-violet transition-colors"
              >
                Patreon
              </Link>
              <Link
                href="https://paypal.me/nathanielschool"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-slate-400 hover:text-electric-violet transition-colors"
              >
                PayPal
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-700 text-lg text-cream mb-4">
              Get in Touch
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:music@nathanielschool.com"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-electric-violet transition-colors group"
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                music@nathanielschool.com
              </a>
              <a
                href="https://wa.me/917760456847"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#25D366] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.445 0-2.816-.356-4.113-1.02l-.295-.16-.306.051c-1.019.339-1.938.911-2.727 1.693l-.101.103c-.837.829-1.441 1.902-1.747 3.07l-.016.062c-.312 1.254-.314 2.528.027 3.764l.048.194-.127.155c-.864.95-1.366 2.127-1.561 3.385l-.019.121c-.18 1.146.046 2.31.68 3.255l.097.146.154-.041c1.12-.3 2.149-.866 3.016-1.645l.105-.101c.633.217 1.293.349 1.968.349h.023c3.897 0 7.089-3.167 7.093-7.054.001-1.87-.729-3.632-2.057-4.956-1.332-1.328-3.096-2.06-4.966-2.064" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-xs text-slate-500">
              Copyright {currentYear} Nathaniel School of Music. All rights
              reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-4 sm:mt-0">
              Made with
              <Heart className="w-3 h-3 text-rose fill-current" />
              for music lovers
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
