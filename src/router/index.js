import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../components/Index.vue')
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('../components/NetGame.vue')
    },
    {
      path: '/auto',
      name: 'auto',
      component: () => import('../components/NetWatcher.vue')
    },
    {
      path: '/tool',
      name: 'tool',
      component: () => import('../components/MajTool.vue')
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../components/MajCanvas.vue')
    }
  ]
})
