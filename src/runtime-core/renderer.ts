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
    patch(null, vnode, container, null, null)
  }

  // n1->老虚拟节点 n2->信虚拟节点
  function patch(n1, n2, container, parentComponent, anchor) {
    // 判断element类型还是组件类型
    // console.log(vnode.type)
    const { type, shapeFlag } = n2
    // Fragment -> 只渲染 children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // element类型
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // STATEFUL_COMPONENT类型
          processComponent(n1, n2, container, parentComponent, anchor)
        }
    }
  }

  function processFragment(n1, n2, container: any, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  function processText(n1, n2, container: any) {
    const { children } = n2
    const textNode = document.createTextNode(children)
    n2.el = textNode
    container.append(textNode)
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    const el = n1.el
    n2.el = el
    // console.log(n1)
    // console.log(n2)
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    patchChildren(n1, n2, el, parentComponent, anchor)
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
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
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        // array diff array
        patchKeyChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyChildren(c1, c2, container, parentComponent, parentAnchor) {
    const l2 = c2.length
    let i = 0
    let e1 = c1.length - 1
    let e2 = l2 - 1
    function isSomeVNodeType(n1, n2) {
      // type
      // key
      return n1.type === n2.type && n1.key === n2.key
    }
    // 左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++
    }
    // 右侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      e1--
      e2--
      console.log(n1)
      console.log(n2)
    }
    //新的比老的多
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
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

  function mountElement(vnode, container, parentComponent, anchor) {
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
      mountChildren(vnode.children, el, parentComponent, anchor)
    }
    // props
    const { props } = vnode
    for (let key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }
    // container.append(el)
    hostInsert(el, container, anchor)
  }

  function mountChildren(
    children: any,
    container: any,
    parentComponent,
    anchor
  ) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor)
    })
  }

  function processComponent(
    n1,
    n2: any,
    container: any,
    parentComponent: any,
    anchor
  ) {
    mountComponent(n2, container, parentComponent, anchor)
  }

  function mountComponent(
    initinalvnode: any,
    container: any,
    parentComponent,
    anchor
  ) {
    const instance = createComponentInstance(initinalvnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initinalvnode, container, anchor)
  }

  function setupRenderEffect(
    instance: any,
    initinalvnode,
    container: any,
    anchor
  ) {
    effect(() => {
      if (!instance.isMounted) {
        // 虚拟节点树
        const { proxy } = instance
        // this绑定proxy
        instance.subTree = instance.render.call(proxy)
        const subTree = instance.subTree
        patch(null, subTree, container, instance, anchor)
        initinalvnode.el = subTree.el
        instance.isMounted = true
      } else {
        // 虚拟节点树
        const { proxy } = instance
        // this绑定proxy
        const subTree = instance.render.call(proxy)
        const preSubTree = instance.subTree
        instance.subTree = subTree
        patch(preSubTree, subTree, container, instance, anchor)
      }
    })
  }
  return {
    createApp: createAppAPI(render),
  }
}
