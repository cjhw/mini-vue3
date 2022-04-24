import { reactive } from '../reactive'
import { effect, stop } from '../effect'
describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10,
    })

    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)

    //update
    user.age++
    expect(nextAge).toBe(12)
  })
  it('should return runner when call effect', () => {
    // 1.effect(fn) -> function(runner) -> fn -> return
    // 当调用 runner 的时候可以重新执行 effect.run
    // runner 的返回值就是用户给的 fn 的返回值

    let foo = 10
    const runner = effect(() => {
      foo++
      return 'foo'
    })
    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe('foo')
  })
  it('scheduler', () => {
    // 1.通过effect 的第二个参数给定的一个 scheduler 的fn
    // 2. effect 第一次执行的时候 还会执行fn
    // 3.当响应式对象set update 不会执行 fn而是执行 scheduler
    // 4.如果说当执行runner的时候,会再次的执行
    let dummy
    let run: any
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // 应该在第一次触发时调用
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // 现在还不能运行
    expect(dummy).toBe(1)
    // 手动运行
    run()
    // 应该运行
    expect(dummy).toBe(2)
  })
  it('stop', () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    // obj.prop = 3
    // 注意：这个触发了get操作，会收集了依赖
    obj.prop++
    expect(dummy).toBe(2)
    // 停止的依赖依旧可以被手动调用
    runner()
    expect(dummy).toBe(3)
  })
  it('onStop', () => {
    const obj = reactive({
      foo: 1,
    })
    const onStop = jest.fn()
    let dummy
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      {
        onStop,
      }
    )

    stop(runner)
    expect(onStop).toBeCalledTimes(1)
  })
})
