import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';

const mode = import.meta.env.VITE_MODE || 'sim';
console.log(`[SAAS Audit Prototype] 运行模式: ${mode} | 终端: 运营后台`);

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(ElementPlus);

// 进入运营后台首页
router.isReady().then(() => {
  const hash = window.location.hash;
  if (hash === '' || hash === '#/' || hash === '#/index.html' || hash === '#/tenant/') {
    router.replace('/admin/tenant');
  }
});

app.mount('#app');
