import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
createApp(App).mount('#app')

console.log('js 文件中输出')
console.log(import.meta.env)
console.log(import.meta.env.VITE_APP_DEBUG)
console.log(import.meta.env.VITE_APP_JSON_DATA)

if (import.meta.env.VITE_APP_DEBUG) {
  console.log('debug mode ')
}

console.log(process.env)
console.log(process.env.VITE_APP_API_KEY)
