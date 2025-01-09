import fs from 'node:fs'

export function writeEnvInterface(path: string, envInterface: string) {
  console.log('----------', envInterface, '-00000')
  const autoGenerateImportMetaEnvRegexp = /interface\s+?AutoGenerateImportMetaEnv\s*\{[\s\S]*?\}/g
  const importMetaEnvRegexp = /interface\s+?ImportMetaEnv\s*\{[\s\S]*?\}/g
  const importMetaEnvExtendsRegexp = /interface\s+?ImportMetaEnv\s* extends\s+AutoGenerateImportMetaEnv/
  const clientTypeRegexp = /\/\/\/ \<reference types=\"vite\/client\" \/\>/g
  const clientType = '/// <reference types="vite/client" />'

  if (fs.existsSync(path)) {
    const fileContent = fs.readFileSync(path, { encoding: 'utf-8' })
    if (autoGenerateImportMetaEnvRegexp.test(fileContent)) {
      // replace
      envInterface = fileContent.replace(autoGenerateImportMetaEnvRegexp, envInterface)
    } else {
      // append
      envInterface = `${fileContent}${envInterface}`
    }
    if (!clientTypeRegexp.test(fileContent)) {
      envInterface = `${clientType}${fileContent}${envInterface}`
    }
  } else {
    envInterface = `${clientType}${envInterface}`
  }

  if (!importMetaEnvExtendsRegexp.test(envInterface)) {
    if (importMetaEnvRegexp.test(envInterface)) {
      envInterface.replace(importMetaEnvRegexp, '=============')
    } else {
      envInterface = `${envInterface}\n\ninterface ImportMetaEnv extends AutoGenerateImportMetaEnv {}`
    }
  }

  console.log(clientType, envInterface)
  fs.writeFileSync(path, envInterface)
}
