import { useEffect, useRef } from 'react';
import { Slot, router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { notificationService } from '@/services/notificationService';
import { Alert } from 'react-native';

interface NotificationData {
  screen: 'home' | 'profile' | 'recipe';
  id?: number;
}

export default function RootLayout() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    setupNotifications();
    return () => {
      cleanup();
    };
  }, []);

  const setupNotifications = async () => {
    try {
      await registerForNotifications();

      notificationListener.current = Notifications.addNotificationReceivedListener(
        notification => {
          console.log('Notification received:', notification);
        }
      );

      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        response => {
          handleNotificationResponse(response);
        }
      );
    } catch (error) {
      console.error('Error setting up notifications:', error);
      Alert.alert('Notification Error', 'Failed to setup notifications');
    }
  };

  const registerForNotifications = async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        console.log('Push token:', token);
        await notificationService.scheduleDailyRecipeNotification();
      }
    } catch (error) {
      console.error('Error registering for notifications:', error);
    }
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    try {
      const data = response.notification.request.content.data as NotificationData;
      
      if (data.screen === 'recipe' && data.id) {
        router.push({
          pathname: '/recipe/[id]',
          params: { id: data.id.toString() }
        });
      } else if (data.screen === 'profile') {
        router.push('/profile');
      } else if (data.screen === 'home') {
        router.push('/');
      }
    } catch (error) {
      console.error('Error handling notification response:', error);
    }
  };

  const cleanup = () => {
    if (notificationListener.current) {
      Notifications.removeNotificationSubscription(notificationListener.current);
    }
    if (responseListener.current) {
      Notifications.removeNotificationSubscription(responseListener.current);
    }
  };

  return <Slot />;
} 