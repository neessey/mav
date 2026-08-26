import { getVapidPublicKey } from '../../lib/push';

export default function handler(_req: any, res: any) {
  try {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ publicKey: getVapidPublicKey() });
  } catch (error: any) {
    console.error('VAPID public key error:', error);
    return res.status(500).json({ error: error?.message || 'VAPID is not configured.' });
  }
}
