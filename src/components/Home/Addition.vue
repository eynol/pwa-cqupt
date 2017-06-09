<template>
  <div class="home__content">
    <h1 class="app-title">附加功能</h1>
    <div class="ui-addition">
      <ul class="addtion__list">
        <li class="addtion__list-item">
          <router-link to="/others/list">查看他人课表</router-link>
        </li>
        <li class="addtion__list-item">
          <router-link to="/phones">校内联系电话</router-link>
        </li>
        <li class="addtion__list-item">
          <router-link to="/post">Your Time Zone</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  name: 'addition'
}
</script>
<style>
.addtion__list {
  list-style: none;
  padding: 0;
}

.addtion__list-item a {
  display: block;
  text-decoration: none;
  margin: 10px 20px;
  text-align: center;
  padding: 26px 60px;
  border-radius: 12px;
  background-color: #fff;
  color: black;
  box-shadow: 0 3px 12px -3px rgba(0, 0, 0, 0.23);
  overflow: hidden;
  transition: all .3s;
  max-width: 768px;
}

@media screen and (min-width:768px) {
  .addtion__list-item a {
    margin: 10px auto;
  }
}

.addtion__list-item a:hover {
  will-change: transform;
  transform: translateY(-1px);
  box-shadow: 0 6px 11px 0px rgba(0, 0, 0, 0.23)
}
</style>

