
import {
  createRouter, // 新建路由实例
  createWebHashHistory, // 配置内部使用hash模式
} from '../myRouter/index'
import Home from '../pages/home.vue'
import About from '../pages/about.vue'
import Login from '../components/Login.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    hidden: true
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router