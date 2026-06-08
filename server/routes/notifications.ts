import express from 'express';
import { db, messaging } from '../config/firebase';

const router = express.Router();

router.post('/subscribe', async (req, res) => {
  try {
    const { token, deviceInfo } = req.body;
    if (!token) return res.status(400).json({ error: 'FCM token is required' });
    await db.collection('subscribers').doc(token).set({
      token,
      deviceInfo: deviceInfo || 'unknown',
      subscribedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active'
    });
    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

router.post('/unsubscribe', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'FCM token is required' });
    await db.collection('subscribers').doc(token).update({
      status: 'inactive',
      unsubscribedAt: new Date().toISOString()
    });
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

router.post('/send', async (req, res) => {
  try {
    const { title, body, image, data } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });
    const subscribersSnapshot = await db.collection('subscribers')
      .where('status', '==', 'active').get();
    if (subscribersSnapshot.empty) return res.status(404).json({ error: 'No active subscribers found' });
    const tokens: string[] = [];
    subscribersSnapshot.forEach(doc => tokens.push(doc.data().token));
    const message = {
      notification: { title, body, imageUrl: image || undefined },
      data: data || {},
      tokens
    };
    const response = await messaging.sendEachForMulticast(message);
    const notificationId = Date.now().toString();
    await db.collection('notifications').doc(notificationId).set({
      id: notificationId, title, body,
      image: image || null, data: data || {},
      sentAt: new Date().toISOString(),
      totalRecipients: tokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
      status: 'sent'
    });
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) failedTokens.push(tokens[idx]);
      });
      for (const failedToken of failedTokens) {
        await db.collection('subscribers').doc(failedToken).update({
          status: 'invalid', lastError: new Date().toISOString()
        });
      }
    }
    res.json({
      success: true,
      message: 'Notification sent successfully',
      details: {
        totalSent: tokens.length,
        successCount: response.successCount,
        failureCount: response.failureCount
      }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const snapshot = await db.collection('notifications')
      .orderBy('sentAt', 'desc').limit(50).get();
    const notifications: any[] = [];
    snapshot.forEach(doc => notifications.push(doc.data()));
    res.json({ notifications });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch notification history' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const activeSnapshot = await db.collection('subscribers')
      .where('status', '==', 'active').get();
    const inactiveSnapshot = await db.collection('subscribers')
      .where('status', '==', 'inactive').get();
    const invalidSnapshot = await db.collection('subscribers')
      .where('status', '==', 'invalid').get();
    const notificationsSnapshot = await db.collection('notifications').get();
    res.json({
      totalSubscribers: activeSnapshot.size,
      inactiveSubscribers: inactiveSnapshot.size,
      invalidTokens: invalidSnapshot.size,
      totalNotifications: notificationsSnapshot.size
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;