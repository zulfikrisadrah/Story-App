import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  ALL_STORIES: `${CONFIG.BASE_URL}/stories?size=30`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  SUBSCRIBE_NOTIFICATION: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE_NOTIFICATION: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

export async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in fetchData:', error);
    throw error;
  }
}

export default ENDPOINTS;
