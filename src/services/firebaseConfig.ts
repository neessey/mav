// firebaseConfig.ts - Ajout des fonctions d'authentification

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
  getDoc,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  signOut,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
  onAuthStateChanged,
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

// Collection de référence pour les admins
const ADMIN_COLLECTION = 'adminUsers';

export const FirebaseService = {
  isConfigured: (): boolean => {
    return Boolean(
      firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
    );
  },

  // =========================
  // AUTHENTIFICATION
  // =========================

  // Vérifier si un email est autorisé comme admin
 checkAdminEmail: async (email: string): Promise<boolean> => {
  try {
    const adminRef = collection(db, ADMIN_COLLECTION);
    const q = query(adminRef, orderBy('email'));
    const snapshot = await getDocs(q);

    const admins = snapshot.docs.map(doc => doc.data());

    console.log('Admins Firestore:', admins);
    console.log('Email recherché:', email);

    return admins.some(
      admin => admin.email?.trim().toLowerCase() === email.trim().toLowerCase()
    );
  } catch (error) {
    console.error('Erreur vérification admin:', error);
    throw error; // IMPORTANT : ne masque plus l'erreur
  }
},

  // Ajouter un admin (réservé)
  addAdmin: async (email: string, role: string = 'admin'): Promise<void> => {
    try {
      const adminRef = collection(db, ADMIN_COLLECTION);
      await addDoc(adminRef, {
        email,
        role,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erreur ajout admin:', error);
      throw error;
    }
  },

  // Connexion
  signIn: async (email: string, password: string): Promise<User> => {
    try {
      // Vérifier d'abord si l'email est autorisé
      const isAdmin = await FirebaseService.checkAdminEmail(email);
      if (!isAdmin) {
        throw new Error('Email non autorisé. Contactez l\'administrateur.');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Erreur connexion:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Email ou mot de passe incorrect.');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Format d\'email invalide.');
      }
      throw new Error(error.message || 'Erreur de connexion.');
    }
  },

  // Créer un compte admin (premier setup)
  signUpAdmin: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Ajouter l'email à la liste des admins
      await FirebaseService.addAdmin(email, 'admin');
      
      return userCredential.user;
    } catch (error: any) {
      console.error('Erreur création admin:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Cet email est déjà utilisé.');
      }
      throw new Error(error.message || 'Erreur de création du compte.');
    }
  },

  // Changer le mot de passe
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('Utilisateur non connecté.');
      }

      // Réauthentifier l'utilisateur
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Changer le mot de passe
      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Erreur changement mot de passe:', error);
      if (error.code === 'auth/wrong-password') {
        throw new Error('Mot de passe actuel incorrect.');
      }
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Trop de tentatives. Réessayez plus tard.');
      }
      throw new Error(error.message || 'Erreur lors du changement de mot de passe.');
    }
  },

  // Réinitialiser le mot de passe (envoi email)
  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Erreur réinitialisation:', error);
      if (error.code === 'auth/user-not-found') {
        throw new Error('Aucun compte associé à cet email.');
      }
      throw new Error(error.message || 'Erreur d\'envoi de l\'email.');
    }
  },

  // Déconnexion
  signOut: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      throw error;
    }
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Observateur d'état d'authentification
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // =========================
  // PUSH NOTIFICATIONS
  // =========================

  requestPushPermission: async (): Promise<'granted' | 'denied' | 'default'> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  },

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
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item: any) => ({
      id: item.id,
      ...item.data(),
    }));
  },

  updateOrder: async (orderId: string, data: Record<string, any>) => {
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
    const q = query(productsRef, orderBy('createdAt', 'desc'));
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

  // =========================
  // SETTINGS
  // =========================

  getSettings: async () => {
    try {
      const settingsRef = doc(db, 'settings', 'brand');
      const snapshot = await getDoc(settingsRef);
      if (snapshot.exists()) {
        return snapshot.data();
      }
      return null;
    } catch (error) {
      console.error('Erreur récupération settings:', error);
      return null;
    }
  },

  saveSettings: async (settings: any) => {
    const settingsRef = doc(db, 'settings', 'brand');
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  },
};