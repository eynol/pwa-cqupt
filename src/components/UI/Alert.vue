<template>
  <div class="ui-alert-mask">
    <div class="ui-alert">
    </div>
  </div>
</template>

<script>
export default {
  name: 'Alert'
}
</script>

<style>
.ui-alert-mask {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 8000
}

.ui-alert {
  position: absolute;
  bottom: 0;
}
</style>

