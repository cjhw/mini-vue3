import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode, container) {
  // 判断element类型还是组件类型
  // console.log(vnode.type)
  const { type, shapeFlag } = vnode
  // Fragment -> 只渲染 children
  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // element类型
        processElement(vnode, container)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // STATEFUL_COMPONENT类型
        processComponent(vnode, container)
      }
  }
}

function processFragment(vnode: any, container: any) {
  mountChildren(vnode, container)
}

function processText(vnode: any, container: any) {
  const { children } = vnode
  const textNode = document.createTextNode(children)
  vnode.el = textNode
  container.append(textNode)
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
  const { children, shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // text_children
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // 每一个children是vnode
    // array_children
    mountChildren(vnode, el)
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
