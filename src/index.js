import style from "./stylesheets/main.scss"

// Libs
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Router from 'vue-router'
// Components
import AppComponent from './components/app.vue'
import boards from './components/boards.vue'
import board from './components/board.vue'


Vue.use(VueAxios, axios)
Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', component: boards },
    {
      path: '/board/:resourceId',
      name: 'board',
      component: board
    }
  ]
})

Vue.config.productionTip = true

const app = new Vue({
  router,
  render: h => h(AppComponent)
}).$mount('#app')
