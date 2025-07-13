import { describe, it, expect } from 'vitest'
import { parseEnvFile } from '../src/utils/parseEnvFile'

describe('parseEnvFile', () => {
  it('should parse a comment with a single line', () => {
    const comment = `# This is a comment
VITE_TEST_COMMENT="My Awesome App"`
    const result = parseEnvFile(comment)
    expect(result).toEqual({
      VITE_TEST_COMMENT: {
        column: 1,
        comment: 'This is a comment',
        key: 'VITE_TEST_COMMENT',
        line: 2
      }
    })
  })

  it('should parse a comment with multiple lines', () => {
    const comment = `# This is a comment line 1
# This is a comment line 2
VITE_TEST_COMMENT="My Awesome App"`
    const result = parseEnvFile(comment)
    expect(result).toEqual({
      VITE_TEST_COMMENT: {
        key: 'VITE_TEST_COMMENT',
        comment: `This is a comment line 1\n   * This is a comment line 2`,
        line: 3,
        column: 1
      }
    })
  })

  it('should parse no comment', () => {
    const comment = `VITE_APP_NO_COMMENT_ENV_KEY="This is a no comment env key"`
    const result = parseEnvFile(comment)
    expect(result).toEqual({
      VITE_APP_NO_COMMENT_ENV_KEY: {
        column: 1,
        comment: '',
        key: 'VITE_APP_NO_COMMENT_ENV_KEY',
        line: 1
      }
    })
  })

  it('should parse a comment with special characters', () => {
    const comment = `# This is a comment with special characters: !@#$%^&*()
VITE_TEST_COMMENT="My Awesome App"`
    const result = parseEnvFile(comment)
    expect(result).toEqual({
      VITE_TEST_COMMENT: {
        key: 'VITE_TEST_COMMENT',
        comment: `This is a comment with special characters: !@#$%^&*()`,
        line: 2,
        column: 1
      }
    })
  })

  it('should parse a comment with multiple # characters', () => {
    const comment = `#### This is a comment with multiple # characters
    VITE_TEST_COMMENT="My Awesome App"`
    const result = parseEnvFile(comment)
    expect(result).toEqual({
      VITE_TEST_COMMENT: {
        column: 5,
        comment: 'This is a comment with multiple # characters',
        key: 'VITE_TEST_COMMENT',
        line: 2
      }
    })
  })

  it('should parse a comment not with key-value', () => {
    const comment = `# This is a comment with spaces`

    const result = parseEnvFile(comment)
    expect(result).toEqual({})
  })

  it('should parse a comment with empty string', () => {
    const comment = ` `
    const result = parseEnvFile(comment)
    expect(result).toEqual({})
  })

  it('should parse a comment with wrong key-value', () => {
    const comment = `# This is a comment with wrong key-value
    VITE_TEST_COMMENT=`
    const result = parseEnvFile(comment)
    expect(result).toEqual({
      VITE_TEST_COMMENT: {
        key: 'VITE_TEST_COMMENT',
        comment: 'This is a comment with wrong key-value',
        line: 2,
        column: 5
      }
    })
  })
})
