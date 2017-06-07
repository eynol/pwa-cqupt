<template>
  <div class="ui-table-cell" v-bind:class="{thisWeek:item.thisWeek}">
    <div v-if="typeof item === 'string'">
      <p>{{item}}</p>
    </div>
    <div class="table-cell__body" v-else>
      <p>{{item.className}}<br>{{item.classID}}</p>
      <p>{{item.when && item.when.substring(8)}}</p>
      <p>{{item.who}}</p>
      <p>{{item.where}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'tableCell',
  props: ['item']
}
</script>

<style>
.ui-table-cell {
  min-height: 6em;
}
.thisWeek{
  background-color: #9dffc6;
}
.table-cell__body {
  position: relative;
  padding: 10px 20px;
  overflow: hidden;
  transition: all .3s;
  cursor: pointer;
  box-sizing: border-box;
}
.thisWeek .table-cell__body,
.table-cell__body:hover {
  will-change: transform;
  transform: translateY(-1px);
  box-shadow: 0 12px 20px 3px rgba(0, 0, 0, 0.23)
}

</style>

