import React, { useEffect, useState } from 'react';
import { PageView } from '../types';
import { useStore } from '../services/store';
import {
  Sparkles,
  Maximize2,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CampaignPageProps {
  onNavigate: (page: PageView, productId?: string) => void;
}

export const CampaignPage: React.FC<CampaignPageProps> = ({
  onNavigate,
}) => {
  const { campaign } = useStore();

  const [activeLightboxIndex, setActiveLightboxIndex] =
    useState<number | null>(null);

  const shots = campaign?.shots ?? [];

  const activeShot =
    activeLightboxIndex !== null
      ? shots[activeLightboxIndex]
      : null;

  /*
   * Fermer le lightbox avec Escape
   */
  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveLightboxIndex(null);
      }

      if (event.key === 'ArrowLeft') {
        setActiveLightboxIndex((current) => {
          if (current === null || shots.length === 0) {
            return current;
          }

          return (
            (current - 1 + shots.length) %
            shots.length
          );
        });
      }

      if (event.key === 'ArrowRight') {
        setActiveLightboxIndex((current) => {
          if (current === null || shots.length === 0) {
            return current;
          }

          return (current + 1) % shots.length;
        });
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );

      document.body.style.overflow = '';
    };
  }, [activeLightboxIndex, shots.length]);

  const openLightbox = (index: number) => {
    setActiveLightboxIndex(index);
  };

  const closeLightbox = () => {
    setActiveLightboxIndex(null);
  };

  const previousShot = () => {
    setActiveLightboxIndex((current) => {
      if (current === null || shots.length === 0) {
        return current;
      }

      return (
        (current - 1 + shots.length) %
        shots.length
      );
    });
  };

  const nextShot = () => {
    setActiveLightboxIndex((current) => {
      if (current === null || shots.length === 0) {
        return current;
      }

      return (current + 1) % shots.length;
    });
  };

  return (
    <div
      id="campaign-page"
      className="min-h-screen w-full bg-[#050505] text-[#F2F2F0]"
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-6 sm:py-20 lg:px-10 xl:px-16">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-16 border-b border-white/10 pb-10 sm:mb-24 sm:pb-14">

          <div className="mb-7 flex items-center gap-2">

            <span className="font-mono-brand text-[9px] uppercase tracking-[0.35em] text-neutral-500 sm:text-[10px] sm:tracking-[0.45em]">
              LOOKBOOK OFFICIEL • SAISON 01
            </span>
          </div>

          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">

            <div className="max-w-4xl">

              <h1 className="font-display text-5xl uppercase leading-[0.85] tracking-[-0.04em] text-white sm:text-7xl md:text-8xl xl:text-9xl">
                {campaign?.title || 'CAMPAIGN'}
              </h1>

              {campaign?.subtitle && (
                <p className="mt-5 font-mono-brand text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 sm:text-xs">
                  {campaign.subtitle}
                </p>
              )}

            </div>

            {campaign?.statement && (
              <p className="max-w-lg text-xs leading-7 text-neutral-400 sm:text-sm">
                {campaign.statement}
              </p>
            )}

          </div>
        </header>

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

        {shots.length === 0 && (
          <div className="flex min-h-[50vh] items-center justify-center border border-white/10">
            <div className="text-center">


              <p className="font-mono-brand text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                LOOKBOOK EN PRÉPARATION
              </p>

              <p className="mt-3 text-xs text-neutral-700">
                Les images de la campagne seront bientôt disponibles.
              </p>

            </div>
          </div>
        )}

        {shots.length > 0 && (
          <div className="space-y-16 sm:space-y-28">

            {/* =================================================
                HERO SHOT
            ================================================== */}

            {shots[0]?.url && (
              <CampaignShot
                shot={shots[0]}
                index={0}
                aspect="wide"
                onOpen={openLightbox}
              />
            )}

            {/* =================================================
                ASYMMETRIC SPREAD
            ================================================== */}

            <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">

              {shots[1]?.url && (
                <div className="md:col-span-5">
                  <CampaignShot
                    shot={shots[1]}
                    index={1}
                    aspect="portrait"
                    onOpen={openLightbox}
                  />
                </div>
              )}

              {shots[2]?.url && (
                <div className="md:col-span-7 md:mt-24">
                  <CampaignShot
                    shot={shots[2]}
                    index={2}
                    aspect="portraitLarge"
                    onOpen={openLightbox}
                  />
                </div>
              )}

            </div>

            {/* =================================================
                CINEMATIC SHOT
            ================================================== */}

            {shots[3]?.url && (
              <CampaignShot
                shot={shots[3]}
                index={3}
                aspect="wide"
                onOpen={openLightbox}
              />
            )}

            {/* =================================================
                REMAINING SHOTS
            ================================================== */}

            {shots.length > 4 && (
              <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:gap-x-12 lg:gap-y-24">

                {shots.slice(4).map((shot, index) => {
                  const realIndex = index + 4;

                  if (!shot?.url) return null;

                  return (
                    <CampaignShot
                      key={shot.id || realIndex}
                      shot={shot}
                      index={realIndex}
                      aspect="portrait"
                      onOpen={openLightbox}
                    />
                  );
                })}

              </div>
            )}

          </div>
        )}

        {/* =====================================================
            CTA
        ====================================================== */}

        <div className="mt-20 flex flex-col items-center border-t border-white/10 pt-12 text-center sm:mt-32 sm:pt-16">

          <span className="font-mono-brand text-[9px] uppercase tracking-[0.3em] text-neutral-500 sm:text-[10px]">
            LES PIÈCES DU LOOKBOOK SONT DISPONIBLES EN QUANTITÉ LIMITÉE
          </span>

          <button
            onClick={() => onNavigate('shop')}
            className="group mt-7 inline-flex items-center gap-3 bg-white px-7 py-4 font-display text-[10px] uppercase tracking-[0.18em] text-black transition-all duration-300 hover:bg-neutral-200 sm:px-8 sm:py-4"
          >
            <span>
              COMMANDER LES PIÈCES DU LOOKBOOK
            </span>

            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

        </div>
      </div>

      {/* =======================================================
          LIGHTBOX
      ======================================================== */}

      {activeShot && (
        <div
          id="lookbook-lightbox-modal"
          className="fixed inset-0 z-[100] flex flex-col bg-black/98"
          onClick={closeLightbox}
        >

          {/* TOP BAR */}

          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-8">

            <div className="flex items-center gap-4">

              <span className="font-mono-brand text-[9px] uppercase tracking-[0.2em] text-white">
                {activeShot.title ||
                  'MARASSEURAVIE CAMPAIGN 01'}
              </span>

              {activeLightboxIndex !== null && (
                <span className="font-mono-brand text-[9px] text-neutral-600">
                  {String(
                    activeLightboxIndex + 1
                  ).padStart(2, '0')}{' '}
                  /{' '}
                  {String(shots.length).padStart(
                    2,
                    '0'
                  )}
                </span>
              )}

            </div>

            <button
              onClick={closeLightbox}
              className="flex h-10 w-10 items-center justify-center border border-white/10 text-white transition-colors hover:border-white"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          {/* IMAGE */}

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-6 sm:px-16 sm:py-8"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <img
              src={activeShot.url}
              alt={
                activeShot.title ||
                'MARASSEURAVIE campaign'
              }
              className="max-h-full max-w-full object-contain"
            />

            {/* PREVIOUS */}

            {shots.length > 1 && (
              <button
                onClick={previousShot}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/10 bg-black/60 text-white transition-all hover:border-white sm:left-6"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* NEXT */}

            {shots.length > 1 && (
              <button
                onClick={nextShot}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/10 bg-black/60 text-white transition-all hover:border-white sm:right-6"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

          </div>

          {/* BOTTOM */}

          <div className="flex items-center justify-between gap-5 border-t border-white/10 px-4 py-4 sm:px-8">

            <div className="min-w-0">

              {activeShot.caption && (
                <p className="truncate text-[10px] text-neutral-400">
                  {activeShot.caption}
                </p>
              )}

            </div>

            {activeShot.location && (
              <span className="shrink-0 font-mono-brand text-[9px] uppercase tracking-wider text-white">
                {activeShot.location}
              </span>
            )}

          </div>

        </div>
      )}
    </div>
  );
};

/* ============================================================
   CAMPAIGN SHOT COMPONENT
============================================================ */

interface CampaignShotProps {
  shot: any;
  index: number;
  aspect:
    | 'wide'
    | 'portrait'
    | 'portraitLarge';
  onOpen: (index: number) => void;
}

const CampaignShot: React.FC<
  CampaignShotProps
> = ({
  shot,
  index,
  aspect,
  onOpen,
}) => {
  const aspectClass =
    aspect === 'wide'
      ? 'aspect-[16/9] sm:aspect-[21/9]'
      : aspect === 'portraitLarge'
        ? 'aspect-[4/5]'
        : 'aspect-[3/4]';

  return (
    <figure className="group">

      <button
        type="button"
        onClick={() => onOpen(index)}
        className={`relative block w-full cursor-pointer overflow-hidden border border-white/10 bg-neutral-900 text-left ${aspectClass}`}
      >

        <img
          src={shot.url}
          alt={
            shot.title ||
            `MARASSEURAVIE Lookbook ${index + 1}`
          }
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />

        {/* Hover overlay */}

        <div className="absolute inset-0 bg-black/20 opacity-100 transition-all duration-500 group-hover:bg-black/5" />

        {/* Fullscreen icon */}

        <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-white/20 bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
          <Maximize2 className="h-3.5 w-3.5" />
        </div>

        {/* Index */}

        <div className="absolute bottom-4 left-4 font-mono-brand text-[9px] tracking-widest text-white/70">
          {String(index + 1).padStart(2, '0')}
        </div>

      </button>

      {/* Caption */}

      <figcaption className="mt-3 flex flex-col gap-1 px-1 sm:flex-row sm:items-baseline sm:justify-between">

        <div className="flex min-w-0 items-center gap-2">

          {shot.title && (
            <span className="truncate font-mono-brand text-[10px] font-bold uppercase tracking-wider text-white">
              {shot.title}
            </span>
          )}

          {shot.caption && (
            <>
              <span className="text-neutral-700">
                •
              </span>

              <span className="truncate text-[10px] text-neutral-500">
                {shot.caption}
              </span>
            </>
          )}

        </div>

        {shot.location && (
          <span className="shrink-0 font-mono-brand text-[9px] uppercase tracking-wider text-neutral-600">
            {shot.location}
          </span>
        )}

      </figcaption>

    </figure>
  );
};