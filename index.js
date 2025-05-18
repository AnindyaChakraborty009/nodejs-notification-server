const express = require('express');
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(express.json());

async function sendNotification(fcmToken, senderName, messageText) {
  const message = {
    notification: { title: senderName, body: messageText },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return { success: false, error };
  }
}

app.post('/send-notification', async (req, res) => {
  const { fcmToken, senderName, messageText } = req.body;
  if (!fcmToken || !senderName || !messageText) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const result = await sendNotification(fcmToken, senderName, messageText);
  if (result.success) {
    res.status(200).json({ message: 'Notification sent successfully' });
  } else {
    res.status(500).json({ error: 'Failed to send notification', details: result.error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
