import { describe, it, expect } from 'vitest'
import { parseComment } from './parseComment'

describe('parseComment', () => {
  it('should parse a comment with a single line', () => {
    const comment = `# This is a comment
VITE_TEST_COMMENT="My Awesome App"`
    const result = parseComment(comment)
    expect(result).toEqual({
      VITE_TEST_COMMENT: `This is a comment`
    })
  })

  it('should parse a comment with multiple lines', () => {
    const comment = `# This is a comment line 1
# This is a comment line 2
VITE_TEST_COMMENT="My Awesome App"`
    const result = parseComment(comment)
    expect(result).toEqual({
      VITE_TEST_COMMENT: `This is a comment line 1\n   * This is a comment line 2`
    })
  })

  it('should parse no comment', () => {
    const comment = `VITE_APP_NO_COMMENT_ENV_KEY="This is a no comment env key"`
    const result = parseComment(comment)
    expect(result).toEqual({})
  })

  it('should parse a comment with special characters', () => {
    const comment = `# This is a comment with special characters: !@#$%^&*()
VITE_TEST_COMMENT="My Awesome App"`
    const result = parseComment(comment)
    expect(result).toEqual({
      VITE_TEST_COMMENT: `This is a comment with special characters: !@#$%^&*()`
    })
  })

  it('should parse a comment with multiple # characters', () => {
    const comment = `#### This is a comment with multiple # characters
    VITE_TEST_COMMENT="My Awesome App"`
    const result = parseComment(comment)
    expect(result).toEqual({
      VITE_TEST_COMMENT: `This is a comment with multiple # characters`
    })
  })

  it('should parse a comment not with key-value', () => {
    const comment = `# This is a comment with spaces`

    const result = parseComment(comment)
    expect(result).toEqual({})
  })

  it('should parse a comment with empty string', () => {
    const comment = ` `
    const result = parseComment(comment)
    expect(result).toEqual({})
  })

  it('should parse a comment with wrong key-value', () => {
    const comment = `# This is a comment with wrong key-value
    VITE_TEST_COMMENT=`
    const result = parseComment(comment)
    expect(result).toEqual({ VITE_TEST_COMMENT : `This is a comment with wrong key-value` })
  })
})
