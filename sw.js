
let CACHE_NAME="mws-restaurant-stage-1-cache-v1";
let urlsToCache = [
  '/',
  '/restaurant.html', 
  '/index.html',
  '/css/styles.css',
  '/css/responsiveStyles.css',
  '/css/reviewStyles.css',
  '/js/main.js',
  '/js/dbhelper.js',
  'js/idb.js',
  '/img/1.jpg',
  '/img/2.jpg',
  '/img/3.jpg',
  '/img/4.jpg',
  '/img/5.jpg',
  '/img/6.jpg',
  '/img/7.jpg',
  '/img/8.jpg',
  '/img/9.jpg',
  '/img/10.jpg'
];
/*===========Install Service worker======*/
self.addEventListener('install',function(event){
  // perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function(cache){
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});
/*===========Cache and return request===*/
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        
        if (response) {
          console.log(`fetch cache ${response}`);return response;
        }
        return fetch(event.request);
      }
    )
  );
});
//delete old cache in the activate event
self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(cacheNames){
      return Promise.all(
        cacheNames.filter(function(cacheName){
          return cacheName.startsWith('mws-') && cacheName != CACHE_NAME
        }).map(function(cacheName){
          return caches.delete(cacheName)
        })
      )
    })
  )
})