// get中直接返回读取的数据
// set中调用trigger函数，执行track收集依赖

import { reactive } from "./reactive"
import { track, trigger } from "./effect"

// receiver：接收器
const get = createGetter()
const set = createSetter()

function createGetter(shallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
    // track函数实现依赖收集，将effect收集到依赖地图中，依赖地图targetMap的key是要代理的target对象，值还是一个depsMap
    track(target, 'get', key)
    if (  (res)) {
      // 取值也是对象，嵌套调用reactive
      // res===target[key]
      // shallow：是否是浅层代理，true为浅层，不执行嵌套逻辑
      return shallow ? res : reactive(res)
    }
  }
}

function createSetter() {
  return function set(target, key, value, receiver) {
    const res = Reflect.set(target, key, value, receiver)
    // trigger函数执行effect
    trigger(target, 'set', key)
    return res
  }
}

export const mutableHandlers = { get, set }
