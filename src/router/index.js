import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'

import Home from '@/components/Home'
import Days from '@/components/Home/Days'
import Table from '@/components/Home/Table'
import Setting from '@/components/Home/Setting'
import Addition from '@/components/Home/Addition'

import Others from '@/components/Others'
import UserListView from '@/components/Others/UserListView'
import UserCourseView from '@/components/Others/UserCourseView'

import Phones from '@/components/PhoneNumbers'
import OnePost from '@/components/OnePost'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('hasLogin') === 'yes') {
          next('/home')
        } else {
          next()
        }
      }
    }, {
      path: '/home',
      name: 'home',
      component: Home,
      children: [
        {
          path: 'days',
          name: 'days',
          component: Days
        }, {
          path: 'table',
          name: 'table',
          component: Table
        }, {
          path: 'addition',
          name: 'addition',
          component: Addition
        }, {
          path: 'setting',
          name: 'setting',
          component: Setting
        }
      ]
    }, {
      path: '/others',
      name: 'others',
      component: Others,
      children: [
        {
          path: 'list',
          name: 'userListView',
          component: UserListView
        }, {
          path: 'course',
          name: 'userCourseView',
          component: UserCourseView
        }
      ]
    }, {
      path: '/phones',
      name: 'phones',
      component: Phones
    }, {
      path: '/post',
      name: 'onepost',
      component: OnePost
    }
  ],
  beforeEach: function (to, from, next) {
    if (localStorage.getItem('hasLogin') !== 'yes') {
      next('/')
    } else {
      next()
    }
  }
})
