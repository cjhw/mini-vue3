import { proxyRefs } from '../reactivity'
import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { publicInstanceProxyHandlers } from './componentPublicInstance'
import { initSlots } from './componentSlots'

let currentInstance = null

export function createComponentInstance(vnode, parent) {
  const component = {
    vnode,
    type: vnode.type,
    next: null,
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    isMounted: false,
    subTree: {},
    emit: () => {},
  }
  component.emit = emit.bind(null, component) as any
  return component
}

export function setupComponent(instance) {
  // 初始化props
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type
  // ctx
  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)
  const { setup } = Component
  if (setup) {
    setCurrentInstance(instance)
    // 返回object或function
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })
    setCurrentInstance(null)
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult: any) {
  if (typeof setupResult === 'object') {
    instance.setupState = proxyRefs(setupResult)
    // console.log(instance.setupState)
  }
  // 保证组件的render有值
  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type
  if (compiler && !Component.render) {
    Component.render = compiler(Component.template)
  }
  instance.render = Component.render
}

export function getCurrentInstance() {
  return currentInstance
}

export function setCurrentInstance(instance) {
  currentInstance = instance
}

let compiler

export function registerRuntimeCompiler(_compiler) {
  compiler = _compiler
}
