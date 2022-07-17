// 收集到的依赖
let activeEffect = null
const targetMap = new WeakMap()

// 把fn函数通过effect函数包裹执行，将函数赋值给全局变量activeEffect，执行fn()的时候，就会触发响应式对象的get函数，get函数内部会吧activeEffect存储到依赖地图中，完成依赖的收集
export function effect(fn, options = {}) {
  const effectFn = () => {
    try {
      activeEffect = effectFn
      // fn执行的时候，内部读取响应式数据的时候，就能在get配置里读取到activeEffect
      return fn()
    } finally {
      activeEffect = null
    }
  }
  if (!options.lazy) {
    // 没有配置lazy直接执行
    effectFn()
  }
  effectFn.scheduler = options.scheduler
  return effectFn
}

// get->收集依赖
export function track(target, type, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    // 初始化depsMap
    targetMap.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
  }
  if (!deps.has(activeEffect) && activeEffect) {
    deps.add(activeEffect)
  }
  depsMap.set(key, deps)
}

// set->执行依赖
export function trigger(target, type, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const deps = depsMap.get(key)
  if (!deps) {
    return
  }
  deps.forEach((effectFn) => {
    if (effectFn.schedule-r) {
      // 控制执行时机
      effectFn.scheduler()
    } else {
      effectFn()
    }
  })
}