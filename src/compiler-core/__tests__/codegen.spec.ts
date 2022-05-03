import { baseParse } from '../src/parse'
import { generate } from '../src/codegen'
import { transform } from '../src/transform'

describe('codegen', () => {
  it.skip('string', () => {
    const ast = baseParse('hi')
    transform(ast)
    const { code } = generate(ast)
    // 快照
    // 1.抓bug
    // 2.有意 ()
    expect(code).toMatchSnapshot()
  })

  it('interpolation', () => {
    const ast = baseParse('{{message}}')
    transform(ast)
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })
})
