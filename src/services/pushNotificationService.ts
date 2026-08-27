// Real Web Push client for MARASSEURAVIE.
// Important for iPhone/iPad: on iOS 16.4+, Web Push is supported for a Home Screen web app.

function normalizeVapidKey(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, '').replace(/\s+/g, '');
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export const PushNotificationService = {
  isSupported: (): boolean => {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window &&
      window.isSecureContext
    );
  },

  registerServiceWorker: async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) return null;
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  },

  getSubscriptionStatus: async () => {
    if (!PushNotificationService.isSupported()) {
      return { isSupported: false, permission: 'denied' as NotificationPermission, isSubscribed: false };
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return {
        isSupported: true,
        permission: Notification.permission,
        isSubscribed: !!subscription,
      };
    } catch {
      return {
        isSupported: true,
        permission: Notification.permission,
        isSubscribed: false,
      };
    }
  },

  subscribeAdminDevice: async (): Promise<{ success: boolean; message: string }> => {
    if (!PushNotificationService.isSupported()) {
      return { success: false, message: 'Les notifications Push ne sont pas supportées par ce navigateur.' };
    }

    if (isIOS() && !isStandalone()) {
      return {
        success: false,
        message: "Sur iPhone/iPad, ajoute MARASSEURAVIE à l'écran d'accueil puis ouvre l'application depuis son icône pour activer les notifications.",
      };
    }

    try {
      // Ask for permission directly from the Admin button click. Safari requires
      // notification permission / subscription flows to originate from a user gesture.
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { success: false, message: 'Permission de notification refusée.' };
      }

      const registration = await PushNotificationService.registerServiceWorker();
      if (!registration) throw new Error('Impossible d’enregistrer le Service Worker.');

      const keyResponse = await fetch('/api/notifications/vapid-public-key', { cache: 'no-store' });
      const keyData = await keyResponse.json();
      if (!keyResponse.ok || !keyData.publicKey) {
        throw new Error(keyData.error || 'Clé VAPID publique introuvable sur le serveur.');
      }

      // Safari accepts the standard Base64URL VAPID string directly. Using the
      // original string avoids the iOS "The string did not match the expected pattern"
      // error caused by malformed/incorrectly transformed keys.
      const publicKey = normalizeVapidKey(keyData.publicKey);
      if (!/^[-_A-Za-z0-9]+$/.test(publicKey)) {
        throw new Error('La clé VAPID publique reçue est invalide.');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });

      const saveResponse = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      const result = await saveResponse.json();
      if (!saveResponse.ok || !result.success) {
        throw new Error(result.error || 'Le serveur n’a pas enregistré cet appareil.');
      }

      return { success: true, message: 'Cet appareil reçoit maintenant les notifications push.' };
    } catch (error: any) {
      console.error('Push subscription failed:', error);
      return { success: false, message: error?.message || 'Échec de l’abonnement aux notifications.' };
    }
  },

  unsubscribeAdminDevice: async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return true;

      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      });
      return true;
    } catch (error) {
      console.error('Push unsubscribe failed:', error);
      return false;
    }
  },

  sendTestNotification: async () => {
    const response = await fetch('/api/notifications/test', { method: 'POST' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Le test push a échoué.');
    return data;
  },

  sendBroadcast: async (title: string, message: string, imageUrl?: string, actionUrl?: string) => {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, imageUrl, actionUrl }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'L’envoi du push a échoué.');
    return data;
  },
};
