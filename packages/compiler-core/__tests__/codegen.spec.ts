import { baseParse } from '../src/parse'
import { generate } from '../src/codegen'
import { transform } from '../src/transform'
import { transformExpression } from '../src/transforms/transformExpression'
import { transformElement } from '../src/transforms/transformElement'
import { transformText } from '../src/transforms/transformText'

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

  it.skip('interpolation', () => {
    const ast = baseParse('{{message}}')
    transform(ast, {
      nodeTransform: [transformExpression],
    })
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  it('element', () => {
    const ast: any = baseParse('<div>hi,{{message}}</div>')
    console.log(ast)

    transform(ast, {
      nodeTransforms: [transformExpression, transformElement, transformText],
    })

    const { code } = generate(ast)

    expect(code).toMatchSnapshot()
  })
})
