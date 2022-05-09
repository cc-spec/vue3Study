import { inject, reactive } from "vue";

const STORE_KEY = '__store__'

// useStore提供vuex给当前组件
function useStore() {
  return inject(STORE_KEY)
}

// 创建当前应用中的store
function createStore(options) {
  return new MyStore(options)
}

class MyStore {
  // 初始化store实例时添加options
  constructor(options) {
    this.$options = options
    this._state = reactive({
      data: options.state()
    })
    this._mutations = options.mutations
  }
  // 获取state
  get state() {
    return this._state.data
  }
  // 通过commit修改state
  commit = (type, payload) => {
    const entry = this._mutations[type]
    entry && entry(this.state, payload)
  }
  // 通过use安装
  install(app) {
    app.provide(STORE_KEY, this)
  }
}

export { useStore, createStore }