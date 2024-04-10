const htmlLangRE = /\.(?:html|htm)$/
const CSS_LANGS_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/
const nonJsRe = /\.json(?:$|\?)/

export const isHTMLRequest = (requestId: string) => htmlLangRE.test(requestId)
export const isCSSRequest = (requestId: string) => CSS_LANGS_RE.test(requestId)
export const isNonJsRequest = (requestId: string) => nonJsRe.test(requestId)

export function errorLog(content: string) {
  console.log('\n')
  console.log('\x1b[31m%s%s\x1b[0m', '✘ [env-parse] - ', content)
  console.log()
}
