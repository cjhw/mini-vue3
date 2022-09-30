import { h, createTextVNode } from '../../dist/mini-vue.esm.js'
import { Foo } from './Foo.js'

// Fragment 以及 Text
export const App = {
  name: 'App',
  setup() {
    return {}
  },
  render() {
    const app = h('div', {}, 'App')
    // object key
    const foo = h(
      Foo,
      {},
      {
        header: ({ age }) => [
          h('p', {}, 'header' + age),
          createTextVNode('你好呀 李银河'),
        ],
        footer: () => h('p', {}, 'footer'),
      }
    )
    // 数组 vnode
    // const foo = h(Foo, {}, h("p", {}, "123"));
    return h('div', {}, [app, foo])
  },
}
