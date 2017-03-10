var U = {
  id: document
    .getElementById
    .bind(document)
}

var TIME_GAP = [
  {
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
  }
]

var storeTool = {
  _prefix: "CQUPT",
  _sid: "userSid",
  setUserList: function (list) {
    var str = '';
    if (typeof list === 'string') {
      str = list;
    } else if (typeof list === 'object') {
      str = JSON.stringify(list);
    }
    localStorage.setItem(this._prefix + 'UserList', str);
  },
  getUserList: function () {
    var str = localStorage.getItem(this._prefix + 'UserList');
    return JSON.parse(str);
  },

  signout: function () {
    localStorage.removeItem(this._prefix + 'UserList');

  }
}

var Listener = new Vue();

Vue.component('login', {
  // 声明 props
  template: '#tpl-login',
  props: [],
  data: function () {
    return {fakeId: undefined}
  },
  methods: {
    fakeIdKeyDown: function (e) {
      if (e.keyCode == 13) {
        this.enterApp()
      }
    },
    enterApp: function (e) {
      var _self = this;
      if (/\d{10}/.test(this.fakeId)) {
        getListById(this.fakeId, function (err, result) {
          if (err) {
            return;
          }
          if (result.code === 0) {
            result.id = _self.fakeId;
            Listener.$emit('success-login', result);
          } else {
            _self.error(result.msg)
          }
        }, {root: true});

      } else {

        this.error("请输入正确的学号(不是一卡通号)")

      }
    },
    error: function (msg) {
      setTimeout(function () {
        alert(msg);
      }, 4);
    }
  }

})

Vue.component('content-day', {
  // 声明 props
  name: 'content-day',
  template: '#tpl-content-day',
  props: [
    'list', 'today', 'tomorrow', 'tomorrowOption2', 'lastUpdateTime'
  ],
  data: function () {
    return {fakeId: undefined}
  },
  computed: {
    updateTime: function () {
      return new Date(Number(this.lastUpdateTime));
    },

    todayList: function () {
      var _this = this;
      var list = [];
      this
        .list
        .forEach(function (el) {
          if (el.weekend && el.weekend.indexOf(_this.today.weekendPast) !== -1 && el.day === _this.today.todayDay) {
            list.push(el)
          }
        })
      return list.sort(sortClassList);
    },
    tomorrowList: function () {
      var _this = this;
      var list = [];
      this
        .list
        .forEach(function (el) {
          if (el.weekend && el.weekend.indexOf(_this.tomorrow.weekendPast) !== -1 && el.day === _this.tomorrow.todayDay) {
            list.push(el)
          }
        })
      return list.sort(sortClassList);
    }
  },
  created: function () {
    var _this = this;
    var timFunc = function () {
      // current time
      var now = new Date();
      var nowH = now.getHours();
      var nowM = now.getMinutes();

      // 20 minutes later's time
      var after20M = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nowH, nowM + 130);
      console.log(after20M)
      var aftH = after20M.getHours();
      var aftM = after20M.getMinutes();
      _this
        .todayList
        .forEach(function (el) {
          console.log(el);
          if (el.whichClass) {
            var Classindex = getRowIndex(el.whichClass.substring(1, 3));
            var isHavingClass = function (hour, minute) {
              var T = TIME_GAP[Classindex];
              return (T.fromH <= hour && T.fromM <= minute) && (T.toH >= hour && T.toM >= minute)
            }
            if (isHavingClass(nowH, nowM) || isHavingClass(aftH, aftM)) {
              el.activated = true;
            } else {
              el.activated = false;
            }
          }
        })
    }
    timFunc();
    setInterval(timFunc, 60000);
  },
  methods: {}

})

Vue.component('content-table', {
  // 声明 props
  name: 'content-table',
  template: '#tpl-content-table',
  props: [
    'list', 'today', 'lastUpdateTime'
  ],
  computed: {
    updateTime: function () {
      return new Date(Number(this.lastUpdateTime));
    },
    table: function () {
      var ret = {
        hasWeekend: false,
        data: [
          [
            [],
            [],
            [],
            [],
            [],
            [],
            []
          ],
          [
            [],
            [],
            [],
            [],
            [],
            [],
            []
          ],
          [
            [],
            [],
            [],
            [],
            [],
            [],
            []
          ],
          [
            [],
            [],
            [],
            [],
            [],
            [],
            []
          ],
          [
            [],
            [],
            [],
            [],
            [],
            [],
            []
          ],
          [
            [],
            [],
            [],
            [],
            [],
            [],
            []
          ]
        ]
      };

      this
        .list
        .forEach(function (el) {
          var rowIndex = getRowIndex(el.whichClass && el.whichClass.substring(1, 3));
          var colIndex = getColIndex(el.day);
          if (/6|0/.test(el.day)) {
            ret.hasWeekend = true;
          }
          ret
            .data[rowIndex][colIndex]
            .push(el);
        })

      return ret;
    }
  },
  methods: {}

})

Vue.component('content-setting', {
  // 声明 props
  name: 'content-setting',
  template: '#tpl-content-setting',
  props: ['sid'],
  data: function () {
    return {isLoading: false}
  },
  methods: {
    updateList: function () {

      var _this = this;
      this.isLoading = true;
      getListById(this.sid, function (err, result) {
        if (err) {
          _this.isLoading = false;
          return;
        }
        Listener.$emit('success-login', result);
        _this.isLoading = false;
      }, {root: true})
    },
    signout: function () {
      Listener.$emit('signout');
    }
  }

})

/**
 * sort class list by class Orders
 *
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
function sortClassList(a, b) {
  if (a.whichClass.substring(1, 3) > b.whichClass.substring(1, 3)) {
    return 1;
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
  if (!str && str !== 0) 
    return 0;
  if (/\d+/.test(str)) {
    return Math.floor(Number(str.substring(0, 1)) / 2)
  } else {
    return 5;
  }
}
/**
 * return colums index (start with 0);
 *
 * @param {number} num
 * @returns {number}
 */
function getColIndex(num) {
  if (!num && num !== 0) 
    return 0;
  return num == 0
    ? 6
    : num - 1;
}

Vue.component('main-panel', {

  template: '#tpl-main-panel',
  props: [
    'sid', 'list', 'today', 'tomorrow', 'lastUpdateTime'
  ],
  data: function () {
    return {tab: 'day', isLoading: false}
  },
  components: {
    'day': Vue.component('content-day'),
    'week': Vue.component('content-table'),
    'setting': Vue.component('content-setting')
  },

  methods: {

    navTo: function (tab) {
      this.tab = tab;
    }
  }

})

var app = new Vue({
  el: '#app',
  data: {
    id: undefined,
    originList: [],
    currentView: "",
    todayOption: {},
    tomorrowOption: {},
    lastRequestTime: '1',
    tab: "day"
  },
  created: function () {
    _this = this;
    Listener.$on('success-login', function (result) {
      _this.login(result);
    });
    Listener.$on('signout', function () {
      _this.signout()
    });
    /**
     * 新的一天更新日期
     */
    Listener.$on('DayDown', function () {
      _this.newDay()
    });


/**
 *  提取本地数据
 */
     var result = storeTool.getUserList();
    if (result) {

      var s_id = result.id;
      var s_list = result.list;
      var lastRequestTime = result.time;
      console.log(lastRequestTime);
      this.id = s_id;
      this.originList = s_list || [];
      this.lastRequestTime = lastRequestTime;
      this.currentView = 'main-panel'
    } else {
      console.log(this);
      this.currentView = 'login'
    }

  },
  beforeMount: function () {

    this.newDay();
    this.updateThisWeek();
  },
  beforeUpdate: function () {
    this.updateThisWeek()
  },
  components: {
    'login': Vue.component('login'),
    'main-panel': Vue.component('main-panel')
  },
  computed: {
    hasLogin: function () {
      return this.id
        ? true
        : false;
    }
  },
  methods: {
    login: function (result) {
      var _this = this;

      this.id = Number(result.id);
      this.lastRequestTime = result.time;
      this.originList = result.list;
      this.currentView = 'main-panel';

      storeTool.setUserList(result);
     
    },
    newDay: function () {
      var d = new Date();
      this.todayOption = doTimeCount(d),
      this.tomorrowOption = doTimeCount(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))
    },
    signout: function () {
      this.id = undefined;
      this.originList = [];
      this.currentView = 'login';
      storeTool.signout();
    },
    updateThisWeek: function () {
      var _this = this;
      this
        .originList
        .forEach(function (el) {
          el.thisWeek = (el.weekend && (el.weekend.indexOf(_this.todayOption.weekendPast) !== -1))
            ? true
            : false;
        })

    }

  }
})

setInterval((function () {
  var current_day = (new Date().getDay());

  return function () {
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var today_day = now.getDay();
    if (today_day != current_day) {
      setTimeout(function () {
        Listener.$emit('DayDown')
      }, 4);
      current_day = today_day;
    }
    console.log('哔')
  }
})(), 10000)

/**
 *  Date.getDay() 星期天是0
 *
 * @param {date} thatDay
 * @returns
 */
function doTimeCount(thatDay) {

  var timeGap = thatDay - new Date(2017, 1, 27);
  var dayPast = Math.floor(timeGap / (1000 * 60 * 60 * 24)) + 1;
  var weekendPast = Math.floor(dayPast / 7) + 1;
  var isoddWeek = (weekendPast % 2) === 1;

  return {
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

function getListById(sid, callback, option) {
  var xhr = new XMLHttpRequest();
  xhr.open('get', './api/kebiao/stu/' + sid + '?t=' + Date.now() + (option.root
    ? '#ROOTUSER'
    : ''));
  console.log(option)
  xhr.responseType = 'json';
  if (option.root) {
    xhr.setRequestHeader('X-ROOTUSER', 'ROOT')
  }
  xhr.setRequestHeader('X-SW-tag', 'get-list')
  xhr.onload = function (e) {
    callback(null, xhr.response)
  }
  xhr.onerror = function (e) {
    console.log(e)
    alert("发送失败！")
    callback(e);
  }
  xhr.send();
}

var detector = {
  serviceWorker: 'serviceWorker' in navigator,
  promise: 'Promise' in window,
  cache: 'Cache' in window,
  indexedDB: 'indexedDB' in window,
  nothin: 'nothin' in window
}

if ('serviceWorker' in navigator) {

  navigator
    .serviceWorker
    .register('./sw.js')

  navigator
    .serviceWorker
    .ready
    .then(function (registration) {
      console.log(registration)
      console.log(navigator.serviceWorker)
      registration.active.onmessage = function (e) {
        console.log("OnMessage")
        console.log(e.data)
      }

      Notification
        .requestPermission()
        .then(function (result) {
          console.log(result);

        })
      registration.showNotification("3302", {
        body: "软件工程导论 张西华，\n hell",
        data: "nice work",
        tag: "yes",
        icon: './cykb192.png',
        vibrate: [
          200,
          100,
          200,
          100,
          200,
          100,
          200
        ],
        actions: [
          {
            action: "dismiss",
            title: "知道了"
          }, {
            action: "arived",
            title: "我到教室了"
          }
        ]
      })

    })

}