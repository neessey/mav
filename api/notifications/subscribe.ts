import { saveSubscription } from '../../lib/push';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { subscription, fcmToken, userAgent } = req.body || {};
    const id = await saveSubscription({ subscription, fcmToken, userAgent });
    return res.status(200).json({ success: true, id });
  } catch (error: any) {
    console.error('Push subscription error:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Unable to save subscription.' });
  }
}
