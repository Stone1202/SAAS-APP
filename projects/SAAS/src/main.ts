import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';

// 根据环境变量决定使用 Sim 还是 Real 适配器
// VITE_MODE=sim (默认) | VITE_MODE=real
const mode = import.meta.env.VITE_MODE || 'sim';
console.log(`[SAAS Audit Prototype] 运行模式: ${mode}`);

const app = createApp(App);

// Pinia 状态管理
const pinia = createPinia();
app.use(pinia);

// Vue Router
app.use(router);

// Element Plus UI 组件库
app.use(ElementPlus);

app.mount('#app');
