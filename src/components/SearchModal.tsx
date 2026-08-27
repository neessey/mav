import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useStore } from '../services/store';
import { PageView } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
  onNavigate: (page: PageView, productId?: string, categoryFilter?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onNavigate,
}) => {
  const { products, settings } = useStore();
  const [query, setQuery] = useState('');

  // Keyboard shortcut Cmd+K or Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = products.filter(p => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div
      id="search-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="search-modal-container"
        className="w-full max-w-2xl bg-[#0D0D0D] border border-white/20 p-6 shadow-2xl text-white flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            id="search-query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un tricot, survêtement, taille, hoodie..."
            autoFocus
            className="w-full bg-transparent text-lg font-display text-white placeholder:text-neutral-600 focus:outline-none tracking-wide"
          />
          <button
            id="search-modal-close"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white border border-neutral-800 rounded-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Quick Tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[10px] font-mono-brand text-neutral-500 uppercase tracking-widest mr-1">
            CATÉGORIES:
          </span>
          {['tshirts', 'hoodies'].map(cat => (
            <button
              key={cat}
              onClick={() => {
                onClose();
                onNavigate('shop', undefined, cat);
              }}
              className="px-2.5 py-1 bg-black border border-neutral-800 text-neutral-400 hover:text-white hover:border-white uppercase font-mono-brand text-[10px] transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto flex flex-col gap-3 pr-1">
          <div className="flex items-center justify-between text-[10px] font-mono-brand text-neutral-500 uppercase tracking-widest">
            <span>RÉSULTATS ({filtered.length})</span>
            <span>ESC POUR QUITTER</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 font-mono-brand text-xs">
              Aucune pièce trouvée pour « {query} ».
            </div>
          ) : (
            filtered.map(product => (
              <div
                key={product.id}
                id={`search-result-${product.id}`}
                onClick={() => {
                  onClose();
                  onSelectProduct(product.id);
                }}
                className="group flex items-center justify-between p-3 bg-black/40 hover:bg-neutral-900/60 border border-neutral-900 hover:border-white/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-14 bg-neutral-900 overflow-hidden border border-white/10 shrink-0">
                    <img loading="lazy"                      src={product.images[0]}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm tracking-wide text-white uppercase group-hover:text-neutral-200">
                        {product.name}
                      </span>
                      {product.badge && (
                        <span className="text-[8px] font-mono-brand uppercase px-1.5 py-0.5 bg-white text-black font-bold">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono-brand uppercase">
                      {product.category} • {product.sizes.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono-brand font-bold text-xs text-white">
                    {product.status === 'coming_soon'
                      ? 'COMING SOON'
                      : `${product.price.toLocaleString('fr-FR')} ${settings.currency}`}
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};