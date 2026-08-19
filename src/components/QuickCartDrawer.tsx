import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, MessageCircle } from 'lucide-react';
import { useStore } from '../services/store';
import { PageView } from '../types';
import confetti from 'canvas-confetti';

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
    formatWhatsAppCartCheckoutUrl
  } = useStore();
  const [customerName, setCustomerName] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Abidjan');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleWhatsAppCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#ffffff', '#22c55e', '#a3a3a3']
    });

    try {
      // 1. Create order in backend/Firestore (triggers push notification to admin device)
      const order = await createOrder({
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          size: item.selectedSize,
          color: item.selectedColor,
          quantity: item.quantity,
          unitPrice: item.product.price,
          total: item.product.price * item.quantity,
          image: item.product.images[0]
        })),
        totalAmount,
        customerName: customerName || 'Client MAV',
        customerCity: deliveryCity,
        notes: `Commande Panier (${cart.length} pièces)`
      });

      // 2. Format customized WhatsApp URL with order reference
      const { url } = formatWhatsAppCartCheckoutUrl(cart, customerName, deliveryCity, order.id);

      // 3. Open WhatsApp
      window.open(url, '_blank', 'noopener,noreferrer');
      clearCart();
      onClose();
    } catch (e) {
      console.error('Cart order creation error:', e);
      const { url } = formatWhatsAppCartCheckoutUrl(cart, customerName, deliveryCity);
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
        {/* Header */}
        <div>
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="font-display  text-lg tracking-widest uppercase">
                MON PANIER ({cart.reduce((s, i) => s + i.quantity, 0)})
              </span>
            </div>
            <button
              id="cart-close-btn"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white border border-neutral-800 rounded-sm"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
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
                <div
                  key={item.id}
                  id={`cart-item-${item.id}`}
                  className="flex gap-4 p-3 bg-black border border-neutral-900"
                >
                  <div
                    onClick={() => {
                      onClose();
                      onNavigate('product', item.product.id);
                    }}
                    className="w-16 h-20 bg-neutral-900 shrink-0 border border-white/10 cursor-pointer overflow-hidden"
                  >
                    <img
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
                        <button
                          onClick={() => updateCartQty(item.id, -1)}
                          className="px-2 py-0.5 text-neutral-400 hover:text-white"
                          aria-label="Diminuer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono-brand text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.id, 1)}
                          className="px-2 py-0.5 text-neutral-400 hover:text-white"
                          aria-label="Augmenter"
                        >
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

        {/* Footer Checkout info */}
        {cart.length > 0 && (
          <div className="border-t border-neutral-800 pt-4 flex flex-col gap-4">
            {/* Delivery & details */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Votre nom complet"
                  className="w-1/2 bg-black border border-neutral-800 text-xs px-3 py-2 text-white font-mono-brand placeholder:text-neutral-600 focus:outline-none focus:border-white"
                />
                <select
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="w-1/2 bg-black border border-neutral-800 text-xs px-2 py-2 text-white font-mono-brand focus:outline-none focus:border-white"
                >
                  <option value="Abidjan (Cocody / Plateau / Marcory)">Abidjan (Toutes communes)</option>
                  <option value="Yamoussoukro / San Pedro / Bouaké">Intérieur Côte d'Ivoire</option>
                  <option value="International (France / USA / Afrique)">International (DHL)</option>
                </select>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline border-t border-neutral-900 pt-3">
              <span className="text-xs uppercase font-mono-brand text-neutral-400">TOTAL ESTIMÉ</span>
              <span className=" font-extrabold text-xl text-white">
                {totalAmount.toLocaleString('fr-FR')} {settings.currency}
              </span>
            </div>

            {/* Direct WhatsApp Checkout Button */}
            <button
              id="cart-whatsapp-checkout-btn"
              onClick={handleWhatsAppCheckout}
              className="w-full bg-white text-black font-bold text-xs uppercase tracking-widest py-3.5 flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-2xl"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>COMMANDER VIA WHATSAPP</span>
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
  );
};
