import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'document',
  new StaleWhileRevalidate(),
);

self.addEventListener('push', (event) => {
  let title = 'Notifikasi Baru';
  let options = {
    body: 'Ada sesuatu yang baru.',
  };

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      options = Object.assign(options, data.options);
    } catch (err) {
      options.body = event.data.text();
    }
  }

  event.waitUntil(self.registration.showNotification(title, options));
});
