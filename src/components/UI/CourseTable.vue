<template>
  <div class="ui-course-table">
    <table class="table-all_class center aligned" v-bind:class="{noWeekend:tabledata.hasWeekend === false}">
      <thead>
        <tr>
          <th>&nbsp;</th>
          <th>周一</th>
          <th>周二</th>
          <th>周三</th>
          <th>周四</th>
          <th>周五</th>
          <th>周六</th>
          <th>周日</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in tabledata.data">
          <td v-for="block in row">
            <div class="cell-wrapper" v-for="item in block">
              <tableCell v-bind:item="item"></tableCell>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import TableCell from 'UI/TableCell'
import Util from '@/util'
window.ui_table = window.ui_table || {}

function getElementViewTop(element) {
  var actualTop = element.offsetTop
  var current = element.offsetParent
  var elementScrollTop
  var elementStop = document.querySelector(window.ui_table.query)

  while (current !== null) {
    actualTop += current.offsetTop
    if (current.offsetParent !== elementStop) {
      current = current.offsetParent
    } else {
      current = null
    }
  }
  if (document.compatMode === 'BackCompat') {
    elementScrollTop = document.body.scrollTop
  } else {
    elementScrollTop = document.documentElement.scrollTop
  }
  return actualTop - elementScrollTop
}

function throttle(func, wait) {
  var ctx,
    args,
    rtn,
    timeoutID // caching
  var last = 0

  return function throttled() {
    ctx = this
    args = arguments
    var delta = new Date() - last
    if (!timeoutID) {
      if (delta >= wait) {
        call()
      } else {
        timeoutID = setTimeout(call, wait - delta)
      }
    }
    return rtn
  }

  function call() {
    timeoutID = 0
    last = +new Date()
    rtn = func.apply(ctx, args)
    ctx = null
    args = null
  }
}

function resizeHandler(e) {
  var content = document.querySelector(window.ui_table.query)
  var table = content.querySelector('table')
  var thead = table.querySelector('thead')

  //  默认出现滚动条元素顶部的距离
  window.ui_table.offTop = getElementViewTop(thead)
  //  默认距离左侧的距离 肯定是0
  window.ui_table.offX = table.scrollLeft

  window.ui_table.height = table.scrollHeight
}

function contentScroll(e) {
  var scrollTop = e.target.scrollTop
  var ui = window.ui_table
  var distance = scrollTop - ui.offTop

  /*
  //  It's not working at Windows Edge
  if (distance > 0 && distance < ui.height) {
    ui.thead.style.transform = 'translateZ(2px) translateY(' + distance + 'px)'
  } else {
    ui.thead.style.transform = 'translateZ(2px) translateY(0px)'
  } */

  if (distance > 0 && distance < ui.height) {
    ui.ths.forEach(function (el) {
      el.style.transform = 'translateZ(2px) translateY(' + distance + 'px)'
    })
  } else {
    ui.ths.forEach(function (el) {
      el.style.transform = 'translateY(0px)'
    })
  }
}

function tableScroll(e) {
  var scrollLeft = e.target.scrollLeft
  var ui = window.ui_table

  ui.tds.forEach(function (el) {
    el.style.transform = 'translateZ(2px) translateX(' + scrollLeft + 'px)'
  })
}

function touchMoveHandler(e) {

}

var thContentScroll = throttle(contentScroll, 60)
var thTableScroll = throttle(tableScroll, 60)

export default {
  name: 'courseTable',
  props: ['list', 'query'],
  computed: {
    tabledata: function () {
      //  用一个二维数组去存储所有课程
      var ret = {
        hasWeekend: false,
        data: [
          [
            [],
            [],
            [],
            [],
            [],
            [],
            []
          ],
          [
            [],
            [],
            [],
            [],
            [],
            [],
            []
          ],
          [
            [],
            [],
            [],
            [],
            [],
            [],
            []
          ],
          [
            [],
            [],
            [],
            [],
            [],
            [],
            []
          ],
          [
            [],
            [],
            [],
            [],
            [],
            [],
            []
          ],
          [
            [],
            [],
            [],
            [],
            [],
            [],
            []
          ]
        ]
      }

      this
        .list
        .forEach(function (el) {
          var rowIndex = Util.getRowIndex(el.whichClass && el.whichClass.substring(1, 3)) // 课程所在的行
          var colIndex = Util.getColIndex(el.day) //  课程所在的列
          if (/6|0/.test(el.day)) {
            ret.hasWeekend = true // 有没有周末，没有周末的课程，课表会隐藏周末的两列
          }
          ret
            .data[rowIndex][colIndex]
            .push(el)
        })

      var strHourTime = ['08:00至09:40', '10:05至11:45', '14:00至15:40', '16:05至17:45', '19:00至20:40', '20:50至22:30']
      ret.data.forEach(function (row, index) {
        row.unshift([strHourTime[index]])
      })
      return ret
    }
  },
  components: { TableCell },
  mounted: function () {
    var table = this.$el.querySelector('table')

    window.ui_table.thead = table.querySelector('thead tr')
    window.ui_table.ths = Array.prototype.slice.apply(table.querySelectorAll('thead th'))
    window.ui_table.tds = Array.prototype.slice.apply(table.querySelectorAll('tr td:nth-child(1)'))
    window.ui_table.query = this.query

    document.querySelector(this.query).addEventListener('scroll', thContentScroll)

    table.addEventListener('touchstart', touchMoveHandler)
    table.addEventListener('scroll', thTableScroll)

    window.addEventListener('resize', resizeHandler)
    resizeHandler()
  },
  beforeDestroy: function () {
    var table = this.$el.querySelector('table')

    window.ui_table = {}

    window.removeEventListener('resize', resizeHandler)
    document.querySelector(this.query).removeEventListener('scroll', thContentScroll)
    table.removeEventListener('touchstart', touchMoveHandler)
    table.removeEventListener('scroll', thTableScroll)
  }
}

</script>
<style>
.table-all_class {
  border-collapse: collapse;
  overflow: auto;
  width: 100%;
  display: block;
  background-color: white;
}

.table-all_class thead tr {
  position: relative;
}

.table-all_class thead th {
  background-color: white;
}

table.noWeekend th:nth-child(7),
table.noWeekend th:nth-child(8) {
  display: none;
}

table.noWeekend tr td:nth-child(7),
table.noWeekend tr td:nth-child(8) {
  display: none;
}

.table-all_class td {
  min-width: 10em;
  border: solid 1px #bbb;
}

table.noWeekend tr td:nth-child(1) {
  min-width: 3em;
  width: 3em;
  background-color: white;
}
</style>
