import { shallowReadonly } from '../resctivity/reactive'
import { emit } from './componentEmit,'
import { initProps } from './componentProps'
import { publicInstanceProxyHandlers } from './componentPublicInstance'

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {},
  }
  component.emit = emit.bind(null, component) as any
  return component
}

export function setupComponent(instance) {
  // 初始化props
  initProps(instance, instance.vnode.props)
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type
  // ctx
  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)
  const { setup } = Component
  if (setup) {
    // 返回object或function
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult: any) {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }
  // 保证组件的render有值
  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type
  instance.render = Component.render
}
