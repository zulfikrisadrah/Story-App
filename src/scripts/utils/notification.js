import StoryModel from '../models/storyModel';
import CONFIG from '../config';

export const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const subscribeUserToPush = async (registration) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      const msg =
        permission === 'denied'
          ? 'Notification access denied. Please allow it in your browseFr settings.'
          : 'Notification request was not answered.';
      Swal.fire({
        icon: 'error',
        title: 'Subscription Failed',
        text: msg,
      });
      return;
    }

    const token = sessionStorage.getItem('token');

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
    });

    await StoryModel.subscribeToPushNotification({
      token,
      subscription,
    });

    Swal.fire({
      icon: 'success',
      title: 'Subscribed',
      text: 'You have successfully subscribed to notifications.',
    });
  } catch (error) {
    console.error('Failed to subscribe to notifications:', error);
    Swal.fire({
      icon: 'error',
      title: 'Subscription Error',
      text: 'An error occurred while subscribing to notifications.',
    });
  }
};

export const unsubscribeUserFromPush = async (registration) => {
  try {
    const token = sessionStorage.getItem('token');
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const result = await StoryModel.unsubscribeFromPushNotification({
        token,
        subscription,
      });

      Swal.fire({
        icon: 'success',
        title: 'Unsubscribed',
        text: result.message,
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'No Subscription',
        text: 'You are not currently subscribed to notifications.',
      });
    }
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    Swal.fire({
      icon: 'error',
      title: 'Unsubscribe Error',
      text: 'An error occurred while unsubscribing from notifications.',
    });
  }
};
