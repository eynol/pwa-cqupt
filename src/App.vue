<template>
  <div id="app">
    <router-view v-bind="{ id:id, originList:originList, lastRequestTime:lastRequestTime, todayOption:todayOption, tomorrowOption:tomorrowOption }" v-on:login="doLogin"></router-view>
  </div>
</template>

<script>
import Listener from '@/Listener'
import util from '@/util'

var storeTool = {
  _prefix: 'CQUPT',
  _sid: 'userSid',
  setUserList: function (list) {
    var str = ''
    if (typeof list === 'string') {
      str = list
    } else if (typeof list === 'object') {
      str = JSON.stringify(list)
    }
    localStorage.setItem('hasLogin', 'yes')
    localStorage.setItem(this._prefix + 'UserList', str)
  },
  getUserList: function () {
    var str = localStorage.getItem(this._prefix + 'UserList')
    return JSON.parse(str)
  },

  signout: function () {
    localStorage.removeItem(this._prefix + 'UserList')
    localStorage.removeItem('hasLogin')
  }
}

export default {
  name: 'app',
  data: function () {
    return {
      id: undefined,
      originList: [],
      currentView: '',
      todayOption: {},
      tomorrowOption: {},
      lastRequestTime: '1'
    }
  },
  methods: {
    doLogin: function (userid, cb) {
      // 点击登录后的操作
      var _self = this
      if (/\d{10}/.test(userid)) {
        util.getListById(userid, function (err, result) {
          if (err) {
            return
          }
          if (result.code === 0) {
            // 若无错误，触发成功登录事件
            _self.id = userid

            Listener.$emit('success-login', result)

            _self.$router.push({ name: 'home' })// 切换至main-panel页面
          } else {
            cb && cb({}, result.msg)
          }
        }, { root: true })
      } else {
        cb && cb({}, '请输入正确的学号(不是一卡通号)')
      }
    },
    login: function (result) {
      //  用户登录成功后的配置，将数据保存在这个对象上，然后通过prop传递给需要的子组件
      this.id = String(result.id) // 用户的id
      this.lastRequestTime = result.time //  操作的时间
      this.originList = result.list // 用户所有的课表

      storeTool.setUserList(result) // 本地保存副本
    },
    newDay: function () {
      //  现在是凌晨零点零分左右，更新今天的时间对象，和明天的时间对象
      var d = new Date()
      this.todayOption = util.doTimeCount(d)
      this.tomorrowOption = util.doTimeCount(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))
    },
    signout: function () {
      //  用户注销操作
      this.id = undefined
      this.originList = []

      this.$router.push({ name: 'login' })

      storeTool.signout()
    },
    updateThisWeek: function () {
      //  更新本周课表的表格
      var _this = this
      this.originList && this.originList.forEach(function (el) {
        el.thisWeek = (el.weekend && (el.weekend.indexOf(_this.todayOption.weekendPast) !== -1))
      })
    }

  },
  created: function () {
    //  订阅事件
    var _this = this
    Listener.$on('success-login', function (result) {
      _this.login(result)
    })
    Listener.$on('signout', function () {
      _this.signout()
      _this.$router.replace({ name: 'login' })
    })
    /**
     * 新的一天更新日期
     */
    Listener.$on('DayDown', function () {
      _this.newDay()
    })

    /**
     *  提取本地数据
     */
    var result = storeTool.getUserList()
    if (result) {
      var sId = result.id
      var sList = result.list
      var lastRequestTime = result.time

      this.id = sId
      this.originList = sList || []
      this.lastRequestTime = lastRequestTime
    } else {
      this.$router.replace({ name: 'login' })
    }
  },
  beforeMount: function () {
    //  在挂载组件前，更新今天的时间对象，
    this.newDay()
    this.updateThisWeek() //  更新本周的课表
  },
  beforeUpdate: function () {
    //  当数据有更新时，更新本周课表；比如新用户登录，新的一天过去后
    this.updateThisWeek()
  }
}

/**
 *  定时调整到下一天。当今天结束后，用Listener触发下一天的事件，让app自己去更新课表。
 */
setInterval((function () {
  var currentDay = (new Date().getDay())

  return function () {
    var now = new Date()
    // var hour = now.getHours() var minute = now.getMinutes()
    var todayDay = now.getDay()
    if (todayDay !== currentDay) {
      setTimeout(function () {
        Listener.$emit('DayDown')
      }, 4)
      currentDay = todayDay
    }
  }
})(), 10000) // 每隔10秒钟检测一次

</script>
<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
