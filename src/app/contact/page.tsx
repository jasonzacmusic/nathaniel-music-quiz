import { Metadata } from 'next';
import ContactForm from './ContactForm';
import { Mail, Music, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact - Nathaniel School of Music',
  description:
    'Get in touch with Nathaniel School of Music for personalized instruction. Learn music properly with expert guidance.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-slate-900 to-dark-bg">
      {/* Hero Section */}
      <div className="relative pt-20 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-electric-violet rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute bottom-40 right-10 w-72 h-72 bg-deep-purple rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Learn Music Properly
          </h1>
          <p className="text-xl text-center text-slate-300 mb-8">
            Join Nathaniel School of Music for personalized instruction
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Get In Touch</h2>
              <ContactForm />
            </div>
          </div>

          {/* Alternative Contact Methods */}
          <div className="space-y-6">
            {/* WhatsApp */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Music className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="font-bold text-white">WhatsApp</h3>
              </div>
              <p className="text-slate-300 text-sm mb-4">Chat with us on WhatsApp for quick responses</p>
              <a
                href="https://wa.me/917760456847"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
              >
                Message Us
              </a>
            </div>

            {/* Email */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-bold text-white">Email</h3>
              </div>
              <p className="text-slate-300 text-sm mb-4">Reach out to us via email</p>
              <a
                href="mailto:music@nathanielschool.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
              >
                Send Email
              </a>
            </div>

            {/* Website */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur border border-purple-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Music className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-bold text-white">Website</h3>
              </div>
              <p className="text-slate-300 text-sm mb-4">Visit our main website for more info</p>
              <a
                href="https://nathanielschool.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition"
              >
                Visit Website
              </a>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 backdrop-blur border border-amber-500/20 rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-amber-500/20 rounded-lg shrink-0">
              <Heart className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Support Our Work</h3>
              <p className="text-slate-300 mb-6">
                Help us continue creating quality music education content. Your support makes a difference!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://www.patreon.com/nathanielschool"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition text-center"
            >
              Support on Patreon
            </a>
            <a
              href="https://www.paypal.com/donate?hosted_button_id=NATHANIELSCHOOL"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition text-center"
            >
              Donate via PayPal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
