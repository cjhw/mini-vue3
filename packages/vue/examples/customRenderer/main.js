import { createRenderer } from '../../dist/mini-vue.esm.js'
import { App } from './App.js'

const game = new PIXI.Application({
  width: 1000,
  height: 500,
})

document.body.append(game.view)

const renderer = createRenderer({
  createElement(type) {
    if (type === 'rect') {
      const rect = new PIXI.Graphics()
      rect.beginFill(0xfffffff)
      rect.drawRect(84, 160, 255, 100)
      rect.endFill()
      return rect
    }
  },
  patchProp(el, key, val) {
    el[key] = val
  },
  insert(el, parent) {
    parent.addChild(el)
  },
})

renderer.createApp(App).mount(game.stage)
