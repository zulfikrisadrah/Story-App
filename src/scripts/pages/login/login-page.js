import LoginPresenter from './login-presenter';
import { transitionHelper } from '../../utils';

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="form-container">
        <div class="register-box">
          <h1>LOGIN</h1>
          <form id="loginForm">
            <table>
              <tr>
                <td><label for="email">Email</label></td>
                <td><input type="email" id="email" name="email" placeholder="example@gmail.com" required aria-label="Enter your email" /></td>
              </tr>
              <tr>
                <td><label for="password">Password</label></td>
                <td><input type="password" id="password" name="password" placeholder="********" required aria-label="Enter your password" /></td>
              </tr>
            </table>
            <span id="loginError" class="error-message"></span>
            <button type="submit">Login</button>
          </form>
          <p>Don't have an account? <a href="#/register" aria-label="Register here">Register here</a></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter(this);
    this.#presenter.init();

    transitionHelper({
      updateDOM: () => this.render(),
      skipTransition: false,
    });
  }

  showLoginError(message) {
    document.getElementById('loginError').textContent = message;
  }

  handleFormSubmit(callback) {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const data = { email, password };

      callback(data);
    });
  }

  showPageTransition() {
    const formContainer = document.querySelector('.form-container');
    formContainer.classList.add('page-transition');
    setTimeout(() => {
      formContainer.classList.add('page-transition-active');
    }, 10);
  }

  hidePageTransition() {
    const formContainer = document.querySelector('.form-container');
    formContainer.classList.remove('page-transition-active');
  }
}
