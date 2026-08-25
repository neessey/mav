// React is provided by the application runtime. Keep this import tolerant when
// this service is type-checked in environments without React's declarations.
// @ts-ignore TS2307: React may be unavailable to standalone type-checkers.
import { useState, useEffect } from 'react';
import {
  BrandSettings,
  Campaign,
  CartItem,
  Collection,
  Order,
  OrderStatus,
  Product,
  PushNotification
} from '../types';
import {
  INITIAL_CAMPAIGN,
  INITIAL_COLLECTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS
} from '../data/initialData';
import { FirebaseService } from './firebaseConfig';
import { set } from 'firebase/database';

const STORAGE_KEYS = {
  PRODUCTS: 'mav_products_v1',
  COLLECTIONS: 'mav_collections_v1',
  SETTINGS: 'mav_settings_v1',
  NOTIFICATIONS: 'mav_notifications_v1',
  ORDERS: 'mav_orders_v1',
  CAMPAIGN: 'mav_campaign_v1',
  CART: 'mav_cart_v1',
  WISHLIST: 'mav_wishlist_v1',
  ADMIN_AUTH: 'mav_admin_auth_v1',
};

// Seed initial orders for admin preview
const INITIAL_ORDERS: Order[] = [
  {
    id: 'MAV-2025-8921',
    items: [
      {
        productId: 'mav-knit-01',
        name: 'Tricot Signature Noir MAV',
        size: 'L',
        color: 'Noir Profond',
        quantity: 1,
        unitPrice: 45000,
        total: 45000,
        image: INITIAL_PRODUCTS[0]?.images[0]
      }
    ],
    totalAmount: 45000,
    status: 'NEW',
    customerName: 'Yanis Sey',
    customerPhone: '+225 07 89 21 00 12',
    customerCity: 'Abidjan (Cocody)',
    whatsappMessage: 'Bonjour MARASSEURAVIE, commande MAV-2025-8921...',
    whatsappUrl: 'https://wa.me/2250700000000',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    notes: 'Livraison express demandée pour samedi.'
  },
  {
    id: 'MAV-2025-7410',
    items: [
      {
        productId: 'mav-knit-02',
        name: 'Tricot Monogramme Blanc MAV',
        size: 'M',
        color: 'Blanc Craie',
        quantity: 2,
        unitPrice: 45000,
        total: 90000,
        image: INITIAL_PRODUCTS[1]?.images[0]
      }
    ],
    totalAmount: 90000,
    status: 'CONFIRMED',
    customerName: 'Marc A.',
    customerPhone: '+33 6 12 34 56 78',
    customerCity: 'Paris / Expédition DHL',
    whatsappMessage: 'Bonjour MARASSEURAVIE, commande MAV-2025-7410...',
    whatsappUrl: 'https://wa.me/2250700000000',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    notes: 'Paiement reçu via virement.'
  }
];

// Global event bus for cross-component reactive updates
const listeners = new Set<() => void>();

function notifyAll() {
  listeners.forEach(listener => listener());
}

// Local storage reader with fallback
function loadData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyAll();
  } catch (err) {
    console.error('Failed to save to local storage', err);
  }
}

// Store singleton API
export const StoreAPI = {
  getProducts: (): Product[] => loadData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  setProducts: (products: Product[]) => saveData(STORAGE_KEYS.PRODUCTS, products),
  
  getProductById: (id: string): Product | undefined => {
    const list = StoreAPI.getProducts();
    return list.find(p => p.id === id || p.slug === id);
  },

  // Charge les produits depuis Firestore et met à jour le cache local.
  // Le localStorage reste utilisé comme cache instantané au chargement
  // (comme pour les commandes) mais Firestore est la source de vérité.
  fetchBackendProducts: async (): Promise<Product[]> => {
    try {
      const products = await FirebaseService.getProducts();
      StoreAPI.setProducts(products);
      return products;
    } catch (error) {
      console.error('Erreur récupération produits Firestore:', error);
      return StoreAPI.getProducts();
    }
  },

  saveProduct: async (product: Product) => {
    try {
      const savedProduct = await FirebaseService.saveProduct(product);

      const list = StoreAPI.getProducts();
      const index = list.findIndex(p => p.id === savedProduct.id);
      let updatedProducts;
      if (index >= 0) {
        updatedProducts = [...list];
        updatedProducts[index] = savedProduct as Product;
      } else {
        updatedProducts = [...list, savedProduct as Product];
      }
      StoreAPI.setProducts(updatedProducts);

      return savedProduct;
    } catch (error) {
      console.error('Erreur Firestore (produit):', error);
      throw new Error('Impossible d\'enregistrer le produit. Veuillez réessayer.');
    }
  },

  deleteProduct: async (id: string) => {
    try {
      await FirebaseService.deleteProduct(id);
      const list = StoreAPI.getProducts().filter(p => p.id !== id);
      StoreAPI.setProducts(list);
    } catch (error) {
      console.error('Erreur suppression produit:', error);
      throw error;
    }
  },

  getCollections: (): Collection[] => loadData(STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS),
  setCollections: (collections: Collection[]) => saveData(STORAGE_KEYS.COLLECTIONS, collections),

  saveCollection: (collection: Collection) => {
    const list = StoreAPI.getCollections();
    const index = list.findIndex(c => c.id === collection.id);
    if (index >= 0) {
      list[index] = collection;
    } else {
      list.push(collection);
    }
    StoreAPI.setCollections([...list]);
  },

  deleteCollection: (id: string) => {
    const list = StoreAPI.getCollections().filter(c => c.id !== id);
    StoreAPI.setCollections(list);
  },

  getSettings: (): BrandSettings => loadData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
  setSettings: (settings: BrandSettings) => saveData(STORAGE_KEYS.SETTINGS, settings),

  getCampaign: (): Campaign => loadData(STORAGE_KEYS.CAMPAIGN, INITIAL_CAMPAIGN),
  setCampaign: (campaign: Campaign) => saveData(STORAGE_KEYS.CAMPAIGN, campaign),

  getNotifications: (): PushNotification[] => loadData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  setNotifications: (notifs: PushNotification[]) => saveData(STORAGE_KEYS.NOTIFICATIONS, notifs),

  addNotification: (notif: Omit<PushNotification, 'id' | 'date'>) => {
    const list = StoreAPI.getNotifications();
    const newNotif: PushNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      date: 'À l\'instant',
      sent: true,
    };
    StoreAPI.setNotifications([newNotif, ...list]);
    return newNotif;
  },

  // --- ORDERS MANAGEMENT ---
  getOrders: (): Order[] => loadData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS),
  setOrders: (orders: Order[]) => saveData(STORAGE_KEYS.ORDERS, orders),

 fetchBackendOrders: async (): Promise<Order[]> => {
  try {
    const orders = await FirebaseService.getOrders();

    StoreAPI.setOrders(orders);

    return orders;
  } catch (error) {
    console.error(
      'Erreur récupération commandes Firestore:',
      error
    );

    return StoreAPI.getOrders();
  }
  
},
createOrder: async (orderData: { items: any; totalAmount: any; customerName: any; customerPhone: any; customerCity: any; whatsappMessage: any; whatsappUrl: any; notes: any; }) => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const fallbackId = `MAV-${new Date().getFullYear()}-${randomSuffix}`;

  const order = {
    id: fallbackId,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    status: 'NEW' as const,
    customerName: orderData.customerName || 'Client MAV',
    customerPhone: orderData.customerPhone || '',
    customerCity: orderData.customerCity || 'Abidjan',
    whatsappMessage: orderData.whatsappMessage || '',
    whatsappUrl: orderData.whatsappUrl || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: orderData.notes || '',
  };

  try {
    const savedOrder = await FirebaseService.createOrder(order);

    // The order is stored in Firestore first. Then the server sends a real
    // Web Push notification to every admin device that enabled notifications.
    // A push-server failure must never make a successful customer order fail.
    try {
      const response = await fetch('/api/notifications/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: savedOrder }),
      });

      if (!response.ok) {
        console.warn('⚠️ Commande enregistrée, mais notification push non envoyée:', response.status);
      } else {
        const pushResult = await response.json();
        console.log('📲 Notification nouvelle commande:', pushResult);
      }
    } catch (pushError) {
      console.warn('⚠️ Commande enregistrée, serveur push indisponible:', pushError);
    }

    const currentOrders = StoreAPI.getOrders();

    StoreAPI.setOrders([
      savedOrder,
      ...currentOrders.filter((o) => o.id !== savedOrder.id),
    ]);

    return savedOrder;
  } catch (error) {
    console.error('Erreur Firestore:', error);

    throw new Error(
      'Impossible d’enregistrer la commande. Veuillez réessayer.'
    );
  }
  
},

updateOrderStatus: async (
  orderId: string,
  status: OrderStatus,
  notes?: string
) => {
  try {
    await FirebaseService.updateOrder(orderId, {
      status,
      ...(notes !== undefined ? { notes } : {}),
    });

    const list = StoreAPI.getOrders();
    const index = list.findIndex((o) => o.id === orderId);

    if (index >= 0) {
      list[index] = {
        ...list[index],
        status,
        ...(notes !== undefined ? { notes } : {}),
        updatedAt: new Date().toISOString(),
      };

      StoreAPI.setOrders([...list]);
    }
  } catch (error) {
    console.error(
      'Erreur mise à jour commande:',
      error
    );

    throw error;
  }
},

  deleteOrder: async (orderId: string) => {
  try {
    await FirebaseService.deleteOrder(orderId);

    const list = StoreAPI
      .getOrders()
      .filter((o) => o.id !== orderId);

    StoreAPI.setOrders(list);
  } catch (error) {
    console.error(
      'Erreur suppression commande:',
      error
    );

    throw error;
  }
},

  // --- CART MANAGEMENT ---
  getCart: (): CartItem[] => loadData(STORAGE_KEYS.CART, []),
  setCart: (cart: CartItem[]) => saveData(STORAGE_KEYS.CART, cart),

  addToCart: (product: Product, size: string, color: string, quantity = 1) => {
    const cart = StoreAPI.getCart();
    const cartItemId = `${product.id}-${size}-${color}`;
    const existingIndex = cart.findIndex(item => item.id === cartItemId);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: cartItemId,
        product,
        selectedSize: size,
        selectedColor: color,
        quantity
      });
    }
    StoreAPI.setCart([...cart]);
  },

  removeFromCart: (cartItemId: string) => {
    const cart = StoreAPI.getCart().filter(item => item.id !== cartItemId);
    StoreAPI.setCart(cart);
  },

  updateCartQty: (cartItemId: string, delta: number) => {
    const cart = StoreAPI.getCart();
    const index = cart.findIndex(item => item.id === cartItemId);
    if (index >= 0) {
      cart[index].quantity += delta;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
      StoreAPI.setCart([...cart]);
    }
  },

  clearCart: () => {
    StoreAPI.setCart([]);
  },

  getAdminAuth: () => loadData(STORAGE_KEYS.ADMIN_AUTH, { isAuthenticated: false, email: '' }),
  setAdminAuth: (auth: { isAuthenticated: boolean; email: string; uid?: string }) => saveData(STORAGE_KEYS.ADMIN_AUTH, auth),

  resetDefaults: () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.COLLECTIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CAMPAIGN);
    notifyAll();
  },

  // Generate customized WhatsApp order message with Order ID
  formatWhatsAppOrderUrl: (
    product: Product,
    size: string,
    color: string,
    quantity: number = 1,
    deliveryCity: string = 'Abidjan',
    orderId?: string
  ): { url: string; message: string } => {
    const settings = StoreAPI.getSettings();
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const priceTotal = (product.price * quantity).toLocaleString('fr-FR');
    const refText = orderId ? `\n• Réf. Commande : ${orderId}` : '';

    const message = `Bonjour MARASSEURAVIE,

Je souhaite passer commande pour la pièce suivante :
${refText}
• Produit : ${product.name}
• Taille : ${size}
• Couleur : ${color}
• Quantité : ${quantity}
• Montant : ${priceTotal} ${settings.currency}
• Ville de livraison : ${deliveryCity}

Merci de me confirmer la commande et les délais de livraison !`;

    const encoded = encodeURIComponent(message);
    return {
      url: `https://wa.me/${cleanNumber}?text=${encoded}`,
      message
    };
  },

  // Format WhatsApp cart checkout URL for multiple pieces
  formatWhatsAppCartCheckoutUrl: (
    items: CartItem[],
    customerName?: string,
    deliveryCity: string = 'Abidjan',
    orderId?: string
  ): { url: string; message: string } => {
    const settings = StoreAPI.getSettings();
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const total = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const refText = orderId ? `RÉFÉRENCE COMMANDE : ${orderId}\n---------------------------\n` : '';

    const itemsSummary = items
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.product.name} (Taille: ${item.selectedSize}, Couleur: ${item.selectedColor}, Qté: ${item.quantity}) — ${(item.product.price * item.quantity).toLocaleString('fr-FR')} ${settings.currency}`
      )
      .join('\n');

    const message = `Bonjour MARASSEURAVIE,

Je souhaite valider ma commande :

${refText}${itemsSummary}

---------------------------
TOTAL : ${total.toLocaleString('fr-FR')} ${settings.currency}
Livraison souhaitée : ${deliveryCity}${customerName ? `\nClient : ${customerName}` : ''}

Merci de me confirmer la prise en charge et le paiement !`;

    const encoded = encodeURIComponent(message);
    return {
      url: `https://wa.me/${cleanNumber}?text=${encoded}`,
      message
    };
  },

  formatWhatsAppConciergeUrl: (inquiryType = 'Général'): string => {
    const settings = StoreAPI.getSettings();
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const message = `Bonjour MARASSEURAVIE,\n\nJe vous contacte concernant : [${inquiryType}].\nJ'aimerais avoir plus de renseignements sur vos collections.`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  },


  signIn: async (email: string, password: string) => {
    try {
      const user = await FirebaseService.signIn(email, password);
      // Mettre à jour l'état admin
      StoreAPI.setAdminAuth({ 
        isAuthenticated: true, 
        email: user.email || '',
        uid: user.uid,
      });
      return user;
    } catch (error) {
      console.error('Erreur connexion:', error);
      throw error;
    }
  },

  signUpAdmin: async (email: string, password: string) => {
    try {
      const user = await FirebaseService.signUpAdmin(email, password);
      StoreAPI.setAdminAuth({ 
        isAuthenticated: true, 
        email: user.email || '',
        uid: user.uid,
      });
      return user;
    } catch (error) {
      console.error('Erreur création admin:', error);
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      await FirebaseService.changePassword(currentPassword, newPassword);
      return { success: true, message: 'Mot de passe changé avec succès.' };
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors du changement de mot de passe.');
    }
  },

  resetPassword: async (email: string) => {
    try {
      await FirebaseService.resetPassword(email);
      return { success: true, message: 'Email de réinitialisation envoyé.' };
    } catch (error: any) {
      throw new Error(error.message || 'Erreur d\'envoi de l\'email.');
    }
  },

  signOut: async () => {
    try {
      await FirebaseService.signOut();
      StoreAPI.setAdminAuth({ isAuthenticated: false, email: '', uid: '' });
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      throw error;
    }
  },

  getCurrentUser: () => {
    return FirebaseService.getCurrentUser();
  },

  onAuthStateChanged: (callback: (user: any) => void) => {
    return FirebaseService.onAuthStateChanged(callback);
  },

  // =========================
  // SETTINGS (Firestore)
  // =========================

  fetchBackendSettings: async () => {
    try {
      const settings = await FirebaseService.getSettings();
      if (settings) {
        StoreAPI.setSettings(settings as BrandSettings);
      }
      return settings;
    } catch (error) {
      console.error('Erreur récupération settings:', error);
      return StoreAPI.getSettings();
    }
  },

  saveSettingsToBackend: async (settings: BrandSettings) => {
    try {
      await FirebaseService.saveSettings(settings);
      StoreAPI.setSettings(settings);
      return settings;
    } catch (error) {
      console.error('Erreur sauvegarde settings:', error);
      throw error;
    }
  },

};

// React Hook to access synchronized reactive state
export function useStore() {
  const [, setVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setVersion((v: number) => v + 1);
    listeners.add(handleUpdate);
    
    // Initial fetch
    StoreAPI.fetchBackendOrders();
    StoreAPI.fetchBackendProducts();
    StoreAPI.fetchBackendSettings();
    
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    products: StoreAPI.getProducts(),
    collections: StoreAPI.getCollections(),
    settings: StoreAPI.getSettings(),
    campaign: StoreAPI.getCampaign(),
    notifications: StoreAPI.getNotifications(),
    orders: StoreAPI.getOrders(),
    cart: StoreAPI.getCart(),
    adminAuth: StoreAPI.getAdminAuth(),
    saveProduct: StoreAPI.saveProduct,
    deleteProduct: StoreAPI.deleteProduct,
    fetchBackendProducts: StoreAPI.fetchBackendProducts,
    saveCollection: StoreAPI.saveCollection,
    deleteCollection: StoreAPI.deleteCollection,
    setSettings: StoreAPI.setSettings,
    setCampaign: StoreAPI.setCampaign,
    addNotification: StoreAPI.addNotification,
    createOrder: StoreAPI.createOrder,
    updateOrderStatus: StoreAPI.updateOrderStatus,
    deleteOrder: StoreAPI.deleteOrder,
    fetchBackendOrders: StoreAPI.fetchBackendOrders,
    addToCart: StoreAPI.addToCart,
    removeFromCart: StoreAPI.removeFromCart,
    updateCartQty: StoreAPI.updateCartQty,
    clearCart: StoreAPI.clearCart,
    setAdminAuth: StoreAPI.setAdminAuth,
    resetDefaults: StoreAPI.resetDefaults,
    formatWhatsAppOrderUrl: StoreAPI.formatWhatsAppOrderUrl,
    formatWhatsAppCartCheckoutUrl: StoreAPI.formatWhatsAppCartCheckoutUrl,
    formatWhatsAppConciergeUrl: StoreAPI.formatWhatsAppConciergeUrl,
    signIn: StoreAPI.signIn,
    signUpAdmin: StoreAPI.signUpAdmin,
    changePassword: StoreAPI.changePassword,
    resetPassword: StoreAPI.resetPassword,
    signOut: StoreAPI.signOut,
    getCurrentUser: StoreAPI.getCurrentUser,
    onAuthStateChanged: StoreAPI.onAuthStateChanged,
    
    // Settings Firestore
    fetchBackendSettings: StoreAPI.fetchBackendSettings,
    saveSettingsToBackend: StoreAPI.saveSettingsToBackend,
  };
}