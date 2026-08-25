// Push Notification and Order Service for MARASSEURAVIE PWA

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const PushNotificationService = {
  // Check if Push is supported in this browser
  isSupported: (): boolean => {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  },

  // Register main Service Worker
  registerServiceWorker: async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) return null;
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('🚀 Service Worker registered successfully:', reg.scope);
      return reg;
    } catch (err) {
      console.error('Service Worker registration failed:', err);
      return null;
    }
  },

  // Get current subscription status
  getSubscriptionStatus: async (): Promise<{
    isSupported: boolean;
    permission: NotificationPermission;
    isSubscribed: boolean;
  }> => {
    if (!PushNotificationService.isSupported()) {
      return {
        isSupported: false,
        permission: 'denied',
        isSubscribed: false
      };
    }

    const permission = Notification.permission;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      return {
        isSupported: true,
        permission,
        isSubscribed: !!sub
      };
    } catch {
      return {
        isSupported: true,
        permission,
        isSubscribed: false
      };
    }
  },

  // Subscribe Admin device to real Web Push / FCM
  subscribeAdminDevice: async (): Promise<{ success: boolean; message: string }> => {
    if (!PushNotificationService.isSupported()) {
      return { success: false, message: 'Les notifications Push ne sont pas supportées sur ce navigateur.' };
    }

    try {
      // 1. Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { success: false, message: 'Permission refusée par le navigateur.' };
      }

      // 2. Enregistrer puis récupérer le Service Worker
const registration = await PushNotificationService.registerServiceWorker();

if (!registration) {
  throw new Error('Impossible d’enregistrer le Service Worker /sw.js');
}

await navigator.serviceWorker.ready;

      // 3. Fetch server VAPID key
      const keyRes = await fetch('/api/notifications/vapid-public-key');
      const { publicKey } = await keyRes.json();

      if (!publicKey) {
        throw new Error('Clé VAPID publique introuvable');
      }

      // 4. Subscribe to Push Manager
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any
      });

      // 5. Send subscription payload to backend
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent
        })
      });

      const data = await res.json();
      if (data.success) {
        return { success: true, message: 'Appareil connecté aux notifications push réelles !' };
      } else {
        return { success: false, message: data.error || 'Erreur lors de la synchronisation serveur.' };
      }
    } catch (err: any) {
      console.error('Push subscription failed:', err);
      return { success: false, message: err.message || 'Échec de l’abonnement aux notifications.' };
    }
  },

  // Unsubscribe
  unsubscribeAdminDevice: async (): Promise<boolean> => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint })
        });
      }
      return true;
    } catch {
      return false;
    }
  },

  // Trigger test notification
  sendTestNotification: async () => {
    const res = await fetch('/api/notifications/test', { method: 'POST' });
    return await res.json();
  },

  // Broadcast push message from Admin
  sendBroadcast: async (title: string, message: string, imageUrl?: string, actionUrl?: string) => {
    const res = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, imageUrl, actionUrl })
    });
    return await res.json();
  }
};
