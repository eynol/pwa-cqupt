<template>
  <div class="home__content">
    <div>
      <h1 class="app-title">重邮课表</h1>
    </div>
    <div class="content_today" v-if="todayList.length!==0">
      <div class="panel">
        <div class="notify">
          <h1>今</h1>
          <p>{{todayOption.todayMonth+1}}月{{todayOption.todayDate}}日 周{{todayOption.todayWeekday}}</p>
        </div>
        <div class="course-container">
          <course v-for="item in todayList" :key="item.classID" v-bind:item="item"></course>
        </div>
      </div>
    </div>
    <div class="content_tomorrow" v-if="tomorrowList.length!==0">
      <div class="panel">
        <div class="notify">
          <h1>翌日</h1>
          <p>{{tomorrowOption.todayMonth+1}}月{{tomorrowOption.todayDate}}日 周{{tomorrowOption.todayWeekday}}</p>
        </div>
        <div class="course-container">
          <course v-for="item in tomorrowList" :key="item.classID" v-bind:item="item"></course>
        </div>
      </div>
    </div>

    <div class="content_no_class">
      <poison></poison>
    </div>
    <div class="days__when-update">
      <p class="center aligned color-ignore">
        本地数据更新于
        <br>{{updateTime.toLocaleString()}}
      </p>
    </div>
  </div>
</template>
<script>
import Util from '@/util'
import Course from '@ui/Course'
import Poison from '@/Poison'

export default {
  name: 'days',
  props: {
    id: String,
    originList: Array,
    todayOption: Object,
    tomorrowOption: Object,
    lastRequestTime: String
  },
  components: {
    Course,
    Poison
  },
  computed: {
    updateTime: function () {
      return new Date(Number(this.lastRequestTime))
    },

    todayList: function () {
      var _this = this
      var list = []
      this
        .originList
        .forEach(function (el) {
          //  如果这周有这节课并且今天就是这节课的话，就加入todayList列表里
          if (el.weekend && el.weekend.indexOf(_this.todayOption.weekendPast) !== -1 && el.day === _this.todayOption.todayDay) {
            list.push(el)
          }
        })
      return list.sort(Util.sortClassList.bind(this)) // 按照课程顺序排序
    },
    tomorrowList: function () {
      var _this = this
      var list = []
      this
        .originList
        .forEach(function (el) {
          //  如果这周有这节课并且明天天就是这节课的话，就加入tomorrowList列表里
          if (el.weekend && el.weekend.indexOf(_this.tomorrowOption.weekendPast) !== -1 && el.day === _this.tomorrowOption.todayDay) {
            list.push(el)
          }
        })
      return list.sort(Util.sortClassList) // 按照课程顺序排序
    }
  },
  created: function () {
    var _this = this

    //  timeFunc 是周期运行函数，用于
    var timFunc = function () {
      //  current time
      var now = new Date()
      var nowH = now.getHours()
      var nowM = now.getMinutes()

      //   20分钟后的时间，用于提前激活上课中样式
      var after20M = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nowH, nowM + 20)

      var aftH = after20M.getHours()
      var aftM = after20M.getMinutes()
      _this
        .todayList
        .forEach(function (el) {
          if (el.whichClass) {
            var classIndex = Util.getRowIndex(el.whichClass.substring(1, 3))

            //  如果当前课程现在是上课 或者 20分钟后的当前课程是上课状态 ，就激活当前课程
            if (Util.isHavingClass(classIndex, nowH, nowM, true) || Util.isHavingClass(classIndex, aftH, aftM, true)) {
              el.activated = true
            } else {
              el.activated = false
            }
          }
        })
    }
    timFunc()
    setInterval(timFunc, 60000)
  },
  methods: {}

}
</script>
<style>
.app-title {
  text-align: center;
  color: #016946;
  font-weight: 300;
}
</style>
