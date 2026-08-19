import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  getAuth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export { app };

export const FirebaseService = {
  isConfigured: (): boolean => {
    return Boolean(
      firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
    );
  },

  requestPushPermission: async (): Promise<
    'granted' | 'denied' | 'default'
  > => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window)
    ) {
      return 'denied';
    }

    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  },

  sendLocalPush: (
    title: string,
    body: string,
    icon?: string,
    url?: string
  ) => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
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
  },

  // =========================
  // ORDERS
  // =========================

  createOrder: async (order: any) => {
    const ordersRef = collection(db, 'orders');

    const now = new Date().toISOString();

    const orderToSave = {
      ...order,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(ordersRef, orderToSave);

    return {
      ...orderToSave,
      id: docRef.id,
    };
  },

  getOrders: async () => {
    const ordersRef = collection(db, 'orders');

    const q = query(
      ordersRef,
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((item:any) => ({
      id: item.id,
      ...item.data(),
    }));
  },

  updateOrder: async (
    orderId: string,
    data: Record<string, any>
  ) => {
    const orderRef = doc(db, 'orders', orderId);

    await updateDoc(orderRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  deleteOrder: async (orderId: string) => {
    const orderRef = doc(db, 'orders', orderId);

    await deleteDoc(orderRef);
  },

  // =========================
  // PRODUCTS
  // =========================
  // On utilise setDoc (pas addDoc) pour garder les IDs custom
  // (ex: mav-custom-172..., mav-knit-01) au lieu d'IDs générés par Firestore.

  saveProduct: async (product: any) => {
    const productRef = doc(db, 'products', product.id);

    const now = new Date().toISOString();

    const productToSave = {
      ...product,
      createdAt: product.createdAt || now,
      updatedAt: now,
    };

    await setDoc(productRef, productToSave, { merge: true });

    return {
      ...productToSave,
      id: product.id,
    };
  },

  getProducts: async () => {
    const productsRef = collection(db, 'products');

    const q = query(
      productsRef,
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((item: any) => ({
      id: item.id,
      ...item.data(),
    }));
  },

  deleteProduct: async (productId: string) => {
    const productRef = doc(db, 'products', productId);

    await deleteDoc(productRef);
  },
};