import fs from 'node:fs'

export function updateEnvInterface(envDTsPath: string, envInterface: string, fileSys: any = fs) {
  const source = fileSys.existsSync(envDTsPath) ? fileSys.readFileSync(envDTsPath, 'utf-8') : ''

  const importMetaEnvInterface = `interface ImportMetaEnv extends AutoGenerateImportMetaEnv {}`

  const importMetaExtendsReg = /interface ImportMetaEnv\s+extends\s+AutoGenerateImportMetaEnv/g
  const envInterfaceReg = /\s*interface\s+AutoGenerateImportMetaEnv\s*\{[\s\S]*?\}/g
  const importMetaEnvReg = /interface\s+ImportMetaEnv\s*[\S\s]*?\{/g
  let updated = source
  
  if (envInterfaceReg.test(source)) {
    updated = updated.replace(envInterfaceReg, envInterface)
  } else {
    updated = envInterface + '\n\n' + updated
  }
  const hasExtends = importMetaExtendsReg.test(updated)
  const hasImportMetaEnv = importMetaEnvReg.test(updated)
  
  if (hasImportMetaEnv) {
    if (!hasExtends) {
      updated = updated.replace(
        importMetaEnvReg,
        'interface ImportMetaEnv extends AutoGenerateImportMetaEnv {'
      )
    }
  } else {
    updated = updated + '\n' + importMetaEnvInterface
  }

  // 写回文件
  fileSys.writeFileSync(envDTsPath, updated, 'utf-8')
}
