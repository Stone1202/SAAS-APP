import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';

const mode = import.meta.env.VITE_MODE || 'sim';
console.log(`[SAAS Audit Prototype] 运行模式: ${mode} | 终端: 运营后台`);

// 进入运营后台首页 — 在路由初始化前强制设置 Hash
if (window.location.hash === '' || window.location.hash === '#/' || window.location.hash === '#/index.html') {
  window.location.hash = '#/admin/search';
}

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(ElementPlus);

app.mount('#app');
