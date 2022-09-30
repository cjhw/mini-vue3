import { h } from '../../dist/mini-vue.esm.js'

export const App = {
  setup() {
    return {
      x: 10,
      y: 10,
    }
  },
  render() {
    return h('rect', { x: this.x, y: this.y })
  },
}
