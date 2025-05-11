import { saveStories, getCachedStories } from '../../utils/db';

class HomePresenter {
  #storyModel;
  #view;

  constructor({ model, view }) {
    this.#storyModel = model.storyModel;
    this.#view = view;
  }

  async loadStories() {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }

      if (navigator.onLine) {
        const storiesData = await this.#storyModel.fetchAllStories(token);
        const stories = storiesData.listStory || [];

        if (stories.length > 0) {
          await saveStories(stories);
        }

        this.#view.showStories(stories);
      } else {
        throw new Error('Offline');
      }
    } catch (error) {
      console.warn('Error fetching stories:', error.message);
      try {
        const cachedStories = await getCachedStories();
        if (cachedStories.length > 0) {
          this.#view.showStories(cachedStories);
        } else {
          this.#view.showError(
            'Failed to load data and no cached stories are available.',
          );
        }
      } catch (cacheError) {
        console.error('Failed to load from IndexedDB:', cacheError);
        this.#view.showError('Failed to load any data.');
      }
    }
  }
}

export default HomePresenter;
