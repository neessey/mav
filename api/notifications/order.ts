import { sendNotificationToAdmins } from '../../lib/push.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const order = req.body?.order;
    if (!order?.id) return res.status(400).json({ success: false, error: 'Order is required.' });

    const firstItem = order.items?.[0];
    const itemCount = Array.isArray(order.items)
      ? order.items.reduce((sum: number, item: any) => sum + Number(item.quantity || 1), 0)
      : 1;
    const productLabel = firstItem
      ? `${firstItem.name} (Taille ${firstItem.size || 'M'})`
      : 'Vêtement MARASSEURAVIE';
    const total = Number(order.totalAmount || 0).toLocaleString('fr-FR');

    const result = await sendNotificationToAdmins({
      title: '🛍️ Nouvelle commande ',
      body: `${productLabel} × ${itemCount} • Total : ${total} FCFA`,
      image: firstItem?.image,
      actionUrl: `/admin/orders/${encodeURIComponent(order.id)}`,
      data: { orderId: order.id, customerName: order.customerName || '' },
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('New order push error:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Push failed.' });
  }
}