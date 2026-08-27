import React, { useState, useEffect } from 'react';
import { PageView } from '../types';
import { useStore } from '../services/store';
import { ArrowLeft, MessageCircle, ShoppingBag, Check, ShieldCheck, Truck, Sparkles, HelpCircle, Banknote, Smartphone, X, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductCard } from '../components/ProductCard';

const WAVE_MERCHANT_LINK = 'https://pay.wave.com/m/M_ci_waw-9EveeQZb/c/ci';

interface DeliveryFormData {
  fullName: string;
  phone: string;
  city: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
}

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: PageView, productId?: string, categoryFilter?: string) => void;
  onSelectProduct: (productId: string) => void;
  onOpenCart: () => void;
}

type PaymentMethod = 'cod' | 'wave';

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onNavigate,
  onSelectProduct,
  onOpenCart,
}) => {
  const { products, settings, addToCart, createOrder } = useStore();

  const product = products.find(p => p.id === productId || p.slug === productId) || products[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product?.colors[0]?.name || 'Noir');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingMethod, setProcessingMethod] = useState<PaymentMethod | null>(null);
  const [showWhatsAppContinue, setShowWhatsAppContinue] = useState(false);
  const [pendingWhatsAppUrl, setPendingWhatsAppUrl] = useState<string | null>(null);

  // États pour le formulaire de livraison
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryFormData, setDeliveryFormData] = useState<DeliveryFormData>({
    fullName: '',
    phone: '',
    city: '',
    deliveryAddress: '',
    deliveryInstructions: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof DeliveryFormData, string>>>({});
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;

      const pendingRaw = sessionStorage.getItem('pendingWaveOrder');
      if (!pendingRaw) return;

      try {
        const { whatsappUrl } = JSON.parse(pendingRaw);
        if (whatsappUrl) {
          setPendingWhatsAppUrl(whatsappUrl);
          setShowWhatsAppContinue(true);
        }
      } catch (error) {
        console.error('Erreur récupération commande Wave:', error);
        sessionStorage.removeItem('pendingWaveOrder');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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

  const validateDeliveryForm = (): boolean => {
    const errors: Partial<Record<keyof DeliveryFormData, string>> = {};
    
    if (!deliveryFormData.fullName.trim()) {
      errors.fullName = 'Le nom complet est requis';
    }
    
    if (!deliveryFormData.phone.trim()) {
      errors.phone = 'Le numéro de téléphone est requis';
    } else if (!/^[0-9+\s-]{8,15}$/.test(deliveryFormData.phone.trim())) {
      errors.phone = 'Numéro de téléphone invalide';
    }
    
    if (!deliveryFormData.city.trim()) {
      errors.city = 'La ville est requise';
    }
    
    if (!deliveryFormData.deliveryAddress.trim()) {
      errors.deliveryAddress = "L'adresse de livraison est requise";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetDeliveryForm = () => {
    setDeliveryFormData({
      fullName: '',
      phone: '',
      city: '',
      deliveryAddress: '',
      deliveryInstructions: ''
    });
    setFormErrors({});
  };

  // CORRECTION: Fonction qui gère le passage du formulaire au paiement
  const handleDeliveryFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDeliveryForm()) {
      // Fermer le formulaire de livraison
      setShowDeliveryForm(false);
      // Ouvrir le modal de paiement
      setShowPaymentModal(true);
    }
  };

  const processOrder = async (method: PaymentMethod) => {
    // BUG FIX (mobile Safari/Chrome): window.open() called after an `await` loses the
    // "user activation" the click gave us, so mobile browsers silently block it (iOS) or
    // show a "popup blocked" banner requiring manual approval (Android). Opening a blank
    // tab HERE — synchronously, still inside the click — keeps that activation. We just
    // redirect this already-open tab to the real WhatsApp URL once it's ready below.
    const whatsappWindow = method === 'cod' ? window.open('about:blank', '_blank') : null;

    setProcessingMethod(method);
    setIsOrdering(true);
    setIsSubmittingDelivery(true);
    
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#ffffff', '#22c55e', '#525252']
    });

    try {
      const orderTotal = product.price * quantity;
      
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
        customerName: deliveryFormData.fullName,
        customerPhone: deliveryFormData.phone,
        customerCity: deliveryFormData.city,
        notes: `Commande depuis fiche produit ${product.name} — Paiement : ${
          method === 'wave' ? 'Wave' : 'À la livraison'
        }\nAdresse: ${deliveryFormData.deliveryAddress}\nInstructions: ${deliveryFormData.deliveryInstructions || 'Aucune'}`,
        whatsappMessage: undefined,
        whatsappUrl: undefined
      });

      const orderSummary = `
 *Bonjour MARASSEURAVIE* 
 Je souhaite valider ma commande :
━━━━━━━━━━━━━━━━━
 *Article:* ${product.name}
 *Taille:* ${selectedSize}
 *Couleur:* ${selectedColor}
 *Quantité:* ${quantity}
 *Total:* ${orderTotal.toLocaleString('fr-FR')} FCFA
 *Paiement:* ${method === 'wave' ? 'Wave (déjà effectué)' : 'À la livraison'}
━━━━━━━━━━━━━━━━━
  *Client:* ${deliveryFormData.fullName}
 *Téléphone:* ${deliveryFormData.phone}
 *Ville:* ${deliveryFormData.city}
 *Adresse:* ${deliveryFormData.deliveryAddress}
${deliveryFormData.deliveryInstructions ? ` *Instructions:* ${deliveryFormData.deliveryInstructions}` : ''}
━━━━━━━━━━━━━━━━━
`;

      const phoneNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(orderSummary)}`;

      setShowPaymentModal(false);

      if (method === 'wave') {
        sessionStorage.setItem(
          'pendingWaveOrder',
          JSON.stringify({
            orderId: order.id,
            whatsappUrl: whatsappUrl,
          })
        );
        window.location.assign(WAVE_MERCHANT_LINK);
      } else {
        if (whatsappWindow) {
          whatsappWindow.location.href = whatsappUrl;
        } else {
          // Fallback: the pre-opened tab failed (rare) — navigate the current tab instead
          // of doing nothing, so the customer's order isn't left dangling.
          window.location.assign(whatsappUrl);
        }
        resetDeliveryForm();
      }

    } catch (err) {
      if (whatsappWindow) whatsappWindow.close();
      console.error('Order creation error:', err);
      alert('Une erreur est survenue lors de la création de la commande. Veuillez réessayer.');
    } finally {
      setIsOrdering(false);
      setProcessingMethod(null);
      setIsSubmittingDelivery(false);
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-[#0D0D0D] border border-white/15 overflow-hidden">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={`${product.name} - Vue ${selectedImageIndex + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-all duration-500"
              />
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="text-xs uppercase font-mono-brand px-3 py-1.5 bg-white text-black tracking-widest shadow-xl">
                    {product.badge}
                  </span>
                </div>
              )}
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-[10px] font-mono-brand text-white px-2.5 py-1 border border-white/15">
                {selectedImageIndex + 1} / {product.images.length}
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-[3/4] bg-neutral-900 overflow-hidden border transition-all ${
                      selectedImageIndex === idx
                        ? 'border-white ring-1 ring-white'
                        : 'border-neutral-800 opacity-60 hover:opacity-100 hover:border-neutral-600'
                    }`}
                  >
                    <img loading="lazy"                      src={img}
                      alt={`Miniature ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
            
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

              <h1 className="font-display text-2xl sm:text-4xl text-white uppercase tracking-tight leading-tight">
                {product.name}
              </h1>

              {product.subtitle && (
                <p className="text-xs text-neutral-400 font-sans tracking-wide">
                  {product.subtitle}
                </p>
              )}

              <div className="pt-2 flex items-baseline gap-3">
                <span className="font-display text-3xl sm:text-4xl text-white tracking-tight">
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

            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
              <p>{product.description}</p>
            </div>

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

            <div className="flex flex-col gap-3 pt-4 border-t border-neutral-900">
              {isAvailable ? (
                <>
                  <button
                    onClick={() => {
                      setShowDeliveryForm(true);
                    }}
                    disabled={isOrdering}
                    className="w-full bg-white text-black font-display text-xs uppercase tracking-[0.2em] py-4.5 px-6 flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>COMMANDER</span>
                  </button>

                  <div className="flex gap-3">
                    <button
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

        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-2xl sm:text-3xl text-white uppercase tracking-tight">
                PRODUITS SIMILAIRES
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

      {/* Modal de confirmation WhatsApp après Wave */}
      {showWhatsAppContinue && pendingWhatsAppUrl && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-white/20 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-center mb-5">
              <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-display text-xl uppercase tracking-wider mb-3">
                Paiement Wave terminé ?
              </h3>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed mb-6">
                Si tu as terminé ton paiement sur Wave, clique sur le bouton
                ci-dessous pour finaliser ta commande avec WhatsApp.
              </p>

              <button
                onClick={() => {
                  if (!pendingWhatsAppUrl) return;
                  sessionStorage.removeItem('pendingWaveOrder');
                  window.open(pendingWhatsAppUrl, '_blank', 'noopener,noreferrer');
                  setPendingWhatsAppUrl(null);
                  setShowWhatsAppContinue(false);
                }}
                className="w-full bg-white text-black py-4 px-6 font-display text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                J'AI PAYÉ → CONTINUER SUR WHATSAPP
              </button>

              <button
                onClick={() => {
                  setPendingWhatsAppUrl(null);
                  setShowWhatsAppContinue(false);
                  sessionStorage.removeItem('pendingWaveOrder');
                }}
                className="w-full mt-3 border border-neutral-800 text-neutral-400 py-3 text-xs font-mono-brand uppercase tracking-widest hover:text-white hover:border-neutral-600 transition-all"
              >
                FERMER
              </button>

              <p className="text-[10px] text-neutral-600 font-mono-brand mt-4">
                Ta commande a déjà été enregistrée.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !isOrdering && setShowPaymentModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#0D0D0D] border border-white/20 p-6 shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-5">
              <span className="font-display text-base uppercase tracking-wider">
                MODE DE PAIEMENT
              </span>
              <button
                onClick={() => !isOrdering && setShowPaymentModal(false)}
                className="text-neutral-400 hover:text-white disabled:opacity-40"
                disabled={isOrdering}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 font-sans leading-relaxed mb-5">
              Choisis comment tu veux payer ta commande de <span className="text-white">{product.name}</span> ({quantity} x {product.price.toLocaleString('fr-FR')} {settings.currency}).
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => processOrder('cod')}
                disabled={isOrdering || isSubmittingDelivery}
                className="w-full flex items-center gap-4 border border-neutral-800 hover:border-white bg-black px-4 py-4 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-neutral-900 border border-neutral-800">
                  {processingMethod === 'cod' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Banknote className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest">Paiement à la livraison</span>
                  <span className="text-[11px] text-neutral-500 font-mono-brand">Tu payes en espèces à la réception</span>
                </div>
              </button>

              <button
                onClick={() => processOrder('wave')}
                disabled={isOrdering || isSubmittingDelivery}
                className="w-full flex items-center gap-4 border border-neutral-800 hover:border-white bg-black px-4 py-4 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-neutral-900 border border-neutral-800">
                  {processingMethod === 'wave' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Smartphone className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest">Payer avec Wave</span>
                  <span className="text-[11px] text-neutral-500 font-mono-brand">Redirection vers Wave, puis retour ici</span>
                </div>
              </button>
            </div>

            <p className="text-[10px] text-neutral-500 font-mono-brand mt-5 text-center">
              Une fois le paiement confirmé, tu seras redirigé vers WhatsApp pour finaliser.
            </p>
          </div>
        </div>
      )}

      {/* Delivery Form Modal - CORRIGÉ */}
      {showDeliveryForm && (
        <div
          className="fixed inset-0 z-[55] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => !isSubmittingDelivery && setShowDeliveryForm(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#0D0D0D] border border-white/20 p-6 md:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-6">
              <div>
                <span className="font-display text-xl uppercase tracking-wider block">
                  INFORMATIONS DE LIVRAISON
                </span>
                <span className="text-[10px] font-mono-brand text-neutral-400 mt-1 block">
                  Remplissez vos coordonnées pour finaliser la commande
                </span>
              </div>
              <button
                onClick={() => !isSubmittingDelivery && setShowDeliveryForm(false)}
                className="text-neutral-400 hover:text-white disabled:opacity-40"
                disabled={isSubmittingDelivery}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Utiliser handleDeliveryFormSubmit au lieu de l'inline */}
            <form onSubmit={handleDeliveryFormSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono-brand uppercase tracking-wider text-neutral-400">
                    Nom complet <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryFormData.fullName}
                    onChange={(e) => setDeliveryFormData({...deliveryFormData, fullName: e.target.value})}
                    placeholder="Ex: Kouadio Jean"
                    className={`w-full bg-black border ${
                      formErrors.fullName ? 'border-red-500' : 'border-neutral-800'
                    } text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none transition-colors`}
                    disabled={isSubmittingDelivery}
                  />
                  {formErrors.fullName && (
                    <p className="text-[10px] text-red-400 font-mono-brand">{formErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono-brand uppercase tracking-wider text-neutral-400">
                    Téléphone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={deliveryFormData.phone}
                    onChange={(e) => setDeliveryFormData({...deliveryFormData, phone: e.target.value})}
                    placeholder="Ex: 07 67 89 10 11"
                    className={`w-full bg-black border ${
                      formErrors.phone ? 'border-red-500' : 'border-neutral-800'
                    } text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none transition-colors`}
                    disabled={isSubmittingDelivery}
                  />
                  {formErrors.phone && (
                    <p className="text-[10px] text-red-400 font-mono-brand">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono-brand uppercase tracking-wider text-neutral-400">
                    Ville <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryFormData.city}
                    onChange={(e) => setDeliveryFormData({...deliveryFormData, city: e.target.value})}
                    placeholder="Ex: Abidjan, Cocody"
                    className={`w-full bg-black border ${
                      formErrors.city ? 'border-red-500' : 'border-neutral-800'
                    } text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none transition-colors`}
                    disabled={isSubmittingDelivery}
                  />
                  {formErrors.city && (
                    <p className="text-[10px] text-red-400 font-mono-brand">{formErrors.city}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono-brand uppercase tracking-wider text-neutral-400">
                  Adresse de livraison <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={deliveryFormData.deliveryAddress}
                  onChange={(e) => setDeliveryFormData({...deliveryFormData, deliveryAddress: e.target.value})}
                  placeholder="Ex: Résidence des Palmiers, Appartement 12, Rue du Commerce"
                  rows={2}
                  className={`w-full bg-black border ${
                    formErrors.deliveryAddress ? 'border-red-500' : 'border-neutral-800'
                  } text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none transition-colors resize-none`}
                  disabled={isSubmittingDelivery}
                />
                {formErrors.deliveryAddress && (
                  <p className="text-[10px] text-red-400 font-mono-brand">{formErrors.deliveryAddress}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono-brand uppercase tracking-wider text-neutral-400">
                  Instructions supplémentaires
                </label>
                <textarea
                  value={deliveryFormData.deliveryInstructions}
                  onChange={(e) => setDeliveryFormData({...deliveryFormData, deliveryInstructions: e.target.value})}
                  placeholder="Ex: Sonner 3 fois, porte bleue au fond de la cour"
                  rows={2}
                  className="w-full bg-black border border-neutral-800 text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none transition-colors resize-none"
                  disabled={isSubmittingDelivery}
                />
              </div>

              <div className="p-4 bg-black border border-neutral-800 space-y-1.5">
                <span className="text-[10px] font-mono-brand uppercase tracking-wider text-neutral-400 block">
                  Résumé de la commande
                </span>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">{product.name} × {quantity}</span>
                  <span className="text-white font-bold">{(product.price * quantity).toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-xs border-t border-neutral-800 pt-1.5">
                  <span className="text-neutral-400">Taille / Couleur</span>
                  <span className="text-white">{selectedSize} / {selectedColor}</span>
                </div>
                <div className="flex justify-between text-xs font-bold border-t border-neutral-800 pt-1.5 mt-1">
                  <span className="text-white">Total</span>
                  <span className="text-white">{(product.price * quantity).toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeliveryForm(false)}
                  className="flex-1 py-3 border border-neutral-800 text-neutral-400 text-xs font-mono-brand uppercase tracking-wider hover:text-white hover:border-neutral-600 transition-colors"
                  disabled={isSubmittingDelivery}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-white text-black font-display text-xs uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                  disabled={isSubmittingDelivery}
                >
                  <Check className="w-4 h-4" />
                  <span>Continuer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <span className="font-display text-base uppercase tracking-wider">
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