<template>
  <div class="home">
    <div class="home__container">
      <router-view v-bind="{ id:id, originList:originList, lastRequestTime:lastRequestTime, todayOption:todayOption, tomorrowOption:tomorrowOption }"></router-view>
    </div>
    <div class="home__nav-bar">
      <router-link to="/home/days" replace>
        <i class="icon day"></i>
      </router-link>
      <router-link to="/home/table" replace>
        <i class="icon list"></i>
      </router-link>
      <router-link to="/home/addition" replace>
        <i class="icon addtion"></i>
      </router-link>
      <router-link to="/home/setting" replace>
        <i class="icon setting"></i>
      </router-link>
    </div>
  </div>
</template>

<script>

export default {
  name: 'home',
  props: {
    id: String,
    originList: Array,
    todayOption: Object,
    tomorrowOption: Object,
    lastRequestTime: String
  },
  beforeCreate: function () {
    if (this.$route.fullPath === '/home') {
      this.$router.replace({ name: 'days' })
    }
  }
}
</script>
<style>
.home {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(-135deg, #fff 0%, #ececec 100%);
}

.home__container {
  top: 0;
  left: 0;
  right: 0;
  bottom: 60px;
  overflow: hidden;
  position: absolute;
}

.home__content {
  padding-top: 42px;
  height: 100%;
  overflow: auto;
}


.home__nav-bar {

  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  position: absolute;
  height: 60px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: white;
  box-shadow: 0 -1px 2px -1px rgba(0, 0, 0, .16);
}

.home__nav-bar a {
  text-decoration: none;
}


.icon.list:before {
  background-image: url("../assets/icon/list.svg");
}

.router-link-active .icon.list:before {
  background-image: url("../assets/icon/list-active.svg");
}

.icon.setting:before {
  background-image: url("../assets/icon/setting.svg");
}

.router-link-active .icon.setting:before {
  background-image: url("../assets/icon/setting-active.svg");
}

.icon.day:before {
  background-image: url("../assets/icon/day.svg");
}

.router-link-active .icon.day:before {
  background-image: url("../assets/icon/day-active.svg");
}

.icon.addtion:before {
  background-image: url("../assets/icon/addition.svg");
}

.router-link-active .icon.addtion:before {
  background-image: url("../assets/icon/addition-active.svg");
}
</style>

