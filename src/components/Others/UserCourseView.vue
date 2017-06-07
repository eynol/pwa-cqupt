<template>
  <frame-layout>
    <a href="javascript:;" v-on:click="deleteUser" slot="right">
      <i class="icon delete"></i>
    </a>
    <p slot="title">{{user.name}}的课表</p>
    <div slot="body">
      <courseTable query='.frame__body' :list="courseList"></courseTable>
    </div>
  </frame-layout>
</template>
<script>
import FrameLayout from 'UI/FrameLayout'
import CourseTable from 'UI/CourseTable'
export default {
  name: 'userCourseView',
  props: ['userlist', 'todayOption'],
  components: { FrameLayout, CourseTable },
  computed: {
    user: function () {
      var index = this.$route.params.index
      return this.userlist[index]
    },
    courseList: function () {
      //  更新本周课表的表格
      var _this = this
      var list = this.user.data.list
      list && list.forEach(function (el) {
        el.thisWeek = (el.weekend && (el.weekend.indexOf(_this.todayOption.weekendPast) !== -1))
      })
      return list
    }
  },
  methods: {
    deleteUser: function () {
      var yes = confirm('是否删除该用户的课表？')
      if (yes) {
        this.$emit('deleteUserEvent', this.$route.params.index)
      }
    }
  }
}
</script>
<style>
.icon.delete:before {
  background-image: url('../../assets/icon/delete.svg')
}
</style>

