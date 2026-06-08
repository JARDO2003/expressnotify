import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

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

const VAPID_KEY = "BGL6IVuJSbQjI69fot6FvfGEBmq1t4_hPP1Dhx_KYiIEFCrOLjtYFWjID_MlteNgJtm7FFbdIfBygdRi_IF-qng";

const app = initializeApp(firebaseConfig);
let messaging: Messaging | null = null;

// Initialize messaging only in browser environment
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Failed to initialize messaging:', error);
  }
}

export { app, messaging, VAPID_KEY };

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      throw new Error('Messaging not initialized');
    }

    // Register service worker first
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });
      
      if (token) {
        // Send token to server
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            deviceInfo: navigator.userAgent
          })
        });
        
        return token;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

export const unsubscribeFromNotifications = async (token: string): Promise<void> => {
  try {
    await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
  }
};

export const onMessageReceived = (callback: (payload: any) => void) => {
  if (messaging) {
    return onMessage(messaging, callback);
  }
  return () => {};
};

export const checkNotificationSupport = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'PushManager' in window
  );
};

export const getCurrentPermission = (): NotificationPermission => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }
  return 'default';
};
