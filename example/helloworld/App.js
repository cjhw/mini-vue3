import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const App = {
  name: 'App',
  render() {
    window.self = this
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'pujie'],
        onClick() {
          console.log('click')
        },
        onMousedown() {
          console.log('mousedown')
        },
      },
      // 'hi,hjfhj'
      // [h('p', { class: 'red' }, 'h1'), h('p', { class: 'yellow' }, 'mini vue')],
      // 'Hi ' + this.msg
      [h('div', {}, 'hi ' + this.msg), h(Foo, { count: 10 })]
    )
  },
  setup() {
    // compsoition api
    return {
      msg: 'mini-vue-hhh',
    }
  },
}
