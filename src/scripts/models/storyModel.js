import ENDPOINTS, { fetchData } from '../data/api';

const StoryModel = {
  async fetchAllStories(token) {
    try {
      const response = await fetch(ENDPOINTS.ALL_STORIES, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stories data: ' + response.statusText);
      }

      const data = await response.json();

      if (data.list && Array.isArray(data.list)) {
        await saveStories(data.list);
      }

      return data.list || data;
    } catch (error) {
      throw new Error('Error: ' + error.message);
    }
  },

  async fetchStoryDetail(id, token) {
    const url = ENDPOINTS.STORY_DETAIL(id);
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return await fetchData(url, options);
  },

  async addStory({ token, formData }) {
    try {
      const response = await fetch(ENDPOINTS.ADD_STORY, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add story: ' + response.statusText);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Error while adding story: ' + error.message);
    }
  },

  async subscribeToPushNotification({ token, subscription }) {
    try {
      const getKeyAsBase64 = (key) => {
        return btoa(
          String.fromCharCode(...new Uint8Array(subscription.getKey(key))),
        );
      };

      const payload = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: getKeyAsBase64('p256dh'),
          auth: getKeyAsBase64('auth'),
        },
      };

      const response = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATION, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to subscribe');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error('Subscription error: ' + error.message);
    }
  },

  async unsubscribeFromPushNotification({ token, subscription }) {
    try {
      const payload = {
        endpoint: subscription.endpoint,
      };

      const response = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATION, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unsubscribe');
      }

      await subscription.unsubscribe();

      return { success: true, message: 'Successfully unsubscribed' };
    } catch (error) {
      throw new Error('Unsubscribe error: ' + error.message);
    }
  },
};

export default StoryModel;
