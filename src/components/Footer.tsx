import React, { useState } from 'react';
import { PageView } from '../types';
import { useStore } from '../services/store';
import { ArrowUpRight, Check, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FooterProps {
  onNavigate: (page: PageView, productId?: string, categoryFilter?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useStore();
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.9 },
      colors: ['#ffffff', '#8a8a8a', '#333333']
    });
    setTimeout(() => {
      setEmailInput('');
    }, 2000);
  };

   const handleNavClick = (page: PageView) => {
      onNavigate(page);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

  return (
    <footer id="main-footer" className="bg-[#050505] text-[#F2F2F0] border-t border-white/10 pt-16 sm:pt-24 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-neutral-900">
          
          {/* Brand Identity Column (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div className="flex flex-col gap-6">
              <div
                id="footer-brand-header"
                onClick={() => onNavigate('home')}
                className="cursor-pointer inline-flex items-center gap-4 group"
              >
                <img
                  src="/assets/logo.png"
                  alt="MARASSEURAVIE Logo"
                  className="w-12 h-12 object-contain"
                />
                <div className="flex flex-col">
                  <span className="font-display  text-2xl tracking-[0.18em] text-white uppercase group-hover:text-neutral-300 transition-colors">
                    MARASSEURAVIE
                  </span>

                  
                  <span className="text-[10px] tracking-[0.3em] text-neutral-400 font-mono-brand uppercase">
                    SINCE 2025 — ABIDJAN
                  </span>
                </div>
              </div>
              
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-sm tracking-wide">
                Maison de streetwear contemporain. Tricots haute densité, coupes architecturales et silhouettes audacieuses pour marquer votre histoire.
              </p>
            </div>

            {/* VIP Drop Alerts Form */}
            <div className="mt-8">
              <span className="block text-[10px] uppercase font-mono-brand tracking-[0.25em] text-neutral-400 mb-3">
                AVIS DE SORTIE EXCLUSIFS (VIP LIST)
              </span>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <input
                  id="newsletter-email-input"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Votre adresse email"
                  className="bg-[#0D0D0D] border border-neutral-800 text-white text-xs px-3.5 py-3 focus:outline-none focus:border-white w-full tracking-wider font-mono-brand placeholder:text-neutral-600"
                />
                <button
                  id="newsletter-submit-btn"
                  type="submit"
                  className="bg-white text-black px-4 py-3 text-xs font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center shrink-0"
                  aria-label="S'inscrire"
                >
                  {subscribed ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
              {subscribed && (
                <span className="text-[11px] text-emerald-400 font-mono-brand mt-2 inline-block">
                  ✓ Vous êtes inscrit aux alertes Drop VIP.
                </span>
              )}
            </div>
          </div>

          {/* Navigation Links Column (3 cols) */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <span className="text-[10px] uppercase font-mono-brand tracking-[0.25em] text-neutral-500">
              NAVIGATION
            </span>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'BOUTIQUE / SHOP', page: 'shop' as PageView },
                { label: 'COLLECTIONS & CATÉGORIES', page: 'collections' as PageView },
                { label: 'LA MARQUE / ABOUT', page: 'about' as PageView },
                { label: 'LOOKBOOK / CAMPAIGN 01', page: 'campaign' as PageView },
                { label: 'PORTAIL ADMIN', page: 'admin' as PageView },
              ].map(item => (
                <li key={item.page}>
                  <button
                    id={`footer-nav-${item.page}`}
                    onClick={() => {
                      onNavigate(item.page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-medium tracking-[0.15em] text-neutral-400 hover:text-white uppercase transition-colors flex items-center gap-1.5 group"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Socials Column (4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <span className="text-[10px] uppercase font-mono-brand tracking-[0.25em] text-neutral-500">
              COMMANDE & CONTACT
            </span>

            <div className="flex flex-col gap-3 text-xs text-neutral-400 font-mono-brand">
              <div>
                <span className="text-neutral-500 text-[10px] block">COMMANDES WHATSAPP</span>
                <a
                  id="footer-whatsapp-link"
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline text-sm font-bold tracking-wider inline-flex items-center gap-2 mt-0.5"
                >
                  <span>{settings.whatsappFormatted}</span>
                  <span className="text-[10px] bg-white text-black px-1.5 py-0.2 font-sans font-bold">ACTIF</span>
                </a>
              </div>

              <div>
                <span className="text-neutral-500 text-[10px] block">EMAIL OFFICIEL</span>
                <a href={`mailto:${settings.email}`} className="text-neutral-300 hover:text-white">
                  {settings.email}
                </a>
              </div>

              <div>
                <span className="text-neutral-500 text-[10px] block">LOCALISATION</span>
                <span className="text-neutral-300">{settings.location}</span>
              </div>
            </div>

            {/* Social Links Chips */}
            <div className="pt-2 flex flex-wrap gap-2">
              {[
                { name: 'Instagram', url: settings.instagram },
                { name: 'TikTok', url: settings.tiktok },
                { name: 'Facebook', url: settings.facebook },
              ].map(social => (
                <a
                  key={social.name}
                  id={`footer-social-${social.name.toLowerCase()}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono-brand tracking-widest uppercase px-3 py-1.5 border border-neutral-800 text-neutral-400 hover:text-white hover:border-white transition-colors"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Giant Watermark Typography */}
        <div className="py-12 border-b border-neutral-900 flex justify-center items-center overflow-hidden select-none opacity-20 hover:opacity-30 transition-opacity">
          <span className="font-display font-black text-4xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.2em] text-center text-white uppercase whitespace-nowrap">
            MARASSEURAVIE
          </span>
        </div>

        {/* Bottom Legal & Meta */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500 font-mono-brand">
          <div className="flex items-center gap-4">
             <span className="hidden sm:inline">•</span>
              <button
              id="mobile-nav-admin"
              onClick={() => handleNavClick('admin')}
              className="flex items-center justify-between text-left group py-2 border-b border-neutral-900"
            >
            <span>© 2025 MARASSEURAVIE. TOUS DROITS RÉSERVÉS.</span>
           </button>
            <span className="hidden sm:inline">DEPUIS 2025</span>
            
          </div>

          <div className="flex items-center gap-6">
            <span className="text-neutral-400 font-bold">DEVISE : FCFA (XOF)</span>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-neutral-400 hover:text-white uppercase underline"
            >
              RETOUR EN HAUT ↑
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
