import AuthModel from '../../models/authModel';
import { transitionHelper } from '../../utils';

export default class RegisterPresenter {
  #view;
  #model;

  constructor(view) {
    this.#view = view;
    this.#model = AuthModel;
  }

  init() {
    this.#view.showPageTransition();
    this.#view.handleFormSubmit(this.handleRegister.bind(this));
  }

  async handleRegister(data) {
    const { username, email, password } = data;
    const messageEl = document.getElementById('registerMessage');

    try {
      const response = await this.#model.registerUser({
        name: username,
        email,
        password,
      });

      if (response.error === false && response.message === 'User created') {
        await Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'You will be redirected to the login page.',
          confirmButtonText: 'OK',
        });

        transitionHelper({
          updateDOM: () => {
            this.#view.hidePageTransition();
            window.location.hash = '/login';
          },
          skipTransition: false,
        });
      } else {
        this.#view.showRegisterError(
          response.message || 'Registration failed.',
        );
      }
    } catch (error) {
      console.error('Error during registration:', error);
      this.#view.showRegisterError('This email is already registered.');
    }
  }
}
