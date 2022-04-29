import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'

export function render(vnode, container) {
  patch(vnode, container, null)
}

function patch(vnode, container, parentComponent) {
  // 判断element类型还是组件类型
  // console.log(vnode.type)
  const { type, shapeFlag } = vnode
  // Fragment -> 只渲染 children
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // element类型
        processElement(vnode, container, parentComponent)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // STATEFUL_COMPONENT类型
        processComponent(vnode, container, parentComponent)
      }
  }
}

function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode, container, parentComponent)
}

function processText(vnode: any, container: any) {
  const { children } = vnode
  const textNode = document.createTextNode(children)
  vnode.el = textNode
  container.append(textNode)
}

function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container, parentComponent)
}

function processComponent(vnode: any, container: any, parentComponent: any) {
  mountComponent(vnode, container, parentComponent)
}

function mountElement(vnode, container, parentComponent) {
  const el = document.createElement(vnode.type)
  vnode.el = el
  //children有string 和 array两种类型
  const { children, shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // text_children
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // 每一个children是vnode
    // array_children
    mountChildren(vnode, el, parentComponent)
  }
  // props
  const { props } = vnode
  for (let key in props) {
    const val = props[key]
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val)
    }
  }
  container.append(el)
}

function mountChildren(vnode: any, container: any, parentComponent) {
  vnode.children.forEach((v) => {
    patch(v, container, parentComponent)
  })
}

function mountComponent(initinalvnode: any, container: any, parentComponent) {
  const instance = createComponentInstance(initinalvnode, parentComponent)
  setupComponent(instance)
  setupRenderEffect(instance, initinalvnode, container)
}

function setupRenderEffect(instance: any, initinalvnode, container: any) {
  // 虚拟节点树
  const { proxy } = instance
  // this绑定proxy
  const subTree = instance.render.call(proxy)
  patch(subTree, container, instance)
  initinalvnode.el = subTree.el
}
