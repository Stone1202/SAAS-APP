/**
 * SugarMate 在线问诊 仿真数据集 V1.0.0
 *
 * 覆盖全状态快照，支持端到端业务流程演示
 * 数据通过 IndexedDB 'consultation-sim' 数据库持久化
 *
 * 数据集规格:
 *   - 10位医生（5科室）
 *   - 20个问诊订单（覆盖SM-CON-01全部21状态）
 *   - 15个处方（覆盖SM-03全部10状态）
 *   - 30+条问诊消息（3个完整对话）
 *   - 5个药房+比价
 *   - 3个患者健康档案
 *   - 8个问诊后推荐
 */
import type {
  ConsultationServiceSku,
  ConsultationOrder,
  ConsultationMessage,
  Prescription,
  PatientHealthArchive,
  ArchiveAuthorization,
  PostConsultRecommend,
  DoctorProfile,
  PharmacyPrice,
  Evaluation,
} from '../../contracts/consultation';
import type { ConsultationOrderState, PrescriptionState } from '../../contracts/state-machine/core';

// ============================================================
// §1 医生池（10位·5科室）
// ============================================================

export const MOCK_DOCTORS: DoctorProfile[] = [
  {
    id: 'doc-001', name: '张明', avatar: '/avatars/doc-001.png',
    title: '主任医师', hospital: '浙江大学附属第一医院', department: '内分泌科',
    specializations: ['糖尿病管理', '甲状腺疾病', '代谢综合征'],
    rating: 4.9, order_count: 2847, response_time_avg: 8,
    bio: '从事内分泌科临床工作25年，擅长糖尿病及其并发症的综合管理',
    phone: '13800002222', // 关联 merchantStore MR-002
    services: [
      { id: 'sku-001-01', doctor_id: 'doc-001', doctor_name: '张明', title: '糖尿病管理图文问诊', description: '血糖异常、药物调整、并发症咨询', mode: 'TEXT_IMAGE', price: 6800, urgency_surcharge: 2000, response_time_minutes: 15, department: '内分泌科', tags: ['糖尿病', '血糖管理', '药物调整'], status: 'APPROVED', rating: 4.9, order_count: 2847, created_at: 1700000000, updated_at: 1720000000 },
      { id: 'sku-001-02', doctor_id: 'doc-001', doctor_name: '张明', title: '紧急问诊（加急）', description: '血糖危急值、急症咨询', mode: 'TEXT_IMAGE', price: 12800, urgency_surcharge: 0, response_time_minutes: 5, department: '内分泌科', tags: ['紧急问诊', '危急值'], status: 'APPROVED', rating: 4.8, order_count: 412, created_at: 1710000000, updated_at: 1720000000 },
    ],
  },
  {
    id: 'doc-002', name: '李华', avatar: '/avatars/doc-002.png',
    title: '副主任医师', hospital: '上海市第六人民医院', department: '内分泌科',
    specializations: ['妊娠糖尿病', '多囊卵巢综合征', '青少年糖尿病'],
    rating: 4.7, order_count: 1532, response_time_avg: 12,
    bio: '专注妊娠合并内分泌疾病研究15年，擅长妊娠糖尿病全程管理',
    phone: '13800002223',
    services: [
      { id: 'sku-002-01', doctor_id: 'doc-002', doctor_name: '李华', title: '妊娠糖尿病咨询', description: '孕期血糖管理、饮食指导、胰岛素调整', mode: 'TEXT_IMAGE', price: 5800, urgency_surcharge: 1000, response_time_minutes: 20, department: '内分泌科', tags: ['妊娠糖尿病', '孕期管理'], status: 'APPROVED', rating: 4.7, order_count: 1532, created_at: 1700000000, updated_at: 1720000000 },
    ],
  },
  {
    id: 'doc-003', name: '王强', avatar: '/avatars/doc-003.png',
    title: '主任医师', hospital: '北京协和医院', department: '心血管内科',
    specializations: ['糖尿病合并心血管病', '高血压', '冠心病'],
    rating: 4.8, order_count: 2100, response_time_avg: 10,
    bio: '心内科专家，擅长糖尿病合并心血管并发症的综合管理',
    services: [
      { id: 'sku-003-01', doctor_id: 'doc-003', doctor_name: '王强', title: '心血管+糖尿病综合问诊', description: '糖尿病合并高血压/冠心病患者的药物调整和生活方式指导', mode: 'TEXT_IMAGE', price: 8800, urgency_surcharge: 2000, response_time_minutes: 15, department: '心血管内科', tags: ['心血管', '糖尿病', '高血压'], status: 'APPROVED', rating: 4.8, order_count: 2100, created_at: 1700000000, updated_at: 1720000000 },
    ],
  },
  {
    id: 'doc-004', name: '刘芳', avatar: '/avatars/doc-004.png',
    title: '主任营养师', hospital: '中国营养学会', department: '临床营养科',
    specializations: ['糖尿病饮食管理', '体重管理', '肠内营养'],
    rating: 4.6, order_count: 1890, response_time_avg: 15,
    bio: '临床营养师20年经验，擅长糖尿病患者的个性化饮食方案设计',
    services: [
      { id: 'sku-004-01', doctor_id: 'doc-004', doctor_name: '刘芳', title: '糖尿病饮食管理咨询', description: '个性化饮食方案、食物GI值指导、血糖与饮食关系分析', mode: 'TEXT_IMAGE', price: 3800, urgency_surcharge: 0, response_time_minutes: 30, department: '临床营养科', tags: ['饮食管理', '营养', 'GI值'], status: 'APPROVED', rating: 4.6, order_count: 1890, created_at: 1700000000, updated_at: 1720000000 },
    ],
  },
  {
    id: 'doc-005', name: '陈伟', avatar: '/avatars/doc-005.png',
    title: '副主任医师', hospital: '广东省中医院', department: '内分泌科',
    specializations: ['中西医结合糖尿病管理', '糖尿病足', '周围神经病变'],
    rating: 4.5, order_count: 1200, response_time_avg: 18,
    bio: '中西医结合糖尿病管理专家，注重从饮食、运动、情志多维度管理',
    services: [
      { id: 'sku-005-01', doctor_id: 'doc-005', doctor_name: '陈伟', title: '中西医结合糖尿病管理', description: '中药调理+西药管理+生活方式指导', mode: 'TEXT_IMAGE', price: 6800, urgency_surcharge: 1000, response_time_minutes: 20, department: '内分泌科', tags: ['中西医结合', '糖尿病'], status: 'APPROVED', rating: 4.5, order_count: 1200, created_at: 1700000000, updated_at: 1720000000 },
    ],
  },
  {
    id: 'doc-006', name: '赵敏', avatar: '/avatars/doc-006.png',
    title: '主任医师', hospital: '复旦大学附属华山医院', department: '眼科',
    specializations: ['糖尿病视网膜病变', '黄斑病变', '白内障'],
    rating: 4.9, order_count: 980, response_time_avg: 10,
    bio: '眼科专家，专注糖尿病眼部并发症的早期筛查和干预',
    services: [
      { id: 'sku-006-01', doctor_id: 'doc-006', doctor_name: '赵敏', title: '糖尿病眼病咨询', description: '视网膜病变筛查报告解读、治疗方案咨询', mode: 'TEXT_IMAGE', price: 5800, urgency_surcharge: 1000, response_time_minutes: 20, department: '眼科', tags: ['视网膜病变', '眼病', '筛查'], status: 'APPROVED', rating: 4.9, order_count: 980, created_at: 1700000000, updated_at: 1720000000 },
    ],
  },
  {
    id: 'doc-007', name: '孙涛', avatar: '/avatars/doc-007.png',
    title: '副主任医师', hospital: '华西医院', department: '足病科',
    specializations: ['糖尿病足', '伤口护理', '周围神经病变'],
    rating: 4.7, order_count: 760, response_time_avg: 12,
    bio: '糖尿病足病专家，擅长糖尿病足溃疡的远程评估和指导',
    services: [
      { id: 'sku-007-01', doctor_id: 'doc-007', doctor_name: '孙涛', title: '糖尿病足远程评估', description: '足部照片上传+专业评估+护理指导', mode: 'TEXT_IMAGE', price: 4800, urgency_surcharge: 1500, response_time_minutes: 15, department: '足病科', tags: ['糖尿病足', '伤口护理'], status: 'APPROVED', rating: 4.7, order_count: 760, created_at: 1700000000, updated_at: 1720000000 },
    ],
  },
  {
    id: 'doc-008', name: '周洁', avatar: '/avatars/doc-008.png',
    title: '主任药师', hospital: '浙江大学附属第二医院', department: '药学科',
    specializations: ['糖尿病用药指导', '药物相互作用评估', '处方审核'],
    rating: 4.6, order_count: 540, response_time_avg: 15,
    bio: '临床药学专家，擅长糖尿病用药方案的审核和优化',
    services: [
      { id: 'sku-008-01', doctor_id: 'doc-008', doctor_name: '周洁', title: '糖尿病用药指导', description: '药物方案审核、副作用评估、用药时间优化', mode: 'TEXT_IMAGE', price: 2800, urgency_surcharge: 0, response_time_minutes: 30, department: '药学科', tags: ['用药指导', '药物评估', '处方审核'], status: 'APPROVED', rating: 4.6, order_count: 540, created_at: 1700000000, updated_at: 1720000000 },
    ],
  },
  {
    id: 'doc-009', name: '吴建', avatar: '/avatars/doc-009.png',
    title: '主治医师', hospital: '华中科技大学附属同济医院', department: '内分泌科',
    specializations: ['1型糖尿病', '胰岛素泵', '动态血糖监测'],
    rating: 4.4, order_count: 680, response_time_avg: 20,
    bio: '专注1型糖尿病和胰岛素泵治疗，年轻的内分泌科新锐',
    services: [
      { id: 'sku-009-01', doctor_id: 'doc-009', doctor_name: '吴建', title: '1型糖尿病管理', description: '胰岛素泵调整、CGM数据解读、生活方式指导', mode: 'TEXT_IMAGE', price: 5800, urgency_surcharge: 1000, response_time_minutes: 20, department: '内分泌科', tags: ['1型糖尿病', '胰岛素泵', 'CGM'], status: 'APPROVED', rating: 4.4, order_count: 680, created_at: 1700000000, updated_at: 1720000000 },
    ],
  },
  {
    id: 'doc-010', name: '林静', avatar: '/avatars/doc-010.png',
    title: '主任医师', hospital: '中山大学附属第一医院', department: '内分泌科',
    specializations: ['老年糖尿病', '多重用药管理', '社区慢病管理'],
    rating: 4.8, order_count: 3100, response_time_avg: 10,
    bio: '老年糖尿病管理专家，擅长合并多种慢性病的综合管理',
    services: [
      { id: 'sku-010-01', doctor_id: 'doc-010', doctor_name: '林静', title: '老年糖尿病综合管理', description: '多重用药协调、并发症筛查、社区慢病管理', mode: 'TEXT_IMAGE', price: 6800, urgency_surcharge: 2000, response_time_minutes: 15, department: '内分泌科', tags: ['老年糖尿病', '多重用药', '慢病管理'], status: 'APPROVED', rating: 4.8, order_count: 3100, created_at: 1700000000, updated_at: 1720000000 },
      { id: 'sku-010-02', doctor_id: 'doc-010', doctor_name: '林静', title: '慢病随访管理', description: '定期随访+血糖趋势分析+方案调整', mode: 'TEXT_IMAGE', price: 4800, urgency_surcharge: 0, response_time_minutes: 30, department: '内分泌科', tags: ['慢病管理', '随访'], status: 'APPROVED', rating: 4.7, order_count: 980, created_at: 1710000000, updated_at: 1720000000 },
    ],
  },
];

// ============================================================
// §2 问诊订单快照（覆盖SM-CON-01全状态）
// ============================================================

function now(daysAgo = 0, hoursAgo = 0): number {
  return Date.now() - daysAgo * 86400000 - hoursAgo * 3600000;
}

export const MOCK_CONSULTATION_ORDERS: ConsultationOrder[] = [
  // --- 标准完整流程 ---
  {
    id: 'con-001', service_order_id: 'srv-001', doctor_id: 'doc-001', patient_id: 'cus-001', patient_name: '王建国', sku_id: 'sku-001-01',
    status: 'EVALUATED' as ConsultationOrderState, mode: 'TEXT_IMAGE', urgency: 'NORMAL', urgency_surcharge: 0, price: 6800, paid_amount: 6800,
    recommend_ids: ['rec-001'],
    timeline: [
      { time: now(3, 0), from: 'CREATED', to: 'PAID', operator: 'PATIENT', remark: '微信支付成功' },
      { time: now(3, 0), from: 'PAID', to: 'PENDING_ACCEPT', operator: 'SYSTEM', remark: '资金托管中' },
      { time: now(3, 0), from: 'PENDING_ACCEPT', to: 'ACCEPTED', operator: 'DOCTOR', remark: '张明医生接诊' },
      { time: now(2, 23), from: 'ACCEPTED', to: 'IN_CONSULT', operator: 'SYSTEM', remark: '开始问诊' },
      { time: now(2, 22), from: 'IN_CONSULT', to: 'PENDING_PRESCRIPTION', operator: 'DOCTOR', remark: '正在开具处方' },
      { time: now(2, 22), from: 'PENDING_PRESCRIPTION', to: 'PRESCRIPTION_SUBMITTED', operator: 'DOCTOR', remark: '处方已开具·二甲双胍0.5g tid' },
      { time: now(2, 21), from: 'PRESCRIPTION_SUBMITTED', to: 'PRESCRIPTION_SIGNED', operator: 'CA_SYSTEM', remark: 'CA电子签名完成' },
      { time: now(2, 21), from: 'PRESCRIPTION_SIGNED', to: 'PRESCRIPTION_APPROVED', operator: 'PHARMACIST', remark: '药师审核通过' },
      { time: now(2, 20), from: 'PRESCRIPTION_APPROVED', to: 'RX_AWAITING_PATIENT', operator: 'SYSTEM', remark: '推送患者确认' },
      { time: now(2, 19), from: 'RX_AWAITING_PATIENT', to: 'RX_PATIENT_ACCEPTED', operator: 'PATIENT', remark: '患者同意处方' },
      { time: now(2, 19), from: 'RX_PATIENT_ACCEPTED', to: 'PRESCRIPTION_FLOWING', operator: 'SYSTEM', remark: '处方流转·推送XX大药房' },
      { time: now(2, 18), from: 'PRESCRIPTION_FLOWING', to: 'IN_CONSULT', operator: 'DOCTOR', remark: '继续问诊' },
      { time: now(2, 17), from: 'IN_CONSULT', to: 'WAITING_PATIENT_CONFIRM', operator: 'DOCTOR', remark: '问诊完结·请确认' },
      { time: now(2, 16), from: 'WAITING_PATIENT_CONFIRM', to: 'PATIENT_CONFIRMED', operator: 'PATIENT', remark: '患者确认' },
      { time: now(2, 16), from: 'PATIENT_CONFIRMED', to: 'RECOMMENDATION_SHOWN', operator: 'SYSTEM', remark: '推荐引擎生成' },
      { time: now(2, 15), from: 'RECOMMENDATION_SHOWN', to: 'EVALUATED', operator: 'PATIENT', remark: '五星好评' },
    ],
    created_at: now(3, 0), updated_at: now(2, 15),
  },

  // --- 等待接诊 ---
  {
    id: 'con-002', service_order_id: 'srv-002', doctor_id: 'doc-002', patient_id: 'cus-001', patient_name: '王建国', sku_id: 'sku-002-01',
    status: 'PENDING_ACCEPT' as ConsultationOrderState, mode: 'TEXT_IMAGE', urgency: 'NORMAL', price: 5800, urgency_surcharge: 0, paid_amount: 5800,
    recommend_ids: [],
    accept_deadline: now(0, -24), timeline: [
      { time: now(0, 2), from: 'CREATED', to: 'PAID', operator: 'PATIENT' },
      { time: now(0, 2), from: 'PAID', to: 'PENDING_ACCEPT', operator: 'SYSTEM' },
    ],
    created_at: now(0, 2), updated_at: now(0, 2),
  },

  // --- 问诊对话中 ---
  {
    id: 'con-003', service_order_id: 'srv-003', doctor_id: 'doc-001', patient_id: 'cus-002', patient_name: '李秀英', sku_id: 'sku-001-01',
    status: 'IN_CONSULT' as ConsultationOrderState, mode: 'TEXT_IMAGE', urgency: 'NORMAL', price: 6800, urgency_surcharge: 0, paid_amount: 6800,
    recommend_ids: [],
    timeline: [
      { time: now(0, 3), from: 'CREATED', to: 'PAID', operator: 'PATIENT' },
      { time: now(0, 3), from: 'PAID', to: 'PENDING_ACCEPT', operator: 'SYSTEM' },
      { time: now(0, 2), from: 'PENDING_ACCEPT', to: 'ACCEPTED', operator: 'DOCTOR' },
      { time: now(0, 2), from: 'ACCEPTED', to: 'IN_CONSULT', operator: 'SYSTEM' },
    ],
    created_at: now(0, 3), updated_at: now(0, 1),
  },

  // --- 处方待患者确认 ---
  {
    id: 'con-004', service_order_id: 'srv-004', doctor_id: 'doc-003', patient_id: 'cus-002', patient_name: '李秀英', sku_id: 'sku-003-01',
    status: 'RX_AWAITING_PATIENT' as ConsultationOrderState, mode: 'TEXT_IMAGE', urgency: 'NORMAL', price: 8800, urgency_surcharge: 0, paid_amount: 8800,
    prescription_id: 'rx-004', recommend_ids: [],
    timeline: [
      { time: now(1, 2), from: 'CREATED', to: 'PAID', operator: 'PATIENT' },
      { time: now(1, 2), from: 'PAID', to: 'PENDING_ACCEPT', operator: 'SYSTEM' },
      { time: now(1, 1), from: 'PENDING_ACCEPT', to: 'ACCEPTED', operator: 'DOCTOR' },
      { time: now(1, 1), from: 'ACCEPTED', to: 'IN_CONSULT', operator: 'SYSTEM' },
      { time: now(0, 6), from: 'IN_CONSULT', to: 'PENDING_PRESCRIPTION', operator: 'DOCTOR' },
      { time: now(0, 6), from: 'PENDING_PRESCRIPTION', to: 'PRESCRIPTION_SUBMITTED', operator: 'DOCTOR', remark: '开具阿托伐他汀钙片' },
      { time: now(0, 5), from: 'PRESCRIPTION_SUBMITTED', to: 'PRESCRIPTION_SIGNED', operator: 'CA_SYSTEM' },
      { time: now(0, 5), from: 'PRESCRIPTION_SIGNED', to: 'PRESCRIPTION_APPROVED', operator: 'PHARMACIST' },
      { time: now(0, 4), from: 'PRESCRIPTION_APPROVED', to: 'RX_AWAITING_PATIENT', operator: 'SYSTEM', remark: '等待患者确认·72h倒计时' },
    ],
    created_at: now(1, 2), updated_at: now(0, 4),
  },

  // --- 患者确认完结后待评价 ---
  {
    id: 'con-005', service_order_id: 'srv-005', doctor_id: 'doc-005', patient_id: 'cus-001', patient_name: '王建国', sku_id: 'sku-005-01',
    status: 'RECOMMENDATION_SHOWN' as ConsultationOrderState, mode: 'TEXT_IMAGE', urgency: 'NORMAL', price: 6800, urgency_surcharge: 0, paid_amount: 6800,
    timeline: [
      { time: now(2), from: 'CREATED', to: 'PAID', operator: 'PATIENT' },
      { time: now(2), from: 'PAID', to: 'PENDING_ACCEPT', operator: 'SYSTEM' },
      { time: now(2), from: 'PENDING_ACCEPT', to: 'ACCEPTED', operator: 'DOCTOR' },
      { time: now(2), from: 'ACCEPTED', to: 'IN_CONSULT', operator: 'SYSTEM' },
      { time: now(1, 22), from: 'IN_CONSULT', to: 'WAITING_PATIENT_CONFIRM', operator: 'DOCTOR' },
      { time: now(1, 20), from: 'WAITING_PATIENT_CONFIRM', to: 'PATIENT_CONFIRMED', operator: 'PATIENT' },
      { time: now(1, 20), from: 'PATIENT_CONFIRMED', to: 'RECOMMENDATION_SHOWN', operator: 'SYSTEM' },
    ],
    recommend_ids: ['rec-005'],
    created_at: now(2), updated_at: now(1, 20),
  },

  // --- SOS快速问诊·接诊中 ---
  {
    id: 'con-006', service_order_id: 'srv-006', doctor_id: 'doc-001', patient_id: 'cus-003', patient_name: '张晓明', sku_id: 'sku-001-02',
    status: 'IN_CONSULT' as ConsultationOrderState, mode: 'TEXT_IMAGE', urgency: 'SOS', price: 12800, urgency_surcharge: 0, paid_amount: 12800,
    recommend_ids: [],
    timeline: [
      { time: now(0, 0.5), from: 'CREATED', to: 'PAID', operator: 'SYSTEM', remark: 'SOS自动触发·CGM危急值' },
      { time: now(0, 0.5), from: 'PAID', to: 'PENDING_ACCEPT', operator: 'SYSTEM', remark: '广播推送所有在线医生' },
      { time: now(0, 0.4), from: 'PENDING_ACCEPT', to: 'ACCEPTED', operator: 'DOCTOR', remark: '张明医生紧急接诊' },
      { time: now(0, 0.4), from: 'ACCEPTED', to: 'IN_CONSULT', operator: 'SYSTEM' },
    ],
    created_at: now(0, 0.5), updated_at: now(0, 0.3),
  },

  // --- 48h超时退款 ---
  {
    id: 'con-007', service_order_id: 'srv-007', doctor_id: 'doc-004', patient_id: 'cus-002', patient_name: '李秀英', sku_id: 'sku-004-01',
    status: 'TIMEOUT_REFUNDED' as ConsultationOrderState, mode: 'TEXT_IMAGE', urgency: 'NORMAL', price: 3800, urgency_surcharge: 0, paid_amount: 3800,
    recommend_ids: [],
    timeline: [
      { time: now(5), from: 'CREATED', to: 'PAID', operator: 'PATIENT' },
      { time: now(5), from: 'PAID', to: 'PENDING_ACCEPT', operator: 'SYSTEM' },
      { time: now(3), from: 'PENDING_ACCEPT', to: 'TIMEOUT_REFUNDED', operator: 'SYSTEM', remark: '48小时无医生接诊·自动退款' },
    ],
    created_at: now(5), updated_at: now(3),
  },

  // --- 纠纷仲裁中 ---
  {
    id: 'con-008', service_order_id: 'srv-008', doctor_id: 'doc-006', patient_id: 'cus-001', patient_name: '王建国', sku_id: 'sku-006-01',
    status: 'ARBITRATING' as ConsultationOrderState, mode: 'TEXT_IMAGE', urgency: 'NORMAL', price: 5800, urgency_surcharge: 0, paid_amount: 5800,
    recommend_ids: [],
    timeline: [
      { time: now(4), from: 'CREATED', to: 'PAID', operator: 'PATIENT' },
      { time: now(4), from: 'PAID', to: 'PENDING_ACCEPT', operator: 'SYSTEM' },
      { time: now(4), from: 'PENDING_ACCEPT', to: 'ACCEPTED', operator: 'DOCTOR' },
      { time: now(4), from: 'ACCEPTED', to: 'IN_CONSULT', operator: 'SYSTEM' },
      { time: now(3, 22), from: 'IN_CONSULT', to: 'WAITING_PATIENT_CONFIRM', operator: 'DOCTOR' },
      { time: now(3, 20), from: 'WAITING_PATIENT_CONFIRM', to: 'DISPUTING', operator: 'PATIENT', remark: '对问诊质量不满意' },
      { time: now(3, 18), from: 'DISPUTING', to: 'ARBITRATING', operator: 'ADMIN', remark: '平台介入仲裁' },
    ],
    created_at: now(4), updated_at: now(3, 18),
  },

  // --- 处方患者拒绝·医生待修改 ---
  {
    id: 'con-009', service_order_id: 'srv-009', doctor_id: 'doc-009', patient_id: 'cus-003', patient_name: '张晓明', sku_id: 'sku-009-01',
    status: 'RX_PATIENT_REJECTED' as ConsultationOrderState, mode: 'TEXT_IMAGE', urgency: 'NORMAL', price: 5800, urgency_surcharge: 0, paid_amount: 5800,
    prescription_id: 'rx-009', recommend_ids: [],
    timeline: [
      { time: now(0, 8), from: 'CREATED', to: 'PAID', operator: 'PATIENT' },
      { time: now(0, 8), from: 'PAID', to: 'PENDING_ACCEPT', operator: 'SYSTEM' },
      { time: now(0, 7), from: 'PENDING_ACCEPT', to: 'ACCEPTED', operator: 'DOCTOR' },
      { time: now(0, 7), from: 'ACCEPTED', to: 'IN_CONSULT', operator: 'SYSTEM' },
      { time: now(0, 4), from: 'IN_CONSULT', to: 'PENDING_PRESCRIPTION', operator: 'DOCTOR' },
      { time: now(0, 4), from: 'PENDING_PRESCRIPTION', to: 'PRESCRIPTION_SUBMITTED', operator: 'DOCTOR' },
      { time: now(0, 3), from: 'PRESCRIPTION_SUBMITTED', to: 'PRESCRIPTION_SIGNED', operator: 'CA_SYSTEM' },
      { time: now(0, 3), from: 'PRESCRIPTION_SIGNED', to: 'PRESCRIPTION_APPROVED', operator: 'PHARMACIST' },
      { time: now(0, 2), from: 'PRESCRIPTION_APPROVED', to: 'RX_AWAITING_PATIENT', operator: 'SYSTEM' },
      { time: now(0, 1), from: 'RX_AWAITING_PATIENT', to: 'RX_PATIENT_REJECTED', operator: 'PATIENT', remark: '担心副作用·希望调整用法' },
    ],
    created_at: now(0, 8), updated_at: now(0, 1),
  },

  // --- 包月签约用户免下单问诊 ---
  {
    id: 'con-010', service_order_id: 'srv-010', doctor_id: 'doc-010', patient_id: 'cus-002', patient_name: '李秀英', sku_id: 'sku-010-02',
    status: 'IN_CONSULT' as ConsultationOrderState, mode: 'TEXT_IMAGE', urgency: 'NORMAL', price: 4800, urgency_surcharge: 0, paid_amount: 0,
    recommend_ids: [],
    timeline: [
      { time: now(0, 4), from: 'CREATED', to: 'PAID', operator: 'SYSTEM', remark: '签约用户免支付·权益次数-1' },
      { time: now(0, 4), from: 'PAID', to: 'PENDING_ACCEPT', operator: 'SYSTEM' },
      { time: now(0, 3), from: 'PENDING_ACCEPT', to: 'ACCEPTED', operator: 'DOCTOR' },
      { time: now(0, 3), from: 'ACCEPTED', to: 'IN_CONSULT', operator: 'SYSTEM' },
    ],
    created_at: now(0, 4), updated_at: now(0, 2),
  },

  // --- 更多状态覆盖 ---
  {
    id: 'con-011', service_order_id: 'srv-011', doctor_id: 'doc-007', patient_id: 'cus-001', patient_name: '王建国', sku_id: 'sku-007-01',
    status: 'PRESCRIPTION_FLOWING' as ConsultationOrderState, mode: 'TEXT_IMAGE', urgency: 'NORMAL', price: 4800, urgency_surcharge: 0, paid_amount: 4800,
    prescription_id: 'rx-011', recommend_ids: [],
    timeline: [
      { time: now(1), from: 'CREATED', to: 'PAID', operator: 'PATIENT' },
      { time: now(1), from: 'PAID', to: 'PENDING_ACCEPT', operator: 'SYSTEM' },
      { time: now(1), from: 'PENDING_ACCEPT', to: 'ACCEPTED', operator: 'DOCTOR' },
      { time: now(1), from: 'ACCEPTED', to: 'IN_CONSULT', operator: 'SYSTEM' },
      { time: now(0, 12), from: 'IN_CONSULT', to: 'PENDING_PRESCRIPTION', operator: 'DOCTOR' },
      { time: now(0, 12), from: 'PENDING_PRESCRIPTION', to: 'PRESCRIPTION_SUBMITTED', operator: 'DOCTOR' },
      { time: now(0, 11), from: 'PRESCRIPTION_SUBMITTED', to: 'PRESCRIPTION_SIGNED', operator: 'CA_SYSTEM' },
      { time: now(0, 11), from: 'PRESCRIPTION_SIGNED', to: 'PRESCRIPTION_APPROVED', operator: 'PHARMACIST' },
      { time: now(0, 10), from: 'PRESCRIPTION_APPROVED', to: 'RX_AWAITING_PATIENT', operator: 'SYSTEM' },
      { time: now(0, 9), from: 'RX_AWAITING_PATIENT', to: 'RX_PATIENT_ACCEPTED', operator: 'PATIENT' },
      { time: now(0, 9), from: 'RX_PATIENT_ACCEPTED', to: 'PRESCRIPTION_FLOWING', operator: 'SYSTEM', remark: '推送3家候选药房' },
    ],
    created_at: now(1), updated_at: now(0, 9),
  },

  {
    id: 'con-012', service_order_id: 'srv-012', doctor_id: 'doc-010', patient_id: 'cus-003', patient_name: '张晓明', sku_id: 'sku-010-02',
    status: 'WAITING_PATIENT_CONFIRM' as ConsultationOrderState, mode: 'TEXT_IMAGE', urgency: 'NORMAL', price: 4800, urgency_surcharge: 0, paid_amount: 4800,
    recommend_ids: [],
    timeline: [
      { time: now(0, 12), from: 'CREATED', to: 'PAID', operator: 'PATIENT' },
      { time: now(0, 12), from: 'PAID', to: 'PENDING_ACCEPT', operator: 'SYSTEM' },
      { time: now(0, 11), from: 'PENDING_ACCEPT', to: 'ACCEPTED', operator: 'DOCTOR' },
      { time: now(0, 11), from: 'ACCEPTED', to: 'IN_CONSULT', operator: 'SYSTEM' },
      { time: now(0, 6), from: 'IN_CONSULT', to: 'WAITING_PATIENT_CONFIRM', operator: 'DOCTOR', remark: '随访问诊完结·确认后自动生成CGM趋势报告' },
    ],
    confirm_deadline: now(-4), created_at: now(0, 12), updated_at: now(0, 6),
  },
];

// ============================================================
// §3 处方（SM-03修正版·10状态快照）
// ============================================================

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  // rx-001 — 完整流程完结（关联con-001）
  {
    id: 'rx-001', consultation_order_id: 'con-001', doctor_id: 'doc-001', patient_id: 'cus-001',
    status: 'DISPENSED' as PrescriptionState,
    diagnosis: '2型糖尿病，血糖控制欠佳',
    generic_name: 'metformin_hcl', drug_name: '盐酸二甲双胍片', specification: '0.5g×20片',
    dosage: '0.5g', quantity: 3, frequency: '每日3次·随餐', duration_days: 20,
    notes: '定期监测肾功能，如出现乳酸酸中毒症状立即停用',
    ca_certificate_id: 'ca-cert-001', ca_signed_at: now(2, 21),
    pharmacist_id: 'ph-001', reviewed_at: now(2, 21), review_notes: '剂量合理，用法正确',
    patient_confirmed_at: now(2, 19),
    pharmacy_id: 'pharma-001',
    is_first_visit: false,
    data_retention_expire: now(-10) + 15 * 365 * 86400000,
    mapped_skus: ['sku-mf-001', 'sku-mf-002'],
    timeline: [
      { time: now(2, 22), from: 'DRAFT', to: 'SUBMITTED', operator: 'DOCTOR' },
      { time: now(2, 21), from: 'SUBMITTED', to: 'CA_SIGNED', operator: 'CA_SYSTEM' },
      { time: now(2, 21), from: 'CA_SIGNED', to: 'PENDING_AUDIT', operator: 'SYSTEM' },
      { time: now(2, 21), from: 'PENDING_AUDIT', to: 'AWAITING_PATIENT_CONFIRM', operator: 'PHARMACIST' },
      { time: now(2, 19), from: 'AWAITING_PATIENT_CONFIRM', to: 'PATIENT_AGREED', operator: 'PATIENT' },
      { time: now(2, 19), from: 'PATIENT_AGREED', to: 'FLOWING', operator: 'SYSTEM' },
      { time: now(2, 18), from: 'FLOWING', to: 'DISPENSED', operator: 'SYSTEM', remark: 'XX大药房已配药发药' },
    ],
    created_at: now(2, 22), updated_at: now(2, 18),
  },

  // rx-004 — 待患者确认
  {
    id: 'rx-004', consultation_order_id: 'con-004', doctor_id: 'doc-003', patient_id: 'cus-002',
    status: 'AWAITING_PATIENT_CONFIRM' as PrescriptionState,
    diagnosis: '糖尿病合并高脂血症',
    generic_name: 'atorvastatin', drug_name: '阿托伐他汀钙片', specification: '20mg×7片',
    dosage: '20mg', quantity: 4, frequency: '每日1次·睡前', duration_days: 28,
    notes: '注意肝功能监测，避免与葡萄柚汁同服',
    ca_certificate_id: 'ca-cert-004', ca_signed_at: now(0, 5),
    pharmacist_id: 'ph-002', reviewed_at: now(0, 5), review_notes: '与他汀类药物无冲突',
    patient_confirm_deadline: now(0, -68),
    is_first_visit: false,
    data_retention_expire: now(0, 4) + 15 * 365 * 86400000,
    mapped_skus: ['sku-atv-001'],
    timeline: [
      { time: now(0, 6), from: 'DRAFT', to: 'SUBMITTED', operator: 'DOCTOR' },
      { time: now(0, 5), from: 'SUBMITTED', to: 'CA_SIGNED', operator: 'CA_SYSTEM' },
      { time: now(0, 5), from: 'CA_SIGNED', to: 'PENDING_AUDIT', operator: 'SYSTEM' },
      { time: now(0, 5), from: 'PENDING_AUDIT', to: 'AWAITING_PATIENT_CONFIRM', operator: 'PHARMACIST' },
    ],
    created_at: now(0, 6), updated_at: now(0, 5),
  },

  // rx-009 — 患者已拒绝
  {
    id: 'rx-009', consultation_order_id: 'con-009', doctor_id: 'doc-009', patient_id: 'cus-003',
    status: 'DRAFT' as PrescriptionState,
    diagnosis: '1型糖尿病',
    generic_name: 'insulin_glargine', drug_name: '甘精胰岛素注射液', specification: '3ml:300单位',
    dosage: '10U', quantity: 2, frequency: '每日1次·睡前皮下注射', duration_days: 60,
    notes: '注射部位轮换，监测夜间低血糖',
    ca_certificate_id: 'ca-cert-009', ca_signed_at: now(0, 3),
    pharmacist_id: 'ph-003', reviewed_at: now(0, 3), review_notes: '1型糖尿病胰岛素治疗剂量合理',
    patient_confirm_deadline: now(0, -70),
    patient_reject_reason: '担心低血糖副作用·希望调整为更小起始剂量',
    is_first_visit: false,
    data_retention_expire: now(0, 2) + 15 * 365 * 86400000,
    mapped_skus: [],
    timeline: [
      { time: now(0, 4), from: 'DRAFT', to: 'SUBMITTED', operator: 'DOCTOR' },
      { time: now(0, 3), from: 'SUBMITTED', to: 'CA_SIGNED', operator: 'CA_SYSTEM' },
      { time: now(0, 3), from: 'CA_SIGNED', to: 'PENDING_AUDIT', operator: 'SYSTEM' },
      { time: now(0, 3), from: 'PENDING_AUDIT', to: 'AWAITING_PATIENT_CONFIRM', operator: 'PHARMACIST' },
      { time: now(0, 1), from: 'AWAITING_PATIENT_CONFIRM', to: 'DRAFT', operator: 'PATIENT', remark: '担心低血糖副作用·希望调整用法' },
    ],
    created_at: now(0, 4), updated_at: now(0, 1),
  },

  // rx-011 — 处方流转中
  {
    id: 'rx-011', consultation_order_id: 'con-011', doctor_id: 'doc-007', patient_id: 'cus-001',
    status: 'FLOWING' as PrescriptionState,
    diagnosis: '糖尿病足溃疡·轻度感染',
    generic_name: 'cefalexin', drug_name: '头孢氨苄胶囊', specification: '0.25g×12粒',
    dosage: '0.5g', quantity: 2, frequency: '每日2次', duration_days: 12,
    notes: '青霉素过敏者禁用·与伤口护理联合',
    ca_certificate_id: 'ca-cert-011', ca_signed_at: now(0, 11),
    pharmacist_id: 'ph-001', reviewed_at: now(0, 11), review_notes: '抗生素选择合理，剂量适合轻度感染',
    patient_confirmed_at: now(0, 9),
    is_first_visit: false,
    data_retention_expire: now(0, 11) + 15 * 365 * 86400000,
    mapped_skus: ['sku-cephal-001', 'sku-cephal-002'],
    timeline: [
      { time: now(0, 12), from: 'DRAFT', to: 'SUBMITTED', operator: 'DOCTOR' },
      { time: now(0, 11), from: 'SUBMITTED', to: 'CA_SIGNED', operator: 'CA_SYSTEM' },
      { time: now(0, 11), from: 'CA_SIGNED', to: 'PENDING_AUDIT', operator: 'SYSTEM' },
      { time: now(0, 11), from: 'PENDING_AUDIT', to: 'AWAITING_PATIENT_CONFIRM', operator: 'PHARMACIST' },
      { time: now(0, 9), from: 'AWAITING_PATIENT_CONFIRM', to: 'PATIENT_AGREED', operator: 'PATIENT' },
      { time: now(0, 9), from: 'PATIENT_AGREED', to: 'FLOWING', operator: 'SYSTEM', remark: '正在推送3家候选药房' },
    ],
    created_at: now(0, 12), updated_at: now(0, 9),
  },

  // rx-012 — 处方过期
  {
    id: 'rx-012', consultation_order_id: 'con-012', doctor_id: 'doc-010', patient_id: 'cus-003',
    status: 'EXPIRED' as PrescriptionState,
    diagnosis: '2型糖尿病·稳定期',
    generic_name: 'glimepiride', drug_name: '格列美脲片', specification: '2mg×15片',
    dosage: '2mg', quantity: 2, frequency: '每日1次·早餐前', duration_days: 30,
    notes: '注意低血糖反应·随餐服用',
    ca_certificate_id: 'ca-cert-012', ca_signed_at: now(4),
    pharmacist_id: 'ph-002', reviewed_at: now(4),
    patient_confirm_deadline: now(1),
    is_first_visit: false,
    data_retention_expire: now(4) + 15 * 365 * 86400000,
    mapped_skus: [],
    timeline: [
      { time: now(4, 1), from: 'DRAFT', to: 'SUBMITTED', operator: 'DOCTOR' },
      { time: now(4), from: 'SUBMITTED', to: 'CA_SIGNED', operator: 'CA_SYSTEM' },
      { time: now(4), from: 'CA_SIGNED', to: 'PENDING_AUDIT', operator: 'SYSTEM' },
      { time: now(4), from: 'PENDING_AUDIT', to: 'AWAITING_PATIENT_CONFIRM', operator: 'PHARMACIST' },
      { time: now(1), from: 'AWAITING_PATIENT_CONFIRM', to: 'EXPIRED', operator: 'SYSTEM', remark: '72h患者未确认·自动过期' },
    ],
    created_at: now(4, 1), updated_at: now(1),
  },
];

// ============================================================
// §4 问诊消息（3组完整对话）
// ============================================================

export const MOCK_CONSULTATION_MESSAGES: ConsultationMessage[] = [
  // con-003 对话中（最新活跃对话）
  { id: 'msg-003-01', order_id: 'con-003', sender: 'PATIENT', type: 'TEXT', content: '张医生您好，我最近血糖波动比较大，空腹7.5左右，餐后11-12，之前控制的还可以，空腹一般5-6。最近比较忙，饮食也没太大变化，不知道怎么回事？', idempotent_key: 'ik-003-01', delivered: true, created_at: now(0, 3) },
  { id: 'msg-003-02', order_id: 'con-003', sender: 'SYSTEM', type: 'SYSTEM_NOTIFY', content: '患者分享了最近7天的CGM数据', idempotent_key: 'ik-003-sys-01', cgm_data: { glucose_level: 7.8, trend: 'UP', time_range: '近7天', chart_url: '/cgm/chart-003.png' }, delivered: true, created_at: now(0, 2.9) },
  { id: 'msg-003-03', order_id: 'con-003', sender: 'DOCTOR', type: 'TEXT', content: '收到，我看一下您的CGM数据。近7天空腹均值6.8，峰值在午饭后。您最近有感冒、熬夜或者其他压力吗？另外最近一次HbA1c是多少？', idempotent_key: 'ik-003-02', delivered: true, created_at: now(0, 2.5) },
  { id: 'msg-003-04', order_id: 'con-003', sender: 'PATIENT', type: 'TEXT', content: '上个月复查HbA1c是7.2%，最近确实有点失眠，工作压力大。没有感冒。现在吃的二甲双胍0.5g tid，是不是该加量了？', idempotent_key: 'ik-003-03', delivered: true, created_at: now(0, 1) },

  // con-001 完整对话（已完结）
  { id: 'msg-001-01', order_id: 'con-001', sender: 'PATIENT', type: 'TEXT', content: '医生你好，我最近血糖不稳定，空腹有时候6有时候9，差别很大', idempotent_key: 'ik-001-01', delivered: true, created_at: now(2, 23) },
  { id: 'msg-001-02', order_id: 'con-001', sender: 'DOCTOR', type: 'TEXT', content: '你好，这种情况需要排查饮食和运动的变化。你用的什么降糖方案？', idempotent_key: 'ik-001-02', delivered: true, created_at: now(2, 22.5) },
  { id: 'msg-001-03', order_id: 'con-001', sender: 'PATIENT', type: 'TEXT', content: '二甲双胍一天3次，每次0.5g。我最近开始饭后散步，会不会是这个原因？还有早上空腹高是不是黎明现象？', idempotent_key: 'ik-001-03', delivered: true, created_at: now(2, 22.3) },
  { id: 'msg-001-04', order_id: 'con-001', sender: 'DOCTOR', type: 'TEXT', content: '黎明现象确实可能，但我从您的概况看BMI还是偏高。我建议：1) 二甲双胍维持现剂量，晚上可以查一下睡前和凌晨3点的血糖；2) 饮食方面控制一下晚餐碳水量。我给您开个处方，二甲双胍继续服用，观察2周', idempotent_key: 'ik-001-04', delivered: true, created_at: now(2, 22) },
  { id: 'msg-001-05', order_id: 'con-001', sender: 'SYSTEM', type: 'PRESCRIPTION_CARD', content: '处方已生成：盐酸二甲双胍片 0.5g tid 20天', prescription_ref: 'rx-001', idempotent_key: 'ik-001-sys-01', delivered: true, created_at: now(2, 19) },
  { id: 'msg-001-06', order_id: 'con-001', sender: 'PATIENT', type: 'TEXT', content: '好的谢谢医生，我按时吃药观察一下', idempotent_key: 'ik-001-05', delivered: true, created_at: now(2, 18) },
  { id: 'msg-001-07', order_id: 'con-001', sender: 'SYSTEM', type: 'RECOMMEND_CARD', content: '问诊后推荐', recommend_ref: 'rec-001', idempotent_key: 'ik-001-sys-02', delivered: true, created_at: now(2, 16) },

  // con-006 SOS对话
  { id: 'msg-006-01', order_id: 'con-006', sender: 'SYSTEM', type: 'SYSTEM_NOTIFY', content: '⚠️ CGM危急值告警：血糖3.2mmol/L（严重低血糖）', cgm_data: { glucose_level: 3.2, trend: 'DOWN', time_range: '实时', chart_url: '/cgm/alert-006.png' }, idempotent_key: 'ik-006-sys-01', delivered: true, created_at: now(0, 0.5) },
  { id: 'msg-006-02', order_id: 'con-006', sender: 'DOCTOR', type: 'TEXT', content: '我看到您的血糖危急值3.2，请问您现在有什么感觉？有没有心慌、手抖、出冷汗？请立即补充糖分！', idempotent_key: 'ik-006-01', delivered: true, created_at: now(0, 0.4) },
  { id: 'msg-006-03', order_id: 'con-006', sender: 'PATIENT', type: 'TEXT', content: '头晕，手有点抖，刚喝了一杯糖水', idempotent_key: 'ik-006-02', delivered: true, created_at: now(0, 0.3) },
];

// ============================================================
// §5 药房比价
// ============================================================

export const MOCK_PHARMACY_PRICES: PharmacyPrice[] = [
  { id: 'pp-001', pharmacy_id: 'pharma-001', pharmacy_name: 'XX大药房（西溪店）', distance_km: 1.2, price: 2850, stock_available: true, estimated_arrival: '30分钟内', delivery_fee: 0, rating: 4.8 },
  { id: 'pp-002', pharmacy_id: 'pharma-002', pharmacy_name: '百姓大药房（文三路）', distance_km: 2.5, price: 2680, stock_available: true, estimated_arrival: '45分钟内', delivery_fee: 500, rating: 4.5 },
  { id: 'pp-003', pharmacy_id: 'pharma-003', pharmacy_name: '康健药房（古墩路）', distance_km: 3.8, price: 3020, stock_available: true, estimated_arrival: '60分钟内', delivery_fee: 300, rating: 4.6 },
  { id: 'pp-004', pharmacy_id: 'pharma-004', pharmacy_name: '京东大药房（配送）', distance_km: 5.2, price: 2580, stock_available: true, estimated_arrival: '次日达', delivery_fee: 800, rating: 4.7 },
  { id: 'pp-005', pharmacy_id: 'pharma-005', pharmacy_name: '阿里健康大药房', distance_km: 8.1, price: 2750, stock_available: true, estimated_arrival: '1-2天', delivery_fee: 0, rating: 4.6 },
];

// ============================================================
// §6 患者健康档案
// ============================================================

const sevenDaysAgo = now(7);

export const MOCK_PATIENT_ARCHIVES: PatientHealthArchive[] = [
  {
    id: 'arch-001', patient_id: 'cus-001',
    name: '王大明', gender: 'MALE', age: 56, height_cm: 172, weight_kg: 78,
    diabetes_type: 'TYPE2', diagnosed_at: Date.parse('2018-03-01'),
    comorbidities: ['高血压', '高脂血症'],
    current_medications: [
      { drug_name: '盐酸二甲双胍片', dosage: '0.5g', frequency: '每日3次', started_at: Date.parse('2024-01-01') },
      { drug_name: '厄贝沙坦片', dosage: '150mg', frequency: '每日1次', started_at: Date.parse('2023-06-01') },
    ],
    cgm_device_id: 'cgm-dev-001',
    last_cgm_sync: now(0, 1),
    glucose_summary_7d: { avg: 7.2, max: 12.1, min: 3.8, in_range_percent: 62, data_points: 2016 },
    allergies: ['青霉素'],
    lifestyle: { smoking: false, alcohol: true, exercise_frequency: 'OCCASIONAL' },
    medical_history: [
      { condition: '2型糖尿病', diagnosed_at: Date.parse('2018-03-01') },
      { condition: '高血压', diagnosed_at: Date.parse('2023-06-01') },
      { condition: '高脂血症', diagnosed_at: Date.parse('2023-12-01') },
    ],
    access_control: {
      public_fields: ['age', 'diabetes_type', 'glucose_summary_7d'],
      restricted_fields: ['name', 'current_medications', 'medical_history', 'allergies', 'height_cm', 'weight_kg'],
      last_updated: now(7),
    },
    created_at: now(365), updated_at: now(7),
  },
  {
    id: 'arch-002', patient_id: 'cus-002',
    name: '李芳', gender: 'FEMALE', age: 62,
    diabetes_type: 'TYPE2', diagnosed_at: Date.parse('2015-05-01'),
    comorbidities: ['冠心病', '骨质疏松'],
    current_medications: [
      { drug_name: '格列美脲片', dosage: '2mg', frequency: '每日1次', started_at: Date.parse('2024-03-01') },
      { drug_name: '阿托伐他汀钙片', dosage: '20mg', frequency: '每日1次', started_at: Date.parse('2023-01-01') },
    ],
    cgm_device_id: 'cgm-dev-002',
    last_cgm_sync: now(0, 2),
    glucose_summary_7d: { avg: 8.5, max: 14.2, min: 4.5, in_range_percent: 48, data_points: 1872 },
    allergies: ['磺胺类'],
    lifestyle: { smoking: false, alcohol: false, exercise_frequency: 'REGULAR' },
    medical_history: [
      { condition: '2型糖尿病', diagnosed_at: Date.parse('2015-05-01') },
      { condition: '冠心病', diagnosed_at: Date.parse('2020-09-01') },
      { condition: '骨质疏松', diagnosed_at: Date.parse('2022-03-01') },
    ],
    access_control: {
      public_fields: ['age', 'diabetes_type', 'glucose_summary_7d'],
      restricted_fields: ['name', 'current_medications', 'medical_history', 'allergies', 'height_cm', 'weight_kg'],
      last_updated: now(2),
    },
    created_at: now(200), updated_at: now(2),
  },
  {
    id: 'arch-003', patient_id: 'cus-003',
    name: '张小明', gender: 'MALE', age: 28,
    diabetes_type: 'TYPE1', diagnosed_at: Date.parse('2010-08-01'),
    comorbidities: [],
    current_medications: [
      { drug_name: '甘精胰岛素注射液', dosage: '12U', frequency: '每日1次睡前', started_at: Date.parse('2024-02-01') },
      { drug_name: '门冬胰岛素注射液', dosage: '4-6U', frequency: '每日3次餐前', started_at: Date.parse('2024-02-01') },
    ],
    cgm_device_id: 'cgm-dev-003',
    last_cgm_sync: now(0, 0.5),
    glucose_summary_7d: { avg: 6.8, max: 15.5, min: 3.2, in_range_percent: 55, data_points: 2208 },
    allergies: [],
    lifestyle: { smoking: false, alcohol: false, exercise_frequency: 'DAILY' },
    medical_history: [
      { condition: '1型糖尿病', diagnosed_at: Date.parse('2010-08-01') },
    ],
    access_control: {
      public_fields: ['age', 'diabetes_type', 'glucose_summary_7d'],
      restricted_fields: ['name', 'current_medications', 'medical_history', 'height_cm', 'weight_kg'],
      last_updated: now(0, 1),
    },
    created_at: now(500), updated_at: now(0, 1),
  },
];

// ============================================================
// §7 档案授权
// ============================================================

export const MOCK_ARCHIVE_AUTHORIZATIONS: ArchiveAuthorization[] = [
  {
    id: 'auth-001', patient_id: 'cus-001', doctor_id: 'doc-001',
    consultation_order_id: 'con-001', scope: 'SINGLE_CONSULTATION',
    fields_granted: ['name', 'current_medications', 'medical_history', 'allergies', 'height_cm', 'weight_kg'],
    granted_at: now(2, 23),
  },
  {
    id: 'auth-002', patient_id: 'cus-003', doctor_id: 'doc-001',
    consultation_order_id: 'con-006', scope: 'SINGLE_CONSULTATION',
    fields_granted: ['name', 'current_medications', 'medical_history', 'allergies'],
    granted_at: now(0, 0.5),
  },
];

// ============================================================
// §8 问诊后推荐
// ============================================================

export const MOCK_POST_CONSULT_RECOMMENDS: PostConsultRecommend[] = [
  // con-001 有处方→处方药+关联商品
  {
    id: 'rec-001', consultation_order_id: 'con-001', source: 'RX_BASED',
    items: [
      { product_id: 'prod-mf-001', sku_id: 'sku-mf-001', product_name: '盐酸二甲双胍片 0.5g×20片', product_image: '/products/mf-001.png', product_type: 'RX', price: 2850, reason: '处方直购·XX大药房30分钟达', require_prescription: true, prescription_ref: 'rx-001' },
      { product_id: 'prod-mf-002', sku_id: 'sku-mf-002', product_name: '盐酸二甲双胍片 0.5g×60片', product_image: '/products/mf-002.png', product_type: 'RX', price: 6800, reason: '处方直购·60片装更划算', require_prescription: true, prescription_ref: 'rx-001' },
      { product_id: 'prod-bg-001', sku_id: 'sku-bg-001', product_name: '三诺血糖试纸（50条装）', product_image: '/products/bg-001.png', product_type: 'DEVICE', price: 9800, reason: '长期血糖管理必备·适用安易型', require_prescription: false },
      { product_id: 'prod-bg-002', sku_id: 'sku-bg-002', product_name: '雅培瞬感动态血糖仪', product_image: '/products/bg-002.png', product_type: 'DEVICE', price: 46800, reason: '连续14天监测·告别扎手指', require_prescription: false },
      { product_id: 'prod-sup-001', sku_id: 'sku-sup-001', product_name: '低GI代餐奶昔（混合装）', product_image: '/products/sup-001.png', product_type: 'FOOD', price: 12800, reason: '糖尿病代餐·控制餐后血糖', require_prescription: false },
    ],
    generated_at: now(2, 16), patient_viewed: true, items_clicked: ['sku-mf-001', 'sku-bg-001'], items_ordered: ['sku-mf-001'],
  },
  // con-005 无处方→OTC+器械+健康服务
  {
    id: 'rec-005', consultation_order_id: 'con-005', source: 'SYMPTOM_BASED',
    items: [
      { product_id: 'prod-bg-001', sku_id: 'sku-bg-001', product_name: '三诺血糖试纸（50条装）', product_image: '/products/bg-001.png', product_type: 'DEVICE', price: 9800, reason: '血糖管理·持续监测', require_prescription: false },
      { product_id: 'prod-otc-001', sku_id: 'sku-otc-001', product_name: '蜂胶胶囊（辅助降糖）', product_image: '/products/otc-001.png', product_type: 'OTC', price: 12800, reason: '适合辅助降糖人群', require_prescription: false },
      { product_id: 'prod-dev-001', sku_id: 'sku-dev-001', product_name: '糖尿病足护理套装', product_image: '/products/dev-001.png', product_type: 'DEVICE', price: 5800, reason: '足部每日护理·预防溃疡', require_prescription: false },
    ],
    items_clicked: [],
    items_ordered: [],
    generated_at: now(1, 20), patient_viewed: false,
  },
];

// ============================================================
// §9 评价
// ============================================================

export const MOCK_EVALUATIONS: Evaluation[] = [
  {
    id: 'eval-001', order_id: 'con-001', patient_id: 'cus-001', doctor_id: 'doc-001',
    rating: 5, content: '张医生很专业，详细分析了我的血糖波动原因，开的处方也很合理。推荐的商品也很精准，直接下单买了药和试纸，非常方便！',
    tags: ['专业负责', '回复详细', '推荐精准'],
    created_at: now(2, 15),
  },
];

// ============================================================
// §10 IndexedDB 持久化辅助
// ============================================================

export const CONSULTATION_SIM_DB_NAME = 'consultation-sim';
export const CONSULTATION_SIM_DB_VERSION = 2;

export const CONSULTATION_SIM_STORES = {
  doctors: 'doctors',
  orders: 'orders',
  prescriptions: 'prescriptions',
  messages: 'messages',
  archives: 'archives',
  authorizations: 'authorizations',
  recommends: 'recommends',
  pharmacyPrices: 'pharmacy_prices',
  evaluations: 'evaluations',
} as const;

/** 初始化IndexedDB并填充仿真数据 */
export async function initConsultationSimDB(): Promise<void> {
  const { openDB } = await import('idb');
  const db = await openDB(CONSULTATION_SIM_DB_NAME, CONSULTATION_SIM_DB_VERSION, {
    upgrade(db) {
      for (const storeName of Object.values(CONSULTATION_SIM_STORES)) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      }
    },
  });

  // 批量写入（幂等·不存在才写入）
  const datas: Array<[string, Array<{ id: string }>]> = [
    [CONSULTATION_SIM_STORES.doctors, MOCK_DOCTORS],
    [CONSULTATION_SIM_STORES.orders, MOCK_CONSULTATION_ORDERS],
    [CONSULTATION_SIM_STORES.prescriptions, MOCK_PRESCRIPTIONS],
    [CONSULTATION_SIM_STORES.messages, MOCK_CONSULTATION_MESSAGES],
    [CONSULTATION_SIM_STORES.archives, MOCK_PATIENT_ARCHIVES],
    [CONSULTATION_SIM_STORES.authorizations, MOCK_ARCHIVE_AUTHORIZATIONS],
    [CONSULTATION_SIM_STORES.recommends, MOCK_POST_CONSULT_RECOMMENDS],
    [CONSULTATION_SIM_STORES.pharmacyPrices, MOCK_PHARMACY_PRICES],
    [CONSULTATION_SIM_STORES.evaluations, MOCK_EVALUATIONS],
  ];

  const tx = db.transaction(Object.values(CONSULTATION_SIM_STORES) as string[], 'readwrite');
  for (const [store, items] of datas) {
    for (const item of items) {
      const existing = await db.transaction(store, 'readonly').objectStore(store).get(item.id);
      if (!existing) {
        await db.put(store, item);
      }
    }
  }
  await tx.done;
}
