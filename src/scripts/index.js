import '../styles/styles.css';
import App from './pages/app';
import {
  subscribeUserToPush,
  unsubscribeUserFromPush,
} from './utils/notification';

document.addEventListener('DOMContentLoaded', async () => {
  let deferredPrompt;

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  const token = sessionStorage.getItem('token');

  if (token && token !== '') {
    const loginRegisterLinks = document.getElementById('login-links');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');

    if (loginRegisterLinks) loginRegisterLinks.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'inline';
  }

  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', () => {
      sessionStorage.removeItem('token');
      window.location.reload();
    });
  }

  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration =
      await navigator.serviceWorker.register('sw.bundle.js');
    console.log('Service Worker registered.');

    const subscribeLink = document.getElementById('subscribe-link');
    const subscribeButton = document.getElementById('subscribe-button');

    if (token && subscribeLink && subscribeButton) {
      subscribeLink.style.display = 'inline';

      let isSubscribed = false;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) isSubscribed = true;

      subscribeButton.innerHTML = isSubscribed
        ? '<i class="fas fa-bell-slash"></i> Unsubscribe'
        : '<i class="fas fa-bell"></i> Subscribe';

      subscribeButton.addEventListener('click', async () => {
        try {
          if (!isSubscribed) {
            await subscribeUserToPush(registration);
            subscribeButton.innerHTML =
              '<i class="fas fa-bell-slash"></i> Unsubscribe';
            isSubscribed = true;
          } else {
            await unsubscribeUserFromPush(registration);
            subscribeButton.innerHTML = '<i class="fas fa-bell"></i> Subscribe';
            isSubscribed = false;
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while processing your request. Please try again.',
          });
        }
      });
    }
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('install-button');
    if (installBtn) {
      installBtn.style.display = 'block';
      installBtn.addEventListener('click', async () => {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
        installBtn.style.display = 'none';
      });
    }
  });

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
