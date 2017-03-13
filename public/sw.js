importScripts('js/util.js')

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

// Names of the two caches used in this version of the service worker. Change to
// v2, etc. when you update any of the local resources, which will in turn
// trigger the install event again.
const PRECACHE = 'precache-201703131114';
const RUNTIME = 'runtime';

const DB_NAME = 'cykb';
const DB_VER = 1;
const NAME_LIST_ALL = 'lists';
const NAME_CAT = 'SchrodingerCat';

const default_config = {
  show: false,
  openFirst: false,
  first: 20,
  openSecond: false,
  second: 5,
  openThird: false,
  third: 0
}
/**
 *
 */
const getDB = function () {
  return new Promise((resolve, reject) => {

    let openRequest = indexedDB.open(DB_NAME, DB_VER)
    openRequest.onupgradeneeded = onupgradeneeded;
    openRequest.onerror = (e) => {
      reject(e)
    }
    openRequest.onsuccess = (e) => {
      resolve(openRequest.result);
    }
  })

}

function onupgradeneeded(e) {
  let oldVer = e.oldVersion;
  let newVer = e.newVersion;
  let db = e.target.result;

  if (!db.objectStoreNames.contains(NAME_CAT)) {
    let cat = db.createObjectStore(NAME_CAT);
    cat.put(default_config, 'config');
  }
  if (!db.objectStoreNames.contains(NAME_LIST_ALL)) {
    db.createObjectStore(NAME_LIST_ALL, {keyPath: "id"});
  }

}
// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  './',
  './css/index.css',
  './js/util.js',
  './js/index.min.js',
  './lib/vue/vue.min.js',
  './icon/list.svg',
  './icon/list-active.svg',
  './icon/day.svg',
  './icon/day-active.svg',
  './icon/setting.svg',
  './icon/setting-active.svg',
  './cykb192.png'
];

const ICON_PATH = './cykb192.png';

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(caches.open(PRECACHE).then(cache => cache.addAll(PRECACHE_URLS)).then(self.skipWaiting()));
});

self.addEventListener('statechange', e => {
  console.log("statechange", e);
})
self.addEventListener('updatefound', e => {
  console.log('updatefound', e);
})
// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {

  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(caches.keys().then(cacheNames => {
    return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
  }).then(cachesToDelete => {
    return Promise.all(cachesToDelete.map(cacheToDelete => {
      return caches.delete(cacheToDelete);
    }));
  }).then(() => self.clients.claim()));
});

// The fetch handler serves responses for same-origin resources from a cache. If
// no response is found, it populates the runtime cache with the response from
// the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {

    if (event.request.headers.get('X-SW-tag') == "get-list") {
      event.respondWith(fetch(event.request.url).then(resp => {
        return new Promise((resolve, reject) => {
          resp
            .clone()
            .json()
            .then(json => {
              console.log(json);
              if (json.code != 0) {
                showNotification('更新课表失败!')
                resolve(resp);
              } else {

                getDB().then(db => {
                  let transaction = db.transaction([
                    NAME_CAT, NAME_LIST_ALL
                  ], "readwrite");
                  let cat = transaction.objectStore(NAME_CAT);
                  let listStore = transaction.objectStore(NAME_LIST_ALL);
                  let afterStore = () => {
                    if (event.request.headers.get('X-ROOTUSER') == "ROOT") {
                      cat
                        .put(json, NAME_CAT)
                        .onsuccess = () => {
                        showNotification('更新课表成功!', {
                          body: "学号为" + json.id
                        })
                        resolve(resp);
                      }
                    } else {
                      resolve(resp)
                    }
                  };
                  var req = listStore.get(json.id);
                  req.onsuccess = (e) => {
                    if (req.result) {
                      listStore
                        .put(json)
                        .onsuccess = afterStore;
                    } else {
                      listStore
                        .add(json)
                        .onsuccess = afterStore;
                    }
                  }
                  req.onerror = () => {
                    console.log("error")
                  }

                })
              }
            });
        })

      }))
    } else if (navigator.onLine) {
      //Online strategy
      event.respondWith(caches.open(PRECACHE).then(cache => cache.match(event.request.clone())).then(cachedResponse => {
        if (cachedResponse) {
          //Request precached resources, return the response directly.
          console.log("precache:" + event.request.url)
          return cachedResponse
        } else {
          //onLine resources first , always get a new one.
          console.log("getNew:" + event.request.url)
          return caches
            .open(RUNTIME)
            .then(cache => {
              return fetch(event.request).then(response => {
                // Put a copy of the response in the runtime cache.
                return cache
                  .put(event.request, response.clone())
                  .then(() => {
                    return response
                  })
              })
            })
        }
      }))
    } else {
      //Off-line , Cache first, 404 second
      event.respondWith(caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse
        } else {
          return Response.error()
        }
      }))
    }
  }
});

self.addEventListener('notificationclick', function (event) {
  console.log(event)
  console.log('On notification click: ', event.notification.tag);
  switch (event.action) {
    case "dismiss":
      {}
    default:
      {
        event
          .notification
          .close()
        break;
      }
  }

  // This looks to see if the current is already open and focuses if it is
  // event.waitUntil(clients.matchAll({   type: "window"
  // }).then(function(clientList) {   for (var i = 0; i < clientList.length; i++)
  // {     var client = clientList[i];     if (client.url == '/' && 'focus' in
  // client)       return client.focus();   }   if (clients.openWindow)     return
  // clients.openWindow('/'); }));
});

self.addEventListener('message', function (e) {
  console.log(e);
  switch (e.data.action) {
    case "getconfig":
      {
        getDB().then(db => {
          db.transaction([NAME_CAT], 'readonly')
            .objectStore(NAME_CAT)
            .get('config')
            .onsuccess = function (event) {
            e
              .ports[0]
              .postMessage(event.target.result)
          }
        });

      

        break;
      }
    case "test":
      {
        showNotification("推送测试!")
        break;
      }
    case "saveconfig":
      {
        getDB().then(db => {
          db.transaction([NAME_CAT], 'readwrite')
            .objectStore(NAME_CAT)
            .put(e.data.data, 'config')
            .onsuccess = function (event) {
            e
              .ports[0]
              .postMessage({code: 0})
           
          }
        });

        break;
      }
  }
})

/**
 *   ShowNotifications；
 *   current service worker can not response at a specific time ,only to set a timer;
 */
setInterval(function () {
  getDB().then(db => {
    let theCat = db.transaction([NAME_CAT], 'readwrite').objectStore(NAME_CAT);

    let currentTime = new Date();
    let currentY = currentTime.getFullYear()
    let currentMo = currentTime.getMonth();
    let currentD = currentTime.getDate();
    let currentH = currentTime.getHours();
    let currentMin = currentTime.getMinutes();

    let user = {};
    let config = {};
    let today_list = [];
    let timeOption = doTimeCount(currentTime);
    let timeOptionID = timeOption.id;

    theCat
      .get(NAME_CAT)
      .onsuccess = (e) => {
      user = e.target.result;
      if (!user) 
        return false;
      theCat
        .get('today')
        .onsuccess = (e) => {
        let today = e.target.result;

        if (today && today.id == timeOptionID) {
          today_list = today.list;
        } else {
          today_list = user
            .list
            .filter(function (el) {
              if (el.weekend.indexOf(timeOption.weekendPast) != -1 && el.day == timeOption.todayDay) {
                return true;
              } else {
                return false;
              }
            });
          if (today_list.length == 0) 
            return;
          theCat[today
              ? "put"
              : "add"]({
            id: timeOptionID,
            list: today_list
          }, 'today');
        }

        //保证today_list
        if (today_list.length == 0) 
          return;
        
        //今天没有课，就什么也不做；如果有课，继续执行
        theCat
          .get('config')
          .onsuccess = (e) => {
          config = e.target.result;
          //showNotification()
          if (config.show == false) {
            return;
          }

          // if closed ,return
          if (!(config.openFirst || config.openSecond || config.openThird)) {
            return;
          }

          //预先准备索引，用于判断将要提醒的课程是否真正上课
          let indexList = [];
          today_list.forEach(function (el) {
            indexList.push(getRowIndex(el))
          });
          indexList.sort();
          let isHavingLastClass = function (currentIndex, hour, minute) {
            var i = indexList.indexOf(currentIndex);
            var lastIndex = indexList[i - 1];
            if (lastIndex) {
              return isHavingClass(lastIndex, hour, minute, false);
            } else {
              return false;
            }
          };

          //循环遍历每一节课
          today_list.forEach(function (el) {
            var index = getRowIndex(el);
            var classtime = TIME_GAP[index];
            var firstTime,
              secondTime,
              thirdTime;

            //显示第一次提醒
            if (config.openFirst && Number(config.first) > 0) {
              if (!el.firstN) {
                firstTime = new Date(currentY, currentMo, currentD, currentH, (currentMin + Number(config.first)))
                let h = firstTime.getHours();
                let m = firstTime.getMinutes();
                if (classtime.fromH == h && classtime.fromM == m &&!isHavingLastClass(index,h,m)) {

                  showNotification("【"+el.where+"】将在"+config.first+"分钟后上课！", {
                    body: el.className + '\n' + el.who,
                    tag: "first"
                  });
                  el.firstN = true;
                }
              }
            }

            //显示第二次提醒
            if (config.openSecond && Number(config.second) > 0) {
              if (!el.secondN) {
                secondTime = new Date(currentY, currentMo, currentD, currentH, (currentMin + Number(config.first)))
                let h = secondTime.getHours();
                let m = secondTime.getMinutes();
                if (classtime.fromH == h && classtime.fromM == m &&!isHavingLastClass(index,h,m)) {
                  showNotification("【"+el.where+"】将在"+config.second+"分钟后上课！", {
                    body: el.className + '\n' + el.who,
                    tag: "second"
                  });
                  el.secondN = true;
                }
              }
            }

            //显示第三次提醒
            if (config.openThird && Number(config.third) > 0) {
              if (!el.thirdN) {
                thirdTime = new Date(currentY, currentMo, currentD, currentH, (currentMin + Number(config.first)))
                let h = thirdTime.getHours();
                let m = thirdTime.getMinutes();
                if (classtime.fromH == h && classtime.fromM == m &&!isHavingLastClass(index,h,m)) {
                  showNotification("【"+el.where+"】将在"+config.third+"分钟后上课！", {
                    body: el.className + '\n' + el.who,
                    tag: "third"
                  });
                  el.thirdN = true;
                }
              }
            }

            if (!el.rightNow) {
              if (classtime.fromH == currentH && classtime.fromM == currentMin) {
                showNotification('【'+el.where+'】'+"正在上课！", {
                  body: el.className + '\n' + el.who,
                  tag: "rightNow"
                });
                el.rightNow = true;
              }
            }

          });

          theCat
            .put(today_list, 'today')
            .onsuccess = e => {};

        }
      }

    }
  })

}, 60000)

function getUserList() {
  return new Promise((resolve, reject) => {})
}

function showNotification(title, option) {
  let default_option = Object.assign({
    tag: "public",
    icon: "./cykb192.png",
    vibrate: [
      500,
      700,
      700,
      700,
      1000,
      700,
      1000
    ],
    actions: [
      {
        action: "dismiss",
        title: "我我我知道了(●￣(ｴ)￣●)"
      }
    ]
  }, option)

  if (Notification.permission == 'granted') {
    return registration.showNotification(title, default_option)
  } else {
    console.warn("No permission")
    return Promise.reject("No permission")
  }

}

function uninstall() {
  indexedDB.deleteDatabase(DB_NAME);
  caches
    .keys()
    .then(cacheNames => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    })
    .then(() => {
      registration
        .unregister()
        .then(e => {
          postMessage(JSON.stringify({tag: 'alert', msg: '已卸载该应用'}))
        })
    });

}
