export * from './toDisplayString'

export const extend = Object.assign

export const EMPTY_OBJ = {}

export const isString = (value) => typeof value === 'string'

export const isObject = (val) => {
  return val !== null && typeof val === 'object'
}

export const isFunction = (val) => {
  return typeof val === 'function'
}

export const hasChanged = (val, newValue) => !Object.is(val, newValue)

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key)

export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : ''
  })
}

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const toHandlerKey = (str: string) => {
  return str ? 'on' + capitalize(str) : ''
}

export { ShapeFlags } from './ShapeFlags'
