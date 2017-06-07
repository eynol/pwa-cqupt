<template>
  <div class="box login">
    <div class="form">
      <h1 class="app-title">重邮课表</h1>
      <p>
        <input class="login" type="text" v-model="fakeId" v-on:keydown="fakeIdKeyDown" placeholder="请输入您的学号">
      </p>
      <p class="error-info" v-bind:class="{active:isWrong}" style="opacity:1">{{errMsg}}</p>
      <p>
        <a class="primary btn" href="javascript:;" v-on:click="enterApp">进入应用</a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  props: {
    sid: String
  },
  data: function () {
    return {
      isWrong: false,
      errMsg: 'No BUG',
      fakeId: ''
    }
  },
  methods: {
    enterApp: function () {
      var _this = this
      this.$emit('login', this.fakeId, function (err, msg) {
        if (err) {
          _this.isWrong = true
          _this.errMsg = msg
        } else {
          _this.isWrong = false
        }
      })
    },
    fakeIdKeyDown: function (f) {
      if (this.isWrong) this.isWrong = false
      if (f.keyCode === 13) {
        this.enterApp()
      }
    }
  }
}
</script>

<style scoped>
.center.aligned {
  text-align: center;
}

.app-title {
  text-align: center;
  color: #016946;
  font-weight: 300;
}

.btn {
  display: inline-block;
  color: #444;
  padding: 6px 20px;
  text-decoration: none;
  /* box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.13);*/
  transition: all 0.3s;
}


.btn.primary {
  color: #fff;
  border: solid 2px #46bf91;
  background-color: #46bf91;
}


.box.login {
  position: absolute;
  background-color: #fff;
  z-index: 500;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.box.login .form {
  text-align: center;
}

.box.login h1 {
  font-family: Georgia, "Times New Roman", "FangSong", "仿宋", "STFangSong", "华文仿宋", serif;
}

.box.login input {
  border: 0;
  border-bottom: 2px solid #cbffb5;
  padding: 5px 10px;
  text-align: center;
  outline: 0;
  -webkit-appearance: none;
}

.box.login input:focus {
  border-color: #46bf91
}

.error-info {
  color: red;
  visibility: hidden;
}

.error-info.active {
  visibility: visible;
}
</style>
