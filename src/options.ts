export type CustomTransformer = (key: string, value: string) => any

export interface Options {
  /**
   * exclude parse env keys
   */
  exclude?: string[]
  /**
   * parse json string to json object
   * @default true
   */
  parseJson?: boolean
  /**
   * custom parser
   */
  customParser?: CustomTransformer
  /**
   * generate env .d.ts file path
   * @default 'env.d.ts'
   */
  dtsPath?: string
  /**
   * Enable the .d.ts file generate in dev mode
   *
   * @default true
   */
  dev?: boolean
  /**
   * Enable the .d.ts file generate in build mode
   * @default false
   */
  build?: boolean
}
