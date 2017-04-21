/**
 * 与localstorage沟通的工具，存储本地课表
 */

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

//全局的订阅者，用于订阅者模式，在Vue多个组件之间沟通，避免深层次组件过度依赖高层组件
var Listener = new Vue();

/**
 * 顶层组件是app ,然后是两个页面组件（login ,main-panel）,
 * 在main-panel中有三个content组件,分别是content-day content-table conten-setting
 * 用户数据通过prop传递给子组件，更新并没有反馈调用，而是用全局listener让顶层组件去负责更新
 */


//登录组件，负责登录操作
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
      //点击登录后的操作
      var _self = this;
      if (/\d{10}/.test(this.fakeId)) {
        getListById(this.fakeId, function (err, result) {
          if (err) {
            return;
          }
          if (result.code === 0) {
            // 若无错误，触发成功登录事件
            result.id = _self.fakeId;
            Listener.$emit('success-login', result);
          } else {
            alert(result.msg)
          }
        }, {root: true});

      } else {

        alert("请输入正确的学号(不是一卡通号)")

      }
    }

  }

})

//显示今日课表组件
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
          //如果这周有这节课并且今天就是这节课的话，就加入todayList列表里
          if (el.weekend && el.weekend.indexOf(_this.today.weekendPast) !== -1 && el.day === _this.today.todayDay) {
            list.push(el)
          }
        })
      return list.sort(sortClassList); //按照课程顺序排序
    },
    tomorrowList: function () {
      var _this = this;
      var list = [];
      this
        .list
        .forEach(function (el) {
          //如果这周有这节课并且明天天就是这节课的话，就加入tomorrowList列表里
          if (el.weekend && el.weekend.indexOf(_this.tomorrow.weekendPast) !== -1 && el.day === _this.tomorrow.todayDay) {
            list.push(el)
          }
        })
      return list.sort(sortClassList); //按照课程顺序排序
    }
  },
  created: function () {
    var _this = this;

    //timeFunc 是周期运行函数，用于
    var timFunc = function () {
      // current time
      var now = new Date();
      var nowH = now.getHours();
      var nowM = now.getMinutes();

      // 20分钟后的时间，用于提前激活上课中样式
      var after20M = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nowH, nowM + 20);

      var aftH = after20M.getHours();
      var aftM = after20M.getMinutes();
      _this
        .todayList
        .forEach(function (el) {

          if (el.whichClass) {
            var classIndex = getRowIndex(el.whichClass.substring(1, 3));

            //如果当前课程现在是上课 或者 20分钟后的当前课程是上课状态 ，就激活当前课程
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


//所有课表的表格
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
      //用一个二维数组去存储所有课程
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
          var rowIndex = getRowIndex(el.whichClass && el.whichClass.substring(1, 3));//课程所在的行
          var colIndex = getColIndex(el.day);//课程所在的列
          if (/6|0/.test(el.day)) {
            ret.hasWeekend = true;//有没有周末，没有周末的课程，课表会隐藏周末的两列
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


//设置组件，负责和ServiceWorker交换数据
Vue.component('content-setting', {
  // 声明 props
  name: 'content-setting',
  template: '#tpl-content-setting',
  props: ['sid'],
  data: function () {
    return {
      urlScreenShot: "http://pluscdn.heitaov.cn/Screenrecord-2017-03-12-23-30-39-643.mp4",
      isLoading: false,
      inited: false,
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

  created: function () {
    this
      .$watch('config.show', function (a) {
        var _this = this;

        //如果打开显示通知，并且组件已经初始化后，继续
        if (a == true && _this.inited) {
          //如果没有权限，就申请通知权限
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
    this.initConfig();//执行初始化操作

  },
  methods: {
    updateList: function () {
      //更新课表操作

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
      //注销操作
      Listener.$emit('signout');
    },
    pushtest: function () {
      //推送测试操作
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
      //初始化组件操作，需要从serviceWorker中获取保存的配置信息
      var _this = this;
      var mc = new MessageChannel();
      console.log("init")
      navigator
        .serviceWorker
        .ready
        .then(function (reg) {
          console.log("ready");
          navigator
            .serviceWorker
            .controller
            .postMessage({
              action: "getconfig"
            }, [mc.port2]);
          mc.port1.onmessage = function (e) {
            var _timer = undefined;

            //将返回的消息设置为配置
            _this.config = e.data;
            _this.inited = true;//设置初始化标志位true
            console.log(e)
            console.log("recive data")
            _this.$watch('config', function (_new, _old) {
              //if the input is "" string, let it be 0 at nextTick;
              if (_new.first == "" || _new.first < 0) {
                _new.first = 0;
              }else if(_new.first.charAt(0) == 0){
               _new.first =  _new.first.slice(1);
              }
              if (_new.second == "" || _new.second < 0) {
                _new.second = 0;
              } else if(_new.second.charAt(0) == 0){
               _new.second =  _new.second.slice(1);
              }
              if (_new.third == "" || _new.third < 0) {
                _new.third = 0;
              }else if(_new.third.charAt(0) == 0){
               _new.third =  _new.third.slice(1);
              }


              //延迟1.5s 保存配置对象到ServiceWorker
              if (_timer) {
                clearTimeout(_timer);
              }
              _timer = setTimeout(function () {
                _this.saveConfig();
                clearTimeout(_timer);
              }, 1500);
            }, {deep: true});//深度监视config对象
          };
        })
    },
    saveConfig: function () {
      //保存config操作
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

//主界面组件，用于切换content组件
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

//根组件，保存数据
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
    //订阅事件
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
    //在挂载组件前，更新今天的时间对象，
    this.newDay();
    this.updateThisWeek();//更新本周的课表
  },
  beforeUpdate: function () {
    //当数据有更新时，更新本周课表；比如新用户登录，新的一天过去后
    this.updateThisWeek()
  },
  components: {
    'login': Vue.component('login'),
    'main-panel': Vue.component('main-panel')
  },
  computed: {
    hasLogin: function () {
      //判断用户是否登录来判断是否显示login组件
      return this.id
        ? true
        : false;
    }
  },
  methods: {
    login: function (result) {
      var _this = this;

      //用户登录成功后的配置，将数据保存在这个对象上，然后通过prop传递给需要的子组件
      this.id = Number(result.id);//用户的id
      this.lastRequestTime = result.time;//操作的时间
      this.originList = result.list;//用户所有的课表
      this.currentView = 'main-panel';//切换至main-panel页面

      storeTool.setUserList(result);//本地保存副本

    },
    newDay: function () {

      //现在是凌晨零点零分左右，更新今天的时间对象，和明天的时间对象
      var d = new Date();
      this.todayOption = doTimeCount(d),
      this.tomorrowOption = doTimeCount(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))
    },
    signout: function () {
      //用户注销操作
      this.id = undefined;
      this.originList = [];
      this.currentView = 'login';
      storeTool.signout();
    },
    updateThisWeek: function () {
      //更新本周课表的表格
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
 *  定时调整到下一天。当今天结束后，用Listener触发下一天的事件，让app自己去更新课表。
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
})(), 10000); //每隔10秒钟检测一次

/**
 * 用于存储浏览器能力检测结果的对象，暂未使用
 */
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
  console.log("try");
  navigator
    .serviceWorker
    .ready
    .then(function (registration) {
      console.log("ready at one");
      // var publicChanel = new MessageChannel(); publicChanel   .port1
      // .addEventListener('message', function (e) {     console.log(e);   })
      // registration   .active   .postMessage({     action: 'activate-publicChanel'
      // }, [publicChanel.port2])

    })

}
