// import './assets/main.css'
// 1. 导入 Element Plus 核心、样式、中文语言包
import ElementPlus from "element-plus";
import "element-plus/dist/index.css"; // Element Plus 基础样式
import zhCn from "element-plus/es/locale/lang/zh-cn"; // 简体中文语言包
// 2. 导入 Element Plus 所有图标
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

// 3. 导入router组件
import router from "./router/router.js"

import { createApp } from 'vue'
import App from './App.vue'

// 4.创建vue实例
const app = createApp(App);

// 5. 全局注册所有 Element Plus 图标（确保组件中可直接使用，无需单独导入）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 6.注册router
app.use(router)

app.use(ElementPlus, {
    locale:zhCn
}).mount('#app')
