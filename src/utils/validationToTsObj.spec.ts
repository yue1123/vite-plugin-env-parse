import { describe, it, expect } from 'vitest'
import { ArktypeJSONObject, validationToTsObj } from './validationToTsObj'
import { Options } from '../options'
import { type } from 'arktype'

describe('validation object to ts', () => {
  function typeToJson<const V extends Record<string, any>>(validation: Pick<Options<V>, 'validation'>['validation']) {
    return type(validation as any).toJSON() as ArktypeJSONObject
  }
  it('should be a string', () => {
    expect(validationToTsObj(typeToJson({ string: 'string' }))).toEqual({
      string: 'string'
    })
  })

  it('should be a string sub type', () => {
    expect(validationToTsObj(typeToJson({ stringSubType: 'string.alpha' }))).toEqual({
      stringSubType: 'string'
    })
    expect(validationToTsObj(typeToJson({ stringSubType: 'string.json.parse' }))).toEqual({
      stringSubType: 'string'
    })
    expect(validationToTsObj(typeToJson({ stringSubType: 'string > 10' }))).toEqual({
      stringSubType: 'string'
    })
    expect(validationToTsObj(typeToJson({ stringSubType: 'string <= 10' }))).toEqual({
      stringSubType: 'string'
    })
  })

  it('should be a number', () => {
    expect(validationToTsObj(typeToJson({ number: 'number' }))).toEqual({
      number: 'number'
    })
  })

  it('should be a number sub type', () => {
    expect(validationToTsObj(typeToJson({ numberSubType: 'number > 10' }))).toEqual({
      numberSubType: 'number'
    })
    expect(validationToTsObj(typeToJson({ numberSubType: 'number <= 10' }))).toEqual({
      numberSubType: 'number'
    })
    expect(validationToTsObj(typeToJson({ numberSubType: 'number.Infinity' }))).toEqual({
      numberSubType: 'number'
    })
    expect(validationToTsObj(typeToJson({ numberSubType: 'number.NaN' }))).toEqual({
      numberSubType: 'number'
    })
    expect(validationToTsObj(typeToJson({ numberSubType: 'number.NegativeInfinity' }))).toEqual({
      numberSubType: 'number'
    })
    expect(validationToTsObj(typeToJson({ numberSubType: 'number.epoch' }))).toEqual({
      numberSubType: 'number'
    })
    expect(validationToTsObj(typeToJson({ numberSubType: 'number.integer' }))).toEqual({
      numberSubType: 'number'
    })
    expect(validationToTsObj(typeToJson({ numberSubType: 'number.safe' }))).toEqual({
      numberSubType: 'number'
    })
  })

  // union
  it('should be a union type', () => {
    // string
    expect(validationToTsObj(typeToJson({ union: '"fasdf" | "faffsdf"' }))).toEqual({
      union: 'faffsdf | fasdf'
    })
    // subtype
    expect(validationToTsObj(typeToJson({ union: 'string.alpha | string.base64' }))).toEqual({
      union: 'string'
    })

    expect(validationToTsObj(typeToJson({ union: 'string | number' }))).toEqual({
      union: 'number | string'
    })
    expect(validationToTsObj(typeToJson({ union: 'string | number | boolean' }))).toEqual({
      union: 'number | string | boolean'
    })
    expect(validationToTsObj(typeToJson({ union: 'string | number | Record<string | symbol, string>' }))).toEqual({
      union: 'number | string | Record<string | symbol, string>'
    })

    // repeat value
    expect(validationToTsObj(typeToJson({ union: 'string | string | number | boolean | string | boolean' }))).toEqual({
      union: 'number | string | boolean'
    })
  })

  // array type
  it('should be an array type', () => {
    expect(validationToTsObj(typeToJson({ array: 'string[]' }))).toEqual({
      array: 'string[]'
    })
    expect(validationToTsObj(typeToJson({ array: 'number[]' }))).toEqual({
      array: 'number[]'
    })
    expect(validationToTsObj(typeToJson({ array: 'boolean[]' }))).toEqual({
      array: 'boolean[]'
    })
    expect(validationToTsObj(typeToJson({ array: '(string | number)[]' }))).toEqual({
      array: '(number | string)[]'
    })
    expect(validationToTsObj(typeToJson({ array: 'string | number[]' }))).toEqual({
      array: 'string | number[]'
    })
  })

  it('should be an object type', () => {
    expect(validationToTsObj(typeToJson({ object: 'object' }))).toEqual({
      object: 'object'
    })
    expect(validationToTsObj(typeToJson({ object: 'Record<string, string>' }))).toEqual({
      object: 'Record<string, string>'
    })
    expect(validationToTsObj(typeToJson({ object: 'Record<string, number>' }))).toEqual({
      object: 'Record<string, number>'
    })
    expect(validationToTsObj(typeToJson({ object: 'Record<string, boolean>' }))).toEqual({
      object: 'Record<string, boolean>'
    })
  })

  // built-in types
  it('should be a built-in type', () => {
    expect(validationToTsObj(typeToJson({ builtIn: 'Date' }))).toEqual({
      builtIn: 'Date'
    })
    expect(validationToTsObj(typeToJson({ builtIn: 'RegExp' }))).toEqual({
      builtIn: 'RegExp'
    })
    expect(validationToTsObj(typeToJson({ builtIn: 'Error' }))).toEqual({
      builtIn: 'Error'
    })
  })
})
