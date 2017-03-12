var TIME_GAP = [
  {
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
  }
]

function isHavingClass(_index, hour, minute, isEqual) {
  var T = TIME_GAP[_index];
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
    return 1;
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
  if (typeof str == "object") 
    str = str.whichClass.substring(1, 3);
  if (!str && str !== 0) 
    return 0;
  if (/\d+/.test(str)) {
    return Math.floor(Number(str.substring(0, 1)) / 2)
  } else {
    return 5;
  }
}
/**
 * return colums index (start with 0);
 *
 * @param {number} num
 * @returns {number}
 */
function getColIndex(num) {
  if (!num && num !== 0) 
    return 0;
  return num == 0
    ? 6
    : num - 1;
}

/**
 *  Date.getDay() 星期天是0
 *
 * @param {Date} thatDay
 * @returns
 */
function doTimeCount(thatDay) {

  var timeGap = thatDay - new Date(2017, 1, 27);
  var dayPast = Math.floor(timeGap / (1000 * 60 * 60 * 24)) + 1;
  var weekendPast = Math.ceil(dayPast / 7);
  var isoddWeek = (weekendPast % 2) === 1;
  var id = "" + thatDay.getFullYear() + thatDay.getMonth() + thatDay.getDate();
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

function getListById(sid, callback, option) {
  var xhr = new XMLHttpRequest();
  xhr.open('get', './api/kebiao/stu/' + sid + '?t=' + Date.now() + (option.root
    ? '#ROOTUSER'
    : ''));
  console.log(option)
  xhr.responseType = 'json';
  if (option.root) {
    xhr.setRequestHeader('X-ROOTUSER', 'ROOT')
  }
  xhr.setRequestHeader('X-SW-tag', 'get-list')
  xhr.onload = function (e) {
    callback(null, xhr.response)
  }
  xhr.onerror = function (e) {
    console.log(e)
    alert("发送失败！")
    callback(e);
  }
  xhr.send();
}
