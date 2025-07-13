/**
 * @type {Options}
 */
export const defaultOptions = {
  logLevel: 'info',
  validation: {
    keepBaseline: true,
    schema: {},
    strictMode: true
  },
  castType: {
    enabled: true,
    json: true,
    exclude: [] as string[],
  },
  generateDts: {
    devEnable: true,
    buildEnable: false,
    path: 'env.d.ts'
  }
}
