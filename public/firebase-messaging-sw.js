importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBsGrY-AqYMoI70kT3WMxLgW0HwYA4KyaQ",
  authDomain: "livraison-c8498.firebaseapp.com",
  databaseURL: "https://livraison-c8498-default-rtdb.firebaseio.com",
  projectId: "livraison-c8498",
  storageBucket: "livraison-c8498.firebasestorage.app",
  messagingSenderId: "403240604780",
  appId: "1:403240604780:web:77d84ad03d68bdaddfb449",
  measurementId: "G-5YF89BZ5RY"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Express Notify';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'New notification received',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: payload.data?.tag || 'express-notify',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'View'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ],
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const url = event.notification.data?.url || '/';
      
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle push events (for devices that don't support FCM background)
self.addEventListener('push', (event) => {
  if (event.data) {
    const payload = event.data.json();
    const notificationTitle = payload.notification?.title || 'Express Notify';
    const notificationOptions = {
      body: payload.notification?.body || 'New notification received',
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      tag: payload.data?.tag || 'express-notify',
      requireInteraction: true,
      data: payload.data || {}
    };

    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  }
});
