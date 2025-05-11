import { transitionHelper } from '../../utils';

export default class NotFoundPage {
  async render() {
    return `
        <section class="not-found container" role="region" style="text-align: center; padding: 2rem;">
        <h1 style="font-size: 3rem; color: #ff4d4f; margin-bottom: 0.5rem;">404</h1>
        <h2 style="font-size: 1.5rem; color: #ff4d4f;">Page Not Found</h2>
        
        <img 
            src="/images/not-found-robot.png" 
            alt="Robot showing page not found" 
            style="max-width: 200px; height: 200px; margin-bottom: 2rem;"
        >

        <a href="/" class="btn btn-primary" id="back-home-btn" style="padding: 0.75rem 1.5rem; font-size: 1rem;">
            Back to Home
        </a>
        </section>
    `;
  }

  async afterRender() {
    transitionHelper({
      updateDOM: async () => {
        const htmlContent = await this.render();
        document.querySelector('#root').innerHTML = htmlContent;

        this.showPageTransition();
      },
      skipTransition: false,
    });
  }

  showPageTransition() {
    const container = document.querySelector('.container');
    if (container) {
      container.classList.add('page-transition');
      setTimeout(() => {
        container.classList.add('page-transition-active');
      }, 10);
    }
  }

  hidePageTransition() {
    const container = document.querySelector('.container');
    if (container) {
      container.classList.remove('page-transition-active');
    }
  }
}
