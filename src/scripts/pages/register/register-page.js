import RegisterPresenter from './register-presenter';
import { transitionHelper } from '../../utils';

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="form-container">
        <div class="register-box">
          <h1>REGISTER</h1>
          <form id="registerForm">
            <table>
              <tr>
                <td><label for="username">Username</label></td>
                <td><input type="text" id="username" name="username" placeholder="Username" required aria-label="Enter your username"/></td>
              </tr>
              <tr>
                <td><label for="email">Email</label></td>
                <td><input type="email" id="email" name="email" placeholder="example@gmail.com" required aria-label="Enter your email"/></td>
              </tr>
              <tr>
                <td><label for="password">Password</label></td>
                <td><input type="password" id="password" name="password" placeholder="********" required minlength="6" aria-label="Enter your password"/></td>
              </tr>
            </table>
            <span id="registerMessage" class="error-message" role="alert"></span>
            <button type="submit">Register</button>
          </form>
          <p>Already have an account? <a href="#/login" title="Go to login page">Login here</a></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter(this);
    this.#presenter.init();

    transitionHelper({
      updateDOM: () => this.render(),
      skipTransition: false,
    });
  }

  handleFormSubmit(callback) {
    const form = document.getElementById('registerForm');
    const messageEl = document.getElementById('registerMessage');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const data = { username, email, password };

      messageEl.textContent = '';
      messageEl.style.color = 'red';

      transitionHelper({
        updateDOM: () => callback(data),
        skipTransition: false,
      });
    });
  }

  showRegisterError(message) {
    const messageEl = document.getElementById('registerMessage');
    messageEl.textContent = message;
    messageEl.style.color = 'red';
  }

  hidePageTransition() {
    const formContainer = document.querySelector('.form-container');
    formContainer.classList.remove('page-transition-active');
  }

  showPageTransition() {
    const formContainer = document.querySelector('.form-container');
    formContainer.classList.add('page-transition');
    setTimeout(() => {
      formContainer.classList.add('page-transition-active');
    }, 10);
  }
}
