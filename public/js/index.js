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
  props: ['list'],
  data: function () {
    return {}
  },
  methods: {}

})



var store_id = storeTool.getSchoolID();
var store_list = storeTool.getListById(store_id);
var app = new Vue({
  el: '#app',
  data: {
    id:store_id ,
    originList: store_list,
    currentView: ""
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

 function doTimeCount(thatDay) {

  var timeGap = thatDay - new Date(2017, 1, 27);;
  var dayPast = Math.floor(timeGap / (1000 * 60 * 60 * 24)) + 1;
  var weekendPast = Math.floor(dayPast / 7) + 1;
  var isoddWeek = (weekendPast % 2) === 1;

  return {timeGap: timeGap, dayPast: dayPast, weekendPast: weekendPast, isoddWeek: isoddWeek}
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
