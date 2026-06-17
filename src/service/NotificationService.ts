import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { getLocalData, setLocalData } from '../utilies/storageUtility';

 async function requestUserPermission() {
  try {
    console.log('requestUserPermission');

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }

    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log('Notification Permission Status:', authStatus);

    if (enabled) {
      await getFcmToken();
    }
  } catch (error) {
    console.log('requestUserPermission Error:', error);
  }
}

export const getFcmToken = async () => {
  try {
    const storedToken = getLocalData('fcmToken');

    console.log('Stored FCM Token:', storedToken);

    if (!storedToken) {
      const token = await messaging().getToken();

      await setLocalData('fcmToken', token);

      console.log('New FCM Token:', token);
    }

    return storedToken;
  } catch (error) {
    console.log('getFcmToken Error:', error);
    return null;
  }
};

async function onDisplayNotification(remoteMessage) {
  try {
    if (!remoteMessage?.notification) {
      return;
    }

    if (Platform.OS === 'ios') {
      await notifee.requestPermission();
    }

    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      sound: 'default',
      vibration: true,
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: remoteMessage.notification.title,
      body: remoteMessage.notification.body,
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
      },
    });
  } catch (error) {
    console.log('Notification Display Error:', error);
  }
}

export const notificationListener = () => {
  try {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background Message:', remoteMessage);

      await onDisplayNotification(remoteMessage);
    });

    const unsubscribeForeground = messaging().onMessage(
      async remoteMessage => {
        console.log('Foreground Message:', remoteMessage);

        await onDisplayNotification(remoteMessage);
      },
    );

    const unsubscribeOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log(
          'Notification opened from background:',
          remoteMessage,
        );

        // Navigation logic here
      },
    );

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification opened from quit state:',
            remoteMessage,
          );

          // Navigation logic here
        }
      });

    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
    };
  } catch (error) {
    console.log('notificationListener Error:', error);
  }
};

 const showNotification = async (
  title = 'Test Notification',
  body = 'Hello World',
) => {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
      pressAction: {
        id: 'default',
      },
    },
  });
};
export const NotificationService={
    requestUserPermission,
    showNotification
}