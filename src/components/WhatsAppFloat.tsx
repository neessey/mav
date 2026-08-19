import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, ShoppingBag } from 'lucide-react';
import { useStore } from '../services/store';
import { PageView } from '../types';

interface WhatsAppFloatProps {
  onNavigate: (page: PageView, productId?: string) => void;
}

export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({ onNavigate }) => {
  const { settings, products } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const featuredKnit = products.find(p => p.category === 'tricots' && p.status === 'available') || products[0];

  const handleSendDirect = (messageText: string) => {
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleQuickQuestion = (topic: string) => {
    const message = `Bonjour MARASSEURAVIE,\n\nJe souhaite obtenir des informations concernant : ${topic}.\nMerci d'avance pour votre retour !`;
    handleSendDirect(message);
  };

  return (
    <div id="whatsapp-float-container" className="fixed bottom-6 right-6 z-40">
      {/* Floating Popup Modal */}
      {isOpen && (
        <div
          id="whatsapp-chat-popup"
          className="absolute bottom-16 right-0 w-[320px] sm:w-[360px] bg-[#0D0D0D] border border-white/20 shadow-2xl p-5 text-white animate-fadeIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-black text-xs font-display">
                MAV
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                  SERVICE CLIENT MAV
                </h4>
                <span className="text-[10px] text-emerald-400 font-mono-brand flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  DISPONIBLE SUR WHATSAPP
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white p-1"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-3">
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Passez votre commande directement ou échangez avec un conseiller MARASSEURAVIE.
            </p>

            {/* Quick Action Pills */}
            <div className="flex flex-col gap-2 pt-1">
              {featuredKnit && (
                <button
                  id="wa-quick-order-knit"
                  onClick={() => {
                    const msg = `Bonjour MARASSEURAVIE, je souhaite commander le ${featuredKnit.name} en taille M.`;
                    handleSendDirect(msg);
                  }}
                  className="text-left text-xs bg-black/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-white p-2.5 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
                    <span className="font-medium text-white truncate max-w-[220px]">
                      Commander {featuredKnit.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-brand text-neutral-400">→</span>
                </button>
              )}

              <button
                id="wa-quick-sizes"
                onClick={() => handleQuickQuestion('Guide des tailles et essayage à Abidjan')}
                className="text-left text-xs bg-black/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-white p-2.5 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
                  <span className="font-medium text-white">Guide des tailles & essayage</span>
                </div>
                <span className="text-[10px] font-mono-brand text-neutral-400">→</span>
              </button>

              <button
                id="wa-quick-delivery"
                onClick={() => handleQuickQuestion('Délais et zones de livraison')}
                className="text-left text-xs bg-black/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-white p-2.5 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
                  <span className="font-medium text-white">Livraison Abidjan & International</span>
                </div>
                <span className="text-[10px] font-mono-brand text-neutral-400">→</span>
              </button>
            </div>

            {/* Custom Input */}
            <div className="pt-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  placeholder="Écrire votre message..."
                  className="bg-[#050505] border border-neutral-800 text-white text-xs px-3 py-2 flex-1 focus:outline-none focus:border-white font-mono-brand placeholder:text-neutral-600"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customMsg.trim()) {
                      handleSendDirect(customMsg);
                    }
                  }}
                />
                <button
                  id="wa-popup-send-btn"
                  onClick={() => {
                    if (customMsg.trim()) handleSendDirect(customMsg);
                  }}
                  className="bg-white text-black px-3 py-2 text-xs font-bold hover:bg-neutral-200 transition-colors"
                  aria-label="Envoyer sur WhatsApp"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        id="whatsapp-floating-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-13 h-13 bg-white text-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none"
        aria-label="Contacter sur WhatsApp"
        title="Commander sur WhatsApp"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-black" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-black fill-current" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />
          </>
        )}
      </button>
    </div>
  );
};
