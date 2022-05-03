import { NodeTypes } from './ast'
import { helperMapName, TO_DISPLAY_STRING } from './runtimeHelper'

export function generate(ast) {
  const context = createCodegenContext()
  const { push } = context
  getFunctionPreamble(ast, context)

  const functionName = 'render'
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')

  push(`function ${functionName}(${signature}){`)
  push('return ')
  getNode(ast.codegenNode, context)
  push('}')

  return {
    code: context.code,
  }
}

function getFunctionPreamble(ast, context) {
  const { push } = context
  const VueBinging = 'vue'
  const aliasHelper = (s) => `${helperMapName[s]} as _${helperMapName[s]}`
  if (ast.helpers.length > 0) {
    push(`import { ${ast.helpers.map(aliasHelper)} } from '${VueBinging}'`)
  }
  push('\n')
  push('return ')
}

function createCodegenContext(): any {
  const context = {
    code: '',
    push(source) {
      context.code += source
    },
    helper(key) {
      return `_${helperMapName[key]}`
    },
  }
  return context
}

function getNode(node: any, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      // text类型
      genText(context, node)
      break
    case NodeTypes.INTERPOLATION:
      // 插值类型
      getInterpolation(node, context)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      getExpression(node, context)
      break
    default:
      break
  }
}

function getExpression(node, context) {
  const { push } = context
  push(`_ctx.${node.content}`)
}

function getInterpolation(node, context) {
  console.log(node)

  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  getNode(node.content, context)
  push(`)`)
}

function genText(context, node) {
  const { push } = context
  push(`'${node.content}'`)
}
