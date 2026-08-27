import { removeSubscriptionByEndpoint } from '../../lib/push.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { endpoint, fcmToken } = req.body || {};
    const removed = await removeSubscriptionByEndpoint(endpoint, fcmToken);
    return res.status(200).json({ success: true, removed });
  } catch (error: any) {
    console.error('Push unsubscribe error:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Unable to unsubscribe.' });
  }
}
