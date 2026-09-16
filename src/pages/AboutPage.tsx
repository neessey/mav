import React from 'react';
import { PageView } from '../types';
import { useStore } from '../services/store';
import { ArrowUpRight, Shield, Compass, Star, MapPin, Calendar } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: PageView, productId?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { settings, campaign } = useStore();

  return (
    <div
      id="about-page"
      className="w-full bg-[#050505] text-[#F2F2F0] overflow-hidden"
    >
    

      {/* ============ LOGO + ORIGINE ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          
          {/* Texte origine */}
          <div className="flex flex-col gap-8">
            <div>
              <span className="text-[10px] font-mono-brand uppercase tracking-[0.4em] text-neutral-500">
                L'origine
              </span>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl uppercase leading-[0.95] tracking-tight text-white">
                Une vision stricte du streetwear.
              </h2>
            </div>

            <div className="flex flex-col gap-5 text-neutral-400 text-sm sm:text-base leading-relaxed">
              <p>
                Fondée en 2025 à Abidjan, <strong className="text-white">MARASSEURAVIE</strong> s'est construite autour d'une conviction : le streetwear doit retrouver sa force brute, son exigence textile et sa capacité à raconter une identité sans détour.
              </p>
              <p>
                Nos tricots inauguraux et nos futures capsules sont travaillés avec des grammages exceptionnels, des coupes nettes et une palette résolument monochrome. Pas de compromis, pas d'artifices.
              </p>
            </div>

            {/* Stats inline */}
            <div className="flex flex-wrap gap-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-neutral-500" />
                <div>
                  <div className="font-mono-brand text-xs font-bold uppercase tracking-widest text-white">
                    Abidjan, CI
                  </div>
                  <div className="text-[10px] font-mono-brand uppercase tracking-widest text-neutral-500">
                    Origine
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-neutral-500" />
                <div>
                  <div className="font-mono-brand text-xs font-bold uppercase tracking-widest text-white">
                    Depuis {settings.foundedYear}
                  </div>
                  <div className="text-[10px] font-mono-brand uppercase tracking-widest text-neutral-500">
                    Fondation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CITATION / VISION ============ */}
      <section className="bg-[#0D0D0D] border-y border-white/10 py-20 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[10px] font-mono-brand uppercase tracking-[0.4em] text-neutral-500">
            The Vision
          </span>
          <blockquote className="mt-8 font-display text-3xl sm:text-5xl md:text-6xl uppercase leading-[1.05] tracking-tight text-white">
            « Porter <span className=" font-light text-neutral-400">MARASSEURAVIE</span>, c'est assumer sa propre stature. »
          </blockquote>
          <div className="mt-10 flex items-center justify-center gap-3 text-[10px] font-mono-brand uppercase tracking-[0.3em] text-neutral-500">
            <span className="w-8 h-px bg-white/20" />
            MAV Studio
            <span className="w-8 h-px bg-white/20" />
          </div>
        </div>
      </section>

      {/* ============ CAMPAGNE PLEIN ÉCRAN ============ */}
      <section className="relative">
        <div className="relative aspect-[4/5] sm:aspect-[21/9] rounded-2xl overflow-hidden mx-4 sm:mx-6 lg:mx-8 my-16 sm:my-24 border border-white/10">
          <img
            loading="lazy"
            src="/assets/cta.png"
            alt="Campagne MARASSEURAVIE"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-md">
              <span className="text-[10px] font-mono-brand uppercase tracking-[0.4em] text-white/70">
                Campagne — SS25
              </span>
              <h3 className="mt-3 font-display text-2xl sm:text-4xl text-white uppercase leading-tight">
                Le lookbook officiel
              </h3>
            </div>
            <button
              onClick={() => onNavigate('campaign')}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white text-black text-xs font-mono-brand uppercase tracking-widest hover:bg-neutral-200 transition-colors"
            >
              Découvrir
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============ 3 PILIERS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <span className="text-[10px] font-mono-brand uppercase tracking-[0.4em] text-neutral-500">
              Nos piliers
            </span>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl uppercase leading-[0.95] tracking-tight max-w-xl text-white">
              Trois règles non négociables.
            </h2>
          </div>
          <span className="font-mono-brand text-xs uppercase tracking-widest text-neutral-500">
            / 03 principes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              num: '01',
              title: 'Matériaux lourds',
              desc: 'Mailles doubles tricotées au coton haute densité. Chaque pièce conserve sa tenue architecturale et son éclat monochrome.',
            },
            {
              icon: Compass,
              num: '02',
              title: 'Coupe boxy',
              desc: 'Silhouettes contemporaines, tombé franc, asymétrie maîtrisée. Une présence immédiate, sans effort.',
            },
            {
              icon: Star,
              num: '03',
              title: 'Éditions limitées',
              desc: 'Production en séries exclusives pour préserver le caractère rare et précieux de chaque drop.',
            },
          ].map((pillar) => (
            <div
              key={pillar.num}
              className="group relative p-8 rounded-2xl bg-[#0D0D0D] border border-white/10 flex flex-col gap-6 hover:bg-white hover:text-black transition-colors duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300">
                  <pillar.icon className="w-5 h-5" />
                </div>
                <span className="font-mono-brand text-xs tracking-widest text-neutral-500 group-hover:text-black/50 transition-colors duration-300">
                  {pillar.num}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="font-display text-xl uppercase tracking-wide text-white group-hover:text-black transition-colors duration-300">
                  {pillar.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-400 group-hover:text-black/70 transition-colors duration-300">
                  {pillar.desc}
                </p>
              </div>

              <ArrowUpRight className="w-5 h-5 mt-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="rounded-2xl bg-[#0D0D0D] border border-white/10 p-10 sm:p-16 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
          <div className="max-w-2xl">
            <span className="text-[10px] font-mono-brand uppercase tracking-[0.4em] text-neutral-500">
              Rejoindre
            </span>
            <h2 className="mt-4 font-display text-4xl sm:text-6xl uppercase leading-[0.95] tracking-tight text-white">
              Fais partie du <span className=" font-light text-neutral-400">mouvement</span>.
            </h2>
            <p className="mt-6 text-sm sm:text-base text-neutral-400 max-w-lg leading-relaxed">
              Pièces en édition limitée, drops confidentiels, esthétique sans compromis. Porte ton histoire.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={() => onNavigate('shop')}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white text-black text-xs font-mono-brand uppercase tracking-widest hover:bg-neutral-200 transition-colors"
            >
              Boutique
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('campaign')}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border border-white/30 text-white text-xs font-mono-brand uppercase tracking-widest hover:bg-white/5 transition-colors"
            >
              Lookbook
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};