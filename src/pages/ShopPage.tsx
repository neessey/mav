import React, { useState, useMemo } from 'react';
import { PageView } from '../types';
import { useStore } from '../services/store';
import { ProductCard } from '../components/ProductCard';
import { ChevronDown, SlidersHorizontal, ChevronRight } from 'lucide-react';

interface ShopPageProps {
  initialCategory?: string;
  onNavigate: (page: PageView, productId?: string) => void;
  onSelectProduct: (productId: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory,
  onNavigate,
  onSelectProduct,
}) => {
  const { products, settings } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);

  const categories = [
    { id: 'all', label: 'TOUS LES PRODUITS' },
    { id: 'tricots', label: 'TRICOTS' },
    { id: 'survetements', label: 'SURVÊTEMENTS' },
    { id: 'tshirts', label: 'T-SHIRTS' },
    { id: 'hoodies', label: 'HOODIES' },
    { id: 'accessoires', label: 'ACCESSOIRES' },
  ];

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Toggle size filter
  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Sizes filter
      if (selectedSizes.length > 0) {
        const hasMatchingSize = p.sizes.some(s => selectedSizes.includes(s));
        if (!hasMatchingSize) return false;
      }
      // Price filter
      if (p.price > maxPrice) {
        return false;
      }
      // Availability filter
      if (selectedAvailability === 'available' && p.status !== 'available' && p.status !== 'preorder') {
        return false;
      }
      if (selectedAvailability === 'soldout' && p.status !== 'sold_out') {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, selectedCategory, selectedSizes, maxPrice, selectedAvailability, sortBy]);

  // Counts for sidebar
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  return (
    <div id="shop-page-container" className="w-full bg-[#000000] text-[#FFFFFF] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-mono-brand uppercase tracking-[0.2em] text-neutral-400 mb-2">
          <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
            HOME
          </button>
          <span>/</span>
          <span className="text-white">SHOP</span>
        </div>

        {/* Page Title */}
        <h1 className="font-display  text-5xl sm:text-6xl text-white uppercase tracking-tight mb-8">
          SHOP
        </h1>

        {/* Top Category Filter Tabs Bar */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4 mb-8">
          
          {/* Category Horizontal Pills */}
          <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto scrollbar-none">
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`top-filter-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs font-semibold tracking-[0.15em] uppercase whitespace-nowrap transition-colors relative py-1 ${
                    isActive ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0 hidden sm:flex items-center gap-2 text-xs font-mono-brand">
            <span className="text-neutral-400">TRIER PAR :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black text-white text-xs font-mono-brand uppercase border border-neutral-800 px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="newest">Nouveautés</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="sm:hidden flex items-center gap-1.5 text-xs font-mono-brand border border-neutral-800 px-3 py-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>FILTRES</span>
          </button>
        </div>

        {/* Layout Grid: Sidebar Filters (Left) + 3-Col Product Grid (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Sidebar Filter Column (3 cols) */}
          <aside className={`lg:col-span-3 flex flex-col gap-8 ${mobileFilterOpen ? 'block' : 'hidden lg:flex'}`}>
            
            {/* Filter Group: Catégories */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold font-mono-brand uppercase tracking-[0.2em] text-white">
                CATÉGORIES
              </span>
              <div className="flex flex-col gap-2 pt-1 text-xs font-mono-brand text-neutral-400">
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedCategory === 'all'}
                    onChange={() => setSelectedCategory('all')}
                    className="accent-white cursor-pointer"
                  />
                  <span>Tous ({categoryCounts['all'] || products.length})</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedCategory === 'tricots'}
                    onChange={() => setSelectedCategory('tricots')}
                    className="accent-white cursor-pointer"
                  />
                  <span>Tricots ({categoryCounts['tricots'] || 0})</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedCategory === 'survetements'}
                    onChange={() => setSelectedCategory('survetements')}
                    className="accent-white cursor-pointer"
                  />
                  <span>Survêtements ({categoryCounts['survetements'] || 0})</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedCategory === 'tshirts'}
                    onChange={() => setSelectedCategory('tshirts')}
                    className="accent-white cursor-pointer"
                  />
                  <span>T-Shirts ({categoryCounts['tshirts'] || 0})</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedCategory === 'hoodies'}
                    onChange={() => setSelectedCategory('hoodies')}
                    className="accent-white cursor-pointer"
                  />
                  <span>Hoodies ({categoryCounts['hoodies'] || 0})</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedCategory === 'accessoires'}
                    onChange={() => setSelectedCategory('accessoires')}
                    className="accent-white cursor-pointer"
                  />
                  <span>Accessoires ({categoryCounts['accessoires'] || 0})</span>
                </label>
              </div>
            </div>

            {/* Filter Group: Taille */}
            <div className="flex flex-col gap-3 border-t border-neutral-900 pt-6">
              <span className="text-xs font-bold font-mono-brand uppercase tracking-[0.2em] text-white">
                TAILLE
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-mono-brand text-neutral-400">
                {allSizes.map(size => {
                  const isChecked = selectedSizes.includes(size);
                  return (
                    <label key={size} className="flex items-center gap-2 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSize(size)}
                        className="accent-white cursor-pointer"
                      />
                      <span>{size}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Filter Group: Prix */}
            <div className="flex flex-col gap-3 border-t border-neutral-900 pt-6">
              <span className="text-xs font-bold font-mono-brand uppercase tracking-[0.2em] text-white">
                PRIX
              </span>
              <div className="flex flex-col gap-2 pt-1">
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="accent-white w-full cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs font-mono-brand text-neutral-400">
                  <span>0 FCFA</span>
                  <span className="text-white font-bold">{maxPrice.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            </div>

            {/* Filter Group: Disponibilité */}
            <div className="flex flex-col gap-3 border-t border-neutral-900 pt-6">
              <span className="text-xs font-bold font-mono-brand uppercase tracking-[0.2em] text-white">
                DISPONIBILITÉ
              </span>
              <div className="flex flex-col gap-2 pt-1 text-xs font-mono-brand text-neutral-400">
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedAvailability === 'available'}
                    onChange={() => setSelectedAvailability(selectedAvailability === 'available' ? 'all' : 'available')}
                    className="accent-white cursor-pointer"
                  />
                  <span>Disponible ({products.filter(p => p.status === 'available').length})</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedAvailability === 'soldout'}
                    onChange={() => setSelectedAvailability(selectedAvailability === 'soldout' ? 'all' : 'soldout')}
                    className="accent-white cursor-pointer"
                  />
                  <span>Épuisé ({products.filter(p => p.status === 'sold_out').length})</span>
                </label>
              </div>
            </div>

            {/* Reset Button */}
            {(selectedCategory !== 'all' || selectedSizes.length > 0 || maxPrice < 100000 || selectedAvailability !== 'all') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSizes([]);
                  setMaxPrice(100000);
                  setSelectedAvailability('all');
                }}
                className="text-xs font-mono-brand uppercase underline text-neutral-400 hover:text-white text-left"
              >
                Réinitialiser les filtres
              </button>
            )}

          </aside>

          {/* Right Product Grid (9 cols on Desktop) */}
          <main className="lg:col-span-9 flex flex-col gap-8">
            
            {/* 3-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  layoutVariant="editorial"
                  idPrefix="shop-catalog"
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center gap-3 bg-[#0a0a0a] border border-neutral-900">
                <span className="font-display font-bold text-lg text-white uppercase">
                  Aucune pièce trouvée
                </span>
                <p className="text-xs text-neutral-400 font-mono-brand">
                  Modifiez vos critères de recherche ou de filtre.
                </p>
              </div>
            )}

            {/* Pagination controls at bottom */}
            {filteredProducts.length > 0 && (
              <div className="flex items-center justify-center gap-2 pt-8 border-t border-neutral-900">
                <button
                  onClick={() => setCurrentPageNum(1)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-mono-brand ${
                    currentPageNum === 1 ? 'bg-white text-black font-bold' : 'text-neutral-400 border border-neutral-800 hover:text-white'
                  }`}
                >
                  1
                </button>
                <button
                  onClick={() => setCurrentPageNum(2)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-mono-brand ${
                    currentPageNum === 2 ? 'bg-white text-black font-bold' : 'text-neutral-400 border border-neutral-800 hover:text-white'
                  }`}
                >
                  2
                </button>
                <button
                  onClick={() => setCurrentPageNum(prev => prev + 1)}
                  className="w-8 h-8 flex items-center justify-center text-xs font-mono-brand text-neutral-400 border border-neutral-800 hover:text-white"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
};
