<template>
  <frame-layout>
    <a href="javascript:;" v-on:click="newuser" slot="right">
      <i class="icon new"></i>
    </a>
    <p slot="title">查看其它课表</p>
    <div slot="body">
      <ul class="other__userlist">
        <li class="other__userlist-item" v-for="u,index in userlist">
          <div class="people" v-on:click="showCourse(index)">
            <h1 class="people-name">{{u.name}}</h1>
            <div>{{u.id}}</div>
          </div>
        </li>
      </ul>
    </div>
  </frame-layout>
</template>
<script>
import FrameLayout from '@ui/FrameLayout'
export default {
  name: 'userlistview',
  props: ['userlist'],
  components: { FrameLayout },
  methods: {
    showCourse: function (index) {
      this.$emit('showCurseEvent', index)
    },
    newuser: function () {
      this.$emit('newUser')
    }
  }
}
</script>
