import { createVnode } from './vnode'

export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // 先vnode
        // component => vnode
        // 所有的逻辑都会基于vnode做处理
        const vnode = createVnode(rootComponent)
        render(vnode, rootContainer)
      },
    }
  }
}
