import { isObject } from '../shared'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  // 判断element类型还是组件类型
  console.log(vnode.type)
  if (typeof vnode.type === 'string') {
    // element类型
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    // STATEFUL_COMPONENT类型
    processComponent(vnode, container)
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container)
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountElement(vnode, container) {
  const el = document.createElement(vnode.type)
  vnode.el = el
  //children有string 和 array两种类型
  const { children } = vnode
  if (typeof children === 'string') {
    // text_children
    el.textContent = children
  } else if (Array.isArray(children)) {
    // 每一个children是vnode
    // array_children
    mountChildren(vnode, el)
  }
  // props
  const { props } = vnode
  for (let key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }
  container.append(el)
}

function mountChildren(vnode: any, container: any) {
  vnode.children.forEach((v) => {
    patch(v, container)
  })
}

function mountComponent(initinalvnode: any, container: any) {
  const instance = createComponentInstance(initinalvnode)
  setupComponent(instance)
  setupRenderEffect(instance, initinalvnode, container)
}

function setupRenderEffect(instance: any, initinalvnode, container: any) {
  // 虚拟节点树
  const { proxy } = instance
  // this绑定proxy
  const subTree = instance.render.call(proxy)
  patch(subTree, container)
  initinalvnode.el = subTree.el
}
