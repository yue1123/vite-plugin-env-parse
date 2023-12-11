import { Recordable } from './types'

export function parseEnvComment(content: string) {
  let res: Recordable<string, string> = {}
  // Convert buffer to string
  // Convert line breaks to same format
  let lines = content.toString().replace(/\r\n?/gm, '\n').split('\n')

  const commentReg = /^\s*#\s*(.*)\s*/
  const keyReg = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)/
  let commentString: string[] = []
  lines.forEach((line) => {
    if (commentReg.test(line)) {
      // Comment line
      const comment = line.replace(commentReg, '$1')
      commentString.push(comment)
    } else if (keyReg.test(line)) {
      // Key-value pair line
      const matched = line.match(keyReg)
      const key = matched ? matched[1] : ''

      key && (res[key] = commentString.join('\n   * '))
      commentString.length = 0
    } else if (commentString.length) {
      // Matches a comment but the next line is not a comment or a key-value pair
      commentString.length = 0
    }
  })
  return res
}
