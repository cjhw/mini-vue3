import { render } from './renderer'
import { createVnode } from './vnode'

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 所有的逻辑都会基于vnode做处理
      const vnode = createVnode(rootComponent)
      render(vnode, rootContainer)
    },
  }
}
