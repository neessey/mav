import React, { useEffect, useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, MessageCircle, Check, Banknote, Smartphone, Loader2 } from 'lucide-react';
import { useStore } from '../services/store';
import { PageView } from '../types';
import confetti from 'canvas-confetti';

const WAVE_MERCHANT_LINK = 'https://pay.wave.com/m/M_ci_NiFtdXeHAg97/c/ci/';

interface DeliveryFormData {
  fullName: string;
  phone: string;
  city: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
}

type PaymentMethod = 'cod' | 'wave';

interface QuickCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageView, productId?: string) => void;
}

export const QuickCartDrawer: React.FC<QuickCartDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const {
    cart,
    settings,
    removeFromCart,
    updateCartQty,
    clearCart,
    createOrder,
  } = useStore();

  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [processingMethod, setProcessingMethod] = useState<PaymentMethod | null>(null);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWhatsAppContinue, setShowWhatsAppContinue] = useState(false);
  const [pendingWhatsAppUrl, setPendingWhatsAppUrl] = useState<string | null>(null);

  const [deliveryFormData, setDeliveryFormData] = useState<DeliveryFormData>({
    fullName: '',
    phone: '',
    city: '',
    deliveryAddress: '',
    deliveryInstructions: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof DeliveryFormData, string>>>({});

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Même mécanisme que la fiche produit : après le retour de Wave,
  // proposer explicitement de poursuivre sur WhatsApp.
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
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  if (!isOpen) return null;

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
      deliveryInstructions: '',
    });
    setFormErrors({});
  };

  const handleDeliveryFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDeliveryForm()) return;

    setShowDeliveryForm(false);
    setShowPaymentModal(true);
  };

  const processOrder = async (method: PaymentMethod) => {
    if (cart.length === 0) return;

    // Pré-ouverture synchrone pour éviter le blocage WhatsApp sur mobile.
    const whatsappWindow = method === 'cod' ? window.open('about:blank', '_blank') : null;

    setProcessingMethod(method);
    setIsOrdering(true);
    setIsSubmittingDelivery(true);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#ffffff', '#22c55e', '#525252'],
    });

    try {
      const order = await createOrder({
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          size: item.selectedSize,
          color: item.selectedColor,
          quantity: item.quantity,
          unitPrice: item.product.price,
          total: item.product.price * item.quantity,
          image: item.product.images[0],
        })),
        totalAmount,
        customerName: deliveryFormData.fullName,
        customerPhone: deliveryFormData.phone,
        customerCity: deliveryFormData.city,
        notes: `Commande depuis le panier (${cart.length} article${cart.length > 1 ? 's' : ''}) — Paiement : ${
          method === 'wave' ? 'Wave' : 'À la livraison'
        }\nAdresse: ${deliveryFormData.deliveryAddress}\nInstructions: ${deliveryFormData.deliveryInstructions || 'Aucune'}`,
        whatsappMessage: undefined,
        whatsappUrl: undefined,
      });

      const orderSummary = `
 *Bonjour MARASSEURAVIE* 
 Je souhaite valider ma commande :
━━━━━━━━━━━━━━━━━
${cart.map((item, index) => ` *Article ${index + 1}:* ${item.product.name}\n *Taille:* ${item.selectedSize}\n *Couleur:* ${item.selectedColor}\n *Quantité:* ${item.quantity}\n *Sous-total:* ${(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA`).join('\n━━━━━━━━━━━━━━━━━\n')}
━━━━━━━━━━━━━━━━━
 *Total:* ${totalAmount.toLocaleString('fr-FR')} FCFA
 *Paiement:* ${method === 'wave' ? 'Wave (déjà effectué)' : 'À la livraison'}
━━━━━━━━━━━━━━━━━
 *Client:* ${deliveryFormData.fullName}
 *Téléphone:* ${deliveryFormData.phone}
 *Ville:* ${deliveryFormData.city}
 *Adresse:* ${deliveryFormData.deliveryAddress}
${deliveryFormData.deliveryInstructions ? ` *Instructions:* ${deliveryFormData.deliveryInstructions}\n` : ''} *Référence:* ${order.orderNumber || order.id}
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
            whatsappUrl,
          })
        );
        clearCart();
        resetDeliveryForm();
        onClose();
        window.location.assign(WAVE_MERCHANT_LINK);
      } else {
        if (whatsappWindow) {
          whatsappWindow.location.href = whatsappUrl;
        } else {
          window.location.assign(whatsappUrl);
        }
        clearCart();
        resetDeliveryForm();
        onClose();
      }
    } catch (err) {
      if (whatsappWindow) whatsappWindow.close();
      console.error('Cart order creation error:', err);
      alert('Une erreur est survenue lors de la création de la commande. Veuillez réessayer.');
    } finally {
      setIsOrdering(false);
      setProcessingMethod(null);
      setIsSubmittingDelivery(false);
    }
  };

  return (
    <>
      <div
        id="cart-drawer-backdrop"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-fadeIn"
        onClick={onClose}
      >
        <div
          id="cart-drawer-panel"
          className="w-full max-w-md bg-[#0D0D0D] border-l border-white/20 h-full flex flex-col justify-between text-white p-6 shadow-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <span className="font-display text-lg tracking-widest uppercase">
                MON PANIER ({cart.reduce((s, i) => s + i.quantity, 0)})
              </span>
              <button
                id="cart-close-btn"
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-white border border-neutral-800 rounded-sm"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 flex flex-col gap-4 max-h-[46vh] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center gap-4 text-neutral-500 font-mono-brand text-xs">
                  <span>Votre panier est vide.</span>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigate('shop');
                    }}
                    className="px-4 py-2 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-neutral-200"
                  >
                    DÉCOUVRIR LE SHOP
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} id={`cart-item-${item.id}`} className="flex gap-4 p-3 bg-black border border-neutral-900">
                    <div
                      onClick={() => {
                        onClose();
                        onNavigate('product', item.product.id);
                      }}
                      className="w-16 h-20 bg-neutral-900 shrink-0 border border-white/10 cursor-pointer overflow-hidden"
                    >
                      <img
                        loading="lazy"
                        src={item.product.images[0]}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4
                            onClick={() => {
                              onClose();
                              onNavigate('product', item.product.id);
                            }}
                            className="font-bold text-xs uppercase tracking-wider text-white hover:underline cursor-pointer line-clamp-1"
                          >
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-500 hover:text-red-400 p-0.5"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[10px] font-mono-brand text-neutral-400 flex items-center gap-2 mt-1">
                          <span>Taille : {item.selectedSize}</span>
                          <span>•</span>
                          <span>Couleur : {item.selectedColor}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-neutral-800 bg-black">
                          <button onClick={() => updateCartQty(item.id, -1)} className="px-2 py-0.5 text-neutral-400 hover:text-white" aria-label="Diminuer">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono-brand text-white">{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.id, 1)} className="px-2 py-0.5 text-neutral-400 hover:text-white" aria-label="Augmenter">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-mono-brand font-bold text-xs text-white">
                          {(item.product.price * item.quantity).toLocaleString('fr-FR')} {settings.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="border-t border-neutral-800 pt-4 flex flex-col gap-4">
              <div className="flex justify-between items-baseline border-t border-neutral-900 pt-3">
                <span className="text-xs uppercase font-mono-brand text-neutral-400">TOTAL ESTIMÉ</span>
                <span className="font-extrabold text-xl text-white">
                  {totalAmount.toLocaleString('fr-FR')} {settings.currency}
                </span>
              </div>

              <button
                id="cart-order-btn"
                onClick={() => setShowDeliveryForm(true)}
                disabled={isOrdering}
                className="w-full bg-white text-black font-bold text-xs uppercase tracking-widest py-3.5 flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>COMMANDER</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={clearCart}
                className="text-[10px] text-neutral-500 hover:text-neutral-300 font-mono-brand uppercase text-center"
              >
                Vider le panier
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Même fiche de livraison que la fiche produit */}
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
                <span className="font-display text-xl uppercase tracking-wider block">INFORMATIONS DE LIVRAISON</span>
                <span className="text-[10px] font-mono-brand text-neutral-400 mt-1 block">Remplissez vos coordonnées pour finaliser la commande</span>
              </div>
              <button onClick={() => !isSubmittingDelivery && setShowDeliveryForm(false)} className="text-neutral-400 hover:text-white disabled:opacity-40" disabled={isSubmittingDelivery}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeliveryFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono-brand uppercase tracking-wider text-neutral-400">Nom complet <span className="text-red-400">*</span></label>
                  <input type="text" value={deliveryFormData.fullName} onChange={(e) => setDeliveryFormData({...deliveryFormData, fullName: e.target.value})} placeholder="Ex: Kouadio Jean" className={`w-full bg-black border ${formErrors.fullName ? 'border-red-500' : 'border-neutral-800'} text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none transition-colors`} disabled={isSubmittingDelivery} />
                  {formErrors.fullName && <p className="text-[10px] text-red-400 font-mono-brand">{formErrors.fullName}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono-brand uppercase tracking-wider text-neutral-400">Téléphone <span className="text-red-400">*</span></label>
                  <input type="tel" value={deliveryFormData.phone} onChange={(e) => setDeliveryFormData({...deliveryFormData, phone: e.target.value})} placeholder="Ex: 07 67 89 10 11" className={`w-full bg-black border ${formErrors.phone ? 'border-red-500' : 'border-neutral-800'} text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none transition-colors`} disabled={isSubmittingDelivery} />
                  {formErrors.phone && <p className="text-[10px] text-red-400 font-mono-brand">{formErrors.phone}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono-brand uppercase tracking-wider text-neutral-400">Ville <span className="text-red-400">*</span></label>
                <input type="text" value={deliveryFormData.city} onChange={(e) => setDeliveryFormData({...deliveryFormData, city: e.target.value})} placeholder="Ex: Abidjan, Cocody" className={`w-full bg-black border ${formErrors.city ? 'border-red-500' : 'border-neutral-800'} text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none transition-colors`} disabled={isSubmittingDelivery} />
                {formErrors.city && <p className="text-[10px] text-red-400 font-mono-brand">{formErrors.city}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono-brand uppercase tracking-wider text-neutral-400">Adresse de livraison <span className="text-red-400">*</span></label>
                <textarea value={deliveryFormData.deliveryAddress} onChange={(e) => setDeliveryFormData({...deliveryFormData, deliveryAddress: e.target.value})} placeholder="Ex: Résidence des Palmiers, Appartement 12, Rue du Commerce" rows={2} className={`w-full bg-black border ${formErrors.deliveryAddress ? 'border-red-500' : 'border-neutral-800'} text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none transition-colors resize-none`} disabled={isSubmittingDelivery} />
                {formErrors.deliveryAddress && <p className="text-[10px] text-red-400 font-mono-brand">{formErrors.deliveryAddress}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono-brand uppercase tracking-wider text-neutral-400">Instructions supplémentaires</label>
                <textarea value={deliveryFormData.deliveryInstructions} onChange={(e) => setDeliveryFormData({...deliveryFormData, deliveryInstructions: e.target.value})} placeholder="Ex: Sonner 3 fois, porte bleue au fond de la cour" rows={2} className="w-full bg-black border border-neutral-800 text-white text-xs p-3 font-mono-brand focus:border-white focus:outline-none transition-colors resize-none" disabled={isSubmittingDelivery} />
              </div>

              <div className="p-4 bg-black border border-neutral-800 space-y-1.5">
                <span className="text-[10px] font-mono-brand uppercase tracking-wider text-neutral-400 block">Résumé de la commande</span>
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs gap-4">
                    <span className="text-neutral-400">{item.product.name} × {item.quantity}</span>
                    <span className="text-white font-bold whitespace-nowrap">{(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs border-t border-neutral-800 pt-1.5 mt-1 font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-white">{totalAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowDeliveryForm(false)} className="flex-1 py-3 border border-neutral-800 text-neutral-400 text-xs font-mono-brand uppercase tracking-wider hover:text-white hover:border-neutral-600 transition-colors" disabled={isSubmittingDelivery}>Annuler</button>
                <button type="submit" className="flex-1 py-3 bg-white text-black font-display text-xs uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2" disabled={isSubmittingDelivery}>
                  <Check className="w-4 h-4" />
                  <span>Continuer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Même choix de paiement que la fiche produit */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[56] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !isOrdering && setShowPaymentModal(false)}>
          <div className="w-full max-w-md bg-[#0D0D0D] border border-white/20 p-6 shadow-2xl text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-5">
              <span className="font-display text-base uppercase tracking-wider">MODE DE PAIEMENT</span>
              <button onClick={() => !isOrdering && setShowPaymentModal(false)} className="text-neutral-400 hover:text-white disabled:opacity-40" disabled={isOrdering}><X className="w-4 h-4" /></button>
            </div>

            <p className="text-xs text-neutral-400 font-sans leading-relaxed mb-5">
              Choisis comment tu veux payer ta commande de <span className="text-white">{cart.length} article{cart.length > 1 ? 's' : ''}</span> ({totalAmount.toLocaleString('fr-FR')} {settings.currency}).
            </p>

            <div className="flex flex-col gap-3">
              <button onClick={() => processOrder('cod')} disabled={isOrdering || isSubmittingDelivery} className="w-full flex items-center gap-4 border border-neutral-800 hover:border-white bg-black px-4 py-4 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <div className="w-10 h-10 flex items-center justify-center bg-neutral-900 border border-neutral-800">
                  {processingMethod === 'cod' ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Banknote className="w-4 h-4 text-white" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest">Paiement à la livraison</span>
                  <span className="text-[11px] text-neutral-500 font-mono-brand">Tu payes en espèces à la réception</span>
                </div>
              </button>

              <button onClick={() => processOrder('wave')} disabled={isOrdering || isSubmittingDelivery} className="w-full flex items-center gap-4 border border-neutral-800 hover:border-white bg-black px-4 py-4 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <div className="w-10 h-10 flex items-center justify-center bg-neutral-900 border border-neutral-800">
                  {processingMethod === 'wave' ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Smartphone className="w-4 h-4 text-white" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest">Payer avec Wave</span>
                  <span className="text-[11px] text-neutral-500 font-mono-brand">Redirection vers Wave, puis retour ici</span>
                </div>
              </button>
            </div>

            <p className="text-[10px] text-neutral-500 font-mono-brand mt-5 text-center">Une fois le paiement confirmé, tu seras redirigé vers WhatsApp pour finaliser.</p>
          </div>
        </div>
      )}

      {/* Même confirmation Wave que la fiche produit */}
      {showWhatsAppContinue && pendingWhatsAppUrl && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-white/20 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-center mb-5">
              <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-display text-xl uppercase tracking-wider mb-3">Paiement Wave terminé ?</h3>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed mb-6">Si tu as terminé ton paiement sur Wave, clique sur le bouton ci-dessous pour finaliser ta commande avec WhatsApp.</p>
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
              <p className="text-[10px] text-neutral-600 font-mono-brand mt-4">Ta commande a déjà été enregistrée.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
