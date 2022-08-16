import { hasChanged, isObject } from '../shared'
import { isTracking, trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'

// 传过来的基本数据类型没办法get和set
// 所以用一个对象包裹住，这就是ref要使用.value的原因

class RefImpl {
  private _value: any
  public dep
  private _rawValue
  public __v_isRef = true
  constructor(value) {
    this._rawValue = value
    // 看看value是不是对象，如果是对象用reactive包裹
    this._value = convert(value)
    this.dep = new Set()
  }
  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    // 如果两次设置的值相等，不触发依赖
    if (hasChanged(this._rawValue, newValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffects(this.dep)
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(ref) {
  // 是ref对象返回ref.value否则返回初始值
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value)
      } else {
        return Reflect.set(target, key, value)
      }
    },
  })
}
