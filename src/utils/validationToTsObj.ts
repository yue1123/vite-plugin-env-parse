export type ArktypeJSONValue = string | number | boolean | null | ArktypeJSONObject | ArktypeJSONValue[]

export interface ArktypeJSONObject {
  domain?: string | { domain?: string }
  pattern?: { rule: string; flags?: string; meta?: string }[]
  index?: { signature: string; value: ArktypeJSONValue }[]
  sequence?: ArktypeJSONValue[]
  proto?: string
  required?: { key: string; value: ArktypeJSONValue }[]
  optional?: { key: string; value: ArktypeJSONValue }[]
  unit?: any
}
const NumberUnit = ['NaN', 'Infinity', '-Infinity']

export function validationToTsObj(json: ArktypeJSONObject) {
  const { required = [], optional = [] } = json || {}

  const signatures = required.concat(optional)
  const res = signatures.map(({ key, value }) => {
    return [key, arktypeToKeyValue(value)]
  })
  return Object.fromEntries(res)
}

function arktypeToKeyValue(value: ArktypeJSONValue): string {
  const fallback = 'string'
  if (typeof value === 'string') {
    return value
  } else if (Array.isArray(value)) {
    // console.log('aa')
    // union type
    const union = new Set<string>(
      value
        .map((v) => {
          if (typeof v === 'string') return v
          else return arktypeToKeyValue(v)
        })
        .filter((v): v is string => v !== undefined)
    )

    return Array.from(union).join(' | ')
    // return
  } else if (typeof value === 'object' && value !== null) {
    const domain = typeof value.domain === 'object' ? value.domain.domain : value.domain

    if (domain === 'string' && value.pattern) {
      return 'string'
    }
    // number <= 10
    // number
    // number.Infinity
    // number.NaN
    else if (domain === 'number' || NumberUnit.includes(value.unit)) {
      return 'number'
    }
    // boolean
    else if (!domain && typeof value.unit === 'boolean') {
      return 'boolean'
    } else if (domain === 'object' && Array.isArray(value.index) && value.index.length) {
      const _value = value.index[0]

      return `Record<${arktypeToKeyValue(_value.signature)}, ${arktypeToKeyValue(_value.value)}>`
    } else if (value.proto === 'Array' && value.sequence) {
      const _value = Array.isArray(value.sequence) ? value.sequence : [value.sequence]

      const sequence = Array.from(new Set(_value.map(arktypeToKeyValue)))
      const isUnionType = sequence.length > 1
      return isUnionType ? `(${sequence.join(' | ')})[]` : `${sequence}[]`
    } else if (value.unit && !NumberUnit.includes(value.unit)) {
      return `"${value.unit}"`
    }
  }
  return fallback
}
