import { type, Ark } from 'arktype'

export interface TypeParser<$ = {}> {
  /**
   * Create a {@link Type} from your definition.
   *
   * @example const Person = type({ name: "string" })
   */
  <const def, r = type.instantiate<def, $>>(def: type.validate<def, $>): r extends infer _ ? _ : never
}

interface Options<VAL> {
  val: type.validate<VAL, {}>
}
function test<const VAL>(options: Options<VAL>) {}
// type options = {
//   <const def>:
// }

test({
  val: {
    name: 'string.capitalize'
  }
})
export declare const type1: TypeParser<{}>

const a = type1({
  name: 'string.json'
})
// type aaaa = Parameters<typeof type1>[0]

// const aaff: aaaa = {
//   name: 'string.hex'
// }
// const a = type1({
//   type: 'string.alpha'
// })

// const a: bb = {
//   name: 'string.alpha',
// }
// const a:  =
// keywords.string.alpha

// type a = Record<string, typeof keywords>

// const bb: a = {
//   name: 'string.alpha',
// }
