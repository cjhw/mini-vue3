import { effect } from '../resctivity/effect'
import { EMPTY_OBJ } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
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
    mountChildren(n2.children, container, parentComponent)
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
      patchElement(n1, n2, container, parentComponent)
    }
  }

  function patchElement(n1, n2, container, parentComponent) {
    const el = n1.el
    n2.el = el
    console.log(n1)
    console.log(n2)
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    patchChildren(n1, n2, el, parentComponent)
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent) {
    const preShapeFlag = n1.shapeFlag
    const c1 = n1.children
    const { shapeFlag } = n2
    const c2 = n2.children

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 1.把老的children清空
        unmountChildren(n1.children)
        // 2.设置 text
        hostSetElementText(container, c2)
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2)
      }
    } else {
      // new Array
      if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent)
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      // remove
      hostRemove(el)
    }
  }

  function patchProps(el, oldProps, newProps) {
    for (const key in newProps) {
      const preProp = oldProps[key]
      const nextProp = newProps[key]
      if (preProp !== nextProp) {
        hostPatchProp(el, key, preProp, nextProp)
      }
    }

    if (oldProps !== EMPTY_OBJ) {
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null)
        }
      }
    }
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
      mountChildren(vnode.children, el, parentComponent)
    }
    // props
    const { props } = vnode
    for (let key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }
    // container.append(el)
    hostInsert(el, container)
  }

  function mountChildren(children: any, container: any, parentComponent) {
    children.forEach((v) => {
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
