import { h } from '../../dist/mini-vue.esm.js'

export const Foo = {
  setup(props) {
    console.log(props)
    // props不可被修改
    props.count++
  },
  render() {
    return h('div', {}, 'foo: ' + this.count)
  },
}
