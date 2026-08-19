/**
 * Firebase integration service module for MARASSEURAVIE
 * Structured to seamlessly bind to Firebase Auth, Firestore and FCM when configured.
 */

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export const FirebaseService = {
  isConfigured: (): boolean => {
    return Boolean(
      typeof window !== 'undefined' &&
      (window as unknown as { __FIREBASE_CONFIG__?: FirebaseClientConfig }).__FIREBASE_CONFIG__
    );
  },

  // Push notification web permission handler
  requestPushPermission: async (): Promise<'granted' | 'denied' | 'default'> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  },

  // Push notification trigger
  sendLocalPush: (title: string, body: string, icon?: string, url?: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: icon || '/assets/logo.png',
          badge: '/assets/logo.png',
          tag: `mav-${Date.now()}`,
        });

        if (url) {
          notif.onclick = () => {
            window.focus();
            window.location.href = url;
          };
        }
      } catch (err) {
        console.warn('Local push notification error', err);
      }
    }
  }
};
