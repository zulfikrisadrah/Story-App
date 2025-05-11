import StoryModel from '../../models/storyModel';

export default class AddStoryPresenter {
  #view;
  #storyModel;
  #token;

  constructor(view) {
    this.#view = view;
    this.#storyModel = StoryModel;
    this.#token = sessionStorage.getItem('token') || '';
  }

  setupFormSubmission() {
    const form = document.getElementById('addStoryForm');
    form.addEventListener('submit', this.handleFormSubmit.bind(this));
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    const description = document.getElementById('description').value.trim();
    const photo = document.getElementById('photo')._file;
    const lat = document.getElementById('lat').value;
    const lon = document.getElementById('lon').value;

    if (!description || !photo) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Description and photo are required!',
      });
      return;
    }

    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);

    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }

    try {
      const result = await this.#storyModel.addStory({
        token: this.#token,
        formData,
      });
      if (!result.error) {
        Swal.fire({
          icon: 'success',
          title: 'Story Added!',
          text: 'Your story has been successfully added.',
        }).then(() => {
          this.#view.onStoryAddedSuccess();
        });
      } else {
        throw new Error(result.message || 'Failed to add story');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add story: ' + error.message,
      });
    }
  }
}
