import AuthModel from '../../models/authModel';
import { transitionHelper } from '../../utils';

export default class LoginPresenter {
  #view;
  #model;

  constructor(view) {
    this.#view = view;
    this.#model = AuthModel;
  }

  init() {
    this.#view.handleFormSubmit(this.handleLogin.bind(this));

    this.#view.showPageTransition();
  }

  async handleLogin(data) {
    try {
      const response = await this.#model.loginUser(data);

      if (response.message === 'success') {
        sessionStorage.setItem('email', data.email);
        sessionStorage.setItem('token', response.loginResult.token);

        setTimeout(() => {
          window.location.href = '/';
        }, 500);

        transitionHelper({
          updateDOM: () => {
            this.#view.hidePageTransition();
            window.location.hash = '/';
          },
          skipTransition: false,
        });
      } else {
        this.#view.showLoginError('Invalid credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.#view.showLoginError('Invalid credentials.');
    }
  }
}
