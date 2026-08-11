import { defineConfig } from '@playwright/test';

// PRD截图专用配置
// - 不启动webServer（复用已在5174端口运行的dev server）
// - 报告输出到 prd-screenshot-reports/
export default defineConfig({
  testDir: '.',
  timeout: 60000,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5174',
    screenshot: 'off',
    video: 'off',
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
      },
    },
  ],
  // 不配置webServer，复用已在运行的dev server
});
