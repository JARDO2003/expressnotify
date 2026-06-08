import { useState, useEffect, useCallback, useRef } from 'react';
import {
  requestNotificationPermission,
  unsubscribeFromNotifications,
  onMessageReceived,
  checkNotificationSupport,
  getCurrentPermission
} from '@/config/firebase';

export interface NotificationPayload {
  title: string;
  body: string;
  image?: string;
  timestamp: string;
  data?: Record<string, string>;
}

export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const supported = checkNotificationSupport();
    setIsSupported(supported);
    
    if (supported) {
      setPermission(getCurrentPermission());
    }

    // Load stored notifications
    const stored = localStorage.getItem('express-notify-history');
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse notification history:', e);
      }
    }

    // Load stored token
    const storedToken = localStorage.getItem('express-notify-token');
    if (storedToken) {
      setFcmToken(storedToken);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  useEffect(() => {
    if (fcmToken) {
      // Listen for foreground messages
      const unsubscribe = onMessageReceived((payload) => {
        console.log('Foreground message received:', payload);
        
        const newNotification: NotificationPayload = {
          title: payload.notification?.title || 'Express Notify',
          body: payload.notification?.body || 'New notification',
          image: payload.notification?.imageUrl,
          timestamp: new Date().toISOString(),
          data: payload.data
        };

        setNotifications(prev => {
          const updated = [newNotification, ...prev].slice(0, 50);
          localStorage.setItem('express-notify-history', JSON.stringify(updated));
          return updated;
        });

        // Show in-app notification
        if (Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.body,
            icon: '/icon-192x192.png',
            badge: '/icon-72x72.png',
            tag: 'express-notify-foreground'
          });
        }
      });

      unsubscribeRef.current = unsubscribe;
    }
  }, [fcmToken]);

  const subscribe = useCallback(async () => {
    setIsSubscribing(true);
    setError(null);

    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        setFcmToken(token);
        setPermission('granted');
        localStorage.setItem('express-notify-token', token);
        return true;
      } else {
        setPermission(getCurrentPermission());
        if (getCurrentPermission() === 'denied') {
          setError('Notification permission was denied. Please enable it in your browser settings.');
        }
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe to notifications');
      return false;
    } finally {
      setIsSubscribing(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (fcmToken) {
      await unsubscribeFromNotifications(fcmToken);
      localStorage.removeItem('express-notify-token');
      setFcmToken(null);
      setPermission('default');
    }
  }, [fcmToken]);

  const clearHistory = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('express-notify-history');
  }, []);

  return {
    isSupported,
    permission,
    fcmToken,
    isSubscribing,
    notifications,
    error,
    subscribe,
    unsubscribe,
    clearHistory
  };
}
