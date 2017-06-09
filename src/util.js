/**
 *  上课的时间
 */
var TIME_GAP = [{
  fromH: 8,
  fromM: 0,
  toH: 9,
  toM: 40
}, {
  fromH: 10,
  fromM: 5,
  toH: 11,
  toM: 45
}, {
  fromH: 14,
  fromM: 0,
  toH: 15,
  toM: 40
}, {
  fromH: 16,
  fromM: 5,
  toH: 17,
  toM: 45
}, {
  fromH: 19,
  fromM: 0,
  toH: 20,
  toM: 40
}, {
  fromH: 20,
  fromM: 50,
  toH: 22,
  toM: 30
}]

/**
 *  当前时间是否在上课
 *
 * @param {int} _index 课程的索引
 * @param {int} hour  当前小时
 * @param {int} minute  当前分钟
 * @param {boolean} isEqual  是否包含整点
 * @returns {boolean}
 */
function isHavingClass(_index, hour, minute, isEqual) {
  var T = TIME_GAP[_index]
  if (isEqual) {
    return (T.fromH <= hour && T.fromM <= minute) && (T.toH >= hour && T.toM >= minute)
  } else {
    return (T.fromH < hour && T.fromM < minute) && (T.toH > hour && T.toM > minute)
  }
}

/**
 * sort class list by class Orders
 *
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
function sortClassList(a, b) {
  if (a.whichClass.substring(1, 3) > b.whichClass.substring(1, 3)) {
    return 1
  } else {
    return -1
  }
}

/**
 *  return rows index (start with 0);
 *
 * @param {string} str
 * @returns {number}
 */
function getRowIndex(str) {
  if (typeof str === 'object') {
    str = str
      .whichClass
      .substring(1, 3)
  }
  if (!str && str !== 0) {
    return 0
  }
  if (/\d+/.test(str)) {
    return Math.floor(Number(str.substring(0, 1)) / 2)
  } else {
    return 5
  }
}
/**
 * return colums index (start with 0);
 *
 * @param {number} num
 * @returns {number}
 */
function getColIndex(num) {
  num = Number(num) // make sure
  if (!num && num !== 0) {
    return 0
  }
  if (num === 0) {
    return 6
  } else {
    return num - 1
  }
}

/**
 *  Date.getDay() 星期天是0
 *
 * @param {Date} thatDay
 * @returns
 */
function doTimeCount(thatDay) {
  var timeGap = thatDay - new Date(2017, 1, 27)
  var dayPast = Math.floor(timeGap / (1000 * 60 * 60 * 24)) + 1
  var weekendPast = Math.ceil(dayPast / 7)
  var isoddWeek = (weekendPast % 2) === 1
  var id = '' + thatDay.getFullYear() + thatDay.getMonth() + thatDay.getDate()
  return {
    id: id,
    timeGap: timeGap,
    dayPast: dayPast,
    weekendPast: weekendPast,
    isoddWeek: isoddWeek,
    todayDay: thatDay.getDay(),
    todayDate: thatDay.getDate(),
    todayMonth: thatDay.getMonth(),
    todayWeekday: [
      '日',
      '一',
      '二',
      '三',
      '四',
      '五',
      '六'
    ][thatDay.getDay()]
  }
}

/**
 *  单独获取JSON格式的请求函数
 *
 * @param {string} url ;携带参数的url
 * @param {function} callback ;获取成功后执行的回调函数
 * @param {function} beforeSend ;发送前处理header头
 */

function getJSON(url, callback, beforeSend) {
  var xhr = new XMLHttpRequest()
  var done = false
  var _JSONResp = function (xhr) {
    var res = xhr.response || xhr.responseText
    var ret
    if (typeof res === 'string') {
      try {
        ret = JSON.parse(res)
      } catch (error) {
        if (xhr.status === 500) {
          ret = {
            code: 500,
            msg: '服务器发生错误~请联系管理员！'
          }
        } else if (xhr.status === 404) {
          ret = {
            code: 404,
            msg: '服务器没有找到请求资源！'
          }
        } else {
          ret = {
            code: -6,
            msg: '服务器返回数据，但格式不正确！'
          }
        }

        console.error(error)
      }
      return ret
    } else if (typeof res === 'object') {
      return res
    } else if (typeof res === 'undefined') {
      return {
        code: -6,
        msg: '服务器返回的结果没有数据！'
      }
    }
  }

  xhr.open('get', url)
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
  beforeSend && beforeSend(xhr)
  xhr.responseType = 'json'

  xhr.onreadystatechange = function (e) {
    //  兼容微信内置浏览器
    if (!done) {
      if (xhr.readyState === 4) {
        done = true
        callback(null, _JSONResp(xhr))
      }
    }
  }
  xhr.onload = function (e) {
    if (!done) {
      done = true
      callback(null, _JSONResp(xhr))
    }
  }
  xhr.onerror = function (e) {
    callback(e)
  }
  xhr.send()
}

/**
 * 根据学生id获取课表
 *
 * @param {string} sid
 * @param {function} callback ;获取成功后执行的回调函数
 * @param {object} option
 */
function getListById(sid, callback, option) {
  var hash
  if (option && option.root) {
    hash = '#ROOTUSER'
  } else {
    hash = ''
  }

  var url = './api/kebiao/stu/' + sid + '?t=' + Date.now() + hash

  var beforeSend = function (xhr) {
    if (option && option.root) {
      xhr.setRequestHeader('X-ROOTUSER', 'ROOT')
    }
    xhr.setRequestHeader('X-SW-tag', 'get-list')
  }

  getJSON(url, callback, beforeSend)
}

/**
 * 根据学生id获取课表
 *
 * @param {string} sid
 * @param {function} callback ;获取成功后执行的回调函数
 * @param {object} option
 */
function getHitokoto(callback) {
  var beforeSend = function (xhr) {
    xhr.setRequestHeader('X-SW-tag', 'hitokoto')
  }
  getJSON('./proxy/hitokoto?t=' + Date.now(), callback, beforeSend)
}
export default {
  isHavingClass,
  getColIndex,
  getRowIndex,
  sortClassList,
  doTimeCount,
  getJSON,
  getListById,
  getHitokoto
}
