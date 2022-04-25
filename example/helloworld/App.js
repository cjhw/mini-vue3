import { h } from '../../lib/mini-vue.esm.js'

export const App = {
  render() {
    return h(
      'div',
      { id: 'root', class: ['red', 'pujie'] },
      // 'hi,hjfhj'
      [h('p', { class: 'red' }, 'h1'), h('p', { class: 'yellow' }, 'mini vue')]
    )
  },
  setup() {
    // compsoition api
    return {
      msg: 'mini-vue',
    }
  },
}
