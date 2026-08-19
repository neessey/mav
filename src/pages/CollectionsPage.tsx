import React from 'react';
import { PageView } from '../types';
import { useStore } from '../services/store';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CollectionsPageProps {
  onNavigate: (page: PageView, productId?: string, categoryFilter?: string) => void;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({ onNavigate }) => {
  const { collections, products, settings } = useStore();

  return (
    <div id="collections-page" className="w-full bg-[#050505] text-[#F2F2F0] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 mb-16 border-b border-white/10 pb-8">
          <div className="flex items-center gap-2 text-[10px] font-mono-brand uppercase tracking-[0.3em] text-neutral-400">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>ARCHIVES & CATÉGORIES OFFICIELLES</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h1 className="font-display  text-4xl sm:text-6xl text-white uppercase tracking-tight">
              COLLECTIONS
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md font-sans">
              Explorez le vestiaire MARASSEURAVIE par typologie de pièces. Des mailles lourdes inaugurales aux capsules techniques en développement.
            </p>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {collections.map((collection, index) => {
            const count = products.filter(p => p.category === collection.slug).length;
            const isComingSoon = collection.status === 'coming_soon';

            return (
              <div
                key={collection.id}
                id={`col-block-${collection.id}`}
                onClick={() => onNavigate('shop', undefined, collection.slug)}
                className="group cursor-pointer flex flex-col bg-[#0D0D0D] border border-white/10 hover:border-white/40 transition-all duration-300"
              >
                {/* Large Editorial Card Image */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-black overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter brightness-85 group-hover:scale-105 group-hover:brightness-100 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Top Status */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="text-[10px] font-mono-brand font-bold uppercase tracking-widest px-3 py-1 bg-black/80 backdrop-blur-sm text-white border border-white/20">
                      {collection.season}
                    </span>
                    {isComingSoon && (
                      <span className="text-[10px] font-mono-brand font-bold uppercase tracking-widest px-3 py-1 bg-white text-black">
                        COMING SOON
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 right-4 text-xs font-mono-brand text-neutral-300 bg-black/60 px-2.5 py-1">
                    {count} {count > 1 ? 'PIÈCES' : 'PIÈCE'}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 sm:p-8 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-mono-brand text-neutral-500 uppercase tracking-widest">
                      0{index + 1} • MARASSEURAVIE
                    </span>
                    <h2 className="font-display  text-2xl sm:text-3xl text-white uppercase tracking-wider group-hover:text-neutral-200 transition-colors">
                      {collection.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                      {collection.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-900 flex items-center justify-between">
                    <span className="text-xs font-mono-brand uppercase text-white font-bold tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                      <span>VOIR LA SÉLECTION</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-mono-brand text-neutral-500">
                      {isComingSoon ? 'DROP 02' : 'DISPONIBLE'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
