import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Pour installer l'application MARASSEURAVIE sur votre écran d'accueil :\n- iOS (Safari) : Cliquez sur Partager puis « Sur l'écran d'accueil »\n- Android (Chrome) : Cliquez sur Menu (⋮) puis « Installer l'application »");
      setShowBanner(false);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
      }
    } catch {
      setShowBanner(false);
    }
  };

  if (!showBanner) return null;

  return (
    <aside
      id="pwa-install-banner"
      aria-label="Installation de l'application"
      className="fixed bottom-24 left-6 right-6 sm:left-auto sm:right-6 sm:w-96 z-40 bg-[#0D0D0D] border border-white/20 p-4 shadow-2xl flex items-center justify-between gap-3 text-white animate-fadeIn"
    >
      <div className="flex items-center gap-3">
        <img
          src="/assets/logo.png"
          alt="MARASSEURAVIE Logo"
          className="w-9 h-9 object-contain"
        />
        <div className="flex flex-col">
          <span className="font-bold text-xs uppercase tracking-wider text-white">
            APPLICATION MARASSEURAVIE
          </span>
          <span className="text-[10px] text-neutral-400 font-mono-brand">
            Installer pour un accès direct & alertes Drops
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          id="pwa-install-trigger-btn"
          onClick={handleInstallClick}
          className="bg-white text-black px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>INSTALLER</span>
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="text-neutral-400 hover:text-white p-1"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
