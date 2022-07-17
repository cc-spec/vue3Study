// reactive：通过proxy实现属性拦截
import { mutableHandlers } from "./baseHandlers"

export function reactive(target) {
  if (typeof target !== 'object') {
    console.warn(`reactive ${target} 必须是一个对象`)
    return target
  }
  // mutableHandlers方法中配置proxy的拦截函数
  return new Proxy(target, mutableHandlers)
}