import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '@/types/recipe';
import Constants from 'expo-constants';
import * as Application from 'expo-application';

// Define types for notification data
interface NotificationData {
  screen: 'home' | 'profile' | 'recipe';
  id?: number;
}

// Set notification handler at the top level
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  async registerForPushNotifications() {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
      }

      // Set up Android channel first
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B6B',
        });
      }

      // Request permissions first
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      try {
        // Get the project ID
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        
        if (!projectId) {
          throw new Error('Project ID is not configured');
        }

        // Get push token
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: projectId
        });
        
        const token = tokenData.data;
        await AsyncStorage.setItem('pushToken', token);
        return token;
      } catch (tokenError) {
        console.error('Error getting push token:', tokenError);
        // Fallback to device ID for development
        const deviceId = Application.applicationId || 'development';
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: deviceId
        });
        await AsyncStorage.setItem('pushToken', tokenData.data);
        return tokenData.data;
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  },

  async cancelExistingDailyNotification() {
    try {
      const existingId = await AsyncStorage.getItem('dailyNotificationId');
      if (existingId) {
        await Notifications.cancelScheduledNotificationAsync(existingId);
        await AsyncStorage.removeItem('dailyNotificationId');
      }
    } catch (error) {
      console.error('Error canceling existing notification:', error);
    }
  },

  async scheduleDailyRecipeNotification() {
    try {
      await this.cancelExistingDailyNotification();

      const trigger: Notifications.DailyTriggerInput = {
        hour: 12,
        minute: 0,
        repeats: true,
      };

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to cook something delicious! 👨‍🍳",
          body: "Check out today's recipe suggestions",
          data: { screen: 'home' } as NotificationData,
        },
        trigger,
      });

      await AsyncStorage.setItem('dailyNotificationId', identifier);
      return identifier;
    } catch (error) {
      console.error('Error scheduling daily notification:', error);
      return null;
    }
  },

  async testScheduledNotification(seconds: number) {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Scheduled Test Notification 🍳",
          body: `This notification was scheduled for ${seconds} seconds later`,
          data: { screen: 'home' } as NotificationData,
        },
        trigger: {
          seconds: seconds,
        },
      });
      return identifier;
    } catch (error) {
      console.error('Error scheduling test notification:', error);
      return null;
    }
  },

  async testImmediateNotification() {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test notification",
          data: { screen: 'home' } as NotificationData,
        },
        trigger: null, // null trigger means immediate notification
      });
      return identifier;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return null;
    }
  },

  async sendSavedRecipeUpdateNotification(recipeTitle: string) {
    if (!recipeTitle) {
      throw new Error('Recipe title is required');
    }

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Recipe Saved! 🎉",
          body: `${recipeTitle} has been added to your favorites`,
          data: { screen: 'profile' } as NotificationData,
        },
        trigger: null, // Immediate notification
      });
      return identifier;
    } catch (error) {
      console.error('Error sending saved recipe notification:', error);
      return null;
    }
  }
}; 