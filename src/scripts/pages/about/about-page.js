import { transitionHelper } from '../../utils';

export default class AboutPage {
  async render() {
    return `
      <section class="container" role="region">
        <h1 style="margin-bottom: 1rem">About</h1>
        <p id="about-text">This website is a platform that allows users to share their stories and display the locations of those stories on an interactive map. Users can upload photos and describe their stories, which will then be mapped based on specific locations. The map provides an engaging visual experience, where each shared story appears with a marker on the digital map, enabling others to explore stories from various places around the world.<br><br>
        Aimed at connecting people through shared narratives, this website offers a space for users to exchange experiences. Users can also select the location of their story using the map, adding an extra layer to the stories being shared by linking them to real-world places.</p>
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
