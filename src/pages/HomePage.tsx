
import React from 'react';
import { PageView } from '../types';
import { useStore } from '../services/store';
import { ProductCard } from '../components/ProductCard';
import {
  ArrowDown,
  ArrowRight,
  Truck,
  ShieldCheck,
  Headphones,
  MoveUpRight,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (
    page: PageView,
    productId?: string,
    categoryFilter?: string
  ) => void;
  onSelectProduct: (productId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectProduct,
}) => {
  const { products, settings, campaign } = useStore();

  const newDropProducts = products.slice(0, 4);

  return (
    <main
      id="home-page-container"
      className="w-full overflow-hidden bg-black text-white selection:bg-white selection:text-black"
    >
      {/* =========================================================
          HERO
      ========================================================= */}
      <section
        id="hero-section"
        className="relative min-h-[100svh] w-full overflow-hidden bg-black"
      >
        {/* Background image */}
        <div className="absolute inset-0 lg:left-[27%]">
          <img
            src={settings.heroImage}
            alt="MARASSEURAVIE"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center scale-[1.02]"
          />
        </div>

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent lg:via-black/45" />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

        {/* Top editorial line */}
        <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
          <span className="font-mono-brand right-5 text-[10px] uppercase tracking-[0.3em] text-white/60">
            MARASSEURAVIE®
          </span>

        </div>

       

        {/* Hero content */}
        <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-10 pt-28 sm:px-8 sm:pb-14 lg:w-[58%] lg:px-16 lg:pb-20">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="mb-6 flex items-center gap-4">

              <span className="font-mono-brand text-[10px] uppercase tracking-[0.3em] text-white/70">
                NEW COLLECTION
              </span>
            </div>

            {/* Main title */}
            <h1 className="font-display text-[clamp(3.8rem,10vw,9rem)] uppercase leading-[0.78] tracking-[-0.055em] text-white">
              MARASSEURAVIE
            </h1>

            <div className="mt-7 flex max-w-xl flex-col gap-5 sm:mt-9">
              <p className="max-w-md text-sm leading-relaxed text-white/65 sm:text-base">
                Plus qu'une manière de s'habiller.
                <br />
                Une manière d'avancer.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="hero-discover-btn"
                  onClick={() => onNavigate('shop')}
                  className="group inline-flex items-center gap-4 border border-white bg-white px-6 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-black transition-all duration-300 hover:bg-transparent hover:text-white sm:px-7"
                >
                  <span>Découvrir la collection</span>

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>

               
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTRO
      ========================================================= */}
      <section className="relative border-b border-white/10 bg-black px-5 py-20 sm:px-8 sm:py-28 lg:px-16 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-3">
              <span className="font-mono-brand text-[10px] uppercase tracking-[0.3em] text-white/35">
                 THE BRAND
              </span>
            </div>

            <div className="lg:col-span-8 lg:col-start-5">
              <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                NOUS NE CRÉONS
                <br />
                <span className="text-white/35">PAS DES VÊTEMENTS.</span>
                <br />
                NOUS CRÉONS
                <br />
                UNE ATTITUDE.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          NEW DROP
      ========================================================= */}
      <section
        id="new-drop-section"
        className="bg-black px-5 py-20 sm:px-8 sm:py-28 lg:px-16 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-10 flex items-end justify-between border-b border-white/10 pb-5 sm:mb-14">
            <div>
              <span className="mb-3 block font-mono-brand text-[10px] uppercase tracking-[0.3em] text-white/35">
                 DERNIÈRE SÉLECTION
              </span>

              <h2 className="font-display text-4xl uppercase leading-none tracking-[-0.03em] sm:text-6xl">
                NEW DROP
              </h2>
            </div>

            <button
              id="new-drop-view-all-btn"
              onClick={() => onNavigate('shop')}
              className="group mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white"
            >
              Voir tout
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Products */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-14 lg:grid-cols-4 lg:gap-x-6">
            {newDropProducts.map((product, index) => (
              <div key={product.id} className="group relative">
                

                <ProductCard
                  product={product}
                  onSelectProduct={onSelectProduct}
                  layoutVariant="editorial"
                  idPrefix="home-drop"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          EDITORIAL CAMPAIGN
      ========================================================= */}
      <section
        id="brand-editorial-story"
        className="relative border-y border-white/10 bg-black"
      >
        <div className="grid min-h-[700px] lg:grid-cols-2">
          {/* Image */}
          <div className="relative min-h-[500px] overflow-hidden lg:min-h-[700px]">
            <img
              src={campaign.coverImage}
              alt="MARASSEURAVIE Campaign"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center transition-transform duration-[1.5s] hover:scale-[1.03]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
              <span className="font-mono-brand text-[9px] uppercase tracking-[0.3em] text-white/60">
                CAMPAIGN / 001
              </span>
            </div>
          </div>

          {/* Story */}
          <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16 xl:p-20">
            <div>
              <span className="font-mono-brand text-[10px] uppercase tracking-[0.3em] text-white/35">
                OUR STORY
              </span>
            </div>

            <div className="my-16 max-w-xl lg:my-0">
              <h2 className="font-display text-5xl uppercase leading-[0.88] tracking-[-0.04em] sm:text-7xl">
                MARASSEURAVIE
              </h2>

              <p className="mt-8 max-w-md text-sm leading-7 text-white/55 sm:text-base">
                Plus qu'une marque, un mouvement.
                <br />
                <br />
                Des pièces pensées pour celles et ceux qui avancent avec
                vision, discipline et style. Chaque création porte une
                histoire, une énergie et une intention.
              </p>

              <button
                id="story-discover-btn"
                onClick={() => onNavigate('about')}
                className="group mt-9 inline-flex items-center gap-4 border-b border-white/50 pb-3 text-[10px] font-bold uppercase tracking-[0.22em] transition-colors hover:border-white"
              >
                Découvrir notre histoire

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            <div className="flex justify-between border-t border-white/10 pt-5">
              <span className="font-mono-brand text-[9px] uppercase tracking-widest text-white/30">
                EST. 2025
              </span>

              <span className="font-mono-brand text-[9px] uppercase tracking-widest text-white/30">
                ABIDJAN / CI
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VALUES
      ========================================================= */}
      <section
        id="trust-features-bar"
        className="border-b border-white/10 bg-black px-5 py-16 sm:px-8 lg:px-16 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="mb-3 block font-mono-brand text-[10px] uppercase tracking-[0.3em] text-white/30">
                SERVICE
              </span>

              <h2 className="font-display text-3xl uppercase tracking-tight sm:text-4xl">
                PENSÉ POUR VOUS
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-white/10 border-y border-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {/* Item */}
            <div className="group flex gap-4 py-7 sm:px-6 lg:px-7 lg:first:pl-0">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-white/70" />

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.15em]">
                  Livraison
                </span>

                <span className="mt-2 block text-xs leading-relaxed text-white/40">
                  Partout en Côte d'Ivoire
                </span>
              </div>
            </div>

            <div className="group flex gap-4 py-7 sm:px-6 lg:px-7">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-white/70" />

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.15em]">
                  Paiement sécurisé
                </span>

                <span className="mt-2 block text-xs leading-relaxed text-white/40">
                  Transactions protégées
                </span>
              </div>
            </div>

            <div className="group flex gap-4 py-7 sm:px-6 lg:px-7">
              <Headphones className="mt-0.5 h-5 w-5 shrink-0 text-white/70" />

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.15em]">
                  Assistance
                </span>

                <span className="mt-2 block text-xs leading-relaxed text-white/40">
                  Une équipe à votre écoute
                </span>
              </div>
            </div>

            <div className="group flex gap-4 py-7 sm:px-6 lg:px-7 lg:pr-0">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center border border-white/50 text-[8px]">
                M
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.15em]">
                  Qualité
                </span>

                <span className="mt-2 block text-xs leading-relaxed text-white/40">
                  Des pièces pensées pour durer
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-white px-5 py-24 text-black sm:px-8">
        <div className="relative z-10 text-center">
          <span className="font-mono-brand text-[10px] uppercase tracking-[0.35em] text-black/40">
            YOUR STORY STARTS HERE
          </span>

          <h2 className="mt-7 font-display text-[clamp(4rem,10vw,9rem)] uppercase leading-[0.78] tracking-[-0.06em]">
            MARASSEURAVIE
          </h2>

          <button
            onClick={() => onNavigate('shop')}
            className="group mt-10 inline-flex items-center gap-4 border border-black bg-black px-7 py-4 text-[10px] font-bold uppercase tracking-[0.22em] text-white transition-all duration-300 hover:bg-transparent hover:text-black"
          >
            Explorer la boutique

            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Decorative typography */}
        <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-[20vw] uppercase leading-none tracking-[-0.08em] text-black/[0.035]">
          MARASSEURAVIE
        </div>
      </section>
    </main>
  );
};
