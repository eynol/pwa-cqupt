<template>
  <div class="home__content">
    <h1 class="app-title">设置</h1>
    <card>
      <h2 class="text-center">{{id}}</h2>
      <p class="text-center">
        <a class="btn primary" href="javascript:;" v-on:click="updateList" v-bind:class="{isLoading:isLoading}">更新课表</a>
      </p>
      <p class="text-center">
        <a class="btn danger" href="javascript:;" v-on:click="signout">注销</a>
      </p>
    </card>
    <card v-if="hasServiceWorker">
      <h4 v-show="!inited">初始化中...</h4>
      <table class="config" v-show="inited">
        <tr>
          <th>
            <input type="checkbox" id="config-show" v-model="config.show" hidden>
            <label for="config-show"></label>
          </th>
          <td>
            开启上课提醒
          </td>
        </tr>
        <tr v-show="config.show">
          <th>
            <input type="checkbox" id="config-first" v-model="config.openFirst" hidden>
            <label for="config-first"></label>
          </th>
          <td>第一次提醒</td>
        </tr>
        <tr v-show="config.openFirst && config.show">
          <th>
            <input class="number" type="number" min="0" max="1440" v-model="config.first">
          </th>
          <td>
            <span>分钟前</span>
          </td>
        </tr>
        <tr v-show="config.show">
          <th>
            <input type="checkbox" id="config-second" v-model="config.openSecond" hidden>
            <label for="config-second"></label>
          </th>
          <td>
            第二次提醒
          </td>
        </tr>
        <tr v-show="config.openSecond && config.show">
          <th>
            <input class="number" type="number" min="0" max="1440" v-model="config.second">
          </th>
          <td>
            <span>分钟前</span>
          </td>
        </tr>
        <tr v-show="config.show">
          <th>
            <input type="checkbox" id="config-third" v-model="config.openThird" hidden>
            <label for="config-third"></label>
          </th>
          <td>
            第三次提醒
          </td>
        </tr>
        <tr v-show="config.openThird && config.show">
          <th>
            <input class="number" type="number" min="0" max="1440" v-model="config.third">
          </th>
          <td>
            <span>分钟前</span>
          </td>
        </tr>
      </table>

      <p v-show="config.show">
        <a class="btn primary" href="javascript:;" v-on:click="pushtest">推送测试</a>
      </p>

    </card>
    <card v-if="!hasServiceWorker">
      <p class="danger pd1em">当前浏览器不支持ServiceWorker</p>
    </card>

    <card>
      <p class="danger pd1em">注意：数据来自外网的教务处网站，可能有误，请以教务在线上的课表为准。该应用是可以离线的，请在必要的时候更新数据。推送不可靠，如果浏览器进程被关闭了，那么程序也就关闭了。</p>
    </card>

    <card>
      <p class="pd1em">
        本应用采用渐进式Web应用开发，可以添加快捷方式到桌面作为为本地应用使用。 目前只有Android系统上的google浏览器和火狐浏览器支持该技术，苹果五年计划中提到可能会支持。 请在这两个浏览器中打开本网页，然后在浏览器的「选项」中找到「添加至主屏幕」，然后就可以像原生应用一样使用本应用了。
      </p>
      <p>如果不清楚怎么添加，可以查看操作演示。（建议在wifi下观看）
        <br>
        <a class="btn primary" href="http://pluscdn.heitaov.cn/Screenrecord-2017-03-12-23-30-39-643.mp4" target="_blank">
          <strong>添加到桌面</strong> 操作演示</a>
      </p>
    </card>

    <card>
      <p>开发者：Vankai</p>
      <p>开发者邮箱：mr.taokai@foxmail.com
        <br>
        <a class="btn primary" href="mailto:mr.taokai@foxmail.com">发送邮件</a>
      </p>
      <p>Version: 1.1.0
        <br>
        <a class="btn primary" href="https://github.com/vankai/pwa-cqupt/releases" target="_blank">ChangeLog</a>
      </p>
      <p>
        本项目代码开源在Github上
        <br>
        <a class="btn primary" href="https://github.com/vankai/pwa-cqupt" target="_blank">GitHub地址</a>
      </p>
      <p>
        QQ交流群：390261126，点击加群
        <br>
        <a class="btn primary" target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=c936e8d0406a9a1dd11b2694696647019c1cada073335db9911e85df3fe8c75b">PC</a>
        <a class="btn primary" href="mqqopensdkapi://bizAgent/qm/qr?url=http%3A%2F%2Fqm.qq.com%2Fcgi-bin%2Fqm%2Fqr%3Ffrom%3Dapp%26p%3Dandroid%26k%3DoXY3IfW_SB-0ftUxIwcOvbD3Rg_Pch86">Android</a>
        <a class="btn primary" href="mqqapi://card/show_pslcard?src_type=internal&version=1&uin=390261126&key=05b3f0a16c9b3be3d2a571103d89f8bd1358c5e1f9da5573fcaf6d54233f1f8a&card_type=group&source=external">IOS</a>
      </p>
    </card>
  </div>
</template>

<script>
import Card from '@ui/Card'
import Listener from '@/Listener'
import Util from '@/util'

export default {
  name: 'setting',
  props: ['id'],
  components: {
    Card
  },
  data: function () {
    return {
      urlScreenShot: 'http://pluscdn.heitaov.cn/Screenrecord-2017-03-12-23-30-39-643.mp4',
      isLoading: false,
      inited: false,
      hasServiceWorker: 'serviceWorker' in navigator,
      config: {
        show: false,
        openFirst: false,
        first: 20,
        openSecond: false,
        second: 5,
        openThird: false,
        third: 0
      }
    }
  },

  beforeMount: function () {
    this
      .$watch('config.show', function (a) {
        var _this = this

        //  如果打开显示通知，并且组件已经初始化后，继续
        if (a === true && _this.inited) {
          //  如果没有权限，就申请通知权限
          if (Notification.permission !== 'granted') {
            alert('请同意通知申请。')
            Notification
              .requestPermission()
              .then(function (result) {
                if (result !== 'granted') {
                  alert('无通知权限权限，无法开启.请清除本网站所有数据重试。')
                  _this.config.show = false
                }
              })
          }
        }
        return false
      })
    this.initConfig() //  执行初始化操作
  },
  methods: {
    updateList: function () {
      //  更新课表操作

      // var _this = this
      //  this.isLoading = true
      Util.getListById(this.id, function (err, result) {
        if (err) {
          //  _this.isLoading = false
          return
        }
        if (result.code === 0) {
          Listener.$emit('success-login', result)
          alert('更新成功！')
        } else {
          alert(result.msg)
        }
        //  _this.isLoading = false
      }, { root: true })
    },
    signout: function () {
      //  注销操作
      Listener.$emit('signout')
    },
    pushtest: function () {
      //  推送测试操作
      var mc = new MessageChannel()
      navigator
        .serviceWorker
        .controller
        .postMessage({
          action: 'test'
        }, [mc.port2])
      mc.port1.onmessage = function (e) {
        console.log('test recived')
      }
    },
    initConfig: function () {
      //  初始化组件操作，需要从serviceWorker中获取保存的配置信息
      var _this = this
      var mc = new MessageChannel()
      console.log('inited')
      navigator
        .serviceWorker
        .ready
        .then(function (reg) {
          console.log('ready')
          navigator
            .serviceWorker
            .controller
            .postMessage({
              action: 'getconfig'
            }, [mc.port2])
          mc.port1.onmessage = function (e) {
            var _timer

            //  防止数字错误
            if (typeof e.data.first !== 'string') {
              e.data.first += ''
            }
            if (typeof e.data.second !== 'string') {
              e.data.second += ''
            }
            if (typeof e.data.third !== 'string') {
              e.data.third += ''
            }

            _this.config = e.data //  将返回的消息设置为配置
            _this.inited = true //  设置初始化标志位true
            console.log(e)
            console.log('recive data')
            _this.$watch('config', function (_new, _old) {
              //  if the input is "" string, let it be 0 at nextTick
              if (_new.first === '' || _new.first < 0) {
                _new.first = '0'
              } else if (_new.first.charAt(0) === '0' && _new.first.length >= 2) {
                _new.first = _new
                  .first
                  .slice(1)
              }
              if (_new.second === '' || _new.second < 0) {
                _new.second = '0'
              } else if (_new.second.charAt(0) === '0' && _new.second.length >= 2) {
                _new.second = _new
                  .second
                  .slice(1)
              }
              if (_new.third === '' || _new.third < 0) {
                _new.third = '0'
              } else if (_new.third.charAt(0) === '0' && _new.third.length >= 2) {
                _new.third = _new
                  .third
                  .slice(1)
              }

              //  延迟1.5s 保存配置对象到ServiceWorker 或许 -1s 更合适
              if (_timer) {
                clearTimeout(_timer)
              }
              _timer = setTimeout(function () {
                _this.saveConfig()
                clearTimeout(_timer)
              }, 1500)
            }, { deep: true }) // 深度监视config对象
          }
        })
    },
    saveConfig: function () {
      //  保存config操作
      var mc = new MessageChannel()
      console.log('save config')
      navigator
        .serviceWorker
        .controller
        .postMessage({
          action: 'saveconfig',
          data: this.config
        }, [mc.port2])

      mc.port1.onmessage = function (e) {
        if (e.data.code !== 0) {
          alert('设置保存失败！')
        }
      }
    }
  }
}
</script>
<style>
table.config {
  position: relative;
  border-collapse: collapse;
}

table.config th {
  font-weight: normal;
  width: 40%;
  text-align: right;
  padding-right: 0.5em;
}

table.config td {
  width: 60%;
  text-align: left;
  padding: 0.3em 0;
}

table.config .number {
  margin-right: 1em;
}


input.number {

  border: 0;
  border-bottom: 2px solid #cbffb5;
  padding: 5px 10px;
  text-align: center;
  outline: 0;
  -webkit-appearance: none;
  width: 7em;
}

input.number:focus {
  border-color: #46bf91
}
</style>
