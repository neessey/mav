import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import webpush from 'web-push';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { createHash } from 'crypto';

// Initialize data storage directory
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'push_subscriptions.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

// Helper to load/save JSON data
function loadJson<T>(file: string, fallback: T): T {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
  } catch (e) {
    console.error(`Error loading ${file}:`, e);
  }
  return fallback;
}

function saveJson<T>(file: string, data: T) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Error saving ${file}:`, e);
  }
}

// In-memory + persisted stores
interface StoredSubscription {
  id: string;
  subscription?: webpush.PushSubscription;
  fcmToken?: string;
  createdAt: string;
  userAgent?: string;
}

let orders: any[] = loadJson(ORDERS_FILE, []);
let subscriptions: StoredSubscription[] = loadJson(SUBSCRIPTIONS_FILE, []);
let notificationLogs: any[] = loadJson(NOTIFICATIONS_FILE, []);

// VAPID Keys Setup for Web Push
let vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
let vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contact@marasseuravie.com';

if (!vapidPublicKey || !vapidPrivateKey) {
  const vapidKeysFile = path.join(DATA_DIR, 'vapid.json');
  const storedKeys = loadJson<{ publicKey: string; privateKey: string } | null>(vapidKeysFile, null);
  if (storedKeys && storedKeys.publicKey && storedKeys.privateKey) {
    vapidPublicKey = storedKeys.publicKey;
    vapidPrivateKey = storedKeys.privateKey;
  } else {
    const generated = webpush.generateVAPIDKeys();
    vapidPublicKey = generated.publicKey;
    vapidPrivateKey = generated.privateKey;
    saveJson(vapidKeysFile, generated);
    console.log('✨ Generated persistent VAPID keys for Web Push');
  }
}

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
console.log(`🔐 Web Push VAPID ready: ${vapidPublicKey.slice(0, 12)}…`);

// Optional Firebase Admin Initialization (Lazy & safe)
let isFirebaseAdminReady = false;
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }
    isFirebaseAdminReady = true;
    console.log('🔥 Firebase Admin SDK initialized successfully');
  } catch (err) {
    console.warn('Firebase Admin init warning:', err);
  }
}


// Firestore is used for push subscriptions in production so a server restart/redeploy
// does not silently erase the devices that are subscribed to notifications.
function subscriptionDocId(subscription?: webpush.PushSubscription, fcmToken?: string) {
  const key = subscription?.endpoint || fcmToken || '';
  return createHash('sha256').update(key).digest('hex');
}

async function getStoredSubscriptions(): Promise<StoredSubscription[]> {
  if (isFirebaseAdminReady) {
    try {
      const snapshot = await getFirestore().collection('pushSubscriptions').get();
      return snapshot.docs.map((d) => d.data() as StoredSubscription);
    } catch (error) {
      console.warn('Firestore push subscriptions read failed; using local store:', error);
    }
  }
  return subscriptions;
}

async function upsertStoredSubscription(sub: StoredSubscription) {
  if (isFirebaseAdminReady) {
    try {
      const id = subscriptionDocId(sub.subscription, sub.fcmToken);
      await getFirestore().collection('pushSubscriptions').doc(id).set(
        { ...sub, id, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      return;
    } catch (error) {
      console.warn('Firestore push subscription write failed; using local store:', error);
    }
  }

  const endpointKey = sub.subscription?.endpoint || sub.fcmToken;
  const existingIndex = subscriptions.findIndex(
    (item) => (item.subscription?.endpoint || item.fcmToken) === endpointKey
  );
  if (existingIndex >= 0) subscriptions[existingIndex] = sub;
  else subscriptions.push(sub);
  saveJson(SUBSCRIPTIONS_FILE, subscriptions);
}

async function removeStoredSubscriptions(predicate: (sub: StoredSubscription) => boolean) {
  if (isFirebaseAdminReady) {
    try {
      const snapshot = await getFirestore().collection('pushSubscriptions').get();
      const batch = getFirestore().batch();
      snapshot.docs.forEach((d) => {
        if (predicate(d.data() as StoredSubscription)) batch.delete(d.ref);
      });
      await batch.commit();
      return;
    } catch (error) {
      console.warn('Firestore push subscription delete failed; using local store:', error);
    }
  }

  subscriptions = subscriptions.filter((sub) => !predicate(sub));
  saveJson(SUBSCRIPTIONS_FILE, subscriptions);
}

// Push notification sender to all registered admin devices
async function sendNotificationToAdmins(payload: {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  actionUrl?: string;
  data?: any;
}) {
  const notifId = `notif-${Date.now()}`;
  const actionUrl = payload.actionUrl || '/admin/orders';

  const notificationRecord = {
    id: notifId,
    title: payload.title,
    message: payload.body,
    imageUrl: payload.image,
    actionUrl: actionUrl,
    date: new Date().toISOString(),
    sentCount: 0,
    badge: 'NEW ORDER'
  };

  const payloadString = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/assets/logo.png',
    badge: payload.badge || '/assets/logo.png',
    image: payload.image,
    data: {
      url: actionUrl,
      ...(payload.data || {})
    },
    tag: `mav-order-${Date.now()}`
  });

  const staleSubIds: string[] = [];
  let successfulSends = 0;
  const activeSubscriptions = await getStoredSubscriptions();

  // 1. Send via Web Push to every subscribed admin device.
  await Promise.all(
    activeSubscriptions.map(async (sub) => {
      if (sub.subscription?.endpoint) {
        try {
          await webpush.sendNotification(sub.subscription, payloadString);
          successfulSends++;
        } catch (err: any) {
          console.error('WebPush send error:', err?.statusCode || err?.message);
          // 404/410 means the browser subscription is no longer valid.
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            staleSubIds.push(sub.id);
          }
        }
      }
    })
  );

  // 2. Send via Firebase Cloud Messaging if tokens exist and Firebase Admin is ready
  const fcmTokens = activeSubscriptions.filter((s) => s.fcmToken).map((s) => s.fcmToken as string);
  if (isFirebaseAdminReady && fcmTokens.length > 0) {
    try {
      const response = await getMessaging().sendEachForMulticast({
        tokens: fcmTokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.image,
        },
        data: {
          url: actionUrl,
        },
      });
      successfulSends += response.successCount;
    } catch (fcmErr) {
      console.error('FCM Multicast error:', fcmErr);
    }
  }

  // Clean up expired subscriptions in the same storage used for registration.
  if (staleSubIds.length > 0) {
    await removeStoredSubscriptions((sub) => staleSubIds.includes(sub.id));
  }

  notificationRecord.sentCount = successfulSends;
  notificationLogs.unshift(notificationRecord);
  if (notificationLogs.length > 100) notificationLogs = notificationLogs.slice(0, 100);
  saveJson(NOTIFICATIONS_FILE, notificationLogs);

  console.log(`📡 Push sent to ${successfulSends} admin device(s) for "${payload.title}"`);
  return { success: true, sentCount: successfulSends };
}

// Function specifically triggered on new order creation
export async function sendNewOrderNotification(order: any) {
  const firstItem = order.items && order.items[0];
  const itemCount = order.items ? order.items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0) : 1;
  const productLabel = firstItem ? `${firstItem.name} (Taille ${firstItem.size || 'M'})` : 'Vêtement MARASSEURAVIE';

  const title = '🛍️ Nouvelle commande — MARASSEURAVIE';
  const body = `${productLabel} × ${itemCount} • Total : ${Number(order.totalAmount || 0).toLocaleString('fr-FR')} FCFA`;
  const actionUrl = `/admin/orders/${order.id}`;

  return await sendNotificationToAdmins({
    title,
    body,
    image: firstItem?.image,
    actionUrl,
    data: { orderId: order.id, customerName: order.customerName }
  });
}

// Express Server Assembly
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Health check & stats
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      orderCount: orders.length,
      subscriberCount: subscriptions.length,
      isFirebaseAdminReady,
    });
  });

  // VAPID Public Key endpoint for clients to subscribe to Web Push
  app.get('/api/notifications/vapid-public-key', (req, res) => {
    res.json({ publicKey: vapidPublicKey });
  });

  // Subscribe the current admin PWA/device to real Web Push.
  app.post('/api/notifications/subscribe', async (req, res) => {
    try {
      const { subscription, fcmToken, userAgent } = req.body;
      if (!subscription && !fcmToken) {
        return res.status(400).json({ error: 'Subscription or FCM Token is required' });
      }

      const subObject: StoredSubscription = {
        id: subscriptionDocId(subscription, fcmToken),
        subscription,
        fcmToken,
        createdAt: new Date().toISOString(),
        userAgent: userAgent || req.headers['user-agent']
      };

      await upsertStoredSubscription(subObject);
      const count = (await getStoredSubscriptions()).length;

      console.log(`✅ Admin device subscribed to real Push. Total active subscribers: ${count}`);
      res.json({ success: true, totalSubscribers: count });
    } catch (error: any) {
      console.error('Push subscription error:', error);
      res.status(500).json({ success: false, error: error?.message || 'Unable to save push subscription' });
    }
  });

  // Unsubscribe this browser/device.
  app.post('/api/notifications/unsubscribe', async (req, res) => {
    try {
      const { endpoint, fcmToken } = req.body;
      await removeStoredSubscriptions(
        (sub) => sub.subscription?.endpoint === endpoint || sub.fcmToken === fcmToken
      );
      res.json({ success: true, totalSubscribers: (await getStoredSubscriptions()).length });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message || 'Unable to unsubscribe' });
    }
  });

  // Manual Push Broadcast from Admin
  app.post('/api/notifications/send', async (req, res) => {
    const { title, message, imageUrl, actionUrl } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const result = await sendNotificationToAdmins({
      title,
      body: message,
      image: imageUrl,
      actionUrl: actionUrl || '/shop'
    });

    res.json(result);
  });

  // Triggered by the storefront after an order is successfully saved in Firestore.
  // This keeps the notification system independent from the browser's Firestore rules.
  app.post('/api/notifications/order', async (req, res) => {
    try {
      const order = req.body?.order;
      if (!order?.id) {
        return res.status(400).json({ success: false, error: 'Order is required' });
      }

      const result = await sendNewOrderNotification(order);
      res.json(result);
    } catch (error: any) {
      console.error('New order push error:', error);
      res.status(500).json({ success: false, error: error?.message || 'Push failed' });
    }
  });

  // Test Push Notification trigger
  app.post('/api/notifications/test', async (req, res) => {
    const result = await sendNotificationToAdmins({
      title: '🔔 Test Notification — MARASSEURAVIE',
      body: 'Le système de notifications push en arrière-plan fonctionne parfaitement !',
      actionUrl: '/admin'
    });
    res.json(result);
  });

  // Get Notification History
  app.get('/api/notifications', (req, res) => {
    res.json(notificationLogs);
  });

  // --- ORDERS API ---

  // Create Order (Called right before WhatsApp opens)
  app.post('/api/orders', async (req, res) => {
    try {
      const { items, totalAmount, customerName, customerPhone, customerCity, whatsappMessage, whatsappUrl, notes } = req.body;

      // Generate distinctive Luxury Order ID
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderId = `MAV-${new Date().getFullYear()}-${randomSuffix}`;

      const newOrder = {
        id: orderId,
        items: items || [],
        totalAmount: Number(totalAmount) || 0,
        status: 'NEW',
        customerName: customerName || 'Client MAV',
        customerPhone: customerPhone || '',
        customerCity: customerCity || 'Abidjan',
        whatsappMessage: whatsappMessage || '',
        whatsappUrl: whatsappUrl || '',
        notes: notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      orders.unshift(newOrder);
      saveJson(ORDERS_FILE, orders);

      console.log(`📦 Order created: ${orderId} (${newOrder.totalAmount} FCFA)`);

      // Trigger instant Push Notification to Admin(s)
      sendNewOrderNotification(newOrder).catch((e) => console.error('Push trigger error:', e));

      res.status(201).json({
        success: true,
        orderId: newOrder.id,
        order: newOrder
      });
    } catch (err: any) {
      console.error('Error creating order:', err);
      res.status(500).json({ error: 'Failed to create order', details: err.message });
    }
  });

  // Get all orders
  app.get('/api/orders', (req, res) => {
    res.json(orders);
  });

  // Get single order
  app.get('/api/orders/:id', (req, res) => {
    const order = orders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  // Update order status or notes
  app.patch('/api/orders/:id', (req, res) => {
    const orderIndex = orders.findIndex((o) => o.id === req.params.id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { status, notes, customerName, customerPhone } = req.body;
    if (status) orders[orderIndex].status = status;
    if (notes !== undefined) orders[orderIndex].notes = notes;
    if (customerName) orders[orderIndex].customerName = customerName;
    if (customerPhone) orders[orderIndex].customerPhone = customerPhone;
    orders[orderIndex].updatedAt = new Date().toISOString();

    saveJson(ORDERS_FILE, orders);
    res.json({ success: true, order: orders[orderIndex] });
  });

  // Delete order
  app.delete('/api/orders/:id', (req, res) => {
    orders = orders.filter((o) => o.id !== req.params.id);
    saveJson(ORDERS_FILE, orders);
    res.json({ success: true });
  });

  // --- VITE SPA & STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MARASSEURAVIE server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
