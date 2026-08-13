# 踩坑：EdgeOne Pages 子目录 SPA 深层路由空白

**日期**：2026-07-28  
**分类**：部署 / EdgeOne Pages / SPA  
**严重性**：P0（所有子项目深层路由不可用）  
**受影响项目**：SAAS、AI-SCRM、SugarMate  
**关联文档**：`deploy/DEPLOY-GUIDE.md`

---

## 现象

门户首页（`/`）和各 SPA 根路径（`/jojo/SAAS/v1.0.0/`）正常，但点击各端按钮进入深层路由（如 `/tenant/dashboard`）时页面**空白**。

## 根因

**EdgeOne Pages 的 SPA fallback 只支持根路径 `"/*" → "/index.html"`**。子目录 SPA 的深层路由不在根级 fallback 覆盖范围内，所以子目录中的 `/tenant/dashboard` 被当作不存在的文件返回 404。

## 试过的错误方案

| 方案 | 结果 | 为什么失败 |
|------|------|-----------|
| `edgeone.json` rewrites | ❌ | 静态资源 JS/CSS 也被 rewrite 成 HTML |
| 子目录放 `edgeone.json` | ❌ | EdgeOne Pages 忽略子目录配置 |
| 子目录放 `404.html` | ❌ | EdgeOne Pages 只认根级 404.html |

## 正确方案

**根级 404.html + JS 动态加载 SPA index.html**

核心逻辑（`deploy/404-template.html`）：
```js
// 1. 从 URL 提取 SPA base 路径
var match = path.match(/^\/([^/]+)\/([^/]+)\/(v[^/]+)\//);
// 2. fetch 对应子项目的 index.html
fetch(base + 'index.html')
// 3. document.write 替换当前文档，URL 不变
```

这样 URL 保持深层路由不变，Vue/React Router 按路径正常渲染。

## 教训

1. **静态托管平台的 SPA fallback 机制各不相同**，不要假设子目录也支持
2. **rewrite 规则会伤及静态资源**，先验证资源路径不受影响再上
3. **部署前必须用浏览器实测深层路由**，不能只验证根路径
4. **新成员添加项目时不需要改 404 模板**，只要遵循 `/{member}/{project}/{version}/` 路径规范即可

## 预防措施

- `deploy/DEPLOY-GUIDE.md` 涵盖完整操作步骤和排查指南
- `scripts/build-all.sh` 自动生成根级 `404.html`
- `build-all.sh` 中兜底删除子目录的 `edgeone.json`，避免残留配置干扰
