import { ref, inject } from 'vue'
import RouterLink from './RouterLink.vue'
import RouterView from './RouterView.vue'

const ROUTER_KEY = '__router__'

function createRouter(options) {
  return new MyRouter(options)
}

function useRouter() {
  return inject(ROUTER_KEY)
}

function createWebHashHistory() {
  function bindEvents(fn) {
    window.addEventListener('hashchange', fn)
  }
  return {
    bindEvents,
    url: window.location.hash.slice(1) || '/'
  }
}

class MyRouter {
  constructor(options) {
    this.history = options.history
    this.routes = options.routes
    this.current = ref(options.url)

    this.history.bindEvents(() => {
      this.current.value = window.location.hash.slice(1)
    })
  }
  install(app) {
    app.provide(ROUTER_KEY, this)
    app.component('router-link', RouterLink)
    app.component('router-view', RouterView)
  }
}

export { createRouter, useRouter, createWebHashHistory }
