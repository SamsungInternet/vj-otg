/* global toolbox */
// todo move local
importScripts('https://cdnjs.cloudflare.com/ajax/libs/sw-toolbox/3.6.1/sw-toolbox.js');

toolbox.precache([
  'https://cdn.glitch.com/345f846f-a31f-4a45-a9f9-719362195a57%2Fminnie-the-moocher.mp4?1509370361653'
]);

toolbox.router.get('https://cdn.glitch.com/*', toolbox.cacheFirst);