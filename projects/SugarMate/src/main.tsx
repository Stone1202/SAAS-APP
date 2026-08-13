/**
 * SugarMate 应用入口
 * BrowserRouter、ConfigProvider 由 App.tsx 统一提供
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { startSyncEngine } from './stores/syncEngine';
import { useAppAuthStore } from './stores/appAuthStore';
import './index.css';

// 启动跨 Store 数据同步引擎（入驻→商家→APP身份 + 商品跨标签页）
startSyncEngine();

// 初始化 APP 端认证（恢复 localStorage 中的会话）
useAppAuthStore.getState().init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
