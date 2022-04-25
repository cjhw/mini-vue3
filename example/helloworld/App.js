import { h } from '../../lib/mini-vue.esm.js'

window.self = null
export const App = {
  render() {
    window.self = this
    return h(
      'div',
      { id: 'root', class: ['red', 'pujie'] },
      // 'hi,hjfhj'
      // [h('p', { class: 'red' }, 'h1'), h('p', { class: 'yellow' }, 'mini vue')],
      'Hi ' + this.msg
    )
  },
  setup() {
    // compsoition api
    return {
      msg: 'mini-vue-hhh',
    }
  },
}
