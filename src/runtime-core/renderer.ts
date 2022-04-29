import { effect } from '../resctivity/effect'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options
  function render(vnode, container) {
    patch(null, vnode, container, null)
  }

  // n1->老虚拟节点 n2->信虚拟节点
  function patch(n1, n2, container, parentComponent) {
    // 判断element类型还是组件类型
    // console.log(vnode.type)
    const { type, shapeFlag } = n2
    // Fragment -> 只渲染 children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // element类型
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // STATEFUL_COMPONENT类型
          processComponent(n1, n2, container, parentComponent)
        }
    }
  }

  function processFragment(n1, n2, container: any, parentComponent) {
    mountChildren(n2, container, parentComponent)
  }

  function processText(n1, n2, container: any) {
    const { children } = n2
    const textNode = document.createTextNode(children)
    n2.el = textNode
    container.append(textNode)
  }

  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }

  function patchElement(n1, n2, container) {
    console.log(n1)
    console.log(n2)
  }

  function mountElement(vnode, container, parentComponent) {
    const el = hostCreateElement(vnode.type)
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
      hostPatchProp(el, key, val)
    }
    // container.append(el)
    hostInsert(el, container)
  }

  function mountChildren(vnode: any, container: any, parentComponent) {
    vnode.children.forEach((v) => {
      patch(null, v, container, parentComponent)
    })
  }

  function processComponent(n1, n2: any, container: any, parentComponent: any) {
    mountComponent(n2, container, parentComponent)
  }

  function mountComponent(initinalvnode: any, container: any, parentComponent) {
    const instance = createComponentInstance(initinalvnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initinalvnode, container)
  }

  function setupRenderEffect(instance: any, initinalvnode, container: any) {
    effect(() => {
      if (!instance.isMounted) {
        // 虚拟节点树
        const { proxy } = instance
        // this绑定proxy
        instance.subTree = instance.render.call(proxy)
        const subTree = instance.subTree
        patch(null, subTree, container, instance)
        initinalvnode.el = subTree.el
        instance.isMounted = true
      } else {
        // 虚拟节点树
        const { proxy } = instance
        // this绑定proxy
        const subTree = instance.render.call(proxy)
        const preSubTree = instance.subTree
        instance.subTree = subTree
        patch(preSubTree, subTree, container, instance)
      }
    })
  }
  return {
    createApp: createAppAPI(render),
  }
}
