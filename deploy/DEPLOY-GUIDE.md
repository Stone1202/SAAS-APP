# 多项目 SPA 部署指南

> **适用平台**：EdgeOne Pages / 腾讯云静态托管  
> **最后更新**：2026-07-28

---

## 一页总结（TL;DR）

| 事项 | 答案 |
|------|------|
| **深层路由空白** | EdgeOne Pages 只支持根级 SPA fallback，子目录深层路由需根级 404.html + JS 动态加载 |
| **新增项目怎么做** | 只需在 `build-all.sh` 的 `PROJECTS` 数组里加一行 + Vite base 用 `VITE_BASE_PATH` 环境变量 |
| **需要改 404 模板吗** | 不需要，正则自动匹配 |
| **能用 edgeone.json rewrites 吗** | ❌ 绝不能，会破坏 JS/CSS 静态资源加载 |
| **排查文档** | 见本文 §6 故障排查 |

---

## 一、问题根因

---

## 一、问题根因

**EdgeOne Pages 的 SPA fallback 只支持根路径**。

官方只认这一种 fallback 模式：
```
/* → /index.html
```

但我们的项目是**多成员、多项目、子目录部署**，路径结构是：
```
/{member}/{project}/{version}/
```

子目录里的 SPA 深层路由（如 `/tenant/dashboard`）不在根级 `/*` 规则的覆盖范围内，导致：
- 用户访问 `/jojo/SAAS/v1.0.0/tenant/dashboard` → 404 Not Found
- 用户访问 `/jojo/SAAS/v1.0.0/` → 正常（因为 `index.html` 文件物理存在）

---

## 二、失败方案（不要再用）

| 试过的方案 | 为什么失败 |
|-----------|-----------|
| `edgeone.json` rewrites 配置子目录 fallback | 静态资源（JS/CSS）也会被 rewrite 成 HTML，页面空白 |
| 在每个子项目目录放 `edgeone.json` | EdgeOne Pages 只读根目录配置，子目录配置被忽略 |
| 在每个子项目目录放 `404.html` | EdgeOne Pages 只识别根级 404.html |
| 动态加内容到根 index.html 的 rewrite | 与静态资源冲突，无法区分页面路由和资源请求 |

---

## 三、当前方案（正确方案）

### 架构

```
deploy/artifacts/
├── index.html              ← 门户首页
├── 404.html                ← 根级 404 回退页（核心）
├── {member}/
│   └── {project}/
│       └── v1.0.0/
│           ├── index.html  ← SPA 入口（Vite 构建产物）
│           ├── assets/     ← 静态资源（JS/CSS/图片）
│           └── ...         ← 404.html **不需要**放在这里
```

### 工作原理

1. 用户访问 `/jojo/SAAS/v1.0.0/tenant/dashboard`（深层路由）
2. EdgeOne Pages 找不到对应文件 → 回退到根级 `404.html`
3. `404.html` 中的 JS 从 URL 中提取 SPA base 路径：`/jojo/SAAS/v1.0.0/`
4. JS 通过 `fetch()` 获取 `/jojo/SAAS/v1.0.0/index.html` 内容
5. 用 `document.write()` 替换当前文档内容
6. 浏览器 URL **保持不变** → Vue/React Router 按 `/tenant/dashboard` 渲染

### 关键代码（`deploy/404-template.html`）

```js
var path = window.location.pathname;
// 匹配: /{member}/{project}/{version}/...
var match = path.match(/^\/([^/]+)\/([^/]+)\/(v[^/]+)\//);
if (match) {
  var base = '/' + match[1] + '/' + match[2] + '/' + match[3] + '/';
  fetch(base + 'index.html')
    .then(res => res.text())
    .then(html => { document.open(); document.write(html); document.close(); });
}
```

---

## 四、新增项目操作步骤

当你需要新增一个 SPA 原型项目时，按以下步骤操作：

### 4.1 项目目录结构

```
projects/{project-name}/
├── package.json
├── vite.config.ts         ← base 必须为 `/{member}/{project}/v1.0.0/`
├── src/
│   ├── main.ts            ← 入口
│   └── router/            ← 路由（使用 Vue Router / React Router history 模式）
└── ...
```

### 4.2 Vite 配置要求

```ts
// vite.config.ts
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  // ...
});
```

**关键**：`base` 路径必须与部署路径一致，否则 JS/CSS 资源 404。

### 4.3 注册到构建脚本

编辑 `scripts/build-all.sh`，在 `PROJECTS` 数组中新增一行：

```bash
PROJECTS=(
  # --- Jojo (admin) ---
  "AI-SCRM|AI-SCRM|jojo"
  "SAAS|SAAS|jojo"
  "SugarMate|SugarMate|jojo"
  # --- 其他成员 ---
  "SAAS|SAAS|Eltonliz"          # ← 新增成员只需加一行
)
```

| 字段 | 含义 | 示例 |
|------|------|------|
| 项目目录名 | `projects/` 下的目录名 | `NewProject` |
| 输出名 | 部署后的 URL 路径名 | `new-project` |
| 成员名 | 成员标识（用于路径分组） | `zhangsan` |

> **注意**：V2.0.3+ 新增成员/项目只需加一行即可。`build-all.sh` 自动生成 `manifest.json`，门户 V2.0.0+ 动态加载该文件，无需手动更新 HTML。成员显示名等元数据需在 `deploy/access-portal/index.html` 的 `MEMBER_META` / `PROJECT_META` 中注册。

### 4.4 构建与部署

**SPA fallback（404.html）、PRD HTML 文档、manifest.json 由构建流程自动处理，无需手动操作：**

| 自动产物 | 触发方式 | 实现 |
|----------|----------|------|
| 404.html（SPA fallback） | Git push → `npm run build:all` | `build-all.sh` 末尾复制 |
| 404.html（SPA fallback） | `/close` → stage-9 | `deploy-manager.yml` Step 5.5 |
| PRD HTML 文档 | Git push → `npm run build:all` | `build-all.sh` Step 3.5 |
| PRD HTML 文档 | `/close` → stage-9 | `deploy-manager.yml` Step 3.5 |
| manifest.json（门户数据源） | Git push → `npm run build:all` | `build-all.sh` 扫描 artifacts/ 自动生成 |
| manifest.json（门户数据源） | `/close` → stage-9 | `deploy-manager.yml` Step 4 |

**门户 V2.0.0 工作原理（解决硬编码不同步导致的 404）：**
- 门户首页 fetch `./manifest.json` 获取实际制品结构
- 与内置 `MEMBER_META` + `PROJECT_META` 注册表合并渲染
- 新增成员/项目只需更新 `build-all.sh`，无需手动改门户 HTML
- manifest 加载失败时回退到 `FALLBACK_DATA`（仅含 jojo 兜底）

**PRD HTML 文档部署说明**：
- 来源路径：`projects/{project}/docs/09-versions/v{version}/prd-html/`
- 部署后访问：`https://{domain}/{member}/{project}/{version}/prd/SAAS-v1.0.0-S1.html`

**PRD HTML 文档部署说明**：
- 来源路径：`projects/{project}/docs/09-versions/v{version}/prd-html/`
- 部署后访问：`https://{domain}/{member}/{project}/{version}/prd/SAAS-v1.0.0-S1.html`
- 如果项目没有 `prd-html/` 目录则自动跳过，不影响部署

```bash
# Git 推送（自动触发 EdgeOne Pages 部署）
git add . && git commit -m "新增项目 XXX" && git push origin main
```

### 4.5 更新门户首页链接

编辑 `deploy/access-portal/index.html`，新增该项目入口链接。

---

## 五、不需要改的东西

- **`deploy/404-template.html`** — 无需修改，正则自动匹配 `/{member}/{project}/{version}/` 模式
- **`deploy/edgeone-pages.json`** — 保持 `{}` 空配置，不要往里加 rewrite 规则
- **子项目目录** — 不需要放 `404.html`、`edgeone.json` 等回退文件

---

## 六、故障排查

| 现象 | 检查项 |
|------|--------|
| 深层路由空白 | 1. `Cmd+Shift+R` 强制刷新（浏览器可能缓存了旧 404）<br>2. 检查 `VITE_BASE_PATH` 是否与部署路径一致<br>3. 打开 DevTools → Network，确认 JS/CSS 资源 200 OK |
| "404 Page Not Found" | 检查 `deploy/artifacts/404.html` 是否存在（构建脚本自动生成） |
| 点击按钮跳转后空白 | 确认 Vue Router 使用的是 history 模式（不是 hash 模式） |
| 新项目首页空白 | 确认 `build-all.sh` 的 `PROJECTS` 数组中项目目录名正确 |
| 静态资源 404 | 确认 Vite `base` 配置通过 `VITE_BASE_PATH` 环境变量设置 |

---

## 七、架构约束（铁律）

1. **绝不使用 `edgeone.json` 的 rewrites 规则** —— 会破坏静态资源加载
2. **所有 SPA 必须使用 history 模式路由** —— hash 模式不需要 404 fallback，但 URL 不美观
3. **Vite `base` 必须是完整部署路径** —— `/{member}/{project}/{version}/`，由构建脚本通过 `VITE_BASE_PATH` 注入
4. **路径必须遵循 `/{member}/{project}/{version}/` 模式** —— 否则 `404-template.html` 的正则匹配会失败
5. **构建产物由脚本统一管理** —— 不要手动修改 `deploy/artifacts/` 目录
