import { sendNotificationToAdmins } from '../../lib/push.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const result = await sendNotificationToAdmins({
      title: '🔔 Test — MARASSEURAVIE',
      body: 'Les notifications push  sont activées sur cet appareil.',
      actionUrl: '/admin',
    });
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Push test error:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Push test failed.' });
  }
}
