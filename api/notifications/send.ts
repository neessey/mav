import { sendNotificationToAdmins } from '../../lib/push.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { title, message, imageUrl, actionUrl } = req.body || {};
    if (!title || !message) return res.status(400).json({ error: 'Title and message are required.' });
    const result = await sendNotificationToAdmins({
      title,
      body: message,
      image: imageUrl,
      actionUrl: actionUrl || '/admin',
    });
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Broadcast push error:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Push failed.' });
  }
}