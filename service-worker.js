const CACHE_NAME = 'sovereign-cache-v1';
const urlsToCache = [
  '/index.html',
  '/about.html',
  '/ada-complaint.html',
  '/admin-remedy.html',
  '/anthem.html',
  '/arrested.html',
  '/ask-sage.html',
  '/chevron-doctrine.html',
  '/community.html',
  '/conspiracy-defense.html',
  '/contact.html',
  '/court-prep.html',
  '/courtroom-scripts.html',
  '/custody.html',
  '/dashboard.html',
  '/defend-false-allegations.html',
  '/demand-discovery.html',
  '/dss.html',
  '/dss-defense.html',
  '/dss-stratagy-tools.html',
  '/emergency-custody-response.html',
  '/estate.html',
  '/evictions.html',
  '/file-complaint-judge-attorney.html',
  '/fix-your-case-timeline.html',
  '/how-to-read-docket.html',
  '/how-to-serve-motions.html',
  '/judicial-recusal.html',
  '/landlord-rights.html',
  '/liberties.html',
  '/llc-guide.html',
  '/llc-to-trust.html',
  '/missed-court.html',
  '/my-case.html',
  '/name-change.html',
  '/open-case.html',
  '/printable-resources.html',
  '/privacy.html',
  '/pro-se-vs-sui-juris.html',
  '/real-stories.html',
  '/records.html',
  '/remedies.html',
  '/remove-gal.html',
  '/reopen-your-case.html',
  '/request-for-continuance.html',
  '/resources.html',
  '/restore-rights.html',
  '/sage-chatbot.html',
  '/smart-search.html',
  '/sovereign.html',
  '/style.css',
  '/submit-your-story.html',
  '/success.html',
  '/sue-cps-federal.html',
  '/sui-juris.html',
  '/take-me-to.html',
  '/terms-of-use.html',
  '/traffic.html',
  '/veterans.html',
  '/voice-search.js',
  '/smart-search.js',
  '/manifest.json',
  '/icon-192-any.png',
  '/icon-192-maskable.png',
  '/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch((error) => {
      // graceful fail (e.g. offline or widget.js requested)
      if (event.request.url.includes('widget.js')) {
        return new Response('', { status: 204 });
      }
    })
  );
});
