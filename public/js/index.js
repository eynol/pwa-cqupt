var U = {
  id: document
    .getElementById
    .bind(document)
}

var storeTool = {
  _prefix: "CQUPT",
  getSchoolID: function () {
    return localStorage.getItem(this._prefix + 'schoolID');
  },
  setSchoolID: function (sid) {
    return localStorage.setItem(this._prefix + 'schoolID', String(sid));
  },
  getListById: function (sid) {
    var str = localStorage.getItem(this._prefix + 'list' + sid);
    return JSON.parse(str);
  },
  setListById: function (sid, list) {
    var str = '';
    if (typeof list === 'string') {
      str = list;
    } else if (typeof list === 'object') {
      str = JSON.stringify(list);
    }
    localStorage.setItem(this._prefix + 'list' + sid, str);
  },
  getLastRequestTime: function () {
    return localStorage.getItem(this._prefix + 'lastRequestTime');
  },

  setLastRequestTime: function (time_str) {
    return localStorage.setItem(this._prefix + 'lastRequestTime', time_str);
  },

  signout: function () {
    var id_to_delete = this.getSchoolID();
    localStorage.removeItem(this._prefix + 'schoolID');
    localStorage.removeItem(this._prefix + 'list' + id_to_delete);
    localStorage.removeItem(this._prefix + 'lastRequestTime');
  }
}

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
            _self.$emit('success', result);
          } else {
            _self.error(result.msg)
          }
        });

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

Vue.component('main-panel', {

  template: '#tpl-main-panel',
  props: [
    'sid', 'list', 'today', 'tomorrow', 'lastUpdateTime'
  ],
  data: function () {
    var todayList = [],
      tomorrowList = [];
    var _this = this;
    this
      .list
      .forEach(function (el) {
        el.thisWeek = (el.weekend && (el.weekend.indexOf(_this.today.weekendPast) !== -1))
          ? true
          : false;
      })

    return {tab: 'today', tableActive: false, isLoading: false}
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
  methods: {
    show_table: function () {
      this.tableActive = true
    },
    hide_table: function () {
      this.tableActive = false
    },
    navTo: function (tab) {
      this.tab = tab;
    },
    updateList: function () {

      var _this = this;
      this.isLoading = true;
      getListById(this.sid, function (err, result) {
        if (err) {
          _this.isLoading = false;
          return;
        }
        _this.$emit('success', result);
        _this.isLoading = false;
      })
    },
    signout: function () {
      this.$emit('signout');
    }
  }

})

var store_id = storeTool.getSchoolID();
var store_list = storeTool.getListById(store_id);
var lastRequestTime = storeTool.getLastRequestTime();
var app = new Vue({
  el: '#app',
  data: {
    id: store_id,
    originList: store_list || [],
    currentView: "",
    todayOption: {},
    tomorrowOption: {},
    lastRequestTime: lastRequestTime
  },
  beforeMount: function () {
    if (this.id) {
      this.currentView = 'main-panel'
    } else {
      this.currentView = 'login'
    }
    this.newDay();
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
      console.log("receive id:" + result.id);

      this.id = Number(result.id);
      this.lastRequestTime = result.time;
      this.originList = result.list;
      this.currentView = 'main-panel';

      storeTool.setSchoolID(this.id);
      storeTool.setLastRequestTime(result.time);
      storeTool.setListById(this.id, result.list);
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
    }

  }
})

/**
 * 新的一天更新日期
 */
app.$on('DayDown', function () {
  app.newDay()
})
setInterval((function () {
  var current_day = (new Date().getDay())
  return function () {
    var newDay = (new Date()).getDay();
    if (newDay != current_day) {
      app.$emit('DayDown')
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
    todayDay: thatDay.getDay()
  }
}
function getListById(sid, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('get', './api/kebiao/stu/' + sid + '?t=' + Date.now());
  xhr.responseType = 'json';
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

if ('serviceWorker' in navigator) {
  navigator
    .serviceWorker
    .register('./sw.js')
    .then(function (reg) {
      console.log(reg)
      reg.active.onmessage = function (e) {
        console.log(e.data)
      }
    reg.showNotification("3302", {
              
              body: "软件工程导论 张西华，\n hell",
              data:"nice work",
              tag: "yes",
              icon:'./cykb192.png',
              vibrate: [200, 100, 200, 100, 200, 100, 200],
              sticky:true,
              requireInteraction:true,
              actions:[{action:"dismiss",title:"知道了"},{action:"arived",title:"我到教室了"}]
            })
      if (Notification.permission == 'default') {

        Notification
          .requestPermission()
          .then(function (result) {
            console.log(result);
           
          });
      }

    })
}
