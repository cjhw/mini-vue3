import { watch } from '../src/watch'
import { reactive } from '../src/reactive'
import { vi } from 'vitest'

describe('watch', () => {
  it('happy path', () => {
    // 跟ref的使用类似
    // 具有缓存功能
    const state = reactive({ name: 'caicai', address: { num: 1 } })

    const cb = vi.fn(() => {
      console.log('kkkk')
    })

    watch(state, cb)

    state.address.num = 123

    expect(cb).toBeCalledTimes(1)
  })
  it('getter function', () => {
    const state = reactive({ name: 'caicai', address: { num: 1 } })

    const cb = vi.fn(() => {
      console.log('kkkk')
    })

    watch(() => state.address.num, cb)

    state.address.num = 123

    expect(cb).toBeCalledTimes(1)
  })
})
