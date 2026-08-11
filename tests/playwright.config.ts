import { defineConfig } from '@playwright/test';

// 配置说明：
// - testDir='.' 表示当前 tests/ 目录
// - 报告输出到上级 test-reports/ 目录
// - 报告路径使用相对于 config 文件所在目录的相对路径
export default defineConfig({
  testDir: '.',
  timeout: 60000,
  retries: 1,
  workers: 1,
  reporter: [
    ['html', { outputFolder: '../test-reports/html', open: 'never' }],
    ['json', { outputFile: '../test-reports/json/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:5174',
    screenshot: 'on',
    video: 'off',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        channel: 'chrome',  // 使用系统Chrome，无需安装Playwright浏览器
        viewport: { width: 390, height: 844 }, // iPhone 14 size
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174/app.html',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
