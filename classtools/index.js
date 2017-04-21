var cheerio = require('cheerio');

function html2array(html) {

  var $ = cheerio.load(html, {decodeEntities: false})

  var tr = $('tr').filter(function (index, el) {
    //过滤没有关闭标签的无用tr
    if (el.children.length == 0) 
      return false;
    else 
      return el;
    }
  )

  var tr_header = tr[0]; //保存表头
  var tr_rest = tr.slice(1); //剔除表头
  var ret = []; //返回值
  var namespace = {
    _key: [
      'classType',
      'classID',
      'className',
      'who',
      'where',
      'when',
      'worth',
      'status'
    ],
    _value: []
  };
  //命名空间，用于映射表头中汉字与命名空间中的key，以便还原
  tr_header
    .children
    .forEach((td) => {
      namespace
        ._value
        .push(td.children[0].data);
    })
  
  //处理剩下的课表
  for (let i = 0; i < tr_rest.length; i++) {

    let _td = tr_rest[i]
      .children
      .filter(el => {
        //过滤td
        if (el.type == "tag") 
          return true;
        return false;
      });
    let _obj = {};

    for (let i = 0; i < namespace._key.length; i++) {
      //如果td中有数据，就按照命名空间对应的key赋值
      _obj[namespace._key[i]] = _td[i].children[0]
        ? _td[i].children[0].data
        : 0;
    }
    ret.push(_obj);

    //   decorate elements with some other parameters
    
    ret.forEach(function (el) {
      //they may give us a shit unicode string;\u65535
      if (el.when.codePointAt(0) != 26143) {
        el.when = el
          .when
          .replace(/^\D*/, "星期")
      }
      el.day = getDay(el.when.substring(2, 3));//计算课程在星期几
      el.whichClass = el
        .when
        .substring(4, 8);//计算课程在第几节课
      el.weekend = getWeekends(el.when.substring(8));//计算课程在哪些周有课
    })

  }

  return ret

}

/**
 *  get weekends list by literal string
 *  return a list, when it's a odd-week class, make even-week class out of it
 * @param {string} when
 * @returns {array}
 */
function getWeekends(when) {

  var oddWeek = (when.indexOf('单周') !== -1)
    ? true
    : false;
  var evenWeek = (when.indexOf('双周') !== -1)
    ? true
    : false;

  var ret = [];

  when
    .split(',')
    .forEach(function (item) {
      item = item.replace(/(单|双)?周/g, '');//删除单双周字符


      if (/^\d{1,2}$/.test(item)) {
        ret.push(Number(item));
        //如果是具体的一周，直接加入，例：2周
      } else if (/^\d{1,2}-\d{1,2}$/.test(item)) {
        //如果周数是一个区间，例：2-17周
        var arr = item.split('-');
        var from = Number(arr[0]);
        var to = Number(arr[1]);
        for (; from <= to; from++) {
          ret.push(from);
        }

      } else {
        ret.push(-99);
      }

    })
  if (oddWeek) {
    //如果限制是单周，就在周数的数组中剔除双周的数
    ret = ret.filter(function (n) {
      return n % 2 === 1
        ? true
        : false
    })
  }
  if (evenWeek) {
    //如果限制是双周，就在周数的数组中剔除单周的数
    ret = ret.filter(function (n) {
      return n % 2 === 0
        ? true
        : false
    })
  }
  return ret;
}

/**
 *  get day (Sunday is 0)
 *
 * @param {string|number} str
 * @returns {number}
 */
function getDay(str) {
  if (/[123456]/.test(str)) {
    return Number(str);
  } else {
    return 0
  }
}

exports.html2array = html2array;
