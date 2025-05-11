import { openDB } from 'idb';

const DB_NAME = 'stories-db';
const STORE_NAME = 'stories';
const FAV_STORE = 'favorite-stories';

export const initDB = async () => {
  return openDB(DB_NAME, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(FAV_STORE)) {
        db.createObjectStore(FAV_STORE, { keyPath: 'id' });
      }
    },
  });
};

export const saveStories = async (stories) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  await store.clear();
  stories.forEach((story) => store.put(story));

  await tx.done;
};

export const getCachedStories = async () => {
  try {
    const db = await initDB();
    const stories = await db.getAll(STORE_NAME);
    return stories.length ? stories : [];
  } catch (err) {
    console.error('Error accessing IndexedDB:', err);
    return [];
  }
};

export const saveToFavorites = async (story) => {
  const db = await initDB();
  const tx = db.transaction(FAV_STORE, 'readwrite');
  const store = tx.objectStore(FAV_STORE);
  try {
    await store.put(story);
    await tx.done;
  } catch (error) {
    console.error('Error saving to favorites:', error);
    throw new Error('Failed to save to favorites.');
  }
};

export const removeFromFavorites = async (id) => {
  const db = await initDB();
  const tx = db.transaction(FAV_STORE, 'readwrite');
  const store = tx.objectStore(FAV_STORE);
  try {
    await store.delete(id);
    await tx.done;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw new Error('Failed to remove from favorites.');
  }
};

export const getAllFavorites = async () => {
  const db = await initDB();
  const favorites = await db.getAll(FAV_STORE);
  return favorites;
};

export const getFavoriteById = async (id) => {
  const db = await initDB();
  return await db.get(FAV_STORE, id);
};
