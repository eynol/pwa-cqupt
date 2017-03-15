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
      var after20M = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nowH, nowM + 20);

      var aftH = after20M.getHours();
      var aftM = after20M.getMinutes();
      _this
        .todayList
        .forEach(function (el) {

          if (el.whichClass) {
            var classIndex = getRowIndex(el.whichClass.substring(1, 3));

            if (isHavingClass(classIndex, nowH, nowM, true) || isHavingClass(classIndex, aftH, aftM, true)) {
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
    return {
      urlScreenShot: "http://pluscdn.heitaov.cn/Screenrecord-2017-03-12-23-30-39-643.mp4",
      isLoading: false,
      config: {
        show: false,
        openFirst: false,
        first: 20,
        openSecond: false,
        second: 5,
        openThird: false,
        third: 0
      }
    }
  },

  // watch:{   config:function(a,b){     console.log(a,b)   } },
  created: function () {
    this
      .$watch('config.show', function (a) {
        var _this = this;
        if (a == true) {
          if (Notification.permission !== "granted") {
            alert("请同意通知申请。")
            Notification
              .requestPermission()
              .then(function (result) {
                if (result != "granted") {
                  alert('无通知权限权限，无法开启.请清除本网站所有数据重试。');
                  _this.config.show = false;
                }
              })
          }
        }
        return false;
      });
    this.initConfig();

  },
  methods: {
    updateList: function () {

      var _this = this;
      //this.isLoading = true;
      getListById(this.sid, function (err, result) {
        if (err) {
          //_this.isLoading = false;
          return;
        }
        Listener.$emit('success-login', result);
        //_this.isLoading = false;
      }, {root: true})
    },
    signout: function () {
      Listener.$emit('signout');
    },
    pushtest: function () {

      var mc = new MessageChannel();
      navigator
        .serviceWorker
        .controller
        .postMessage({
          action: "test"
        }, [mc.port2]);
      mc.port1.onmessage = function (e) {
        console.log('test recived')
      };
    },
    initConfig: function () {
      var _this = this;
      var mc = new MessageChannel();
      navigator
        .serviceWorker
        .ready
        .then(function () {
          navigator
            .serviceWorker
            .controller
            .postMessage({
              action: "getconfig"
            }, [mc.port2]);
          mc.port1.onmessage = function (e) {
            var _timer = undefined;
            _this.config = e.data;
            console.log(e)
            console.log("recive data")
            _this.$watch('config', function (_new, _old) {
              //if the input is "" string, let it be 0 at nextTick;
              if (_new.first == "" || _new.first < 0) {
                _new.first = 0;
              }
              if (_new.second == "" || _new.second < 0) {
                _new.second = 0;
              }
              if (_new.third == "" || _new.third < 0) {
                _new.third = 0;
              }

              if (_timer) {
                clearTimeout(_timer);
              }
              _timer = setTimeout(function () {
                _this.saveConfig();
                clearTimeout(_timer);
              }, 1500);
            }, {deep: true})
          };
        })
    },
    saveConfig: function () {
      var mc = new MessageChannel();
      var _this = this;
      navigator
        .serviceWorker
        .controller
        .postMessage({
          action: "saveconfig",
          data: this.config
        }, [mc.port2]);

      mc.port1.onmessage = function (e) {
        if (e.data.code != 0) {
          alert('设置保存失败！');
        }

      };
    }
  }

})

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

      this.id = s_id;
      this.originList = s_list || [];
      this.lastRequestTime = lastRequestTime;
      this.currentView = 'main-panel'
    } else {

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

/**
 *  定时调整到下一天
 */
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
  }
})(), 10000)

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
      // var publicChanel = new MessageChannel(); publicChanel   .port1
      // .addEventListener('message', function (e) {     console.log(e);   })
      // registration   .active   .postMessage({     action: 'activate-publicChanel'
      // }, [publicChanel.port2])

    })

}
