import fs from 'node:fs'

export function writeEnvInterface(path: string, envInterface: string) {
  const importMetaEnvRegexp = /interface ImportMetaEnv\s*\{[\s\S]*?\}/g
  if (fs.existsSync(path)) {
    const fileContent = fs.readFileSync(path, { encoding: 'utf-8' })
    if (importMetaEnvRegexp.test(fileContent)) {
      // replace
      envInterface = fileContent.replace(importMetaEnvRegexp, envInterface)
    } else {
      // append
      envInterface = `${fileContent}
${envInterface}`
    }
  } else {
    envInterface = `/// <reference types="vite/client" />
${envInterface}`
  }
  fs.writeFileSync(path, envInterface)
}
