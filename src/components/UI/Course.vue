<template>
  <div class="ui-course" v-bind:class="{ active: item.activated }">
    <div class="course__aside">
      <span class="course__room"> {{item.where}}</span>
      <br>
      <span class="course__order"> {{item.whichClass}}</span>
    </div>
    <div class="course__body">
      <p class="course__name">{{item.className}}</p>
      <p class="course__teacher">{{item.who}}</p>
      <p class="course__id">{{item.classID}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'course',
  props: ['item']
}
</script>

<style>
.ui-course {
  background-color: white;
}


.ui-course {
  position: relative;
  margin: 20px;
  text-align: left;
  padding: 10px 20px;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 3px 12px -3px rgba(0, 0, 0, 0.23);
  overflow: hidden;
  transition: all .3s;
  cursor: pointer;
}

.ui-course:hover {
  will-change: transform;
  transform: translateY(-1px);
  box-shadow: 0 6px 11px 0px rgba(0, 0, 0, 0.23)
}

.ui-course.active {
  animation: activeClass 2s infinite;
}

.ui-course.active:before {
  content: '';
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 203, 203, 0.26), rgba(255, 255, 255, 0.2));
  animation: flash 2s infinite;
}

.course__aside {
  float: left;
  color: #444;
  width: 6em;
}

.course__aside span {
  font-size: 16px;
}

.course__room {
  margin-top: 2em;
  display: inline-block;
}

.course__order {
  position: absolute;
  top: 9px;
  width: 6em;
  left: 0;
  background-color: #545454;
  color: #fff500;
  padding: 5px 10px 5px 20px;
  border-radius: 0 20px 20px 0;
}

.course__body {
  display: table-cell;
  position: relative;
  padding-left: 2.4em;
}

.course__body:before {
  content: '';
  display: inline-block;
  position: absolute;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  width: 1px;
  left: 1.2em;
  transform: translateX(-1px);
  height: 100%;
}

.course__body p {
  margin: 0 0 0.5em 0;
}

.course__name {
  font-size: 16px;
}

.course__id {
  font-size: 12px;
}

.content_action {
  text-align: center;
  padding: 2em 0 3em;
}

@media screen and (min-width: 768px) {
  .ui-course {
    display: inline-block;
  }
  .content_no_class {
    max-width: 600px;
    margin: auto;
  }
  .content_no_class blockquote {
    text-align: center;
  }
}
</style>
