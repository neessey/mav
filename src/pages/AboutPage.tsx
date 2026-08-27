import React from 'react';
import { PageView } from '../types';
import { useStore } from '../services/store';
import { ArrowRight, Sparkles, Shield, Compass, Star } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: PageView, productId?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { settings, campaign } = useStore();

  return (
    <div id="about-page" className="w-full bg-[#050505] text-[#F2F2F0] py-12 sm:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Top Headline */}
        <div className="flex flex-col items-center text-center gap-6 mb-16 sm:mb-24 border-b border-white/10 pb-16">
          <div className="flex items-center gap-2 text-xs font-mono-brand uppercase tracking-[0.4em] text-neutral-400">
            <span>MANIFESTE & IDENTITÉ DE MARQUE</span>
          </div>

          <h1 className="font-display  text-4xl sm:text-7xl md:text-8xl text-white uppercase tracking-tight max-w-5xl leading-[0.95]">
            MARASSEURAVIE
          </h1>

          <span className="font-mono-brand text-sm sm:text-base uppercase tracking-[0.3em] text-neutral-400 font-bold">
            SINCE {settings.foundedYear} — WEAR YOUR STORY.
          </span>
        </div>

        {/* Two-Column Editorial Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24">
          
          {/* Left Column: Brand Emblem & Visual (6 cols) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-8 sm:p-16 bg-[#0D0D0D] border border-white/15 relative">
          

            <img loading="lazy"              src="/assets/logo.png"
              alt="MARASSEURAVIE Logo"
              className="w-64 h-64 object-contain"
            />

            <div className="mt-8 text-center">
              <span className="font-display  text-xl text-white uppercase tracking-widest block">
                MARASSEURAVIE
              </span>
              <span className="text-xs font-mono-brand text-neutral-400 tracking-[0.25em] uppercase">
                 MAV • SYMBOLE DE PUISSANCE
              </span>
            </div>
          </div>

          {/* Right Column: Editorial Text (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <span className="text-[10px] font-mono-brand uppercase tracking-[0.3em] text-neutral-500">
              L'ORIGINE DU PROJET
            </span>

            <h2 className="font-display  text-3xl sm:text-4xl text-white uppercase leading-tight">
              UNE VISION STRICTE DU STREETWEAR CONTEMPORAIN.
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
              Fondée en 2025 à Abidjan, <strong>MARASSEURAVIE</strong> s’est construite autour d’une conviction claire : le streetwear doit retrouver sa force brute, son exigence textile et sa capacité à raconter une identité sans détour.
            </p>

            <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
              Nos tricots inauguraux et nos futures capsules de survêtements sont travaillés avec des grammages exceptionnels, des coupes nettes et une palette résolument monochrome. Pas de compromis, pas d’artifices.
            </p>

            <div className="pt-4 border-t border-neutral-900 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-mono-brand text-white font-bold block">ABIDJAN, CI</span>
                <span className="text-[11px] font-mono-brand text-neutral-500 uppercase">Origine & Conception</span>
              </div>
              <div>
                <span className="text-xs font-mono-brand text-white font-bold block">DEPUIS 2025</span>
                <span className="text-[11px] font-mono-brand text-neutral-500 uppercase">Fondation officielle</span>
              </div>
            </div>
          </div>

        </div>

        {/* Full Bleed Campaign Visual */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-neutral-900 border border-white/15 overflow-hidden mb-24">
          <img loading="lazy"            src={campaign.coverImage}
            alt="MARASSEURAVIE Editorial Campaign"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent flex items-center p-8 sm:p-16">
            <div className="max-w-xl flex flex-col gap-3">
              <span className="text-xs font-mono-brand uppercase tracking-[0.3em] text-white">
                THE VISION
              </span>
              <h3 className="font-display  text-2xl sm:text-4xl text-white uppercase leading-tight">
                « Porter MARASSEURAVIE, c’est assumer sa propre stature. »
              </h3>
            </div>
          </div>
        </div>

        {/* 3 Pillars / Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 bg-[#0D0D0D] border border-white/10 flex flex-col gap-4">
            <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-display  text-lg text-white uppercase tracking-wider">
              MATÉRIAUX LOURDS & DURABLES
            </h4>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Des mailles doubles tricotées au coton haute densité, chaque pièce est testée pour conserver sa tenue architecturale et son éclat monochrome.
            </p>
          </div>

          <div className="p-8 bg-[#0D0D0D] border border-white/10 flex flex-col gap-4">
            <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-display  text-lg text-white uppercase tracking-wider">
              COUPE BOXI & ASYMÉTRIE
            </h4>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Inspirée des silhouettes contemporaines les plus pointues, avec un tombé franc qui impose une présence immédiate.
            </p>
          </div>

          <div className="p-8 bg-[#0D0D0D] border border-white/10 flex flex-col gap-4">
            <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-bold">
              <Star className="w-5 h-5" />
            </div>
            <h4 className="font-display  text-lg text-white uppercase tracking-wider">
              ÉDITIONS LIMITÉES & AUTHENTICITÉ
            </h4>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Production maîtrisée par séries exclusives afin de préserver le caractère rare et précieux de chaque drop.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center flex flex-col items-center gap-6 py-12 border-t border-white/10">
          <h3 className="font-display  text-2xl sm:text-3xl text-white uppercase">
            REJOINDRE LE MOUVEMENT
          </h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('shop')}
              className="bg-white text-black font-display  text-xs uppercase tracking-widest px-8 py-4 hover:bg-neutral-200 transition-colors flex items-center gap-2"
            >
              <span>EXPLORER LA BOUTIQUE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('campaign')}
              className="bg-black border border-white/30 text-white font-bold text-xs uppercase tracking-widest px-8 py-4 hover:bg-neutral-900 transition-colors"
            >
              VOIR LE LOOKBOOK
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};