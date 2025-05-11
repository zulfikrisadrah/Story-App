import AddStoryPresenter from './addStory-presenter';
import CONFIG from '../../config';
import { transitionHelper } from '../../utils';

class AddStoryPage {
  #presenter;
  #stream;

  constructor() {
    this.#presenter = new AddStoryPresenter(this);
  }

  async render() {
    return `
      <section class="form-container">
        <div class="add-story-box">
          <h1>Add Story</h1>
          <form id="addStoryForm">
            <div>
              <label for="description">Story Description</label>
              <textarea id="description" placeholder="Description..." required aria-describedby="descriptionError"></textarea>
              <span class="error-message" id="descriptionError"></span>
            </div>

            <div class="form-group">
              <div class="form-photo">
                <label>Upload Photo</label>
                <div class="photo-preview-wrapper" id="previewContainer">
                  <img id="previewImage" src="/images/no-photo.png" alt="Preview of uploaded photo" />
                </div>
                <div id="video-container" style="display: none;">
                  <video id="videoElement" autoplay></video>
                </div>
                <div class="photo-icons">
                  <i class="fas fa-folder-open" id="chooseFileIcon" title="Choose from device" aria-label="Choose file from device"></i>
                  <i class="fas fa-camera" id="openCameraIcon" title="Open camera and capture" aria-label="Open camera to capture photo"></i>
                  <input type="file" id="fileInput" accept="image/*" style="display: none;" aria-label="Upload image file"/>
                </div>
              </div>

              <div class="form-location">
                <label for="map">Choose Location</label>
                <div id="map" style="width: 100%; height: 200px; cursor: pointer;"></div>
                <input type="hidden" id="lat">
                <input type="hidden" id="lon">
              </div>
            </div>

            <input type="hidden" id="photo">
            <button type="submit">ADD NEW STORY</button>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const formContainer = document.querySelector('.form-container');
    formContainer.classList.add('page-transition');

    setTimeout(() => {
      formContainer.classList.add('page-transition-active');
    }, 10);

    transitionHelper({
      updateDOM: () => this.render(),
      skipTransition: false,
    });

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        formContainer.classList.add('page-transition-active');
      });
    }

    this.setupFileUpload();
    this.setupMap();
    this.#presenter.setupFormSubmission();

    window.addEventListener('hashchange', () => {
      this.cleanup();
    });
  }

  onStoryAddedSuccess() {
    const formContainer = document.querySelector('.form-container');

    transitionHelper({
      updateDOM: () => {
        formContainer.classList.add('page-transition');
        setTimeout(() => {
          formContainer.classList.remove('page-transition');
        }, 500);
      },
      skipTransition: false,
    });

    transitionHelper({
      updateDOM: () => {
        window.location.hash = '/';
      },
      skipTransition: false,
    });
  }

  setupFileUpload() {
    const videoElement = document.getElementById('videoElement');
    const openCameraBtn = document.getElementById('openCameraIcon');
    const fileInput = document.getElementById('fileInput');
    const chooseFileBtn = document.getElementById('chooseFileIcon');
    const previewImage = document.getElementById('previewImage');
    const previewContainer = document.getElementById('previewContainer');
    const photoInput = document.getElementById('photo');
    const videoContainer = document.getElementById('video-container');
    let isCameraActive = false;

    chooseFileBtn.addEventListener('click', () => {
      fileInput.click();
    });

    openCameraBtn.addEventListener('click', async () => {
      if (!isCameraActive) {
        try {
          this.#stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          videoElement.srcObject = this.#stream;
          videoContainer.style.display = 'block';
          previewContainer.style.display = 'none';
          isCameraActive = true;
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Camera Access Denied or Unavailable',
            text: 'Please check your camera permissions or ensure the camera is connected.',
          });
        }
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          const file = new File([blob], 'captured.jpg', { type: 'image/jpeg' });
          photoInput._file = file;
          previewImage.src = URL.createObjectURL(file);
          previewContainer.style.display = 'block';
          videoContainer.style.display = 'none';
          this.#stream?.getTracks().forEach((track) => track.stop());
          isCameraActive = false;
        });
      }
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) {
        photoInput._file = file;
        previewImage.src = URL.createObjectURL(file);
        previewContainer.style.display = 'block';
        videoContainer.style.display = 'none';
      }
    });
  }

  setupMap() {
    const map = L.map('map').setView([-5.147665, 119.432732], 10);
    const mapTilerUrl = `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${CONFIG.MAP_SERVICE_API_KEY}`;

    L.tileLayer(mapTilerUrl, {
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a>',
    }).addTo(map);

    let marker;
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      document.getElementById('lat').value = lat;
      document.getElementById('lon').value = lng;

      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }

      marker.bindPopup(`<b>Lat:</b> ${lat}<br><b>Lon:</b> ${lng}`).openPopup();
    });
  }

  cleanup() {
    if (this.#stream) {
      this.#stream.getTracks().forEach((track) => track.stop());
    }
  }
}

export default AddStoryPage;
