import { group } from 'node:console'

const htmlLangRE = /\.(?:html|htm)$/
const CSS_LANGS_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/
const nonJsRe = /\.json(?:$|\?)/

export const isHTMLRequest = (requestId: string) => htmlLangRE.test(requestId)
export const isCSSRequest = (requestId: string) => CSS_LANGS_RE.test(requestId)
export const isNonJsRequest = (requestId: string) => nonJsRe.test(requestId)

export const logger = {
  success: (msg: string) => {
    console.log('🌱 [env-parse]', msg)
  },
  error: (msg: string) => {
    console.error('✘  [env-parse]', msg)
  },
  group: (msg: string[], indent: number = 3) => {
    const _indent = ' '.repeat(indent)
    return msg
      .map((item, i) => {
        const isLast = i == msg.length - 1
        return `${_indent}${isLast ? '└' : '├'} ${item}`
      })
      .join('\n')
  }
}
