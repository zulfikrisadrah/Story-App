import HomePresenter from './home-presenter';
import StoryModel from '../../models/storyModel';
import AuthModel from '../../models/authModel';
import CONFIG from '../../config';
import {
  saveToFavorites,
  getFavoriteById,
  removeFromFavorites,
  getAllFavorites,
} from '../../utils/db';

class HomePage {
  #presenter;
  currentStoryIndex = 0;
  allStories = [];
  filteredStories = [];
  mapInstance = null;
  markers = [];

  constructor() {
    this.#presenter = new HomePresenter({
      model: { storyModel: StoryModel, authModel: AuthModel },
      view: this,
    });
  }

  async render() {
    return `
      <section class="container two-column-layout">
        <div class="left-panel">
          <div class="content-header">
            <div class="filter-story">
              <button class="filter-button actived" data-filter="all">Stories</button>
              <button class="filter-button" data-filter="fav">Fav</button>
            </div>
            <button class="add-story-button">ADD STORY</button>
          </div>
          
          <div class="story-wrapper">
            <div id="storyList" class="story-list" role="region" aria-labelledby="stories-heading">Loading...</div>
            <div class="story-navigation" role="navigation">
              <button id="prevStoryBtn" aria-label="Previous story">&lt;</button>
              <button id="nextStoryBtn" aria-label="Next story">&gt;</button>
            </div>
          </div>
        </div>
        <div class="right-panel">
          <div id="map" aria-label="Interactive map to select location" role="region"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const token = sessionStorage.getItem('token');
    if (!token) {
      window.location.hash = '/login';
      return;
    }

    await this.#presenter.loadStories('all');
    this.setupMap();
    this.setupNavigationButtons();
    this.setupAddStoryButton();
    this.setupFilterButtons();
  }

  showStories(stories) {
    this.allStories = stories;
    this.filteredStories = [...stories];
    this.renderCurrentStories();
  }

  async renderCurrentStories() {
    const storyList = document.getElementById('storyList');
    const start = this.currentStoryIndex;
    const end = Math.min(start + 3, this.filteredStories.length);
    const currentStories = this.filteredStories.slice(start, end);

    storyList.classList.remove('fade-in');
    void storyList.offsetWidth;
    storyList.classList.add('fade-in');

    storyList.innerHTML = currentStories
      .map(
        (story, index) => `
        <div class="story-card" data-index="${start + index}" tabindex="0">
          <div class="fav-btn" data-id="${story.id}" title="Add to Favorites">
            <i class="fas fa-heart"></i>
          </div>
          <div class="story-image">
            <img src="${story.photoUrl}" alt="${story.name}" />
          </div>
          <div class="story-content">
            <div class="story-header">
              <h1 class="story-name">${story.name}</h1>
              <p class="story-date">${new Date(story.createdAt).toLocaleDateString()}</p>
            </div>
            <h2 class="story-description">${story.description}</h2>
          </div>
        </div>
      `,
      )
      .join('');

    const storyCards = document.querySelectorAll('.story-card');
    if (storyCards.length > 0) {
      storyCards[0].focus();
    }

    storyCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        this.handleStoryClick(start + index);
      });

      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          this.handleStoryClick(start + index);
        }
      });
    });

    const favButtons = document.querySelectorAll('.fav-btn');
    for (const btn of favButtons) {
      const storyId = btn.dataset.id;

      const isFavorite = await getFavoriteById(storyId);
      if (isFavorite) {
        btn.classList.add('favorited');
      }

      btn.addEventListener('click', async (event) => {
        event.stopPropagation();

        const card = btn.closest('.story-card');
        const story = {
          id: storyId,
          name: card.querySelector('.story-name').textContent,
          description: card.querySelector('.story-description').textContent,
          photoUrl: card.querySelector('img').src,
          createdAt: new Date(
            card.querySelector('.story-date').textContent,
          ).toISOString(),
        };

        try {
          const alreadyFavorite = await getFavoriteById(story.id);
          if (alreadyFavorite) {
            console.log('Attempting to remove from favorites:', story.id);
            await removeFromFavorites(story.id);
            btn.classList.remove('favorited');
            Swal.fire({
              icon: 'warning',
              title: 'Removed from Favorites',
              text: 'The story has been removed from your favorites.',
            });
          } else {
            console.log('Attempting to save to favorites:', story.id);
            await saveToFavorites(story);
            btn.classList.add('favorited');
            Swal.fire({
              icon: 'success',
              title: 'Added to Favorites',
              text: 'The story has been saved to your favorites!',
            });
          }
        } catch (e) {
          console.error('Failed to handle favorite action:', e);
          Swal.fire({
            icon: 'error',
            title: 'Action Failed',
            text: 'Unable to process this action at the moment.',
          });
        }
      });
    }
  }

  setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filterType = button.getAttribute('data-filter');
        this.applyFilter(filterType);

        filterButtons.forEach((btn) => btn.classList.remove('actived'));
        button.classList.add('actived');
      });
    });
  }

  applyFilter(filterType) {
    if (filterType === 'fav') {
      getAllFavorites().then((favorites) => {
        this.filteredStories = this.allStories.filter((story) =>
          favorites.some((fav) => fav.id === story.id),
        );
        this.currentStoryIndex = 0;
        this.renderCurrentStories();
      });
    } else {
      this.filteredStories = [...this.allStories];
      this.currentStoryIndex = 0;
      this.renderCurrentStories();
    }
  }

  handleStoryClick(index) {
    const selectedStory = this.filteredStories[index];
    if (selectedStory.lat && selectedStory.lon) {
      this.zoomToLocation(selectedStory.lat, selectedStory.lon, selectedStory);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Location Not Found',
        text: 'This story does not have location data.',
      });
    }
  }

  zoomToLocation(lat, lon) {
    const map = this.mapInstance;
    if (map) {
      map.flyTo([lat, lon], 10, { animate: true, duration: 3 });

      const marker = this.markers.find((m) => m.getLatLng().equals([lat, lon]));
      if (marker) {
        marker.openPopup();
      }
    }
  }

  setupNavigationButtons() {
    const prevBtn = document.getElementById('prevStoryBtn');
    const nextBtn = document.getElementById('nextStoryBtn');

    prevBtn.addEventListener('click', () => {
      if (this.currentStoryIndex > 0) {
        this.currentStoryIndex -= 3;
        this.renderCurrentStories();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (this.currentStoryIndex + 3 < this.filteredStories.length) {
        this.currentStoryIndex += 3;
        this.renderCurrentStories();
      }
    });
  }

  setupAddStoryButton() {
    const addStoryButton = document.querySelector('.add-story-button');
    if (addStoryButton) {
      addStoryButton.addEventListener('click', () => {
        window.location.hash = '/add-story';
      });
    }
  }

  setupMap() {
    const streets = L.tileLayer(
      `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${CONFIG.MAP_SERVICE_API_KEY}`,
      {
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> contributors',
      },
    );

    const satellite = L.tileLayer(
      `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${CONFIG.MAP_SERVICE_API_KEY}`,
      {
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> contributors',
      },
    );

    const map = L.map('map', {
      center: [-5.147665, 119.432732],
      zoom: 10,
      layers: [streets],
    });

    const baseMaps = {
      Streets: streets,
      Satellite: satellite,
    };

    L.control.layers(baseMaps).addTo(map);
    this.mapInstance = map;

    this.allStories.forEach((story) => {
      if (Number.isFinite(story.lat) && Number.isFinite(story.lon)) {
        const marker = L.marker([story.lat, story.lon]).addTo(map).bindPopup(`
            <b>${story.name}</b><br>
            <p>${story.description}</p>
            <b>Latitude:</b> ${story.lat}<br>
            <b>Longitude:</b> ${story.lon}`);
        this.markers.push(marker);
      } else {
        console.warn('Invalid coordinate story:', story);
      }
    });
  }

  showError(message) {
    console.error('Failed to load stories:', message);
    const storyList = document.getElementById('storyList');
    storyList.innerHTML = `<p class="error">${message}</p>`;
  }
}

export default HomePage;
