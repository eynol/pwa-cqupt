<template>
  <div class="others">
    <router-view v-on:newUser="newuser" v-on:showCurseEvent="showCourse" v-on:deleteUserEvent="deleteUser" v-bind:userlist="userlist" v-bind:todayOption="todayOption"></router-view>
    <div class="form-mask" v-bind:class="{active:mask,block:maskblock}" v-on:click="wrapperClickHandler">
      <div class="paper" v-on:click="interruptClickHandler">
        <div class="form">
          <h1 class="app-title">请输入</h1>
          <p>
            <input id="newuser-username" type="text" placeholder="昵称" v-model="tempUser.name" v-on:keydown="nameKeyDownRes">
          </p>
          <p>
            <input id="newuser-id" type="number" placeholder="学号" v-model="tempUser.id" v-on:keydown="idKeyDownRes">
          </p>
          <p>
            <a href="javascript:;" class="btn primary" v-on:click="doNewUser">添加</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Util from '@/util'
import othersListHelper from '@/othersListHelper'

export default {
  name: 'others',
  props: ['todayOption'],
  data: function () {
    return {
      mask: false,
      maskblock: false,
      tempUser: { name: '', id: '' },
      userlist: othersListHelper.getUsersList(),
      currentUser: -1
    }
  },
  mounted: function () {
    if (this.$route.fullPath === '/others') {
      this.$router.replace({ name: 'userListView' })
    }
  },
  methods: {
    newuser: function () {
      if (!this.mask) {
        this.$nextTick(function () {
          this.maskblock = true
        })
        var _this = this
        setTimeout(function () {
          _this.mask = true
        }, 16)
      }
    },
    wrapperClickHandler: function (e) {
      var _this = this
      this.mask = false
      setTimeout(function () {
        _this.maskblock = false
      }, 316)
    },
    interruptClickHandler: function (e) {
      e.stopPropagation()
      e.preventDefault()
    },
    nameKeyDownRes: function (e) {
      if (e.keyCode === 13) {
        document.querySelector('#newuser-id').focus()
      }
    },
    idKeyDownRes: function (e) {
      if (e.keyCode === 13) {
        this.doNewUser()
      }
    },
    doNewUser: function (e) {
      //  validate id
      var _this = this
      if (/^\d{10}$/.test(this.tempUser.id)) {
        var copy = JSON.parse(JSON.stringify(this.tempUser))

        Util.getListById(copy.id, function (err, res) {
          if (err) {
            alert('Opps~' + err.msg)
            console.log(err)
          } else {
            copy.data = res
            _this.userlist.push(copy)
            othersListHelper.saveUsersList(_this.userlist)
            _this.wrapperClickHandler()
            _this.tempUser.id = ''
            _this.tempUser.name = ''
          }
        }, {})
      } else {
        alert('请输入正确的学号！')
      }
    },
    showCourse: function (index) {
      this.$router.push({ name: 'userCourseView', params: { index: index } })
    },
    deleteUser: function (index) {
      this.userlist.splice(index, 1)
      this.$router.go(-1)
      othersListHelper.saveUsersList(this.userlist)
    }
  }
}
</script>
<style>
.other__userlist {
  list-style: none;
  padding: 0;
}

.other__userlist:after {
  content: "";
  display: table;
  clear: both;
}

.people {
  cursor: pointer;
  margin: 10px 30px;
  text-align: center;
  padding: 26px 40px;
  border-radius: 4px;
  background-color: #8a7676;
  color: white;
  box-shadow: 0 1px 10px 0px rgba(0, 0, 0, 0.23);
  overflow: hidden;
  transition: all .3s;
  max-width: 768px;
}
@media screen and (min-width:768px){
  .people{
    margin:20px auto;
  }
}


.people:hover {
  will-change: transform;
  transform: translateY(-1px);
  box-shadow: 0 6px 11px 0px rgba(0, 0, 0, 0.23)
}

.form-mask {
  position: fixed;
  background-color: rgba(0, 0, 0, .55);
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0;
  transition: opacity .3s;
  display: none;
}

.form-mask.active {
  opacity: 1;
}

.form-mask.block {
  display: block;
}

.paper {
  background-color: white;
  border-radius: 12px 12px 0 0;
  height: 250px;
  width: 100%;
  position: absolute;
  bottom: -250px;
  transition: .4s;
}

.form-mask.active .paper {
  transform: translateY(-100%)
}

.paper input {
  border: 0;
  border-bottom: 2px solid #cbffb5;
  padding: 5px 10px;
  text-align: center;
  outline: 0;
  -webkit-appearance: none;
}

.paper input:focus {
  border-color: #46bf91
}
</style>
