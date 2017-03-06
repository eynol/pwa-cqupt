var U = {
  id: document
    .getElementById
    .bind(document)
}

var storeTool = {
  _prefix: "CQUPT",
  getSchoolID: function () {
    return localStorage.getItem(this._prefix + 'schoolID');
  },
  setSchoolID: function (sid) {
    return localStorage.setItem(this._prefix + 'schoolID', String(sid));
  },
  getListById:function(sid){
    var str = localStorage.getItem(this._prefix+'list'+sid);
    return JSON.parse(str);
  },
  setListById:function(sid,list){
    var str ='';
    if(typeof list ==='string'){
      str = list;
    }else if(typeof list === 'object'){
      str = JSON.stringify(list);
    }
    localStorage.setItem(this._prefix+'list'+sid,str);
  }
}

Vue.component('login', {
  // 声明 props
  template: '#tpl-login',
  props: [],
  data: function () {
    return {fakeId: undefined}
  },
  methods: {
    fakeIdKeyDown: function (e) {
      if (e.keyCode == 13) {
        this.enterApp()
      }
    },
    enterApp: function (e) {
      var _self = this;
      if (/\d{10}/.test(this.fakeId)) {
        getListById(this.fakeId, function (result) {
          if (result.code === 0) {
              result.id = _self.fakeId;
            _self.$emit('success', result);
          } else {
            _self.error(result.msg)
          }
        });

      } else {

        this.error("请输入正确的学号(不是一卡通号)")

      }
    },
    error: function (msg) {
      setTimeout(function () {
        alert(msg);
      }, 4);
    }
  }

})

Vue.component('main-panel', {

  template: '#tpl-main-panel',
  props: ['list','today','tomorrow'],
  data: function () {
    var todayList = [],
        tomorrowList = [];
    var _this = this;
    this.list.forEach(function(el){
      var when = el.when;
      el.day = getDay(el.when.substring(2,3));
      el.whichClass =  el.when.substring(4,8);
      el.weekend = getWeekends(el.when.substring(8));
      el.thisWeek = (el.weekend.indexOf(_this.today.weekendPast)!==-1)?true:false;
    })

    return {tab:'today',tableActive:false}
  },
  computed:{
    todayList:function(){
      var _this = this;
      var list = [];
      this.list.forEach(function (el) {
        if (el.weekend.indexOf(_this.today.weekendPast) !== -1 && el.day === _this.today.todayDay) {
          list.push(el)
        }
      })
      return list.sort(sortClassList);
    },
    tomorrowList:function(){
      var _this = this;
      var list = [];
      this.list.forEach(function (el) {
        if(el.weekend.indexOf(_this.tomorrow.weekendPast)!==-1 && el.day === _this.tomorrow.todayDay){
          list.push(el)
        }
      })
      return list.sort(sortClassList);
    },
    table:function(){
      var ret = {
        hasWeekend :false,
        data:[[{},{},{},{},{},{},{}],
              [{},{},{},{},{},{},{}],
              [{},{},{},{},{},{},{}],
              [{},{},{},{},{},{},{}],
              [{},{},{},{},{},{},{}],
              [{},{},{},{},{},{},{}]]
      };
      /**
       *  return rows index (start with 0);
       * 
       * @param {string} str 
       * @returns {number}
       */
      function getRowIndex (str){
          if(/\d+/.test(str)){
            return Math.floor(Number(str.substring(0,1))/2)
          }else{
            return 5;
          }
      }
      /**
       * return colums index (start with 0);
       * 
       * @param {number} num 
       * @returns {number}
       */
      function getColIndex(num){
        return num == 0 ? 6:num-1;
      }

      this.list.forEach(function(el){
        var rowIndex = getRowIndex(el.whichClass.substring(1,3));
        var colIndex = getColIndex(el.day);
        if(/6|0/.test(el.day)){
          ret.hasWeekend =true;
        }
        ret.data[rowIndex][colIndex] = el;
      })
      

      return ret;
    }
  },
  methods: {
    show_table:function(){
      this.tableActive =true
    },
    hide_table:function(){
       this.tableActive =false
    },
    navTo:function(tab){
      this.tab = tab;
    }
  }

})



var store_id = storeTool.getSchoolID();
var store_list = storeTool.getListById(store_id);
var d = new Date();
var app = new Vue({
  el: '#app',
  data: {
    id:store_id ,
    originList: store_list,
    currentView: "",
    todayOption :doTimeCount(d),
    tomorrowOption:doTimeCount(new Date(d.getFullYear(),d.getMonth(),d.getDate()+1))
  },
  beforeMount: function () {
    if (this.id) {
      this.currentView = 'main-panel'
    } else {
      this.currentView = 'login'
    }
  },
  components: {
    'login': Vue.component('login'),
    'main-panel': Vue.component('main-panel')
  },
  computed: {
    hasLogin: function () {
      return this.id
        ? true
        : false;
    }
  },
  methods: {
    login: function (result) {
      console.log("receive id:" + result.id);


     

      this.id = Number(result.id);
      this.originList = result.list;
      this.currentView = 'main-panel';


      storeTool.setSchoolID(this.id);
      storeTool.setListById(this.id,result.list);
    }
  }
})

  /**
   *  Date.getDay() 星期天是0
   * 
   * @param {date} thatDay 
   * @returns 
   */
 function doTimeCount(thatDay) {

  var timeGap = thatDay - new Date(2017, 1, 27);
  var dayPast = Math.floor(timeGap / (1000 * 60 * 60 * 24)) + 1;
  var weekendPast = Math.floor(dayPast / 7) + 1;
  var isoddWeek = (weekendPast % 2) === 1;
  
  return {timeGap: timeGap, dayPast: dayPast, weekendPast: weekendPast, isoddWeek: isoddWeek,todayDay:thatDay.getDay()}
}
function getListById(sid, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('get', './api/kebiao/stu/' + sid);
  xhr.responseType = 'json';
  xhr.onload = function (e) {
    callback(xhr.response)
  }
  xhr.onerror = function (e) {
    console.log(e)
    alert("发送失败！")
  }
  xhr.send();
}

function sortClassList(a,b){
  if(a.whichClass.substring(1,3)>b.whichClass.substring(1,3)){
    return 1;
  }else{
    return -1
  }
}
function getDay(str){
  if(/[123456]/.test(str)){
      return Number(str);
  }else{
    return 0
  }
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
  console.log(oddWeek,evenWeek);
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