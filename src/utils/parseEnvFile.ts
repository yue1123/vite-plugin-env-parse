export interface EnvCommentMeta {
  key: string
  comment: string
  line: number
  column: number
  __file: string
}

export type ParsedEnvFileResult = Record<string, EnvCommentMeta>
export function parseEnvFile(content: string, file: string = '.env'): ParsedEnvFileResult {
  const result: ParsedEnvFileResult = {}

  const lines = content.toString().replace(/\r\n?/gm, '\n').split('\n')
  const commentReg = /^\s*#\s*(.*)\s*/
  const keyReg = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)/
  const startMultiSharpReg = /^\#+/
  let commentStrings: string[] = []

  lines.forEach((line, index) => {
    const lineNumber = index + 1

    if (commentReg.test(line)) {
      // 注释行
      const comment = line.replace(commentReg, '$1').replace(startMultiSharpReg, '').trim()
      commentStrings.push(comment)
    } else if (keyReg.test(line)) {
      // Key-value 行
      const matched = line.match(keyReg)
     
      const key = matched ? matched[1] : ''

      if (key) {
        const columnNumber = line.indexOf(key) + 1 // 列号从 1 开始
        result[key] = {
          key,
          comment: commentStrings.join('\n   * '),
          line: lineNumber,
          column: columnNumber,
          __file: file
        }
      }
      commentStrings.length = 0
    } else if (commentStrings.length) {
      // 匹配注释但下一行既不是注释也不是键值
      commentStrings.length = 0
    }
  })

  return result
}
