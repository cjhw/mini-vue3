import { computed } from '../computed'
import { reactive } from '../reactive'

describe('computed', () => {
  it('happy path', () => {
    // 跟ref的使用类似
    // 具有缓存功能
    const user = reactive({ age: 10 })
    const age = computed(() => {
      return user.age
    })

    expect(age.value).toBe(10)
  })
  it('should computed lazyily', () => {
    const value = reactive({
      foo: 1,
    })
    const getter = jest.fn(() => {
      return value.foo
    })

    const cValue = computed(getter)
    expect(getter).not.toHaveBeenCalled()

    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    // 再次执行cValue.value时不执行getter
    cValue.value
    expect(getter).toHaveBeenCalledTimes(1)

    // 响应式对象的值变了，需要重新执行getter
    value.foo = 2
    expect(getter).toHaveBeenCalledTimes(1)

    expect(cValue.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)

    cValue.value
    expect(getter).toHaveBeenCalledTimes(2)
  })
})
