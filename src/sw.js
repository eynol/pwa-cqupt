let DEBUG = false // set to false before publish

/**
 *  上课的时间
 */
var TIME_GAP = [{
  fromH: 8,
  fromM: 0,
  toH: 9,
  toM: 40
}, {
  fromH: 10,
  fromM: 5,
  toH: 11,
  toM: 45
}, {
  fromH: 14,
  fromM: 0,
  toH: 15,
  toM: 40
}, {
  fromH: 16,
  fromM: 5,
  toH: 17,
  toM: 45
}, {
  fromH: 19,
  fromM: 0,
  toH: 20,
  toM: 40
}, {
  fromH: 20,
  fromM: 50,
  toH: 22,
  toM: 30
}]

/**
 *  当前时间是否在上课
 *
 * @param {int} _index 课程的索引
 * @param {int} hour  当前小时
 * @param {int} minute  当前分钟
 * @param {boolean} isEqual  是否包含整点
 * @returns {boolean}
 */
function isHavingClass(_index, hour, minute, isEqual) {
  var T = TIME_GAP[_index]
  if (isEqual) {
    return (T.fromH <= hour && T.fromM <= minute) && (T.toH >= hour && T.toM >= minute)
  } else {
    return (T.fromH < hour && T.fromM < minute) && (T.toH > hour && T.toM > minute)
  }
}

/**
 * sort class list by class Orders
 *
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
function sortClassList(a, b) {
  if (a.whichClass.substring(1, 3) > b.whichClass.substring(1, 3)) {
    return 1
  } else {
    return -1
  }
}

/**
 *  return rows index (start with 0);
 *
 * @param {string} str
 * @returns {number}
 */
function getRowIndex(str) {
  if (typeof str === 'object') {
    str = str
      .whichClass
      .substring(1, 3)
  }
  if (!str && str !== 0) {
    return 0
  }
  if (/\d+/.test(str)) {
    return Math.floor(Number(str.substring(0, 1)) / 2)
  } else {
    return 5
  }
}
/**
 * return colums index (start with 0);
 *
 * @param {number} num
 * @returns {number}
 */
function getColIndex(num) {
  if (!num && num !== 0) {
    return 0
  }
  if (num === 0) {
    return 6
  } else {
    return num - 1
  }
}

/**
 *  Date.getDay() 星期天是0
 *
 * @param {Date} thatDay
 * @returns
 */
function doTimeCount(thatDay) {
  var timeGap = thatDay - new Date(2017, 1, 27)
  var dayPast = Math.floor(timeGap / (1000 * 60 * 60 * 24)) + 1
  var weekendPast = Math.ceil(dayPast / 7)
  var isoddWeek = (weekendPast % 2) === 1
  var id = '' + thatDay.getFullYear() + thatDay.getMonth() + thatDay.getDate()
  return {
    id: id,
    timeGap: timeGap,
    dayPast: dayPast,
    weekendPast: weekendPast,
    isoddWeek: isoddWeek,
    todayDay: thatDay.getDay(),
    todayDate: thatDay.getDate(),
    todayMonth: thatDay.getMonth(),
    todayWeekday: [
      '日',
      '一',
      '二',
      '三',
      '四',
      '五',
      '六'
    ][thatDay.getDay()]
  }
}

const DB_NAME = 'cykb' // 数据库名称
// indexedDB 数据库版本， 如果以往的表结构有变化 需要在onupgradeneeded中更新
const DB_VER = 2
//  版本2 增加hitokoto的保存
const NAME_LIST_ALL = 'lists' //  缓存所有取得的课表的地方
const NAME_CAT = 'SchrodingerCat' // 存储其他对象的地方
const NAME_HITOKOTO = 'hitokoto' // 存储一言

// 默认的配置对象，包含提醒时间
const configDefaultSetting = {
  show: false,
  openFirst: false,
  first: '20',
  openSecond: false,
  second: '5',
  openThird: false,
  third: '0'
}
/**
 *  获取数据库的函数 ，处理 onupgradeneeded
 */
const getDB = function () {
  return new Promise((resolve, reject) => {
    let openRequest = indexedDB.open(DB_NAME, DB_VER)
    openRequest.onupgradeneeded = onupgradeneeded
    openRequest.onerror = (e) => {
      reject(e)
    }
    openRequest.onsuccess = (e) => {
      resolve(openRequest.result)
    }
  })
}

function onupgradeneeded(e) {
  if (DEBUG) {
    console.log('[sw]DB onupgradeneeded', e)
  }

  let oldVer = e.oldVersion
  let newVer = e.newVersion
  let db = e.target.result

  if (!db.objectStoreNames.contains(NAME_CAT)) {
    let cat = db.createObjectStore(NAME_CAT)
    cat.put(configDefaultSetting, 'config')
  }
  if (!db.objectStoreNames.contains(NAME_LIST_ALL)) {
    db.createObjectStore(NAME_LIST_ALL, {
      keyPath: 'id'
    })
  }
  if (!db.objectStoreNames.contains(NAME_HITOKOTO)) {
    let hitokoto = db.createObjectStore(NAME_HITOKOTO, {
      keyPath: 'id'
    })
    hitokoto.createIndex('id', 'id', {
      unique: true
    })
  }
}

/**
 *    Cache Logic Here
 */
const CACHE_NAME = 'precache-201706070050'
const VERSION_TAG = '1.1.1'
const updateInfoBody = '' +
  '1.兼容旧版本浏览器中 请求没有响应的问题（xhr.response）\n' +
  '2.使用Hitokoto一言API接口, 在离线情况下将使用之前缓存过的一言数据'

const {
  assets
} = global.serviceWorkerOption

let assetsToCache = [
  ...assets,
  './',
  './index.html'
]

assetsToCache = assetsToCache.map((path) => {
  return new URL(path, global.location).toString()
})

// When the service worker is first added to a computer.
self.addEventListener('install', (event) => {
  // Perform install steps.
  if (DEBUG) {
    console.log('[SW] Install event', event)
  }

  // Add core website files to cache during serviceworker installation.
  event.waitUntil(
    global.caches
    .open(CACHE_NAME)
    .then((cache) => {
      return cache.addAll(assetsToCache)
    })
    .then(() => {
      if (DEBUG) {
        console.log('Cached assets: main', assetsToCache)
      }
      return self.skipWaiting()
    })
    .catch((error) => {
      if (DEBUG) {
        console.error(error)
      }
      throw error
    })
  )
})

global.registration.addEventListener('updatefound', e => {
  if (DEBUG) {
    console.log('updatefound', e)
  }

  showNotification('发现新版本！', {
    body: '刷新页面后将使用新版本！'
  })
})

// After the install event.
self.addEventListener('activate', (event) => {
  if (DEBUG) {
    console.log('[SW] Activate event')
  }

  showNotification('已更新至 ' + VERSION_TAG + '！', {
    body: updateInfoBody
  })
  // Clean the caches
  event.waitUntil(
    global.caches
    .keys()
    .then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete the caches that are not the current one.
          if (cacheName.indexOf(CACHE_NAME) === 0) {
            return null
          }

          return global.caches.delete(cacheName)
        }),
      )
    }).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request

  // Ignore not GET request.
  if (request.method !== 'GET') {
    if (DEBUG) {
      console.log(`[SW] Ignore non GET request ${request.method}`)
    }
    return
  }

  const requestUrl = new URL(request.url)
  let resource

  // Ignore difference origin.
  if (requestUrl.origin !== location.origin) {
    if (DEBUG) {
      console.log(`[SW] Ignore difference origin ${requestUrl.origin}`)
    }
    return
  }

  if (request.headers.get('X-SW-tag') === 'get-list') {
    resource = getListFromServer(request)
  } else if (request.headers.get('X-SW-tag') === 'hitokoto') {
    resource = getHitokoto(request)
  } else {
    resource = global.caches.match(request)
      .then((response) => {
        if (response) {
          if (DEBUG) {
            console.log(`[SW] fetch URL ${requestUrl.href} from cache`)
          }

          return response
        }

        // Load and cache known assets.
        return fetch(request)
          .then((responseNetwork) => {
            if (!responseNetwork || !responseNetwork.ok) {
              if (DEBUG) {
                console.log(`[SW] URL [${
                requestUrl.toString()}] wrong responseNetwork: ${
                responseNetwork.status} ${responseNetwork.type}`)
              }

              return responseNetwork
            }

            if (DEBUG) {
              console.log(`[SW] URL ${requestUrl.href} fetched`)
            }

            const responseCache = responseNetwork.clone()

            global.caches
              .open(CACHE_NAME)
              .then((cache) => {
                return cache.put(request, responseCache)
              })
              .then(() => {
                if (DEBUG) {
                  console.log(`[SW] Cache asset: ${requestUrl.href}`)
                }
              })

            return responseNetwork
          })
          .catch(() => {
            // User is landing on our page.
            if (event.request.mode === 'navigate') {
              return global.caches.match('./')
            }

            return null
          })
      })
  }

  event.respondWith(resource)
})

self.addEventListener('notificationclick', function (event) {
  switch (event.action) {
    case 'dismiss':
      {
        event
        .notification
        .close()
        break
      }
    default:
      {
        event
        .notification
        .close()
        break
      }
  }

  // This looks to see if the current is already open and focuses if it is
  // event.waitUntil(clients.matchAll({   type: "window"
  // }).then(function(clientList) {   for (var i = 0; i < clientList.length; i++)
  // {     var client = clientList[i];     if (client.url == '/' && 'focus' in
  // client)       return client.focus();   }   if (clients.openWindow)     return
  // clients.openWindow('/'); }));
})

self.addEventListener('message', function (e) {
  if (DEBUG) {
    console.log('[sw]message event', e)
  }

  const action = e.data.action
  if (action === 'activate-publicChanel') {

  } else if (action === 'getconfig') {
    getDB().then(db => {
      db.transaction([NAME_CAT], 'readonly')
        .objectStore(NAME_CAT)
        .get('config')
        .onsuccess = function (event) {
          let result = event.target.result
          if (result) {
            e
              .ports[0]
              .postMessage(event.target.result)
          } else {
            showNotification('没有配置文件~将初始化配置!')
            db.transaction([NAME_CAT], 'readwrite')
              .objectStore(NAME_CAT)
              .add(configDefaultSetting, 'config')
              .onsuccess = successEvent => {
                e
                  .ports[0]
                  .postMessage(configDefaultSetting)
              }
          }
        }
    })
  } else if (action === 'test') {
    showNotification('推送测试!')
  } else if (action === 'saveconfig') {
    getDB().then(db => {
      db.transaction([NAME_CAT], 'readwrite')
        .objectStore(NAME_CAT)
        .put(e.data.data, 'config')
        .onsuccess = function (event) {
          e
            .ports[0]
            .postMessage({
              code: 0
            })
        }
    })
  }
})

/**
 *   ShowNotifications Logic Here
 *   Current service worker can not response at a specific time ,only to set a timer;
 */
let timerFailCounter = 0
setInterval(function () {
  getDB().then(db => {
    let theCat = db.transaction([NAME_CAT], 'readwrite').objectStore(NAME_CAT)

    //  当前时间信息
    let currentTime = new Date()
    let currentY = currentTime.getFullYear()
    let currentMo = currentTime.getMonth()
    let currentD = currentTime.getDate()
    let currentH = currentTime.getHours()
    let currentMin = currentTime.getMinutes()

    let user = {}
    let config = {}
    let todayList = []
    let timeOption = doTimeCount(currentTime)
    let timeOptionID = timeOption.id

    theCat
      .get(NAME_CAT)
      .onsuccess = (e) => {
        user = e.target.result

        if (!user) {
          if (timerFailCounter === 0 || timerFailCounter === 5) {
            showNotification('震惊！后台用户列表居然丢失！需要重新登录！>_<')
          }
          timerFailCounter = timerFailCounter + 1
          return false
        }
        let todayTransition = theCat.get('today')

        todayTransition.onerror = (e) => {
          todayList = user
            .list
            .filter(function (el) {
              if (el.weekend.indexOf(timeOption.weekendPast) !== -1 && el.day === timeOption.todayDay) {
                return true
              } else {
                return false
              }
            })
          if (todayList.length === 0) {
            return
          }
          todayList.sort(sortClassList)
          theCat.put({
            id: timeOptionID,
            list: todayList
          }, 'today').onsuccess = (e) => {
            afterGetToday(todayList)
          }
        }
        todayTransition.onsuccess = (e) => {
          let today = e.target.result

          if (today && today.id === timeOptionID) {
            todayList = today.list
          } else {
            todayList = user
              .list
              .filter(function (el) {
                if (el.weekend.indexOf(timeOption.weekendPast) !== -1 && el.day === timeOption.todayDay) {
                  return true
                } else {
                  return false
                }
              })
            if (todayList.length === 0) {
              return
            }
            todayList.sort(sortClassList)
            theCat.put({
              id: timeOptionID,
              list: todayList
            }, 'today')
          }
          afterGetToday(todayList)
        }

        function afterGetToday(todayList) {
          // 保证today_list
          if (todayList.length === 0) {
            return
          }

          // 今天没有课，就什么也不做；如果有课，继续执行
          theCat
            .get('config')
            .onsuccess = (e) => {
              config = e.target.result
              // showNotification()
              if (config.show === false) {
                return
              }

              // if closed ,return
              if (!(config.openFirst || config.openSecond || config.openThird)) {
                return
              }

              // 预先准备索引，用于判断将要提醒的课程是否真正上课
              let indexList = []
              todayList.forEach(function (el) {
                indexList.push(getRowIndex(el))
              })
              indexList.sort()
              let isHavingLastClass = function (currentIndex, hour, minute) {
                var i = indexList.indexOf(currentIndex)
                var lastIndex = indexList[i - 1]

                if (lastIndex) {
                  return isHavingClass(lastIndex, hour, minute, false)
                } else {
                  return false
                }
              }

              // 循环遍历每一节课
              todayList.forEach(function (el) {
                var index = getRowIndex(el)
                var classtime = TIME_GAP[index]
                var firstTime,
                  secondTime,
                  thirdTime

                // 显示第一次提醒
                if (config.openFirst && Number(config.first) > 0) {
                  if (!el.firstN) {
                    firstTime = new Date(currentY, currentMo, currentD, currentH, (currentMin + Number(config.first)))
                    let h = firstTime.getHours()
                    let m = firstTime.getMinutes()
                    if (classtime.fromH === h && classtime.fromM === m && !isHavingLastClass(index, h, m)) {
                      showNotification('【' + el.where + '】将在' + config.first + '分钟后上课！', {
                        body: el.className + '\n' + el.who,
                        tag: 'first'
                      })
                      el.firstN = true
                    }
                  }
                }

                // 显示第二次提醒
                if (config.openSecond && Number(config.second) > 0) {
                  if (!el.secondN) {
                    secondTime = new Date(currentY, currentMo, currentD, currentH, (currentMin + Number(config.second)))
                    let h = secondTime.getHours()
                    let m = secondTime.getMinutes()
                    if (classtime.fromH === h && classtime.fromM === m && !isHavingLastClass(index, h, m)) {
                      showNotification('【' + el.where + '】将在' + config.second + '分钟后上课！', {
                        body: el.className + '\n' + el.who,
                        tag: 'second'
                      })
                      el.secondN = true
                    }
                  }
                }

                // 显示第三次提醒
                if (config.openThird && Number(config.third) > 0) {
                  if (!el.thirdN) {
                    thirdTime = new Date(currentY, currentMo, currentD, currentH, (currentMin + Number(config.third)))
                    let h = thirdTime.getHours()
                    let m = thirdTime.getMinutes()
                    if (classtime.fromH === h && classtime.fromM === m && !isHavingLastClass(index, h, m)) {
                      showNotification('【' + el.where + '】将在' + config.third + '分钟后上课！', {
                        body: el.className + '\n' + el.who,
                        tag: 'third'
                      })
                      el.thirdN = true
                    }
                  }
                }

                if (!el.rightNow) {
                  if (classtime.fromH === currentH && classtime.fromM === currentMin) {
                    showNotification('【' + el.where + '】正在上课！', {
                      body: el.className + '\n' + el.who,
                      tag: 'rightNow'
                    })
                    el.rightNow = true
                  }
                }
              })

              theCat.put({
                id: timeOptionID,
                list: todayList
              }, 'today').onsuccess = e => {}
            }
        }
      }
  })
}, 20000)

function getDismissWords() {
  let list = ['(◍´꒳`◍)朕已阅!',
    'Σσ(・Д・；)走你！',
    '￣へ￣ 哦',
    '(￣.￣) 哦',
    '(╯°Д°)╯纳尼？？',
    '(°Д°)？关机重启试试？',
    'щ(ﾟДﾟщ) 懵逼状态',
    'biu~ ',
    '(｡•́︿•̀｡)又上课',
    '(｡•́__ก̀｡)上课让我忧郁了很多',
    '＿〆(。。)   作业太多',
    '(ÒωÓױ)！作业走丢了',
    '(๑ó﹏ò๑)非义务教育可以选修咩',
    '_(:3」∠)_我的床需要我',
    '(○｀（●●）´○)ノ唔唔唔~唔~',
    '(￣(●●)￣)　唔唔唔~',
    'U·ェ·U 喵~',
    '(ฅ´ω`ฅ) 喵~',
    '你这么爱学习，一定活得很难过吧',
    '犭(ฅ´ω`ฅ) ',
    '(╥╯﹏╰╥)ง光宗耀祖支撑着我去教室',
    '|･ω･｀)作业只写了一点',
    '(:3[▓▓]快醒醒下课了',
    '（*゜Д゜）σ凸←自爆按钮 ',
    '(●°u°●)​ 此刻我的内心是崩溃的',
    '(❁´▽`❁)每天穿的都是睡衣',
    '(╭☞•́⍛•̀)╭☞就是你',
    '٩(ˊᗜˋ*)و 有木有wifi~',
    '(:[___]',
    '(:3[」_]',
    '(:3[▓▓▓]',
    '┐(‘д’)┌ 爸爸还能说什么',
    '┐(・o・)┌ 爸爸还能说什么',
    '┐(ﾟ～ﾟ)┌ 爸爸还能说什么',
    '┐(￣(ェ)￣)┌爸爸还能说什么',
    '┐(￣ヘ￣)┌爸爸还能说什么',
    '～(ಥ﹏ಥ)～ 冷冷的狗粮在脸上胡乱地拍',
    '（￣ c￣）y▂ξ  抽根烟让爷静静！',
    'ᕦ(･ㅂ･)ᕤ今天又是充满希望的一天！',
    '你走吧，我知道了ヽ(´•ω•`)､',
    '(╬◣д◢)Shut up and take my money!',
    '阿姆斯特朗回旋加速喷气式阿姆斯特朗炮!',
    '烫烫烫烫烫'
  ]
  let radomIndex = Math.floor(Math.random() * list.length)
  return list[radomIndex]
}

function getListFromServer(request) {
  if (DEBUG) {
    console.log('[sw]request from server', request)
  }

  return fetch(request.url).then(resp => {
    return new Promise((resolve, reject) => {
      resp
        .clone()
        .json()
        .then(json => {
          if (Number(json.code) !== 0) {
            showNotification('更新课表失败!')
            resolve(resp)
          } else {
            getDB().then(db => {
              let transaction = db.transaction([
                NAME_CAT, NAME_LIST_ALL
              ], 'readwrite')
              let cat = transaction.objectStore(NAME_CAT)
              let listStore = transaction.objectStore(NAME_LIST_ALL)
              let afterStore = () => {
                if (request.headers.get('X-ROOTUSER') === 'ROOT') {
                  cat
                    .put(json, NAME_CAT)
                    .onsuccess = () => {
                      resolve(resp)
                    }
                } else {
                  resolve(resp)
                }
              }

              listStore
                .put(json)
                .onsuccess = afterStore
            })
          }
        })
    })
  })
}

function getHitokoto(request) {
  if (DEBUG) {
    console.log('[sw]request hitokoto', request)
  }
  if (navigator.onLine) {
    return fetch(request.url).then(resp => {
      return new Promise((resolve, reject) => {
        resp
          .clone()
          .json()
          .then(json => {
            getDB().then(db => {
              let transaction = db.transaction([
                NAME_HITOKOTO
              ], 'readwrite')
              let hitokoto = transaction.objectStore(NAME_HITOKOTO)

              hitokoto.put(json).onsuccess = (e) => {
                console.log('addAttempt', e)
                resolve(resp)
              }
            })
          })
      })
    })
  } else {
    //  离线状态下，随机返回缓存的
    return new Promise((resolve, reject) => {
      getDB().then(db => {
        let transaction = db.transaction([
          NAME_HITOKOTO
        ], 'readwrite')
        let hitokoto = transaction.objectStore(NAME_HITOKOTO)
        let countRequest = hitokoto.count()
        countRequest.onerror = (e) => {
          reject(e)
        }
        countRequest.onsuccess = (e) => {
          let total = countRequest.result
          let luckIndex = Math.floor(Math.random() * total)
          let jumped = false
          let makeAResponse = function (json) {
            let body = new Blob([JSON.stringify(json, null, 2)], {
              type: 'application/json'
            })
            let size = body.size
            return new Response(body, {
              'status': 200,
              'statusText': 'OK',
              headers: {
                'Content-Length': size
              }
            })
          }
          let getResultReq = hitokoto.openCursor()
          getResultReq.onerror = (e) => {
            reject(e)
          }
          getResultReq.onsuccess = (e) => {
            let cursor = e.target.result
            if (DEBUG) {
              console.log('[sw]in getResultReq', e, getResultReq)
            }
            if (!jumped) {
              if (luckIndex === 0) {
                //  cursor.advance的参数必须是大于0的整数
                resolve(makeAResponse(cursor.value))
              } else {
                cursor.advance(luckIndex)
                jumped = true
              }
            } else {
              resolve(makeAResponse(cursor.value))
            }
          }
        }
      })
    }).then(function (resp) {
      console.log(resp.clone())
      return Promise.resolve(resp)
    })
  }
}

function showNotification(title, option) {
  let _option = Object.assign({
    tag: 'public',
    icon: './static/img/cykb192.png',
    vibrate: [
      500,
      700,
      700,
      700,
      1000,
      700,
      1000
    ],
    actions: [{
      action: 'dismiss',
      title: getDismissWords()
    }]
  }, option)

  if (Notification.permission === 'granted') {
    return global.registration.active && global.registration.showNotification(title, _option)
  } else {
    console.warn('No permission')
    return
  }
}

function uninstall() {
  indexedDB.deleteDatabase(DB_NAME)
  caches
    .keys()
    .then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete)
      }))
    })
    .then(() => {
      global.registration
        .unregister()
        .then(e => {
          postMessage(JSON.stringify({
            tag: 'alert',
            msg: '已卸载该应用'
          }))
        })
    })
}
