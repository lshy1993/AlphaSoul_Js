import Vue from 'vue'
import App from './App.vue'
import router from './router'

import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios,axios);
Vue.config.productionTip = false;

import './assets/main.css';
import './assets/tool.scss';
import './assets/game.scss';
import './assets/app.scss';

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
