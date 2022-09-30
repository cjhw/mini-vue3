import { camelize, toHandlerKey } from '@mini-vue3/shared'

export function emit(instance, event, ...args) {
  console.log('emit:' + event)
  const { props } = instance
  // TPP开发
  // 先去写一个特定的行为 -> 重构成通用的行为
  // add -> Add
  // 例如:
  // const handler = props['onAdd']
  // handler && handler()

  const handleName = toHandlerKey(camelize(event))
  console.log(handleName)
  const handler = props[handleName]
  handler && handler(...args)
}
