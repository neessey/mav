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

const vapidSubject = process.env.VAPID_SUBJECT?.trim() || 'mailto:contact@marasseuravie.com';

// Module-level cache: survives across invocations on a warm serverless instance, so a cold
// start only costs one Firestore read/write and every warm request after that is instant.
let cachedVapidKeys: { publicKey: string; privateKey: string } | null = null;
let inFlightVapidKeys: Promise<{ publicKey: string; privateKey: string }> | null = null;

// Stable VAPID keypair, regardless of environment.
// 1. VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY env vars, if set (explicit override).
// 2. Otherwise Firestore (systemConfig/vapidKeys) — generated once, then reused forever.
//    This is required on Vercel: serverless functions have no persistent/writable local
//    filesystem between invocations, so a keypair that lived only in a local file would be
//    regenerated (or simply missing) on every cold start, silently breaking every existing
//    push subscription (webpush.sendNotification then fails with 401/403).
async function getVapidKeys(): Promise<{ publicKey: string; privateKey: string }> {
  const envPublicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const envPrivateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  if (envPublicKey && envPrivateKey) {
    return { publicKey: envPublicKey, privateKey: envPrivateKey };
  }

  if (cachedVapidKeys) return cachedVapidKeys;
  if (inFlightVapidKeys) return inFlightVapidKeys;

  inFlightVapidKeys = (async () => {
    const db = getAdminDb();
    const docRef = db.collection('systemConfig').doc('vapidKeys');
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data() as { publicKey: string; privateKey: string };
      if (data?.publicKey && data?.privateKey) {
        cachedVapidKeys = { publicKey: data.publicKey, privateKey: data.privateKey };
        return cachedVapidKeys;
      }
    }
    // Nothing stored yet: generate once and persist so every future invocation/deploy reuses it.
    const generated = webpush.generateVAPIDKeys();
    await docRef.set({ ...generated, createdAt: new Date().toISOString() });
    cachedVapidKeys = generated;
    return generated;
  })();

  try {
    return await inFlightVapidKeys;
  } finally {
    inFlightVapidKeys = null;
  }
}

export async function getVapidPublicKey() {
  return (await getVapidKeys()).publicKey;
}

async function configureWebPush() {
  const { publicKey, privateKey } = await getVapidKeys();
  webpush.setVapidDetails(vapidSubject, publicKey, privateKey);
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
  await configureWebPush();

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
        // 404/410 = subscription gone. 401/403 = this subscription was created against a VAPID
        // key that no longer matches the current one — also unrecoverable, clean it up too.
        if ([401, 403, 404, 410].includes(status)) staleRefs.push(docRef);
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