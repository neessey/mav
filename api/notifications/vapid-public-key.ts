import { getVapidPublicKey } from '../../lib/push.js';

export default async function handler(_req: any, res: any) {
  try {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ publicKey: await getVapidPublicKey() });
  } catch (error: any) {
    console.error('VAPID public key error:', error);
    return res.status(500).json({ error: error?.message || 'VAPID is not configured.' });
  }
}