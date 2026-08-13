# Git 仓库与 EdgeOne Pages 配置操作指南（V1.0.0）

> **适用对象**：管理员
> **目的**：梳理 Git 仓库创建、EdgeOne Pages 部署关系、自定义域名、访问保护的具体操作步骤
> **版本**：V1.0.0 | **日期**：2026-07-21

---

## 一、当前状态

```
项目目录：/Users/jojo/Desktop/原型设计/九天科技/AI-SCRM/
Git状态：❌ 未初始化（无 .git 目录）
EdgeOne Pages：
  ✅ 已部署成功（通过 deploy_folder 直接推送）
  项目ID：makers-ia0gfprurxre
  项目名：ai-scrm
  部署URL：https://ai-scrm-dpzzl2eobkr6.edgeone.dev
  控制台：https://console.cloud.tencent.com/edgeone/pages/project/makers-ia0gfprurxre/index
```

---

## 二、Git 和 EdgeOne Pages 的关系

### 核心理解：两者独立，各司其职

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  Git 仓库                  EdgeOne Pages                  │
│  （代码版本管理）           （静态网站托管+CDN）            │
│                                                           │
│  作用：                    作用：                          │
│  · 多人协作代码管理         · 部署仿真原型供访问            │
│  · 版本控制与回滚           · CDN 加速                     │
│  · 分支保护与审批           · 自定义域名                   │
│                                                           │
│  关系：互不依赖                                            │
│  · Git 管代码 → 成员协作                                    │
│  · EdgeOne 管部署 → 产品团队访问                           │
│  · /deploy 命令把 Git 管理的代码构建后推送到 EdgeOne       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 部署流程

```
成员开发（Git 管理代码）
  → /close 或 /deploy
  → npm run build:sim（构建静态产物到 dist/）
  → deploy_folder 工具推送 dist/ 到 EdgeOne Pages
  → 生成访问 URL
```

**关键点**：EdgeOne Pages 不需要关联 Git 仓库。`/deploy` 命令通过 `deploy_folder` 工具直接推送构建产物。Git 只用于多人协作代码管理。

---

## 三、Git 仓库创建与配置

### 3.1 选择 Git 平台

| 平台 | 优势 | 劣势 | 推荐度 |
|------|------|------|--------|
| **Gitee** | 国内访问快、免费私有仓库 | 功能不如 GitHub 丰富 | ⭐⭐⭐⭐⭐ |
| **腾讯云 CODING** | 与 EdgeOne 同生态、企业级 | 需要腾讯云企业认证 | ⭐⭐⭐⭐ |
| **GitHub** | 功能最全、生态最好 | 国内访问不稳定 | ⭐⭐⭐ |

**推荐 Gitee**（国内访问快、免费、操作简单）。

### 3.2 创建 Gitee 仓库（具体步骤）

```
步骤1：注册/登录 Gitee
  → 访问 https://gitee.com
  → 注册账号或登录

步骤2：创建新仓库
  → 点击右上角 "+" → "新建仓库"
  → 仓库名称：pom-workspace（或 ai-scrm-workspace）
  → 选择 "私有"（仅团队成员可见）
  → 勾选 "初始化仓库" → 取消勾选（我们手动初始化）
  → 点击 "创建"

步骤3：获取仓库地址
  → 创建后页面会显示仓库地址：
    https://gitee.com/your-username/pom-workspace.git
  → 记住这个地址，后面要用
```

### 3.3 初始化本地 Git 仓库

```bash
# 1. 进入项目目录
cd "/Users/jojo/Desktop/原型设计/九天科技/AI-SCRM"

# 2. 初始化 Git
git init

# 3. 配置 Git 用户（如果未配置）
git config user.name "Jojo"
git config user.email "maenbin@hotmail.com"

# 4. 添加远端仓库（替换为你的 Gitee 地址）
git remote add origin https://gitee.com/your-username/pom-workspace.git

# 5. 创建 .gitignore（已创建，跳过）

# 6. 添加文件并首次提交
git add .
git commit -m "init: 多人多项目部署运营方案 V1.0.0

- POM V5.2.0 工作流引擎
- 多人多项目目录结构（projects/{owner}/{project}/）
- EdgeOne Pages 部署链路
- 角色权限控制（.access-control.yml）
- 成员操作手册 + 管理员操作手册"

# 7. 推送到远端
git branch -M main
git push -u origin main
```

### 3.4 邀请成员加入仓库

```
Gitee 仓库 → 管理 → 仓库成员管理 → 添加仓库成员
  → 输入成员的 Gitee 用户名
  → 选择权限：开发者（可推送代码）
  → 发送邀请
```

### 3.5 配置分支保护

```
Gitee 仓库 → 管理 → 分支保护
  → 保护分支：main
  → 规则：
    - 禁止直接 push（必须 PR）
    - 必须至少1人审批
    - 必须 status check 通过
```

### 3.6 创建 CODEOWNERS 文件

在仓库根目录创建 `CODEOWNERS` 文件（见管理员操作手册第五章）。

---

## 四、EdgeOne Pages 配置

### 4.1 部署方式说明

**当前使用的方式：`deploy_folder` 直接部署**

```
/deploy --project=AI-SCRM
  → npm run build:sim（构建 dist/）
  → deploy_folder 工具推送 dist/ 到 EdgeOne Pages
  → 生成访问 URL
```

**优点**：
- ✅ 已验证可用
- ✅ 不依赖 Git 仓库
- ✅ 可以部署任意版本
- ✅ 自动化（/close 和 /deploy 自动触发）

**不需要关联 Git**：EdgeOne Pages 虽然支持关联 Git 仓库自动部署，但我们用 `deploy_folder` 方式更灵活。

### 4.2 自定义域名配置

**前提**：如果加速区域包含中国大陆，域名需要先在工信部完成备案。

```
步骤1：进入 EdgeOne 控制台
  → https://console.cloud.tencent.com/edgeone/pages/project/makers-ia0gfprurxre/index
  → 切换到 "域名管理" 页面

步骤2：添加自定义域名
  → 点击 "添加自定义域名"
  → 输入域名（如：prototype.yourcompany.com）
  → 或子域名（如：ai-scrm.yourcompany.com）

步骤3：验证域名归属权
  → 根据弹窗指引
  → 在域名注册商处添加 TXT 记录验证归属

步骤4：配置 CNAME 记录
  → 在域名注册商的 DNS 管理中添加 CNAME 记录
  → 将域名指向 EdgeOne 提供的地址（如 xxx.edgeone.dev）

步骤5：配置 SSL 证书
  → 选择 "申请免费证书"（EdgeOne 提供免费 SSL）
  → 或使用已有证书
  → 开启 HTTPS

步骤6：设置关联环境
  → 选择 "生产环境"（关联 main 分支的最新部署）
  → 域名将自动指向最新的成功部署

完成后的访问方式：
  → https://prototype.yourcompany.com  → 直接访问最新部署
  → 不再需要 eo_token 和 eo_time 参数
```

### 4.3 访问保护配置

EdgeOne Pages 本身可能不直接提供站点级密码保护功能。以下是三种实现方案：

#### 方案A：EdgeOne 规则引擎访问控制（推荐）

```
在 EdgeOne 控制台 → 站点加速 → 规则引擎
  → 创建规则：
    - 匹配条件：所有请求
    - 执行操作：访问控制 → URL 鉴权
    - 配置鉴权参数（密码/Token）
  → 效果：访问时需要提供密码/Token
```

#### 方案B：前端应用内置登录页

```
在仿真原型中添加一个简单的登录页：
  → 首次访问显示登录框
  → 输入密码后写入 localStorage
  → 后续访问自动跳过登录
  → 适合简单的访问控制场景

实现方式：在 src/App.tsx 中添加登录守卫组件
```

#### 方案C：EdgeOne WAF（Web应用防火墙）

```
在 EdgeOne 控制台 → 安全 → WAF
  → 配置访问规则
  → 支持 IP 白名单/黑名单
  → 支持基础认证
  → 适合企业级安全需求
```

**推荐方案B**（前端内置登录页），因为：
- 最简单，不需要额外配置 EdgeOne
- 灵活控制（不同成员不同密码）
- 可以和 .access-control.yml 的成员信息对齐

### 4.4 多项目部署路由

当前 EdgeOne Pages 项目部署的是单个项目的 dist/。多项目场景有两种方案：

#### 方案A：每个项目独立部署（推荐，当前使用）

```
每个项目执行 /deploy 时，deploy_folder 推送该项目的 dist/
EdgeOne Pages 项目会更新为最新部署的项目

适合：单项目展示（每次只展示一个项目）
```

#### 方案B：创建多个 EdgeOne Pages 项目

```
在 EdgeOne 控制台为每个项目创建独立的 Pages 项目：
  → ai-scrm（jojo 的项目）
  → erp-portal（张三的项目）
  → crm-portal（李四的项目）

每个项目有独立的部署 URL
/deploy 时 deploy_folder 推送到对应项目

适合：多项目同时在线展示
```

#### 方案C：单项目+路径路由（复杂，暂不推荐）

```
需要构建时配置 base 路径，部署到同一项目的不同子路径
配置复杂，暂不推荐
```

**推荐方案B**（多项目各自独立的 EdgeOne Pages 项目），每个成员的项目有独立的访问 URL。

---

## 五、完整配置清单

### 5.1 一次性配置（管理员做）

| # | 配置项 | 操作位置 | 状态 |
|---|--------|---------|------|
| 1 | 创建 Gitee 仓库 | gitee.com | ❌ 待创建 |
| 2 | 初始化本地 Git + 首次提交 | 本地终端 | ❌ 待执行 |
| 3 | 推送代码到 Gitee | 本地终端 | ❌ 待执行 |
| 4 | 配置分支保护 | Gitee 仓库设置 | ❌ 待配置 |
| 5 | 创建 CODEOWNERS | 仓库根目录 | ❌ 待创建 |
| 6 | EdgeOne 绑定自定义域名 | EdgeOne 控制台 | ❌ 待配置 |
| 7 | EdgeOne 配置 SSL 证书 | EdgeOne 控制台 | ❌ 待配置 |
| 8 | EdgeOne 配置访问保护 | EdgeOne 控制台 或 前端 | ❌ 待配置 |

### 5.2 每个新成员配置

| # | 配置项 | 操作位置 |
|---|--------|---------|
| 1 | 邀请加入 Gitee 仓库 | Gitee 仓库设置 |
| 2 | 注册成员信息 | .access-control.yml + PROJECT-INDEX.yml |
| 3 | 分配端口 | config.yml port_pool |
| 4 | 创建 EdgeOne 访问账号（如需） | EdgeOne 控制台 |
| 5 | 通知成员：仓库地址 + 使用说明 | — |

### 5.3 每个新项目配置

| # | 配置项 | 操作位置 |
|---|--------|---------|
| 1 | 注册项目信息 | PROJECT-INDEX.yml |
| 2 | 分配端口和数据库名 | config.yml + PROJECT-INDEX.yml |
| 3 | 创建项目骨架 | `ensure-project.sh {owner} {project}` |
| 4 | （可选）创建独立 EdgeOne Pages 项目 | EdgeOne 控制台 |
| 5 | （可选）配置部署路由 | deploy/edgeone-pages.json |

---

## 六、操作顺序建议

```
第一步：创建 Git 仓库（Gitee）
  → 注册 Gitee 账号
  → 创建私有仓库
  → 记住仓库地址

第二步：初始化本地 Git
  → git init
  → git add . && git commit
  → git remote add origin {仓库地址}
  → git push

第三步：配置分支保护 + CODEOWNERS
  → Gitee 仓库设置中配置
  → 创建 CODEOWNERS 文件

第四步：EdgeOne 自定义域名（如有域名）
  → EdgeOne 控制台 → 域名管理
  → 添加域名 + CNAME + SSL

第五步：EdgeOne 访问保护
  → 选择方案B（前端内置登录页）或方案A（规则引擎）
  → 配置访问控制

第六步：邀请成员
  → Gitee 邀请成员加入仓库
  → 注册成员信息
  → 通知成员开始使用
```

---

## 七、常见问题

### Q1：不创建 Git 仓库可以吗？

可以。EdgeOne Pages 部署不依赖 Git。但多人协作需要 Git 来管理代码版本和分支保护。如果只有你一个人开发，可以暂时不用 Git。

### Q2：EdgeOne Pages 需要关联 Git 仓库吗？

不需要。我们使用 `deploy_folder` 方式直接推送构建产物，不关联 Git。EdgeOne Pages 虽然支持 Git 关联自动部署，但我们的 `/deploy` 命令已经实现了自动推送。

### Q3：自定义域名必须备案吗？

如果 EdgeOne Pages 的加速区域包含中国大陆，域名需要备案。如果选择"全球可用区（不含中国大陆）"或"海外可用区"，不需要备案但国内访问会慢。

### Q4：不绑定自定义域名可以吗？

可以。使用 EdgeOne 默认的 `.edgeone.dev` 域名也能访问，但：
- 预览链接有有效期（需带 eo_token 参数）
- 不够专业（没有自己的品牌域名）
- 长期使用建议绑定自定义域名

### Q5：成员怎么获取部署链接？

管理员通过访问门户（`deploy/access-portal/index.html`）或直接分享部署 URL 给成员。成员也可以执行 `/deploy --status` 查看部署状态。

### Q6：Gitee 和 GitHub 可以同时用吗？

可以。配置多个 remote 即可：
```bash
git remote add origin https://gitee.com/xxx/pom-workspace.git
git remote add github https://github.com/xxx/pom-workspace.git
git push origin main  # 推送到 Gitee
git push github main  # 推送到 GitHub
```
