import { ReactiveEffect } from './effect'

class ComputedRefImpl {
  // 标记是否被读过
  private _dirty: boolean = true
  private _value: any
  // 依赖的响应式对象用effect存起来
  private _effect: any
  constructor(getter) {
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }
  get value() {
    // 第一次调用get value后就不再执行getter了
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter)
}
