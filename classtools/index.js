var cheerio = require('cheerio');

function html2array(html) {

  var $ = cheerio.load(html, {decodeEntities: false})

  var tr = $('tr').filter(function (index, el) {
    if (el.children.length == 0) 
      return false;
    else 
      return el;
    }
  )

  var tr_header = tr[0];
  var tr_rest = tr.slice(1);
  var ret = []
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
  }
  tr_header
    .children
    .forEach((td) => {
      namespace
        ._value
        .push(td.children[0].data);
    })

  for (let i = 0; i < tr_rest.length; i++) {

    let _td = tr_rest[i]
      .children
      .filter(el => {
        if (el.type == "tag") 
          return true;
        return false;
      });
    let _obj = {};

    for(let i=0;i<namespace._key.length;i++){
      _obj[namespace._key[i]] = _td[i].children[0]?_td[i].children[0].data:0;
    }
    ret.push(_obj);

    //   decorate elements with some other parameters
    ret.forEach(function(el){
      //they may give us a shit unicode string;\u65535
      if(el.when.codePointAt(0)!=26143){
        el.when = el.when.replace(/^\D*/,"星期")
      }
      el.day = getDay(el.when.substring(2,3));
      el.whichClass =  el.when.substring(4,8);
      el.weekend = getWeekends(el.when.substring(8));
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
function getWeekends(when){

  var oddWeek = (when.indexOf('单周')!==-1)?true:false;
  var evenWeek = (when.indexOf('双周')!==-1)?true:false;

  var ret = [];

  when.split(',').forEach(function(item){
    item = item.replace(/(单|双)?周/g,'');

    if(/^\d{1,2}$/.test(item)){
      ret.push(Number(item));
    }else if(/^\d{1,2}-\d{1,2}$/.test(item)){
      var arr = item.split('-');
      var from = Number(arr[0]);
      var to = Number(arr[1]);
      for(;from<=to;from++){
        ret.push(from);
      }

    }else{
      ret.push(-99);
    }

  })
  if(oddWeek){
    ret = ret.filter(function(n){
      return n%2===1?true:false
    })
  }
  if(evenWeek){
    ret = ret.filter(function(n){
      return n%2===0?true:false
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
function getDay(str){
  if(/[123456]/.test(str)){
      return Number(str);
  }else{
    return 0
  }
}


exports.html2array = html2array;
