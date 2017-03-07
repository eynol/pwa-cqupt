/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-201702281345';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  './',
  './css/index.css',
  './js/index.js',
 
  './lib/vue/vue.js',
  './icon/list-active.svg',
  './icon/list.svg',
  './icon/setting-active.svg',
  './icon/setting.svg'
];
const NO_CACHE =[
  '/kebiao/'
]
// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
    .then(cache => cache.addAll(PRECACHE_URLS))
    .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {

  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    
    if(NO_CACHE.some(str=> event.request.url.indexOf(str)>-1
    )){
      return false;
    }

    if (navigator.onLine) {
      //Online strategy
      event.respondWith(caches.open(PRECACHE)
        .then(cache => cache.match(event.request.clone()))
        .then(cachedResponse => {
          if (cachedResponse) {
            //Request precached resources, return the response directly.
            console.log("precache:" + event.request.url)
            return cachedResponse
          } else {
            //onLine resources first , always get a new one.
             console.log("getNew:" + event.request.url)
            return caches.open(RUNTIME).then(cache => {
              return fetch(event.request).then(response => {
                // Put a copy of the response in the runtime cache.
                return cache.put(event.request, response.clone()).then(() => {
                  return response
                })
              })
            })
          }
        }))
    } else {
      //Off-line , Cache first, 404 second
      event.respondWith(
        caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse
          } else {
            return new Response(200,'{nothing:"to find"}')
          }
        }))
    }
  }
});


self.addEventListener('notificationclick', function(event) {
  console.log(event)
  console.log('On notification click: ', event.notification.tag);
  if(event.action==='arived'){
    event.notification.close();
  }

  // This looks to see if the current is already open and
  // focuses if it is
  // event.waitUntil(clients.matchAll({
  //   type: "window"
  // }).then(function(clientList) {
  //   for (var i = 0; i < clientList.length; i++) {
  //     var client = clientList[i];
  //     if (client.url == '/' && 'focus' in client)
  //       return client.focus();
  //   }
  //   if (clients.openWindow)
  //     return clients.openWindow('/');
  // }));
});