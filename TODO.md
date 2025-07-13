## rename 

vite-plugin-env-parse -> vite-plugin-env-expand
或者?
vite-plugin-env-parse -> vite-plugin-envx

## Feature
1. ✅ 类型验证（validation schema）
2. ✅ 自动生成 .d.ts, Type-safe
3. ✅ JSON 字符串解析
4. ✅ 自定义转换器（customParser）
5. ✅ 编译与开发环境下的行为控制
6. ✅ 排除、重写、转型等高级逻辑


## TODO Feature
- ~~[ ] 多环境 env mode 读取/解析~~
- [x] 错误提示信息更具体
<!-- - [ ] 兼容模式 vite-plugin-env-compatible -->
- [ ] import env from (https://github.com/svitejs/vite-plugin-env-import/tree/main/packages/vite-plugin-env-import)
~~- [ ] process.env 动态转写 - https://github.com/vitejs/vite/issues/11685#issuecomment-1482718438~~


当然，这里是一个英文提示的示例，风格专业又简洁，符合国际化最佳实践：

plaintext
复制
编辑
[env-expand] ⚠️ Detected extra environment variables in .env.production: VITE_UNUSED_KEY
Consider declaring all required variables in the base .env file to maintain consistency.
如果想再进一步地提高清晰度或提示上下文，可以稍微扩展：

plaintext
复制
编辑
[env-expand] ⚠️ Detected extra environment variables in .env.production:
- VITE_UNUSED_KEY

For better consistency, declare all required variables in the base .env file.
或者更中立 / 友好的语气：

plaintext
复制
编辑
[env-expand] ℹ️ Note: The following variables in .env.production are not declared in the base .env file:
- VITE_UNUSED_KEY

While this is not necessarily an error, aligning all environment keys across files can help prevent unexpected issues.
