import { getCurrentInstance } from './component'

export function provide(key, value) {
  // 只能在setup里使用
  const currentInstance: any = getCurrentInstance()
  let { provides } = currentInstance
  const parentProvides = currentInstance.parent.provides
  if (provides === parentProvides) {
    provides = currentInstance.provides = Object.create(parentProvides)
  }
  provides[key] = value
}

export function inject(key, defaultValue) {
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    const { parent } = currentInstance
    const parentProvides = currentInstance.parent.provides
    console.log(parentProvides)
    if (key in parentProvides) {
      return parentProvides[key]
    } else if (defaultValue) {
      if (typeof defaultValue === 'function') {
        return defaultValue()
      }
      return defaultValue
    }
  }
}
