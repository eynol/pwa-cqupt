<template>
  <div class="ui-frame">
    <div class="frame__header">
      <div class="frmae__header-left">
        <slot name="left">
          <a href="javascript:;" v-on:click="back">
            <i class="icon back"></i>
          </a>
        </slot>
      </div>
      <div class="frmae__header-center">
        <slot name="title"></slot>
      </div>
      <div class="frmae__header-right">
        <slot name="right"></slot>
      </div>
    </div>
    <div class="frame__body">
      <slot name="body">hesdf</slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'frame-layout',
  methods: {
    back: function () {
      this.$router.go(-1)
    }
  }
}

</script>

<style>
.ui-frame {
  color: black;
}

.frame__header {
  top: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  position: absolute;
  height: 64px;
  line-height: 64px;
  background-color: white;
}

.frame__body {
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  position: absolute;
}

.frmae__header-left,
.frmae__header-right {
  position: absolute;

  line-height: 2em;
  top: 16px;
}

.frmae__header-left {
  left: 20px;
}

.frmae__header-right {
  right: 20px;
}


.frmae__header-center {
  text-align: center
}

.frmae__header-center p {
  margin: 0;
  font-size: 20px;
}
</style>
