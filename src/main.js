// The Vue build version to load with the `import` command (runtime-only or
// standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import runtime from 'serviceworker-webpack-plugin/lib/runtime'

require('./css/public.css')

Vue.config.productionTip = false // production env tip？
var activateServiceWorker = true // set to true before publish

if ('serviceWorker' in navigator && activateServiceWorker) {
  runtime.register()
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {
    App
  }
})
