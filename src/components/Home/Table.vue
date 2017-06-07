<template>
  <div class="home__content">

    <h1 class="center aligned"> 今天是第{{todayOption.weekendPast}}周·周{{todayOption.todayWeekday}}</h1>
    <p class="center aligned">* 浅绿色背景的课程在本周有课 *</p>
    <courseTable query='.home__content' :list="originList"></courseTable>
    <div class="content_action">
      <p class="center aligned update-time">本地数据更新于
        <br>{{updateTime.toLocaleString()}}</p>
    </div>

  </div>
</template>

<script>
import CourseTable from 'UI/CourseTable'

export default {
  name: 'table',
  props: {
    id: String,
    originList: Array,
    todayOption: Object,
    tomorrowOption: Object,
    lastRequestTime: String
  },
  components: {
    CourseTable
  },
  computed: {
    updateTime: function () {
      return new Date(Number(this.lastRequestTime))
    }
  },
  methods: {}

}
</script>
