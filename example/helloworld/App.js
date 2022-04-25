import { h } from '../../lib/mini-vue.esm.js'

export const App = {
  render() {
    return h('div', 'hi,mini vue')
  },
  setup() {
    // compsoition api
    return {
      msg: 'mini-vue',
    }
  },
}
