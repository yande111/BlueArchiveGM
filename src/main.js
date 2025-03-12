import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import * as ElIcons from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/styles.css' // 自定义样式
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/documentation-tips.css'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElIcons)) {
  app.component(key, component)
}

app.use(router)
app.use(ElementPlus)
app.mount('#app')
