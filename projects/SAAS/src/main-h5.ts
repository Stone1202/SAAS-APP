import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';

const mode = import.meta.env.VITE_MODE || 'sim';
console.log(`[SAAS Audit Prototype] 运行模式: ${mode} | 终端: H5观众端`);

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(ElementPlus);

// 进入观众端 H5 首页
router.isReady().then(() => {
  const hash = window.location.hash;
  if (hash === '' || hash === '#/' || hash === '#/index.html') {
    router.replace('/h5/live/demo');
  }
});

app.mount('#app');
