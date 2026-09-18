import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';
import { useStore } from '../services/store';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (productId: string) => void;
  layoutVariant?: 'editorial' | 'compact' | 'featured';
  idPrefix?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  layoutVariant = 'editorial',
  idPrefix = 'prod-card'
}) => {
  const { settings, formatWhatsAppOrderUrl, addToCart } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  const mainImage = product.images[0] || 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=1200';
  const hoverImage = product.images[1] || mainImage;
  const isAvailable = product.status === 'available' || product.status === 'preorder';
  const isSoldOut = product.status === 'sold_out';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    addToCart(product, product.sizes[0] || 'M', product.colors[0]?.name || 'Noir', 1);
  };

  return (
    <article
      id={`${idPrefix}-${product.id}`}
      onClick={() => onSelectProduct(product.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer flex flex-col bg-transparent transition-all duration-300 relative select-none"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[3/4] bg-[#0A0A0A] overflow-hidden">
        <img          src={isHovered && hoverImage !== mainImage ? hoverImage : mainImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out ${
            isSoldOut ? 'grayscale opacity-40' : 'group-hover:scale-105'
          }`}
          loading="eager"
        />

        {/* Top Badges */}
        {product.badge && !isSoldOut && (
          <div className="absolute top-3 right-3 z-10">
            <span
              id={`badge-${product.id}`}
              className="text-[10px] uppercase font-mono-brand font-bold px-2 rounded-2xl  py-0.5 tracking-wider bg-black/80 text-white border border-white/20"
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
            <span
              id={`soldout-${product.id}`}
              className="text-xs uppercase font-mono-brand font-bold px-4 py-1.5 tracking-[0.2em] bg-black/85 text-white border border-white/30"
            >
              Épuisé
            </span>
          </div>
        )}
      </div>

      {/* Meta info below image */}
      <div className="pt-3 pb-1 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`font-display  text-sm tracking-wider uppercase transition-colors ${
            isSoldOut ? 'text-neutral-500' : 'text-white group-hover:text-neutral-300'
          }`}>
            {product.name}
          </h3>
         
        </div>

        <div className="flex items-center justify-between">
          <span className={`font-mono-brand font-medium text-xs tracking-wider ${
            isSoldOut ? 'text-neutral-600' : 'text-neutral-300'
          }`}>
            {product.price.toLocaleString('fr-FR')} {settings.currency}
          </span>
        </div>
      </div>
    </article>
  );
};