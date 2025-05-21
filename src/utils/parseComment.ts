import { Recordable } from '../types'

export function parseComment(content: string) {
  let res: Recordable<string, string> = {}
  // Convert buffer to string
  // Convert line breaks to same format
  let lines = content.toString().replace(/\r\n?/gm, '\n').split('\n')
  const commentReg = /^\s*#\s*(.*)\s*/
  const keyReg = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)/
  const startMultiSharpReg = /^\#+/
  let commentStrings: string[] = []
  lines.forEach((line) => {
    if (commentReg.test(line)) {
      // Comment line
      const comment = line.replace(commentReg, '$1').replace(startMultiSharpReg, '').trim()
      commentStrings.push(comment)
    } else if (keyReg.test(line)) {
      // Key-value pair line
      const matched = line.match(keyReg)
      const key = matched ? matched[1] : ''

      if (key && commentStrings.length) {
        res[key] = commentStrings.join('\n   * ')
      }
      commentStrings.length = 0
    } else if (commentStrings.length) {
      // Matches a comment but the next line is not a comment or a key-value pair
      commentStrings.length = 0
    }
  })
  return res
}
