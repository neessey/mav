import webpush from 'web-push';
import { createHash } from 'node:crypto';
import { getAdminDb } from './firebaseAdmin';
import type { DocumentReference } from 'firebase-admin/firestore';

export interface StoredSubscription {
  id: string;
  subscription?: webpush.PushSubscription;
  fcmToken?: string;
  createdAt?: string;
  updatedAt?: string;
  userAgent?: string;
}

function getVapidKeys() {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || 'mailto:contact@marasseuravie.com';

  if (!publicKey || !privateKey) {
    throw new Error('VAPID is not configured. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in Vercel.');
  }

  return { publicKey, privateKey, subject };
}

export function getVapidPublicKey() {
  return getVapidKeys().publicKey;
}

function configureWebPush() {
  const { publicKey, privateKey, subject } = getVapidKeys();
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export function subscriptionId(subscription?: webpush.PushSubscription, fcmToken?: string) {
  const key = subscription?.endpoint || fcmToken || '';
  if (!key) throw new Error('Missing push subscription endpoint or FCM token.');
  return createHash('sha256').update(key).digest('hex');
}

export async function saveSubscription(input: {
  subscription?: webpush.PushSubscription;
  fcmToken?: string;
  userAgent?: string;
}) {
  if (!input.subscription && !input.fcmToken) {
    throw new Error('Subscription or FCM token is required.');
  }

  const id = subscriptionId(input.subscription, input.fcmToken);
  const db = getAdminDb();
  await db.collection('pushSubscriptions').doc(id).set(
    {
      id,
      subscription: input.subscription || null,
      fcmToken: input.fcmToken || null,
      userAgent: input.userAgent || '',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    { merge: true },
  );

  return id;
}

export async function removeSubscriptionByEndpoint(endpoint?: string, fcmToken?: string) {
  const db = getAdminDb();
  const snapshot = await db.collection('pushSubscriptions').get();
  const batch = db.batch();
  let removed = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() as StoredSubscription;
    if (
      (endpoint && data.subscription?.endpoint === endpoint) ||
      (fcmToken && data.fcmToken === fcmToken)
    ) {
      batch.delete(doc.ref);
      removed++;
    }
  }

  if (removed) await batch.commit();
  return removed;
}

async function getSubscriptions() {
  const db = getAdminDb();
  const snapshot = await db.collection('pushSubscriptions').get();
  return snapshot.docs.map((doc) => ({
    docRef: doc.ref,
    data: doc.data() as StoredSubscription,
  }));
}

export async function sendNotificationToAdmins(payload: {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  actionUrl?: string;
  data?: Record<string, unknown>;
}) {
  configureWebPush();

  const actionUrl = payload.actionUrl || '/admin';
  const pushPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icon-192.svg',
    badge: payload.badge || '/icon-192.svg',
    ...(payload.image ? { image: payload.image } : {}),
    data: { url: actionUrl, ...(payload.data || {}) },
    tag: `mav-${Date.now()}`,
  });

  const subscriptions = await getSubscriptions();
  let sentCount = 0;
  const staleRefs: DocumentReference[] = [];

  await Promise.all(
    subscriptions.map(async ({ docRef, data }) => {
      if (!data.subscription?.endpoint) return;

      try {
        await webpush.sendNotification(data.subscription, pushPayload, {
          TTL: 60,
          urgency: 'high',
        });
        sentCount++;
      } catch (error: any) {
        const status = Number(error?.statusCode);
        console.error('Web Push error:', status || '', error?.body || error?.message || error);
        if (status === 404 || status === 410) staleRefs.push(docRef);
      }
    }),
  );

  if (staleRefs.length) {
    const db = getAdminDb();
    const batch = db.batch();
    staleRefs.forEach((ref) => batch.delete(ref));
    await batch.commit();
  }

  return { success: true, sentCount, removedStale: staleRefs.length };
}
