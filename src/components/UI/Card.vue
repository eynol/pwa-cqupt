<template>
  <div class="ui-card">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'card'
}
</script>
<style>
.ui-card {
  position: relative;
  margin: 20px;
  text-align: left;
  padding: 10px 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 3px 12px -3px rgba(0, 0, 0, 0.23);
  overflow: hidden;
  transition: all .3s;
  max-width: 768px;
}

@media screen and (min-width:768px) {
  .ui-card {

    margin: 20px auto;
  }
}
</style>

