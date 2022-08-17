import { effect } from '../reactivity/effect'
import { EMPTY_OBJ } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { shouldUpdateComponent } from './componentUpdateUtils'
import { createAppAPI } from './createApp'
import { queueJobs } from './scheduler'
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

  // n1->老虚拟节点 n2->新虚拟节点
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
    console.log(n1)
    console.log(n2)
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
      }
      if (c1 !== c2) {
        // 2.设置 text
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
      // 老的比新的多
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    } else {
      // 中间节点
      let s1 = i
      let s2 = i
      // 记录新节点的中间children节点数
      const toBePatched = e2 - s2 + 1
      // 记录当前patch了多少个中间节点
      let patched = 0
      const keyToNewIndexMap = new Map()
      // 存储子序列
      let moved = false
      // 记录老节点的当前子节点索引
      let maxNewIndexSoFar = 0
      const newIndexToOldIndexMap = new Array(toBePatched)
      for (let i = 0; i < toBePatched; i++) {
        newIndexToOldIndexMap[i] = 0
      }
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i]
        // 新节点的中间children节点patch完了直接删除老节点中多余的
        if (patched >= toBePatched) {
          hostRemove(prevChild.el)
          continue
        }

        let newIndex
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSomeVNodeType(prevChild, c2[j])) {
              newIndex = j
              break
            }
          }
        }

        if (newIndex === undefined) {
          hostRemove(prevChild.el)
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }
          // 避免i=0的情况所以+1因为初始化newIndexToOldIndexMap全是0
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          patch(prevChild, c2[newIndex], container, parentComponent, null)
          patched++
        }
      }
      // 最长递增子序列
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : []
      let j = increasingNewIndexSequence.length - 1
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null

        if (newIndexToOldIndexMap[i] === 0) {
          // 老的里面不存在要创建新节点
          patch(null, nextChild, container, parentComponent, anchor)
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }
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
    if (oldProps !== newProps) {
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
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor)
    } else {
      updateComponent(n1, n2)
    }
  }

  function updateComponent(n1, n2) {
    const instance = n1.component
    n2.component = instance
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n2.el = n1.el
      instance.vnode = n2
    }
  }

  function mountComponent(
    initinalvnode: any,
    container: any,
    parentComponent,
    anchor
  ) {
    const instance = createComponentInstance(initinalvnode, parentComponent)
    initinalvnode.component = instance
    setupComponent(instance)
    setupRenderEffect(instance, initinalvnode, container, anchor)
  }

  function setupRenderEffect(
    instance: any,
    initinalvnode,
    container: any,
    anchor
  ) {
    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          // 虚拟节点树
          const { proxy } = instance
          // this绑定proxy
          // 第二个参数是因为template模板编译后要从_ctx里取数据
          instance.subTree = instance.render.call(proxy, proxy)
          const subTree = instance.subTree
          patch(null, subTree, container, instance, anchor)
          initinalvnode.el = subTree.el
          instance.isMounted = true
        } else {
          const { next, vnode } = instance
          if (next) {
            next.el = vnode.el
            updateComponentPreRender(instance, next)
          }
          // 虚拟节点树
          const { proxy } = instance
          // this绑定proxy
          const subTree = instance.render.call(proxy, proxy)
          const preSubTree = instance.subTree
          instance.subTree = subTree
          patch(preSubTree, subTree, container, instance, anchor)
        }
      },
      {
        scheduler() {
          queueJobs(instance.update)
        },
      }
    )
  }
  return {
    createApp: createAppAPI(render),
  }
}

// 更新instance
function updateComponentPreRender(instance, nextVNode) {
  instance.vnode = nextVNode
  instance.next = null
  instance.props = nextVNode.props
}

// 最长递增子序列
function getSequence(arr) {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
