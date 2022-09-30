import { isFunction, isObject } from '@mini-vue3/shared'
import { isReactive } from './reactive'
import { ReactiveEffect } from './effect'

function traversal(value, set = new Set()) {
  // 考虑是否循环引用,不是对象就不再递归了
  if (!isObject(value)) return value

  if (set.has(value)) {
    return value
  }

  set.add(value)
  for (let key in value) {
    traversal(value[key], set)
  }
  return value
}

export function watch(source, cb) {
  let getter
  if (isReactive(source)) {
    // 对用户传入的数据进行循环 (递归循环，只要循环就会访问对象上的每一个属性，访问属性会去收集依赖)
    getter = () => traversal(source)
  } else if (isFunction(source)) {
    getter = source
  } else {
    return
  }
  let cleanup
  const onCleanup = (fn) => {
    cleanup = fn // 保存用户的函数
  }
  let oldValue
  const job = () => {
    if (cleanup) cleanup() // 第二次开始后每次执行用户传入的函数
    const newValue = effect.run()
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }
  const effect = new ReactiveEffect(getter, job)
  oldValue = effect.run()
}
