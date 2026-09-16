
import React, { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Détection iOS : iPhone, iPad, iPod
    const userAgent = window.navigator.userAgent.toLowerCase();

    const ios =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Détection : application déjà installée / ouverte en mode standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    // Si déjà installée, ne rien afficher
    if (isStandalone) {
      setShowBanner(false);
      return;
    }

    // iOS : beforeinstallprompt n'existe pas.
    // On affiche donc directement notre bannière.
    if (ios) {
      setIsIOS(true);

      // Petit délai pour éviter d'afficher la bannière brutalement
      const timer = window.setTimeout(() => {
        setShowBanner(true);
      }, 1000);

      return () => window.clearTimeout(timer);
    }

    // Android / navigateurs compatibles
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();

      const installEvent = e as BeforeInstallPromptEvent;

      setDeferredPrompt(installEvent);
      setIsIOS(false);
      setShowBanner(true);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    );

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    // ==========================================
    // iOS
    // ==========================================
    if (isIOS) {
      alert(
        "Pour installer MARASSEURAVIE sur votre iPhone :\n\n" +
        "1. Appuyez sur le bouton « Partager » de Safari.\n\n" +
        "2. Faites défiler le menu.\n\n" +
        "3. Appuyez sur « Sur l’écran d’accueil ».\n\n" +
        "4. Appuyez sur « Ajouter »."
      );

      return;
    }

    // ==========================================
    // Android / navigateurs compatibles
    // ==========================================
    if (deferredPrompt) {
      

    try {
      await deferredPrompt.prompt();

      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === 'accepted') {
        setShowBanner(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Erreur installation PWA:', error);
     } 
     return; 
    }
      setShowBanner(false);
  };

  const handleClose = () => {
    setShowBanner(false);

    // Pour éviter que la bannière réapparaisse immédiatement
    // pendant cette session.
    try {
      sessionStorage.setItem('mav_pwa_install_dismissed', 'true');
    } catch {
      // sessionStorage indisponible : on ignore
    }
  };

  // Rien à afficher
  if (!showBanner) return null;

  return (
    <aside
      id="pwa-install-banner"
      aria-label="Installation de l'application"
      className="
        fixed
        bottom-24
        left-4
        right-4
        sm:left-auto
        sm:right-6
        sm:w-96
        z-[9999]
        bg-[#0D0D0D]
        border
        border-white/20
        rounded-2xl
        p-4
        shadow-2xl
        flex
        items-center
        justify-between
        gap-3
        text-white
        animate-fadeIn
      "
    >
      <div className="flex items-center gap-3 min-w-0">
        <img
          src="/assets/logo.png"
          alt="MARASSEURAVIE Logo"
          className="w-9 h-9 object-contain shrink-0"
        />

        <div className="flex flex-col min-w-0">
          <span className="font-bold text-xs uppercase tracking-wider text-white">
            APPLICATION MARASSEURAVIE
          </span>

          <span className="text-[10px] text-neutral-400 font-mono-brand leading-relaxed">
            {isIOS
              ? "Ajouter à l'écran d'accueil pour un accès direct"
              : 'Installer pour un accès direct & alertes Drops'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          id="pwa-install-trigger-btn"
          onClick={handleInstallClick}
          className="
            bg-white
            text-black
            px-3
            py-1.5
            text-[11px]
            font-bold
            uppercase
            tracking-wider
            hover:bg-neutral-200
            transition-colors
            flex
            items-center
            gap-1.5
            shrink-0
          "
        >
          {isIOS ? (
            <Share className="w-3.5 h-3.5" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}

          <span>{isIOS ? 'INSTALLER' : 'INSTALLER'}</span>
        </button>

        <button
          onClick={handleClose}
          className="text-neutral-400 hover:text-white p-1"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
