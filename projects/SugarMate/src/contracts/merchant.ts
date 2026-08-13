/**
 * 统一商家/成员契约层 V1.0.0
 * 
 * 单一事实源：全系统所有角色（药房、医生、药师、营养师）
 * 共享同一套实体定义、状态机、角色编码和 CRUD 接口。
 * 
 * 解决的问题：
 * 1. 角色编码三套并行（onboardingStore PH/DR/PR/NT vs contract PHARMACY/DOCTOR/...）
 * 2. 状态体系脱节（入驻12态 vs 管理页3-4态）
 * 3. 数据链路断裂（入驻→管理→资质→合同→评级 互不联动）
 */

import { z } from 'zod';

// ======================== 角色编码（统一） ========================
// 全系统唯一角色枚举，替代 onboardingStore 的 PH/DR/PR/NT
export const MerchantRoleEnum = z.enum([
  'PHARMACY',     // 药房
  'DOCTOR',       // 医生
  'PHARMACIST',   // 药师
  'NUTRITIONIST', // 营养师
  'HEALTH_MANAGER', // 健康管理师
]);
export type MerchantRole = z.infer<typeof MerchantRoleEnum>;

export const ROLE_LABEL: Record<MerchantRole, string> = {
  PHARMACY: '药房',
  DOCTOR: '医生',
  PHARMACIST: '药师',
  NUTRITIONIST: '营养师',
  HEALTH_MANAGER: '健康管理师',
};

export const ROLE_COLOR: Record<MerchantRole, string> = {
  PHARMACY: 'blue',
  DOCTOR: 'green',
  PHARMACIST: 'purple',
  NUTRITIONIST: 'orange',
  HEALTH_MANAGER: 'cyan',
};

// 旧角色编码 → 新角色编码 映射（向后兼容）
export const LEGACY_ROLE_MAP: Record<string, MerchantRole> = {
  PH: 'PHARMACY',
  DR: 'DOCTOR',
  PR: 'PHARMACIST',
  NT: 'NUTRITIONIST',
  HM: 'HEALTH_MANAGER',
};

/**
 * 将旧编码转换到统一角色编码
 */
export function normalizeRole(role: string): MerchantRole {
  // 如果是统一编码，直接转换
  if (MerchantRoleEnum.safeParse(role).success) return role as MerchantRole;
  // 尝试旧编码映射
  const mapped = LEGACY_ROLE_MAP[role];
  if (mapped) return mapped;
  // 尝试大小写不敏感匹配
  const upper = role.toUpperCase();
  if (MerchantRoleEnum.safeParse(upper).success) return upper as MerchantRole;
  if (LEGACY_ROLE_MAP[upper]) return LEGACY_ROLE_MAP[upper];
  throw new Error(`Unknown role: ${role}`);
}

// ======================== 统一生命周期状态机（全14态） ========================
/**
 * 商家/成员从入驻申请到运营的完整状态流转
 * 
 * 申请阶段：DRAFT → PENDING → INFO_APPROVED → CERT_APPROVED → APPROVED
 * 签约阶段：APPROVED → SIGNING → SIGNED
 * 运营阶段：SIGNED → ONLINE ⇄ FROZEN
 * 异常阶段：PENDING → NEED_SUPPLEMENT / REJECTED
 * 撤回：   DRAFT/PENDING → WITHDRAWN
 */
export const MerchantLifecycleStatusEnum = z.enum([
  'DRAFT',           // 草稿
  'PENDING',         // 待审核
  'INFO_APPROVED',   // 信息审核通过
  'CERT_APPROVED',   // 资质审核通过
  'NEED_SUPPLEMENT', // 需补充材料
  'REJECTED',        // 已驳回
  'APPROVED',        // 审核通过（待签约）
  'SIGNING',         // 签约中
  'SIGNED',          // 已签约
  'ONLINE',          // 已上线
  'FROZEN',          // 已冻结
  'WITHDRAWN',       // 已撤回
]);
export type MerchantLifecycleStatus = z.infer<typeof MerchantLifecycleStatusEnum>;

export const STATUS_LABEL: Record<MerchantLifecycleStatus, string> = {
  DRAFT: '草稿',
  PENDING: '待审核',
  INFO_APPROVED: '信息已审',
  CERT_APPROVED: '资质已审',
  NEED_SUPPLEMENT: '需补充',
  REJECTED: '已驳回',
  APPROVED: '审核通过',
  SIGNING: '签约中',
  SIGNED: '已签约',
  ONLINE: '已上线',
  FROZEN: '已冻结',
  WITHDRAWN: '已撤回',
};

export const STATUS_COLOR: Record<MerchantLifecycleStatus, string> = {
  DRAFT: 'default',
  PENDING: 'processing',
  INFO_APPROVED: 'blue',
  CERT_APPROVED: 'geekblue',
  NEED_SUPPLEMENT: 'warning',
  REJECTED: 'error',
  APPROVED: 'cyan',
  SIGNING: 'purple',
  SIGNED: 'magenta',
  ONLINE: 'success',
  FROZEN: 'default',
  WITHDRAWN: 'default',
};

/**
 * 合法状态转换表
 * Key: 当前状态, Value: 可转换到的目标状态列表
 */
export const STATUS_TRANSITIONS: Record<MerchantLifecycleStatus, MerchantLifecycleStatus[]> = {
  DRAFT:           ['PENDING', 'WITHDRAWN'],
  PENDING:         ['INFO_APPROVED', 'CERT_APPROVED', 'NEED_SUPPLEMENT', 'REJECTED', 'WITHDRAWN'],
  INFO_APPROVED:   ['CERT_APPROVED', 'NEED_SUPPLEMENT', 'REJECTED'],
  CERT_APPROVED:   ['APPROVED', 'NEED_SUPPLEMENT', 'REJECTED'],
  NEED_SUPPLEMENT: ['PENDING'],  // 补充后重新提交
  REJECTED:        [],           // 终态，不可恢复
  APPROVED:        ['SIGNING', 'FROZEN', 'ONLINE'],        // ONLINE 容错：允许跳过签约直接上线
  SIGNING:         ['SIGNED', 'FROZEN', 'REJECTED', 'ONLINE'], // ONLINE 容错
  SIGNED:          ['ONLINE', 'FROZEN'],
  ONLINE:          ['FROZEN'],
  FROZEN:          ['ONLINE', 'SIGNED', 'APPROVED'],  // 解冻恢复
  WITHDRAWN:       [],  // 终态
};

/**
 * 校验状态转换是否合法
 */
export function canTransition(from: MerchantLifecycleStatus, to: MerchantLifecycleStatus): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

// ======================== 实体类型 ========================
export const EntityTypeEnum = z.enum(['INSTITUTION', 'INDIVIDUAL']);
export type EntityType = z.infer<typeof EntityTypeEnum>;

// ======================== 证照信息 ========================
export const CertificateSchema = z.object({
  id: z.string(),
  certNo: z.string(),
  type: z.enum([
    'BUSINESS_LICENSE',   // 营业执照
    'MEDICAL_LICENSE',    // 医疗机构许可证
    'PHARMACIST_CERT',    // 药剂师资格证
    'DOCTOR_CERT',        // 医师资格证
    'NUTRITIONIST_CERT',  // 营养师资格证
    'HEALTH_MANAGER_CERT', // 健康管理师资格证
    'FOOD_LICENSE',       // 食品经营许可证
    'ICP_LICENSE',        // ICP许可证
    'GSP_CERT',           // GSP认证
    'ID_CARD',            // 身份证
  ]),
  name: z.string(),
  fileUrl: z.string().optional(),
  status: z.enum(['pending', 'valid', 'expired', 'invalid']),
  expireAt: z.number().optional(),  // 过期时间戳
  issuedAt: z.number().optional(),  // 颁发时间
  issuer: z.string().optional(),    // 颁发机构
  notes: z.string().optional(),
});
export type Certificate = z.infer<typeof CertificateSchema>;

export const CERT_TYPE_LABEL: Record<string, string> = {
  BUSINESS_LICENSE: '营业执照',
  MEDICAL_LICENSE: '医疗机构许可证',
  PHARMACIST_CERT: '药剂师资格证',
  DOCTOR_CERT: '医师资格证',
  NUTRITIONIST_CERT: '营养师资格证',
  HEALTH_MANAGER_CERT: '健康管理师资格证',
  FOOD_LICENSE: '食品经营许可证',
  ICP_LICENSE: 'ICP许可证',
  GSP_CERT: 'GSP认证',
  ID_CARD: '身份证',
};

// 入驻中文证照标签 → 统一枚举值（用于 onboardToMerchant 转换）
export const CERT_LABEL_TO_ENUM: Record<string, string> = {
  '营业执照': 'BUSINESS_LICENSE',
  '药品经营许可证': 'MEDICAL_LICENSE',
  'GSP证书': 'GSP_CERT',
  '法人身份证': 'ID_CARD',
  '执业医师资格证': 'DOCTOR_CERT',
  '执业药师资格证': 'PHARMACIST_CERT',
  '营养师资格证': 'NUTRITIONIST_CERT',
  '健康管理师资格证': 'HEALTH_MANAGER_CERT',
  '身份证': 'ID_CARD',
  '食品经营许可证': 'FOOD_LICENSE',
  'ICP许可证': 'ICP_LICENSE',
};

export function mapCertLabelToEnum(label: string): string {
  return CERT_LABEL_TO_ENUM[label] || 'ID_CARD';
}

// ======================== 状态变更记录 ========================
export const StatusChangeSchema = z.object({
  id: z.string(),
  from: MerchantLifecycleStatusEnum,
  to: MerchantLifecycleStatusEnum,
  at: z.number(),
  operator: z.string(),
  note: z.string().optional(),
});
export type StatusChange = z.infer<typeof StatusChangeSchema>;

// ======================== 审核日志 ========================
export const ReviewLogSchema = z.object({
  id: z.string(),
  step: z.string(),       // 'info_review' | 'cert_review'
  result: z.enum(['ok', 'fix', 'insufficient', 'N/A']),
  reviewedBy: z.string(),
  reviewedAt: z.number(),
  comment: z.string().optional(),
});
export type ReviewLog = z.infer<typeof ReviewLogSchema>;

// ======================== 合同信息 ========================
export const ContractDataSchema = z.object({
  contractId: z.string(),
  contractNo: z.string().optional(),
  signedAt: z.number().optional(),
  contractUrl: z.string().optional(),
  validFrom: z.number().optional(),
  validTo: z.number().optional(),
  status: z.enum(['pending', 'sent', 'signed', 'expired', 'terminated']),
});
export type ContractData = z.infer<typeof ContractDataSchema>;

// ======================== 评级信息 ========================
export const RatingSchema = z.object({
  level: z.enum(['DEFAULT', 'S', 'A', 'B', 'C', 'D']),
  score: z.number(),
  serviceScore: z.number(),
  qualityScore: z.number(),
  fulfillmentRate: z.number(),
  totalOrders: z.number(),
  ratedAt: z.number().optional(),
});
export type Rating = z.infer<typeof RatingSchema>;

export const RATING_LABEL: Record<string, string> = {
  DEFAULT: '未评级', S: 'S级', A: 'A级', B: 'B级', C: 'C级', D: 'D级',
};
export const RATING_COLOR: Record<string, string> = {
  DEFAULT: 'default', S: 'purple', A: 'blue', B: 'green', C: 'orange', D: 'red',
};

// ======================== 统一商家实体 ========================
/**
 * 全系统唯一的商家/成员实体
 * 覆盖入驻申请、管理页、证照中心、合同管理、商家评级 所有模块的数据需求
 */
export const MerchantEntitySchema = z.object({
  // === 系统标识 ===
  id: z.string(),
  applyNo: z.string(),           // 申请编号
  role: MerchantRoleEnum,         // 角色类型（统一编码）

  // === 入驻生命周期 ===
  lifecycleStatus: MerchantLifecycleStatusEnum,
  entityType: EntityTypeEnum,
  statusHistory: z.array(StatusChangeSchema).default([]),
  reviewLogs: z.array(ReviewLogSchema).default([]),

  // === 基本信息（所有角色共用） ===
  name: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  gender: z.enum(['M', 'F']).optional(),
  idCard: z.string().optional(),

  // === 机构信息（药房/机构类角色） ===
  company: z.string().optional(),
  businessScope: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),

  // === 专业信息（医生/药师/营养师） ===
  department: z.string().optional(),
  title: z.string().optional(),
  specialties: z.array(z.string()).default([]),

  // === 药师特定 ===
  licenseNo: z.string().optional(),
  boundPharmacyId: z.string().optional(),
  boundPharmacyName: z.string().optional(),

  // === 证照 ===
  certificates: z.array(CertificateSchema).default([]),

  // === 合同 ===
  contract: ContractDataSchema.optional(),

  // === 评级 ===
  rating: RatingSchema.optional(),

  // === 运营数据 ===
  totalOrders: z.number().default(0),
  totalRevenue: z.number().default(0),

  // === 时间戳 ===
  submittedAt: z.number(),
  joinedAt: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type MerchantEntity = z.infer<typeof MerchantEntitySchema>;

// ======================== CRUD 输入 ========================
export const CreateMerchantInputSchema = MerchantEntitySchema.pick({
  role: true,
  entityType: true,
  name: true,
  phone: true,
  email: true,
  gender: true,
  idCard: true,
  company: true,
  businessScope: true,
  province: true,
  city: true,
  district: true,
  address: true,
  department: true,
  title: true,
  specialties: true,
  licenseNo: true,
  boundPharmacyId: true,
  boundPharmacyName: true,
  certificates: true,
}).partial({
  email: true,
  gender: true,
  idCard: true,
  company: true,
  businessScope: true,
  province: true,
  city: true,
  district: true,
  address: true,
  department: true,
  title: true,
  specialties: true,
  licenseNo: true,
  boundPharmacyId: true,
  boundPharmacyName: true,
  certificates: true,
}).extend({
  source: z.enum(['apply', 'admin_add']).default('apply'),
});

export type CreateMerchantInput = z.infer<typeof CreateMerchantInputSchema>;

export const UpdateMerchantInputSchema = CreateMerchantInputSchema.partial().extend({
  id: z.string(),
});
export type UpdateMerchantInput = z.infer<typeof UpdateMerchantInputSchema>;

// ======================== 按角色获取必填证照类型 ========================
export function getRequiredCertsForRole(role: MerchantRole): string[] {
  switch (role) {
    case 'PHARMACY':
      return ['BUSINESS_LICENSE', 'MEDICAL_LICENSE', 'GSP_CERT', 'FOOD_LICENSE'];
    case 'DOCTOR':
      return ['DOCTOR_CERT', 'ID_CARD'];
    case 'PHARMACIST':
      return ['PHARMACIST_CERT', 'ID_CARD'];
    case 'NUTRITIONIST':
      return ['NUTRITIONIST_CERT', 'ID_CARD'];
    case 'HEALTH_MANAGER':
      return ['HEALTH_MANAGER_CERT', 'ID_CARD'];
  }
}

// ======================== 按角色获取表单字段配置 ========================
export interface RoleFieldConfig {
  label: string;
  fields: {
    key: string;
    label: string;
    required: boolean;
    type: 'text' | 'select' | 'phone' | 'email' | 'idcard' | 'textarea' | 'cert_upload' | 'multi_select';
    options?: { value: string; label: string }[];
    placeholder?: string;
  }[];
}

export function getRoleFieldConfig(role: MerchantRole): RoleFieldConfig {
  const baseFields = [
    { key: 'name', label: '名称', required: true, type: 'text' as const, placeholder: '个人姓名/机构名称' },
    { key: 'phone', label: '联系电话', required: true, type: 'phone' as const, placeholder: '手机号' },
    { key: 'email', label: '电子邮箱', required: false, type: 'email' as const },
    { key: 'idCard', label: '身份证号', required: false, type: 'idcard' as const },
    { key: 'gender', label: '性别', required: false, type: 'select' as const, options: [{ value: 'M', label: '男' }, { value: 'F', label: '女' }] },
  ];

  switch (role) {
    case 'PHARMACY':
      return {
        label: '药房',
        fields: [
          ...baseFields.map(f => ({ ...f, label: f.key === 'name' ? '药房名称' : f.label })),
          { key: 'company', label: '统一社会信用代码', required: true, type: 'text' as const },
          { key: 'licenseNo', label: '药品经营许可证号', required: true, type: 'text' as const },
          { key: 'businessScope', label: '经营范围', required: true, type: 'textarea' as const },
          { key: 'province', label: '所在省份', required: true, type: 'select' as const },
          { key: 'city', label: '所在城市', required: true, type: 'select' as const },
          { key: 'district', label: '所在区县', required: false, type: 'select' as const },
          { key: 'address', label: '详细地址', required: true, type: 'text' as const },
          { key: 'certificates', label: '证照上传', required: true, type: 'cert_upload' as const },
        ],
      };
    case 'DOCTOR':
      return {
        label: '医生',
        fields: [
          ...baseFields,
          { key: 'department', label: '所在科室', required: true, type: 'select' as const },
          { key: 'title', label: '职称', required: true, type: 'select' as const, 
            options: [
              { value: '主任医师', label: '主任医师' }, { value: '副主任医师', label: '副主任医师' },
              { value: '主治医师', label: '主治医师' }, { value: '住院医师', label: '住院医师' },
            ] },
          { key: 'specialties', label: '擅长领域', required: false, type: 'multi_select' as const },
          { key: 'company', label: '执业机构', required: true, type: 'text' as const },
          { key: 'province', label: '所在省份', required: true, type: 'select' as const },
          { key: 'city', label: '所在城市', required: true, type: 'select' as const },
          { key: 'certificates', label: '证照上传', required: true, type: 'cert_upload' as const },
        ],
      };
    case 'PHARMACIST':
      return {
        label: '药师',
        fields: [
          ...baseFields,
          { key: 'licenseNo', label: '执业药师注册证号', required: true, type: 'text' as const },
          { key: 'company', label: '所属药房', required: true, type: 'text' as const, placeholder: '绑定的药房名称' },
          { key: 'province', label: '所在省份', required: true, type: 'select' as const },
          { key: 'city', label: '所在城市', required: true, type: 'select' as const },
          { key: 'certificates', label: '证照上传', required: true, type: 'cert_upload' as const },
        ],
      };
    case 'NUTRITIONIST':
      return {
        label: '营养师',
        fields: [
          ...baseFields,
          { key: 'title', label: '专业资质', required: true, type: 'select' as const,
            options: [
              { value: '注册营养师', label: '注册营养师' },
              { value: '公共营养师', label: '公共营养师' },
              { value: '临床营养师', label: '临床营养师' },
              { value: '运动营养师', label: '运动营养师' },
            ] },
          { key: 'specialties', label: '擅长领域', required: false, type: 'multi_select' as const },
          { key: 'company', label: '执业机构', required: false, type: 'text' as const },
          { key: 'certificates', label: '证照上传', required: true, type: 'cert_upload' as const },
        ],
      };
    case 'HEALTH_MANAGER':
      return {
        label: '健康管理师',
        fields: [
          ...baseFields,
          { key: 'title', label: '专业资质', required: true, type: 'select' as const,
            options: [
              { value: '高级健康管理师', label: '高级健康管理师' },
              { value: '健康管理师', label: '健康管理师' },
              { value: '助理健康管理师', label: '助理健康管理师' },
            ] },
          { key: 'specialties', label: '擅长领域', required: false, type: 'multi_select' as const,
            options: [
              { value: '体重管理', label: '体重管理' },
              { value: '慢病管理', label: '慢病管理' },
              { value: '营养指导', label: '营养指导' },
              { value: '运动指导', label: '运动指导' },
              { value: '心理健康', label: '心理健康' },
            ] },
          { key: 'company', label: '执业机构', required: false, type: 'text' as const },
          { key: 'certificates', label: '证照上传', required: true, type: 'cert_upload' as const },
        ],
      };
  }
}

// ======================== 入驻申请表单（与 OnboardingApplyPage 对齐） ========================
export const OnboardingFormSchema = z.object({
  role: MerchantRoleEnum,
  entityType: EntityTypeEnum,
  name: z.string().min(1, '名称不能为空'),
  phone: z.string().regex(/^1\d{10}$/, '手机号格式不正确'),
  email: z.string().email().optional().or(z.literal('')),
  gender: z.enum(['M', 'F']).optional(),
  idCard: z.string().optional(),
  company: z.string().optional(),
  licenseNo: z.string().optional(),
  businessScope: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  title: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  certificates: z.array(CertificateSchema).default([]),
  source: z.enum(['apply', 'admin_add']).default('apply'),
});
export type OnboardingFormData = z.infer<typeof OnboardingFormSchema>;
