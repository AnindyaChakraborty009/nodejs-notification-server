const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./whisperly-80933-firebase-adminsdk-fbsvc-c296a356b1.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(express.json()); // for parsing application/json

// Your existing notification function
async function sendNotification(fcmToken, senderName, messageText) {
  const message = {
    notification: {
      title: senderName,
      body: messageText,
    },
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

// ✅ Expose an HTTP endpoint
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

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
