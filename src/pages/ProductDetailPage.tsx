import React, { useState } from 'react';
import { PageView } from '../types';
import { useStore } from '../services/store';
import { ArrowLeft, MessageCircle, ShoppingBag, Check, ShieldCheck, Truck, Sparkles, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: PageView, productId?: string, categoryFilter?: string) => void;
  onSelectProduct: (productId: string) => void;
  onOpenCart: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onNavigate,
  onSelectProduct,
  onOpenCart,
}) => {
  const { products, settings, addToCart, createOrder, formatWhatsAppOrderUrl } = useStore();

  const product = products.find(p => p.id === productId || p.slug === productId) || products[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product?.colors[0]?.name || 'Noir');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  if (!product) {
    return (
      <div className="py-32 text-center text-white">
        <h2 className="text-2xl font-bold">Produit introuvable</h2>
        <button
          onClick={() => onNavigate('shop')}
          className="mt-4 px-6 py-2 bg-white text-black font-bold uppercase text-xs"
        >
          Retour au shop
        </button>
      </div>
    );
  }

  const isAvailable = product.status === 'available' || product.status === 'preorder';
  const isComingSoon = product.status === 'coming_soon';

  const handleWhatsAppOrder = async () => {
    setIsOrdering(true);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#ffffff', '#22c55e', '#525252']
    });

    try {
      const orderTotal = product.price * quantity;
      // 1. First create the order in Firestore/backend (triggers instant Admin Push Notification)
      const order = await createOrder({
        items: [
          {
            productId: product.id,
            name: product.name,
            size: selectedSize,
            color: selectedColor,
            quantity: quantity,
            unitPrice: product.price,
            total: orderTotal,
            image: product.images[0]
          }
        ],
        totalAmount: orderTotal,
        customerCity: 'Abidjan',
        notes: `Commande directe depuis fiche produit ${product.name}`
      });

      // 2. Format customized WhatsApp message containing the unique Order ID
      const { url } = formatWhatsAppOrderUrl(product, selectedSize, selectedColor, quantity, 'Abidjan', order.id);
      
      // 3. Open WhatsApp
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Order creation error:', err);
      // Fallback open WhatsApp directly
      const { url } = formatWhatsAppOrderUrl(product, selectedSize, selectedColor, quantity, 'Abidjan');
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setIsOrdering(false);
    }
  };

  const handleAddToBag = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.featured))
    .slice(0, 3);

  return (
    <div id="product-detail-page" className="w-full bg-[#050505] text-[#F2F2F0] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-3 text-xs font-mono-brand uppercase text-neutral-400 mb-8 border-b border-neutral-900 pb-4">
          <button
            onClick={() => onNavigate('shop')}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETOUR AU SHOP</span>
          </button>
          <span>/</span>
          <button
            onClick={() => onNavigate('shop', undefined, product.category)}
            className="hover:text-white transition-colors"
          >
            {product.category}
          </button>
          <span>/</span>
          <span className="text-white truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Main Product Layout (Split Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Photo Gallery (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Primary Large Image */}
            <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-[#0D0D0D] border border-white/15 overflow-hidden">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={`${product.name} - Vue ${selectedImageIndex + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-all duration-500"
              />

              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="text-xs uppercase font-mono-brand  px-3 py-1.5 bg-white text-black tracking-widest shadow-xl">
                    {product.badge}
                  </span>
                </div>
              )}

              {/* Image counter pill */}
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-[10px] font-mono-brand text-white px-2.5 py-1 border border-white/15">
                {selectedImageIndex + 1} / {product.images.length}
              </div>
            </div>

            {/* Thumbnails Row */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    id={`thumb-${idx}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-[3/4] bg-neutral-900 overflow-hidden border transition-all ${
                      selectedImageIndex === idx
                        ? 'border-white ring-1 ring-white'
                        : 'border-neutral-800 opacity-60 hover:opacity-100 hover:border-neutral-600'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Miniature ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Specs & Ordering (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
            
            {/* Header info */}
            <div className="flex flex-col gap-2 border-b border-neutral-900 pb-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-brand uppercase tracking-[0.3em] text-neutral-400">
                  MARASSEURAVIE • {product.category}
                </span>
                <span className={`text-[10px] font-mono-brand uppercase tracking-wider px-2 py-0.5 ${
                  isAvailable ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40' : 'text-neutral-400 bg-neutral-900 border border-neutral-800'
                }`}>
                  {isAvailable ? 'EN STOCK' : 'DROP EN PRÉPARATION'}
                </span>
              </div>

              <h1 className="font-display  text-2xl sm:text-4xl text-white uppercase tracking-tight leading-tight">
                {product.name}
              </h1>

              {product.subtitle && (
                <p className="text-xs text-neutral-400 font-sans tracking-wide">
                  {product.subtitle}
                </p>
              )}

              {/* Price */}
              <div className="pt-2 flex items-baseline gap-3">
                <span className="font-display  text-3xl sm:text-4xl text-white tracking-tight">
                  {isComingSoon ? (
                    <span className="text-xl text-neutral-400">COMING SOON</span>
                  ) : (
                    `${product.price.toLocaleString('fr-FR')} ${settings.currency}`
                  )}
                </span>
                <span className="text-[11px] font-mono-brand text-neutral-500">
                  TTC • Livraison disponible
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
              <p>{product.description}</p>
            </div>

            {/* Color selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono-brand uppercase tracking-widest text-neutral-400">
                  COULEUR : <span className="text-white font-bold">{selectedColor}</span>
                </span>
                <div className="flex items-center gap-3">
                  {product.colors.map(col => (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(col.name)}
                      className={`flex items-center gap-2 px-3 py-2 border text-xs font-mono-brand transition-all ${
                        selectedColor === col.name
                          ? 'border-white bg-white/10 text-white'
                          : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-white/30"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono-brand uppercase tracking-widest text-neutral-400">
                    CHOISIR LA TAILLE : <span className="text-white font-bold">{selectedSize}</span>
                  </span>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[10px] font-mono-brand uppercase tracking-wider text-neutral-400 hover:text-white underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Guide des tailles</span>
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      id={`size-btn-${size}`}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-center text-xs font-mono-brand font-bold uppercase tracking-wider border transition-all ${
                        selectedSize === size
                          ? 'bg-white text-black border-white'
                          : 'bg-black text-neutral-300 border-neutral-800 hover:border-neutral-600 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {isAvailable && (
              <div className="flex items-center gap-4 pt-2">
                <span className="text-[11px] font-mono-brand uppercase tracking-widest text-neutral-400">
                  QUANTITÉ :
                </span>
                <div className="flex items-center border border-neutral-800 bg-black">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-neutral-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-mono-brand font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-neutral-400 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Primary Actions: WhatsApp Order & Bag */}
            <div className="flex flex-col gap-3 pt-4 border-t border-neutral-900">
              {isAvailable ? (
                <>
                  {/* WhatsApp Direct Order Button (Highest Priority) */}
                  <button
                    id="product-whatsapp-order-btn"
                    onClick={handleWhatsAppOrder}
                    className="w-full bg-white text-black font-display  text-xs uppercase tracking-[0.2em] py-4.5 px-6 flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all shadow-2xl"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>COMMANDER SUR WHATSAPP</span>
                  </button>

                  {/* Add to Bag Secondary */}
                  <div className="flex gap-3">
                    <button
                      id="product-add-to-bag-btn"
                      onClick={handleAddToBag}
                      className="flex-1 bg-black border border-white/40 text-white font-bold text-xs uppercase tracking-widest py-3.5 px-4 flex items-center justify-center gap-2 hover:bg-neutral-900 hover:border-white transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>AJOUTER AU PANIER</span>
                    </button>

                    <button
                      onClick={onOpenCart}
                      className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-4 py-3.5 text-xs font-mono-brand hover:text-white hover:border-white"
                      title="Voir le panier"
                    >
                      VOIR LE SAC
                    </button>
                  </div>

                  {addedToast && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono-brand flex items-center gap-2 animate-fadeIn">
                      <Check className="w-4 h-4" />
                      <span>Pièce ajoutée au panier ({selectedSize} / {selectedColor})</span>
                    </div>
                  )}
                </>
              ) : (
                <button
                  disabled
                  className="w-full bg-neutral-900 border border-neutral-800 text-neutral-500 font-bold text-xs uppercase tracking-widest py-4 cursor-not-allowed"
                >
                  DISPONIBLE PROCHAINEMENT (DROP 02)
                </button>
              )}
            </div>

            {/* Reassurances & Tech Specs */}
            <div className="flex flex-col gap-3 pt-6 border-t border-neutral-900 text-xs font-mono-brand text-neutral-400">
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-neutral-300" />
                <span>Livraison express à Abidjan & Expédition mondiale (DHL)</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-neutral-300" />
                <span>Pièce certifiée authentique MARASSEURAVIE</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-neutral-300" />
                <span>{product.composition || '100% Coton Premium'}</span>
              </div>
            </div>

            {/* Details Accordion */}
            {product.details && product.details.length > 0 && (
              <div className="border-t border-neutral-900 pt-4">
                <span className="text-[10px] font-mono-brand uppercase tracking-widest text-neutral-500 block mb-3">
                  CARACTÉRISTIQUES & FINITIONS
                </span>
                <ul className="flex flex-col gap-2">
                  {product.details.map((d, i) => (
                    <li key={i} className="text-xs text-neutral-300 font-mono-brand flex items-baseline gap-2">
                      <span className="text-neutral-500">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display  text-2xl sm:text-3xl text-white uppercase tracking-tight">
                COMPLÉTER LA SILHOUETTE
              </h3>
              <button
                onClick={() => onNavigate('shop')}
                className="text-xs font-mono-brand uppercase tracking-widest text-neutral-400 hover:text-white"
              >
                TOUT LE SHOP →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelectProduct={onSelectProduct}
                  layoutVariant="editorial"
                  idPrefix="related-prod"
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0D0D0D] border border-white/20 p-6 shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-4">
              <span className="font-display  text-base uppercase tracking-wider">
                GUIDE DES TAILLES MARASSEURAVIE
              </span>
              <button onClick={() => setShowSizeGuide(false)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300 mb-4 font-sans leading-relaxed">
              Nos pièces sont conçues avec une coupe contemporaine légèrement boxy / déstructurée. Si vous préférez un ajustement standard, optez pour votre taille habituelle. Pour un tombé très oversize, prenez une taille au-dessus.
            </p>

            <table className="w-full text-left text-xs font-mono-brand border-collapse mb-6">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500">
                  <th className="py-2">Taille</th>
                  <th className="py-2">Poitrine (cm)</th>
                  <th className="py-2">Longueur (cm)</th>
                  <th className="py-2">Stature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-300">
                <tr>
                  <td className="py-2 font-bold text-white">S</td>
                  <td className="py-2">96 - 102</td>
                  <td className="py-2">68</td>
                  <td className="py-2">1m65 - 1m75</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-white">M</td>
                  <td className="py-2">102 - 108</td>
                  <td className="py-2">70</td>
                  <td className="py-2">1m75 - 1m82</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-white">L</td>
                  <td className="py-2">108 - 114</td>
                  <td className="py-2">72</td>
                  <td className="py-2">1m80 - 1m88</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-white">XL</td>
                  <td className="py-2">114 - 120</td>
                  <td className="py-2">74</td>
                  <td className="py-2">1m85 - 1m95</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-white">XXL</td>
                  <td className="py-2">120 - 128</td>
                  <td className="py-2">76</td>
                  <td className="py-2">1m90+</td>
                </tr>
              </tbody>
            </table>

            <button
              onClick={() => setShowSizeGuide(false)}
              className="w-full bg-white text-black py-3 text-xs font-bold font-display uppercase tracking-widest hover:bg-neutral-200"
            >
              COMPRIS
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
