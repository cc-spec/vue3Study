window.onerror = function(e){
  console.log(['https://stackoverflow.com/search?q=[js]+'+e])
} 
import { createApp } from 'vue'
import App from './App.vue'

import router from './router/index'
import store from './store/index'
import Element3 from 'element3'

createApp(App)
  .use(store)
  .use(router)
  .use(Element3)
  .mount('#app')
  