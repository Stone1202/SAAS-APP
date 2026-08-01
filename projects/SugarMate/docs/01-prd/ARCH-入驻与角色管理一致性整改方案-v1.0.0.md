# 入驻与角色管理一致性整改方案 v1.0.0

> 诊断范围：入驻申请端(onboardingStore) ↔ 入驻审核工作台(MerchantListPage) ↔ 各角色管理页(Doctor/Pharmacist/Nutritionist) ↔ 资质证照中心(CertificateCenter) ↔ 合同管理(ContractManage)
>
> 核心问题：同一业务实体在 5 个模块中存在 5 套互不兼容的数据模型和状态体系，导致"流程走不通、数据互不认识"

---

## 一、现状全景梳理

### 1.1 五套并存的数据模型

| 模块 | 角色枚举 | 状态枚举 | 核心字段 | API |
|------|----------|----------|----------|-----|
| **入驻申请(onboardingStore)** | `PH`/`DR`/`PR`/`NT`/`HM` | `DRAFT`→`PENDING`→`INFO_APPROVED`→`CERT_APPROVED`→`APPROVED`→`SIGNING`→`SIGNED`→`ONLINE` (+`NEED_SUPPLEMENT`/`REJECTED`/`FROZEN`/`WITHDRAWN`) | name, phone, company, idCard, gender, title, specialties, address, legalPerson, legalPhone, licenseNo, bizHours, businessScope, affiliatedPharmacyId | localStorage (Zustand persist) |
| **契约层(contracts/onboarding)** | `PHARMACY`/`DOCTOR`/`NUTRITIONIST`/`HM`/`PHARMACIST` | `PENDING`/`IN_REVIEW`/`APPROVED`/`REJECTED`/`EXPIRED` | merchant_name, contact_name, contact_phone, license_no, certificate_no, practice_no, department | — |
| **入驻审核工作台** | `PHARMACY`/`DOCTOR`/`NUTRITIONIST`/`HM`/`PHARMACIST` | `PENDING`/`IN_REVIEW`/`APPROVED`/`REJECTED` | merchant_name, contact_name, contact_phone, province, city | `/applications`, `/merchants` |
| **医生管理** | — | `ACTIVE`/`INACTIVE`/`PENDING` | name, phone, id_card, title, department, hospital, region, specialties | `/doctors` |
| **药剂师管理** | — | `ACTIVE`/`INACTIVE`/`PENDING` | name, license_no, pharmacy, region, review_count | `/pharmacists` |
| **营养师/HM管理** | `NUTRITIONIST`/`HM` | `ACTIVE`/`INACTIVE`/`PENDING` | name, role, organization, customer_count, recipe_count, region | `/nutritionists` |
| **资质证照中心** | — | `PENDING`/`APPROVED`/`REJECTED`/`EXPIRING`/`EXPIRED` | cert_no, type, merchant_name, expire_at | `/certificates` |
| **合同管理** | — | `DRAFT`/`PENDING`/`SIGNED`/`EFFECTIVE`/`EXPIRED`/`TERMINATED` | contract_no, type, party_name, amount, valid_period | `/contracts` |
| **商家评级** | — | `S`/`A`/`B`/`C`/`D` | merchant_name, type, level, score | `/ratings` |

**结论：同一角色（如医生）在系统中存在 3 种不同编码（`DR` / `DOCTOR` / 无角色字段），状态体系完全不互通。**

---

### 1.2 状态机断点分析

```
【入驻申请端】完整状态机（onboardingStore）
DRAFT ──submit──→ PENDING ──info_check──→ INFO_APPROVED ──cert_check──→ CERT_APPROVED ──approve──→ APPROVED ──sendContract──→ SIGNING ──sign──→ SIGNED ──setOnline──→ ONLINE
                      │                                                                                          │
                      ├──supplement──→ NEED_SUPPLEMENT ──resubmit──→ PENDING                                      └──freeze──→ FROZEN
                      └──reject──→ REJECTED

【入驻审核工作台】实际状态机（MerchantListPage）
PENDING ──approve──→ APPROVED
      └──reject──→ REJECTED
      
问题：INFO_APPROVED / CERT_APPROVED / SIGNING / SIGNED / ONLINE 等状态在前端审核页完全不存在
      → 运营人员看不到"资质审核中"、"签约中"等中间状态
      → 一步通过/驳回，与申请端的多步流程严重脱节

【各角色管理页】状态机
PENDING ──(按钮)──→ ACTIVE
      
问题：无 REJECTED 态、无审核记录、无流程追溯
```

---

### 1.3 数据流断点（申请→管理的核心链路不通）

```
用户提交入驻申请
    │
    ▼
onboardingStore.createApplication() ──→ localStorage（sugarmate-onboarding）
    │
    ▼
运营在【入驻审核工作台】看到的是 /applications API 返回的数据
    ↑
    ╰── 数据来自完全不同的数据源！申请端存在 localStorage，工作台调 API
    
问题 1：申请端提交后，工作台看不到申请（数据未打通）
问题 2：工作台点击"通过"后，医生/药剂师管理页看不到新数据（无联动写入）
问题 3：审核通过的资质没有沉淀到【资质证照中心】（证照孤立）
问题 4：签约信息没有同步到【合同管理】（合同孤立）
问题 5：上线的商家没有进入【商家评级】（评级孤立）
```

---

## 二、不一致问题清单（P0→P2）

### P0 — 流程走不通（阻断级）

| # | 问题 | 影响 | 根因 |
|---|------|------|------|
| P0-1 | 入驻申请提交后，工作台无法读取 | 运营无法审核 | 申请端用 localStorage，工作台调 API，无数据同步 |
| P0-2 | 工作台"通过"后，角色管理页无数据 | 管理页空表 | 无"申请通过→创建角色记录"的联动逻辑 |
| P0-3 | 申请端 12 态 vs 工作台 4 态 | 状态显示错乱 | 状态枚举未统一 |
| P0-4 | 角色编码三套：`DR`/`DOCTOR`/无 | 类型判断错误 | 未定义统一角色枚举 |
| P0-5 | 资质证照中心与申请端证书数据无关联 | 审核后看不到证照 | certificates 数组未同步到证照中心 |

### P1 — 数据模型不一致（严重）

| # | 问题 | 影响 |
|---|------|------|
| P1-1 | 医生管理页字段 `hospital` vs 申请端 `company` vs 契约 `department` | 同一概念三个名字 |
| P1-2 | 药剂师管理页 `license_no` vs 申请端无此字段 | 数据无法映射 |
| P1-3 | 营养师管理页 `organization` vs 申请端 `company` | 数据无法映射 |
| P1-4 | 申请端 `affiliatedPharmacyId` 有数据，但药剂师管理页 `pharmacy` 是文本 | 关联关系丢失 |
| P1-5 | 各管理页独立 API（`/doctors`, `/pharmacists`, `/nutritionists`），无统一查询入口 | 数据孤岛 |
| P1-6 | 合同管理 `party_name` 与申请端 `name`/`company` 无关联 | 合同归属不明 |

### P2 — 体验不一致（中等）

| # | 问题 | 影响 |
|---|------|------|
| P2-1 | 医生管理有"科室"字段，但申请端表单无此输入 | 数据从哪里来？ |
| P2-2 | 申请端有"性别"字段，但所有管理页均不展示 | 信息丢失 |
| P2-3 | 申请端有"擅长领域"多选，但管理页展示格式不一致 | 体验割裂 |
| P2-4 | 商家评级从 `/ratings` 独立加载，与入驻数据无关联 | 评级对象是谁？ |

---

## 三、统一架构方案

### 3.1 统一数据模型（核心）

定义一个**入驻主数据实体**，所有角色共享基础结构，通过 `role` 区分类型：

```typescript
// ========== 统一角色枚举 ==========
export type MerchantRole = 'PHARMACY' | 'DOCTOR' | 'PHARMACIST' | 'NUTRITIONIST' | 'HEALTH_MANAGER';

// ========== 统一入驻状态机 ==========
export type OnboardingStatus =
  | 'DRAFT'           // 草稿
  | 'PENDING'         // 待审核（已提交）
  | 'INFO_REVIEWING'  // 信息核对中
  | 'INFO_APPROVED'   // 信息已通过
  | 'CERT_REVIEWING'  // 资质审核中
  | 'CERT_APPROVED'   // 资质已通过
  | 'NEED_SUPPLEMENT' // 需补充资料
  | 'REJECTED'        // 审核不通过
  | 'APPROVED'        // 审核通过（待签约）
  | 'SIGNING'         // 签约中
  | 'SIGNED'          // 已签约
  | 'ONLINE'          // 已上线
  | 'FROZEN'          // 已冻结
  | 'WITHDRAWN';      // 已撤回

// ========== 统一商家/角色实体 ==========
export interface Merchant {
  // ── 主键 ──
  id: string;                    // 统一 ID：MER-{角色缩写}-{NNNN}
  applyId: string;               // 关联入驻申请 ID

  // ── 角色分类 ──
  role: MerchantRole;
  entityType: 'INSTITUTION' | 'INDIVIDUAL';

  // ── 基础信息（所有角色共有）──
  name: string;                  // 姓名/机构名
  phone: string;                 // 联系电话
  idCard?: string;               // 身份证号（个人）
  province?: string;
  city?: string;
  address?: string;
  status: OnboardingStatus;

  // ── 机构专属 ──
  companyName?: string;          // 统一：company → companyName
  legalPerson?: string;
  legalPhone?: string;
  licenseNo?: string;            // 统一社会信用代码
  bizHours?: string;
  businessScope?: string[];

  // ── 个人专业信息 ──
  title?: string;                // 职称
  department?: string;           // 科室（医生）
  specialties?: string[];        // 擅长领域
  gender?: 'M' | 'F';

  // ── 角色关联 ──
  affiliatedMerchantId?: string; // 归属商家 ID（如药师→药房）
  affiliatedMerchantName?: string;

  // ── 流程追踪 ──
  statusHistory: StatusChange[];
  reviewLogs: ReviewLog[];
  currentStep: number;

  // ── 业务统计 ──
  totalOrders?: number;
  totalRevenue?: number;
  serviceScore?: number;
  qualityScore?: number;

  // ── 时间 ──
  createdAt: number;
  updatedAt: number;
  submittedAt?: number;
  reviewedAt?: number;
  onlineAt?: number;
}

// ========== 统一资质证照实体 ==========
export interface MerchantCertificate {
  id: string;
  merchantId: string;            // 关联商家 ID
  merchantRole: MerchantRole;    // 冗余：便于按角色筛选
  type: CertType;                // 统一枚举
  name: string;
  fileUrl: string;
  status: 'pending' | 'valid' | 'expired' | 'invalid' | 'rejected';
  expiryDate?: string;
  reviewedBy?: string;
  reviewedAt?: number;
  rejectReason?: string;
  uploadedAt: number;
}

export type CertType =
  | 'BUSINESS_LICENSE'      // 营业执照
  | 'DRUG_PERMIT'           // 药品经营许可证
  | 'GSP_CERT'              // GSP 认证
  | 'LEGAL_ID_CARD'         // 法人身份证
  | 'ID_CARD'               // 身份证
  | 'DOCTOR_LICENSE'        // 执业医师证
  | 'PHARMACIST_LICENSE'    // 执业药师证
  | 'NUTRITIONIST_LICENSE'  // 营养师资格证
  | 'HEALTH_MANAGER_LICENSE'; // 健康管理师资格证

// ========== 统一合同实体 ==========
export interface MerchantContract {
  id: string;
  contractNo: string;
  merchantId: string;
  type: 'SETTLEMENT' | 'SERVICE' | 'COOPERATION';
  status: 'DRAFT' | 'PENDING_SIGN' | 'SIGNED' | 'EFFECTIVE' | 'EXPIRED' | 'TERMINATED';
  partyName: string;
  amount?: number;
  validPeriod: string;
  signedAt?: number;
  effectiveAt?: number;
  expiredAt?: number;
  contractUrl?: string;
}
```

### 3.2 统一状态机

```
                                    ┌─→ INFO_REVIEWING ──ok──→ INFO_APPROVED ──┐
                                    │              └─supplement──┐              │
DRAFT ──submit──→ PENDING ──────────┤                             ↓              ├──→ CERT_REVIEWING ──ok──→ CERT_APPROVED ──ok──→ APPROVED
                  │  │              └──────────────────────────────┘              │                            └─supplement──┐
                  │  │                                                            │                                          │
                  │  └─withdraw──→ WITHDRAWN                                      └──────────────────────────────────────────┘
                  │
                  └──reject──→ REJECTED

APPROVED ──sendContract──→ SIGNING ──sign──→ SIGNED ──online──→ ONLINE
                                              │
                                              └──freeze──→ FROZEN

关键规则：
1. 每个状态变更必须写入 statusHistory（操作人+时间+备注）
2. 每个审核步骤必须写入 reviewLogs（步骤+结果+审核人+意见）
3. 状态变更必须通过统一接口 `transitionStatus(merchantId, from, to, operator, note)` 执行
4. 前端所有状态标签统一从 STATUS_LABEL 字典读取
```

### 3.3 统一 API 设计

```
# 入驻申请（前端提交）
POST   /api/v1/onboarding/applications          # 创建申请
PUT    /api/v1/onboarding/applications/{id}     # 更新草稿
POST   /api/v1/onboarding/applications/{id}/submit

# 审核工作台（运营操作）
GET    /api/v1/onboarding/applications?status=&role=&page=    # 申请列表
POST   /api/v1/onboarding/applications/{id}/info-review       # 信息核对（ok/fix）
POST   /api/v1/onboarding/applications/{id}/cert-review       # 资质审核（ok/fix）
POST   /api/v1/onboarding/applications/{id}/supplement        # 要求补充
POST   /api/v1/onboarding/applications/{id}/approve           # 终审通过
POST   /api/v1/onboarding/applications/{id}/reject            # 驳回

# 角色管理（统一入口，按角色筛选）
GET    /api/v1/merchants?role=&status=&page=       # 统一商家/角色列表
GET    /api/v1/merchants/{id}                      # 详情
PUT    /api/v1/merchants/{id}                      # 编辑（仅ACTIVE态可编辑非关键字段）
POST   /api/v1/merchants/{id}/freeze               # 冻结
POST   /api/v1/merchants/{id}/unfreeze             # 解冻

# 资质证照中心
GET    /api/v1/certificates?merchantId=&type=&status=   # 证照列表
POST   /api/v1/certificates/{id}/approve               # 通过
POST   /api/v1/certificates/{id}/reject                # 驳回
POST   /api/v1/certificates/{id}/renew                 # 续期

# 合同管理
GET    /api/v1/contracts?merchantId=&status=
POST   /api/v1/contracts/{id}/send                     # 发送签约
POST   /api/v1/contracts/{id}/sign                     # 确认签约

# 商家评级（自动计算+人工调整）
GET    /api/v1/ratings?merchantId=&level=
PUT    /api/v1/ratings/{merchantId}                   # 调整评级
```

### 3.4 数据联动规则（申请通过后的自动流转）

```
当 application.status 从 CERT_APPROVED → APPROVED 时：

触发联动 ①：创建/更新 Merchant 记录
  - 将 application 的所有字段映射到 Merchant 实体
  - 角色编码统一转换（PH→PHARMACY, DR→DOCTOR, PR→PHARMACIST, NT→NUTRITIONIST, HM→HEALTH_MANAGER）
  - status = 'APPROVED'
  - 生成 merchantId = MER-{角色缩写}-{NNNN}

触发联动 ②：资质沉淀到 CertificateCenter
  - 遍历 application.certificates
  - 每条创建 MerchantCertificate 记录
  - status = 'valid'（因资质审核已通过）
  - merchantId 关联新创建的 Merchant

触发联动 ③：生成合同（如需签约）
  - 若 ROLE_CONFIG[role].requiresContract = true
  - 自动创建 MerchantContract（status='DRAFT'）
  - 触发合同模板填充

当 Merchant.status 从 SIGNED → ONLINE 时：

触发联动 ④：初始化商家评级
  - 在 Rating 表创建记录
  - level = 'C'（默认）
  - score = 3.0
  - 关联 merchantId

触发联动 ⑤：角色管理页可见
  - 此时 Merchant.status = 'ONLINE'
  - 各角色管理页 GET /merchants?role=DOCTOR&status=ONLINE 可查到
```

### 3.5 各管理页统一改造点

| 管理页 | 当前 API | 改造后 API | 关键变更 |
|--------|----------|------------|----------|
| 入驻审核工作台 | `/applications`, `/merchants` | `/onboarding/applications` | 接入完整状态机，显示 14 态 |
| 商家管理 | `/merchants` | `/merchants?role=PHARMACY` | 使用统一模型，支持编辑 |
| 医生管理 | `/doctors` | `/merchants?role=DOCTOR` | 字段映射：hospital→companyName, id_card→idCard |
| 药剂师管理 | `/pharmacists` | `/merchants?role=PHARMACIST` | 字段映射：license_no→licenseNo, pharmacy→affiliatedMerchantName |
| 营养师/HM管理 | `/nutritionists` | `/merchants?role=NUTRITIONIST,HEALTH_MANAGER` | 字段映射：organization→companyName |
| 资质证照中心 | `/certificates` | `/certificates` | 关联 merchantId，按角色筛选 |
| 合同管理 | `/contracts` | `/contracts` | 关联 merchantId |
| 商家评级 | `/ratings` | `/ratings` | 关联 merchantId |

---

## 四、实施优先级

### Phase 1 — 数据模型统一（2~3 天）

1. **重构 `contracts/onboarding.ts`**
   - 删除旧 `ApplicationSchema` / `MerchantSchema`
   - 新建统一 `MerchantSchema`、`MerchantCertificateSchema`、`MerchantContractSchema`
   - 新建统一 `MerchantRoleEnum`、`OnboardingStatusEnum`、`CertTypeEnum`

2. **重构 `onboardingStore.ts`**
   - 状态枚举统一到新 `OnboardingStatusEnum`
   - 角色编码统一到新 `MerchantRoleEnum`
   - `OnboardingApplication` 接口扩展为兼容新 `Merchant` 结构
   - 所有状态变更方法增加 `statusHistory` 写入

3. **契约一致性校验**
   - 确保 Store 数据结构与 Zod Schema 100% 对齐

### Phase 2 — 审核流打通（2~3 天）

4. **改造 `MerchantListPage`（入驻审核工作台）**
   - 状态筛选支持全部 14 态
   - 审核操作增加分步：信息核对 → 资质审核 → 终审通过
   - 驳回/补充资料功能保留
   - 详情弹窗展示 `statusHistory` + `reviewLogs`

5. **新增数据联动逻辑**
   - 当审核通过(APPROVED)时，自动写入 Merchant 列表（localStorage 模拟层）
   - 资质自动沉淀到 CertificateCenter

### Phase 3 — 角色管理页统一（2~3 天）

6. **改造 `DoctorManagePage` / `PharmacistManagePage` / `NutritionistManagePage`**
   - 统一从 `/merchants?role=XXX` 加载
   - 字段映射到统一模型
   - 新增/编辑表单复用 `OnboardingApplyPage` 的表单组件（提取公共表单）

7. **改造 `CertificateCenterPage`**
   - 增加 `merchantId` 关联展示
   - 审核通过后资质状态联动更新 Merchant 侧的 certificates

### Phase 4 — 合同/评级联动（1~2 天）

8. **改造 `ContractManagePage`**
   - 增加 merchant 关联展示
   - 签约状态与 Merchant.status 双向同步

9. **改造 `MerchantRatingPage`**
   - 增加 merchant 关联展示
   - 上线时自动初始化评级记录

---

## 五、前端代码级改造建议

### 5.1 提取公共表单组件

当前 `OnboardingApplyPage` 中 900+ 行的表单逻辑应拆分为：

```
src/components/onboarding/
  ├── RoleSelector.tsx          # 角色选择卡片
  ├── MerchantBaseForm.tsx      # 基础信息表单（姓名/电话/地址等）
  ├── InstitutionForm.tsx       # 机构专属字段（法人/执照/经营范围）
  ├── ProfessionalForm.tsx      # 个人专业字段（职称/科室/擅长领域）
  ├── CertUploader.tsx          # 资质上传组件
  └── StatusTracker.tsx         # 状态跟踪/时间线
```

这样管理页的"新增"和"编辑"可以直接复用这些表单组件，确保字段一致。

### 5.2 统一状态标签组件

```tsx
// src/components/MerchantStatusTag.tsx
const STATUS_CONFIG: Record<OnboardingStatus, { color: string; label: string; step: number }> = {
  DRAFT: { color: 'default', label: '草稿', step: 0 },
  PENDING: { color: 'processing', label: '待审核', step: 1 },
  INFO_REVIEWING: { color: 'blue', label: '信息核对中', step: 1 },
  // ... 全部 14 态
};

export const MerchantStatusTag: React.FC<{ status: OnboardingStatus }> = ({ status }) => (
  <Tag color={STATUS_CONFIG[status].color}>{STATUS_CONFIG[status].label}</Tag>
);
```

所有页面统一使用此组件，杜绝各页独立维护 STATUS_MAP。

### 5.3 统一角色标签组件

```tsx
const ROLE_CONFIG: Record<MerchantRole, { label: string; icon: string; color: string }> = {
  PHARMACY: { label: '药房', icon: '🏪', color: '#2563eb' },
  DOCTOR: { label: '医生', icon: '👨‍⚕️', color: '#16a34a' },
  PHARMACIST: { label: '药剂师', icon: '💊', color: '#7c3aed' },
  NUTRITIONIST: { label: '营养师', icon: '🥗', color: '#f59e0b' },
  HEALTH_MANAGER: { label: '健康管理师', icon: '❤️', color: '#0891b2' },
};
```

---

## 六、验证清单

整改完成后，以下流程必须跑通：

- [ ] 用户在 `/apply` 提交入驻申请 → 工作台能看到申请 → 状态为 `PENDING`
- [ ] 运营点击"信息核对通过" → 申请端状态变为 `INFO_APPROVED` → 状态历史有记录
- [ ] 运营点击"资质审核通过" → 申请端状态变为 `CERT_APPROVED` → 资质证照中心出现该商家的证照
- [ ] 运营点击"审核通过" → 状态变为 `APPROVED` → 对应角色管理页出现该记录
- [ ] 系统发送合同 → 状态变为 `SIGNING` → 合同管理页出现合同记录
- [ ] 用户签约 → 状态变为 `SIGNED`
- [ ] 运营点击"上线" → 状态变为 `ONLINE` → 商家评级页出现该商家
- [ ] 运营在角色管理页点击"冻结" → 状态变为 `FROZEN` → 申请端同步显示冻结
- [ ] 运营在角色管理页点击"编辑" → 表单字段与申请端完全一致 → 保存后双向同步

---

> 文档版本：v1.0.0
> 编写日期：2026-07-30
> 关联模块：入驻申请、入驻审核、商家管理、医生管理、药剂师管理、营养师管理、资质证照中心、合同管理、商家评级
