/**
 * OnboardingApplyPage — 服务商入驻申请 V3.1.0
 *
 * AI 大脑 × PRD §8 入驻管理：全流程标准化入驻体验
 *
 * 流程：角色选择→信息填写→资质上传→提交→审核→签约→培训→上线
 * 异常流：NEED_SUPPLEMENT（补充资料）/ REJECTED（驳回重提）/ WITHDRAWN（已撤回）
 * 接入终端：/apply（PC独立）/ /mp/apply（小程序内嵌）
 *
 * V3.1.0 — 品牌化视觉重写
 *   - 统一 SugarMate 品牌色系
 *   - 卡片式角色选择（hover/selected 状态优化）
 *   - 现代化入驻体验（渐变背景/品牌头/进度光效）
 *   - 响应式增强
 *   - 无障碍路径导航
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Steps, Form, Input, Select, Upload, Button, Card, Typography,
  Space, message, Result, Row, Col, Divider, Radio, Alert, Tag,
  Timeline, Progress, Descriptions, Collapse, Badge, Tooltip, Modal,
} from 'antd';
import {
  UserOutlined, PhoneOutlined, BankOutlined, UploadOutlined,
  CheckCircleOutlined, IdcardOutlined, MedicineBoxOutlined,
  ShopOutlined, EnvironmentOutlined, ClockCircleOutlined,
  TeamOutlined, FileProtectOutlined, LinkOutlined,
  ExperimentOutlined, SmileOutlined, CoffeeOutlined,
  WarningOutlined, CloseCircleOutlined, ExclamationCircleOutlined,
  EditOutlined, EyeOutlined, ReloadOutlined, ArrowLeftOutlined,
  FormOutlined, AuditOutlined, SolutionOutlined, SafetyCertificateOutlined,
  TrophyOutlined, RocketOutlined, SyncOutlined, LeftOutlined,
  RightOutlined, StarFilled, CrownOutlined, HeartOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import {
  useOnboardingStore, type OnboardRole, type OnboardingApplication, type OnboardingStatus,
  ROLE_CONFIG, STATUS_LABEL, STATUS_STEP_MAP, ONBOARD_STEPS,
} from '@/stores/onboardingStore';
import CertUploadPanel, {
  type CertUploadItem, type CertSpec,
  PH_CERT_SPECS, getPersonalCertSpecs, buildEmptyCertUploads,
} from '@/components/CertUploadPanel';

/** OnboardRole → CertUploadPanel 角色代码（用于复用个人证书规格） */
const ONBOARD_TO_PANEL_ROLE: Record<Exclude<OnboardRole, ''>, 'DOCTOR' | 'PHARMACIST' | 'NUTRITIONIST' | 'HEALTH_MANAGER'> = {
  DR: 'DOCTOR',
  PR: 'PHARMACIST',
  NT: 'NUTRITIONIST',
  HM: 'HEALTH_MANAGER',
};

/** 申请端药房证书规格：营业执照、药品经营许可证、GSP证书、食品经营许可证、法人身份证
 *  （与 CertUploadPanel.PH_CERT_SPECS 保持一致：法人身份证 1 个 Dragger maxCount=2 正反两面） */
const APPLY_PH_CERT_SPECS: CertSpec[] = PH_CERT_SPECS;

const { Title, Text, Paragraph } = Typography;

// ============ 品牌色 ============
const BRAND = {
  primary: '#2563eb',
  primaryLight: '#3b82f6',
  primaryBg: '#eff6ff',
  primaryBorder: '#bfdbfe',
  success: '#16a34a',
  successBg: '#f0fdf4',
  warning: '#d97706',
  warningBg: '#fffbeb',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  bg: '#f8fafc',
  cardBg: '#ffffff',
  border: '#e2e8f0',
};

// ============ 角色×职称映射 ============
const TITLE_OPTIONS: Record<OnboardRole, string[]> = {
  PH: ['药房负责人', '药房经理', '药店店长', '药房主管'],
  DR: ['主任医师', '副主任医师', '主治医师', '住院医师'],
  PR: ['主任药师', '主管药师', '执业药师'],
  NT: ['注册营养师', '高级营养师', '营养师', '营养指导师'],
  HM: ['高级健康管理师', '健康管理师', '助理健康管理师'],
};

const SPECIALTY_MAP: Record<OnboardRole, { label: string; options: string[] }> = {
  PH: { label: '经营范围', options: ['处方药', 'OTC药品', '医疗器械', '保健品', '中药饮片', '胰岛素冷链'] },
  DR: { label: '擅长领域', options: ['2型糖尿病', '1型糖尿病', '妊娠糖尿病', '糖尿病肾病', '糖尿病足', '甲状腺疾病', '肥胖管理'] },
  PR: { label: '擅长领域', options: ['处方审核', '药物相互作用', '胰岛素用药指导', '慢病用药管理'] },
  NT: { label: '擅长领域', options: ['糖尿病饮食', '减重管理', '孕期营养', '儿童营养', '肾病饮食', '老年营养'] },
  HM: { label: '擅长领域', options: ['糖尿病管理', '慢病管理', '健康风险评估', '生活方式干预', '用药依从性管理', '血糖监测指导'] },
};

const PH_DEPT_OPTIONS = ['内科用药', '内分泌科', '心脑血管', '消化系统', '呼吸系统', '儿科', '妇科', '皮肤科', '中西医结合', '全科'];

// 角色选项
const ROLE_OPTIONS = Object.entries(ROLE_CONFIG).map(([code, config]) => ({
  code: code as OnboardRole,
  ...config,
}));

// 角色选择项（2×2 网格，对齐设计稿）
const ROLE_CARDS: { code: OnboardRole; icon: React.ReactNode; label: string; desc: string; color: string }[] = [
  { code: 'PH', icon: <MedicineBoxOutlined />, label: '药店入驻', desc: '药品经营许可证、GSP认证药店，在线销售处方药与非处方药', color: '#2563eb' },
  { code: 'DR', icon: <TeamOutlined />, label: '医生入驻', desc: '执业医师资格认证，提供在线问诊、处方开具、健康咨询服务', color: '#16a34a' },
  { code: 'PR', icon: <SafetyCertificateOutlined />, label: '药师入驻', desc: '执业药师资格认证，提供用药指导、处方审核、药品咨询服务', color: '#7c3aed' },
  { code: 'NT', icon: <ExperimentOutlined />, label: '营养师入驻', desc: '注册营养师资格认证，提供营养评估、膳食指导、慢病管理服务', color: '#f59e0b' },
  { code: 'HM', icon: <HeartOutlined />, label: '健康管理师入驻', desc: '健康管理师资格认证，提供健康评估、慢病管理、生活方式指导服务', color: '#0891b2' },
];

// ============ 页面配置 ============
const FORM_STEPS = [
  { title: '选择角色', icon: <TeamOutlined /> },
  { title: '基本信息', icon: <FormOutlined /> },
  { title: '资质上传', icon: <FileProtectOutlined /> },
];

const OnboardingApplyPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useOnboardingStore();

  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<OnboardRole | ''>('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Step 1 表单值缓存（Form 在 step===2 时卸载，字段会丢失，提前保存）
  const [step1FormValues, setStep1FormValues] = useState<Record<string, any>>({});

  // 上传文件（统一使用 CertUploadPanel 的状态结构，与管理端共用同一份代码）
  const [certUploads, setCertUploads] = useState<Record<string, CertUploadItem>>({});

  /** 当前角色对应的证书规格（药房 5 类 / 个人 3 类） */
  const certSpecs = useMemo<CertSpec[]>(() => {
    if (!selectedRole) return [];
    if (selectedRole === 'PH') return APPLY_PH_CERT_SPECS;
    return getPersonalCertSpecs(ONBOARD_TO_PANEL_ROLE[selectedRole]);
  }, [selectedRole]);

  /** 切换角色时清空证书 state */
  useEffect(() => {
    setCertUploads(buildEmptyCertUploads(certSpecs));
  }, [certSpecs]);

  const isFromMP = location.pathname.startsWith('/mp');
  const isPharmacy = selectedRole === 'PH';
  const isPharmacist = selectedRole === 'PR';
  const isDoctorOrPharmacist = selectedRole === 'DR' || selectedRole === 'PR';

  // 追踪当前操作的申请ID，existingApp 从 store 实时派生（解决表单/列表/本地存储不同步问题）
  const [existingAppId, setExistingAppId] = useState<string | null>(null);
  // 从 store 实时派生 existingApp，确保响应 store 任何页面（管理列表/状态页等）的状态变更
  const existingApp = useMemo<OnboardingApplication | null>(
    () => existingAppId ? (store.applications.find(a => a.id === existingAppId) || null) : null,
    [store.applications, existingAppId],
  );

  useEffect(() => {
    store.initMockData();
  }, []);

  // 支持 URL ?role=PH|DR|PR|NT 直接进入对应角色表单
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role') as OnboardRole | null;
    const validRoles: OnboardRole[] = ['PH', 'DR', 'PR', 'NT', 'HM'];
    if (roleParam && validRoles.includes(roleParam)) {
      setSelectedRole(roleParam);
      setStep(1);
    }
  }, [location.search]);

  // 根据当前用户手机号精准查找已有申请
  const lookupByPhone = (phone: string): OnboardingApplication | null => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) return null;
    return store.applications.find(a => a.phone === phone) || null;
  };

  // 安全返回
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isFromMP ? '/mp/home' : '/');
    }
  };

  // ============ 把 File 异步读成 data URL（替代 createObjectURL，可持久化到 localStorage） ============
  const readFileAsDataURL = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('FileReader 失败'));
        reader.readAsDataURL(file);
      } catch (e) {
        reject(e);
      }
    });
  };

  // ============ 收集用户上传的证照数据（从 CertUploadPanel 统一结构派生） ============
  const collectCertificates = async (): Promise<Array<{ id: string; type: string; name: string; fileUrl?: string; status: string; certNo?: string; expireAt?: string }>> => {
    const certs: Array<{ id: string; type: string; name: string; fileUrl?: string; status: string; certNo?: string; expireAt?: string }> = [];
    const toCert = async (f: UploadFile, typeName: string, certNo?: string, expireAt?: string) => {
      // 优先级：antd 已生成的 url/thumbUrl > FileReader 转 base64（持久化友好）
      let fileUrl: string | undefined = f.url || f.thumbUrl;
      if (!fileUrl && f.originFileObj) {
        try {
          fileUrl = await readFileAsDataURL(f.originFileObj as Blob);
        } catch (e) {
          console.warn(`[OnboardingApplyPage] 读取证照失败: ${f.name || typeName}`, e);
          fileUrl = undefined;
        }
      }
      return {
        id: `cert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: typeName,
        name: f.name || f.fileName || typeName,
        fileUrl,
        status: 'pending' as const,
        certNo,
        expireAt,
      };
    };

    // 遍历 certUploads，保持与 spec 一致的顺序
    for (const spec of certSpecs) {
      const item = certUploads[spec.type];
      if (!item) continue;
      // 把"身份证正面"/"身份证反面"这种细分类型转回原申请端的命名
      const labelMap: Record<string, string> = {
        ID_CARD: isPharmacy ? '法人身份证' : '身份证',
      };
      const baseName = labelMap[spec.type] || item.name || spec.name;
      // 多槽位模式：每个 slot 单独成一条证书记录，name 带"正面/反面/正本/副本"等后缀
      if (spec.slotLabels && spec.slotLabels.length > 0 && item.slotFiles && item.slotFiles.length > 0) {
        for (let idx = 0; idx < spec.slotLabels.length; idx++) {
          const f = item.slotFiles[idx];
          if (!f) continue;
          certs.push(await toCert(f, `${baseName}（${spec.slotLabels[idx]}）`, item.certNo, item.expireAt));
        }
        continue;
      }
      // 普通模式：files 平铺收集
      for (const f of item.files) {
        certs.push(await toCert(f, baseName, item.certNo, item.expireAt));
      }
    }
    return certs;
  };

  // ============ 提交 / 补充资料 ============
  const handleSubmit = async () => {
    if (!selectedRole) { message.warning('请选择入驻角色'); return; }

    try {
      setSubmitting(true);

      // 基本数据校验：Step1 表单值不得为空
      const formValues = Object.keys(step1FormValues).length > 0 ? step1FormValues : form.getFieldsValue();
      if (!formValues || Object.keys(formValues).length === 0) {
        message.error('请先填写基本信息');
        setSubmitting(false);
        return;
      }

      // 校验必填字段（姓名/药房名 + 手机号）
      const nameKey = isPharmacy ? 'pharmacyName' : 'realName';
      const phoneKey = isPharmacy ? 'legalPhone' : 'phone';
      if (!formValues[nameKey] || String(formValues[nameKey]).trim() === '') {
        message.error('请填写名称');
        setSubmitting(false);
        return;
      }
      if (!formValues[phoneKey] || !/^1[3-9]\d{9}$/.test(String(formValues[phoneKey]))) {
        message.error('请填写正确的手机号');
        setSubmitting(false);
        return;
      }

      // NEED_SUPPLEMENT：引导用户到审核进度查询页使用专业补充流程
      if (existingApp && existingApp.status === 'NEED_SUPPLEMENT') {
        message.info('请前往审核进度查询页面补充资料，已为您自动跳转');
        const appId = existingApp.id;
        const phone = existingApp.phone;
        navigate(`/status?appId=${appId}${phone ? `&phone=${encodeURIComponent(phone)}` : ''}`);
        setSubmitting(false);
        return;
      }

      // DRAFT 状态：优先使用新表单数据创建申请，替代旧草稿
      if (existingApp && existingApp.status === 'DRAFT') {
        const hasNewData = Object.values(formValues || {}).some(v => v && String(v).trim() !== '');
        if (hasNewData) {
          // 用户填了新数据，走新申请流程（旧草稿保留）
          message.info('已使用新信息创建申请');
        } else {
          // 没有新数据，直接提交已有草稿
          store.submitApplication(existingApp.id);
          message.success({
            content: '入驻申请已提交成功！当前状态：待审核',
            duration: 4,
          });
          setSubmitted(true);
          setSubmitting(false);
          return;
        }
      }

      // 新申请：收集用户在表单中填写的完整数据 + 上传证照
      const certificates = await collectCertificates();
      const appData: any = {
        role: selectedRole,
        certificates,
      };

      if (isPharmacy) {
        // 药房入驻
        appData.name = formValues.pharmacyName || '';
        appData.phone = formValues.legalPhone || '';
        appData.company = formValues.pharmacyName || '';
        appData.legalPerson = formValues.legalPerson || '';
        appData.legalPhone = formValues.legalPhone || '';
        appData.licenseNo = formValues.licenseNo || '';
        appData.address = formValues.address || '';
        appData.bizHours = formValues.bizHours;
        appData.businessScope = formValues.businessScope || [];
      } else {
        // 个人入驻
        appData.name = formValues.realName || '';
        appData.phone = formValues.phone || '';
        appData.company = formValues.affiliatedOrg || '';
        appData.idCard = formValues.idCard;
        appData.title = formValues.title;
        appData.specialties = formValues.specialties || [];
        if (isPharmacist) {
          appData.affiliatedPharmacyName = formValues.affiliatedPharmacy;
        }
      }

      const app = store.createApplication(appData);
      store.submitApplication(app.id);
      // 提交后记录 appId，existingApp 自动从 store 派生
      setExistingAppId(app.id);
      message.success({
        content: '入驻申请已提交成功！当前状态：待审核',
        duration: 4,
      });
      setSubmitted(true);
    } catch (e) {
      console.error('[OnboardingApplyPage] handleSubmit 提交异常:', e);
      message.error(`提交失败：${e instanceof Error ? e.message : '未知错误，请稍后重试'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setStep(0);
    setSelectedRole('');
    form.resetFields();
  };

  // ============ 步骤指示器 ============
  const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
    <div style={{ marginBottom: 32, padding: '0 8px' }}>
      <Steps
        current={current}
        size="small"
        items={FORM_STEPS.map((s, i) => ({
          title: s.title,
          icon: i < current ? <CheckCircleOutlined /> : s.icon,
          status: i < current ? 'finish' as const : i === current ? 'process' as const : 'wait' as const,
        }))}
      />
    </div>
  );

  // ============ 品牌头部（PC独立页用） ============
  const BrandHeader = () => (
    <div style={{
      textAlign: 'center', marginBottom: 32, paddingTop: isFromMP ? 0 : 24,
    }}>
      <div style={{ fontSize: 44, marginBottom: 8 }}>🍬</div>
      <Title level={2} style={{ margin: '0 0 4px', fontWeight: 800, letterSpacing: -1, color: BRAND.textPrimary }}>
        SugarMate
      </Title>
      <Text style={{ fontSize: 15, color: BRAND.textSecondary }}>
        服务商入驻 · 为糖尿病患者提供专业服务
      </Text>
    </div>
  );

  // ============ 进度跟踪视图（已提交后的状态页） ============
  if (submitted && existingApp) {
    const app = existingApp;
    const config = ROLE_CONFIG[app.role];
    const currentStepIdx = STATUS_STEP_MAP[app.status];
    const isRejected = app.status === 'REJECTED';
    const needsSupplement = app.status === 'NEED_SUPPLEMENT';
    const isOnline = app.status === 'ONLINE';
    const isAbnormal = isRejected || needsSupplement || app.status === 'FROZEN' || app.status === 'WITHDRAWN';

    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${BRAND.primaryBg} 0%, ${BRAND.bg} 40%)`,
        padding: isFromMP ? '12px' : '40px 20px',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {/* 返回 */}
          {!isFromMP && (
            <Button type="text" icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
              style={{ marginBottom: 16, color: BRAND.textSecondary, padding: '4px 8px' }}>
              返回首页
            </Button>
          )}

          {/* 品牌头部 */}
          {!isFromMP && <BrandHeader />}

          <Card style={{
            borderRadius: 16, border: `1px solid ${BRAND.border}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)',
            overflow: 'hidden',
          }}>
            {/* 头部 */}
            <div style={{
              background: isOnline ? `linear-gradient(135deg, ${BRAND.successBg}, #dcfce7)` :
                isAbnormal ? `linear-gradient(135deg, ${BRAND.warningBg}, ${BRAND.dangerBg})` :
                `linear-gradient(135deg, ${BRAND.primaryBg}, #dbeafe)`,
              padding: '20px 24px', margin: '-1px -1px 0',
            }}>
              <Space align="center" size={12}>
                <span style={{
                  fontSize: 36, width: 56, height: 56, borderRadius: 14,
                  background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  {config.icon}
                </span>
                <div>
                  <Title level={4} style={{ margin: 0, color: BRAND.textPrimary }}>{app.name}</Title>
                  <Space size={6}>
                    <Tag style={{ borderRadius: 6, fontSize: 11 }}
                      color={app.entityType === 'INSTITUTION' ? 'blue' : 'green'}>
                      {app.entityType === 'INSTITUTION' ? '机构入驻' : '个人入驻'}
                    </Tag>
                    <Tag style={{ borderRadius: 6, fontSize: 11 }}>{config.label}</Tag>
                    <Tag style={{ borderRadius: 6, fontSize: 11 }}
                      color={app.status === 'ONLINE' ? 'success' :
                             app.status === 'REJECTED' ? 'error' :
                             app.status === 'NEED_SUPPLEMENT' ? 'warning' :
                             app.status === 'PENDING' ? 'processing' :
                             app.status === 'APPROVED' ? 'cyan' : 'default'}>
                      {STATUS_LABEL[app.status]}
                    </Tag>
                  </Space>
                </div>
              </Space>
              {app.status === 'PENDING' && (
                <div style={{ position: 'absolute', top: 20, right: 24 }}>
                  <Button size="small" onClick={() => {
                    Modal.confirm({
                      title: '确认撤回申请？',
                      content: '撤回后需重新提交所有资料',
                      okText: '确认撤回',
                      cancelText: '取消',
                      onOk: () => {
                        store.withdrawApplication(app.id);
                        message.info('申请已撤回');
                      },
                    });
                  }}>撤回申请</Button>
                </div>
              )}
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* PENDING 状态提醒 */}
              {app.status === 'PENDING' && (
                <Alert
                  type="info" showIcon
                  icon={<ClockCircleOutlined />}
                  message="入驻申请已提交，等待运营审核"
                  description="审核团队将在1-3个工作日内处理您的申请。审核通过后进入资质审核环节，请耐心等待。"
                  action={
                    <Space direction="vertical" size={8}>
                      <Button type="primary" onClick={() => navigate(`/status?appId=${app.id}${app.phone ? `&phone=${encodeURIComponent(app.phone)}` : ''}`)} style={{ borderRadius: 8 }}>
                        查看审核进度
                      </Button>
                      <Button onClick={() => navigate('/onboarding')} style={{ borderRadius: 8 }}>
                        管理端审核
                      </Button>
                    </Space>
                  }
                  style={{ borderRadius: 10, marginBottom: 20 }}
                />
              )}

              {/* 审核进度条 */}
              {!isAbnormal && (
                <div style={{ marginBottom: 24 }}>
                  <Steps
                    current={currentStepIdx > 0 ? currentStepIdx - 1 : 0}
                    size="small"
                    status={isRejected ? 'error' : undefined}
                    items={ONBOARD_STEPS.map((s, i) => ({
                      title: s.title,
                      description: s.description,
                      ...(i < currentStepIdx - 1 ? { status: 'finish' as const } :
                          i === currentStepIdx - 1 && currentStepIdx > 0 ? { status: 'process' as const } : {}),
                    }))}
                  />
                </div>
              )}

              {/* 异常状态提示 */}
              {app.status === 'NEED_SUPPLEMENT' && (
                <Alert
                  type="warning" showIcon
                  icon={<ExclamationCircleOutlined />}
                  message="需补充资料"
                  description={
                    <div>
                      <Paragraph style={{ marginBottom: 8 }}>{app.rejectReason}</Paragraph>
                      {app.supplementItems && app.supplementItems.length > 0 && (
                        <div>
                          <Text strong>需补充的资料项：</Text>
                          <div style={{ marginTop: 6 }}>
                            {app.supplementItems.map((item, i) => (
                              <Tag key={i} color="orange" style={{ marginBottom: 4, borderRadius: 6 }}>{item}</Tag>
                            ))}
                          </div>
                        </div>
                      )}
                      <Divider style={{ margin: '12px 0' }} />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        请前往审核进度查询页面，系统将预填已有资料并引导您补充缺失项
                      </Text>
                    </div>
                  }
                  action={
                    <Button type="primary" onClick={() => navigate(`/status?appId=${app.id}${app.phone ? `&phone=${encodeURIComponent(app.phone)}` : ''}`)} style={{ borderRadius: 8 }}>
                      前往补充资料
                    </Button>
                  }
                  style={{ borderRadius: 10, marginBottom: 20 }}
                />
              )}

              {app.status === 'REJECTED' && (
                <Alert
                  type="error" showIcon
                  icon={<CloseCircleOutlined />}
                  message="审核不通过"
                  description={app.rejectReason || '您的入驻申请未通过审核，请重新提交'}
                  action={
                    <Space direction="vertical" size={8}>
                      <Button type="primary" onClick={handleRetry} style={{ borderRadius: 8 }}>重新申请入驻</Button>
                      <Button onClick={() => navigate(isFromMP ? '/mp/home' : '/')}>返回首页</Button>
                    </Space>
                  }
                  style={{ borderRadius: 10, marginBottom: 20 }}
                />
              )}

              {app.status === 'WITHDRAWN' && (
                <Alert
                  type="info" showIcon
                  message="申请已撤回"
                  description="您可以重新提交入驻申请"
                  action={<Button type="primary" onClick={handleRetry} style={{ borderRadius: 8 }}>重新申请</Button>}
                  style={{ borderRadius: 10, marginBottom: 20 }}
                />
              )}

              {/* 审核详情 */}
              {!isRejected && app.status !== 'WITHDRAWN' && (
                <>
                  <Descriptions bordered column={2} size="small"
                    style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}
                    labelStyle={{ fontWeight: 600 }}>
                    <Descriptions.Item label="申请编号">{app.id}</Descriptions.Item>
                    <Descriptions.Item label="角色类型"><Tag style={{ borderRadius: 6 }}>{config.label}</Tag></Descriptions.Item>
                    <Descriptions.Item label={app.entityType === 'INSTITUTION' ? '机构名称' : '姓名'}>{app.name}</Descriptions.Item>
                    <Descriptions.Item label="联系电话">{app.phone}</Descriptions.Item>
                    <Descriptions.Item label="提交时间">{app.submittedAt ? new Date(app.submittedAt).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
                    <Descriptions.Item label="审核SLA">
                      {app.slaDeadline ? (
                        <span>
                          {new Date(app.slaDeadline - 86400000).toLocaleDateString('zh-CN')}
                          {store.checkSLAStatus(app.id).overtime && (
                            <Tag color="red" style={{ marginLeft: 8, borderRadius: 6 }}>已超时</Tag>
                          )}
                        </span>
                      ) : '-'}
                    </Descriptions.Item>
                  </Descriptions>

                  {/* 审核日志 */}
                  {app.reviewLogs.filter(l => l.result !== 'N/A').length > 0 && (
                    <Collapse
                      size="small"
                      style={{ marginBottom: 16, borderRadius: 10, overflow: 'hidden' }}
                      items={[{
                        key: 'logs',
                        label: <span><AuditOutlined style={{ marginRight: 6 }} />审核记录（{app.reviewLogs.filter(l => l.result !== 'N/A').length}条）</span>,
                        children: (
                          <Timeline style={{ marginTop: 8 }}
                            items={app.reviewLogs.filter(l => l.result !== 'N/A').map(log => ({
                              color: log.result === 'ok' ? 'green' : log.result === 'fix' ? 'blue' :
                                     log.result === 'insufficient' ? 'orange' : 'red',
                              children: (
                                <div>
                                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{log.step}</div>
                                  <div style={{ fontSize: 13, color: BRAND.textSecondary }}>{log.comment}</div>
                                  <div style={{ fontSize: 11, color: BRAND.textTertiary, marginTop: 2 }}>
                                    {log.reviewedBy} · {new Date(log.reviewedAt).toLocaleString('zh-CN')}
                                  </div>
                                </div>
                              ),
                            }))}
                          />
                        ),
                      }]}
                    />
                  )}

                  {/* 签约状态 */}
                  {(app.role === 'PH' || app.role === 'DR' || app.role === 'PR') && app.currentStep >= 2 && (
                    <Card size="small" style={{
                      marginBottom: 12, borderRadius: 10,
                      background: BRAND.primaryBg, border: `1px solid ${BRAND.primaryBorder}`,
                    }}>
                      <Space>
                        <SolutionOutlined style={{ fontSize: 22, color: app.contract?.status === 'signed' ? BRAND.success : BRAND.warning }} />
                        <div>
                          <Text strong>电子签约</Text>
                          <div style={{ marginTop: 2 }}>
                            {app.contract?.status === 'signed' ? (
                              <Tag color="success" style={{ borderRadius: 6 }}>已签约 · {app.contract.signedAt ? new Date(app.contract.signedAt).toLocaleDateString('zh-CN') : ''}</Tag>
                            ) : app.contract?.status === 'sent' ? (
                              <Tag color="processing" style={{ borderRadius: 6 }}>待签署 · 请前往PC完成签约</Tag>
                            ) : (
                              <Tag style={{ borderRadius: 6 }}>待生成合同</Tag>
                            )}
                          </div>
                        </div>
                      </Space>
                    </Card>
                  )}

                  {/* 培训状态 */}
                  {app.training?.required && app.currentStep >= 3 && (
                    <Card size="small" style={{
                      marginBottom: 12, borderRadius: 10,
                      background: BRAND.successBg, border: '1px solid #d9f7be',
                    }}>
                      <Space>
                        <TrophyOutlined style={{ fontSize: 22, color: app.training.completed ? BRAND.success : BRAND.warning }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>合规培训</Text>
                            {app.training.completed && (
                              <Tag color="success" style={{ borderRadius: 6 }}>{app.training.score}分 · 通过</Tag>
                            )}
                          </div>
                          <Progress
                            percent={app.training.completed ? 100 :
                              Math.round((app.training.completedModules / app.training.totalModules) * 100)}
                            size="small" strokeColor={BRAND.primary}
                            style={{ margin: '8px 0' }}
                          />
                          {app.training.modules.length > 0 && (
                            <Collapse ghost size="small" items={[{
                              key: 'modules',
                              label: <Text style={{ fontSize: 12 }}>培训模块（{app.training.completedModules}/{app.training.totalModules}）</Text>,
                              children: app.training.modules.map((m, i) => (
                                <div key={i} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                                  {m.passed ? <CheckCircleOutlined style={{ color: BRAND.success }} /> :
                                    <ClockCircleOutlined style={{ color: BRAND.warning }} />}
                                  <Text style={{ fontSize: 13, flex: 1 }}>{m.name}</Text>
                                  {m.score !== undefined && (
                                    <Tag color={m.score >= 80 ? 'success' : 'error'} style={{ borderRadius: 6, fontSize: 10 }}>{m.score}分</Tag>
                                  )}
                                </div>
                              )),
                            }]} />
                          )}
                        </div>
                      </Space>
                    </Card>
                  )}

                  {/* 已上线成功 */}
                  {isOnline && (
                    <Alert
                      type="success" showIcon
                      icon={<RocketOutlined />}
                      message="恭喜！您的入驻已全部完成，正式上线运营"
                      description={`上线时间：${app.onlineAt ? new Date(app.onlineAt).toLocaleString('zh-CN') : '-'}`}
                      action={
                        <Button type="primary" size="large" style={{ borderRadius: 10 }}
                          onClick={() => navigate('/login')}>
                          <Space><RightOutlined />前往 PC 管理后台</Space>
                        </Button>
                      }
                      style={{ borderRadius: 10 }}
                    />
                  )}
                </>
              )}
            </div>
          </Card>

          {/* 状态变更历史 */}
          <Card size="small" title={<span>📋 状态变更历史</span>}
            style={{ borderRadius: 12, marginTop: 16, border: `1px solid ${BRAND.border}` }}>
            <Timeline items={app.statusHistory.map(h => ({
              color: h.to === 'REJECTED' ? 'red' :
                     h.to === 'NEED_SUPPLEMENT' ? 'orange' :
                     h.to === 'ONLINE' ? 'green' : 'blue',
              children: (
                <div>
                  <Text style={{ fontSize: 13 }}>
                    <Tag style={{ borderRadius: 6 }}>{STATUS_LABEL[h.from]}</Tag> →
                    <Tag color="blue" style={{ borderRadius: 6 }}>{STATUS_LABEL[h.to]}</Tag>
                  </Text>
                  <div style={{ fontSize: 11, color: BRAND.textTertiary, marginTop: 2 }}>
                    {new Date(h.at).toLocaleString('zh-CN')} · {h.operator}
                  </div>
                  {h.note && <div style={{ fontSize: 12, color: BRAND.textSecondary, marginTop: 4 }}>{h.note}</div>}
                </div>
              ),
            }))} />
          </Card>
        </div>
      </div>
    );
  }

  // ============ 申请表单视图（新申请） ============
  const specialtyConfig = selectedRole ? SPECIALTY_MAP[selectedRole] : null;
  const titleOptions = selectedRole ? TITLE_OPTIONS[selectedRole] : [];

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${BRAND.primaryBg} 0%, ${BRAND.bg} 50%)`,
      padding: isFromMP ? '12px 12px 24px' : '40px 20px 60px',
    }}>
      <div style={{ maxWidth: 600, width: '100%', margin: '0 auto' }}>
        {/* 返回按钮 */}
        {!isFromMP && (
          <Button type="text" icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ marginBottom: 8, color: BRAND.textSecondary, padding: '4px 8px', fontSize: 13 }}>
            返回
          </Button>
        )}

        {/* 品牌头部 */}
        {!isFromMP && <BrandHeader />}

        {/* 步骤指示器 */}
        <StepIndicator current={step} />

        {/* ============ Step 0: 角色选择 ============ */}
        {step === 0 && (
          <div>
            <Text style={{
              display: 'block', marginBottom: 24, fontSize: 18,
              fontWeight: 600, color: BRAND.textPrimary, textAlign: 'center',
            }}>
              平台服务角色
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {ROLE_CARDS.map(role => {
                const isSelected = selectedRole === role.code;
                return (
                  <div key={role.code}
                    onClick={() => { setSelectedRole(role.code); setStep(1); setStep1FormValues({}); }}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? role.color + '08' : BRAND.cardBg,
                      border: isSelected ? `2px solid ${role.color}` : `1px solid ${BRAND.border}`,
                      borderRadius: 14, padding: '24px 14px 20px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isSelected
                        ? `0 4px 16px ${role.color}20`
                        : '0 1px 3px rgba(0,0,0,0.03)',
                      transform: isSelected ? 'translateY(-1px)' : 'none',
                      textAlign: 'center',
                    }}
                  >
                    {/* 顶部图标 */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: isSelected ? role.color + '18' : BRAND.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, flexShrink: 0,
                      transition: 'all 0.2s',
                      color: role.color,
                    }}>
                      {role.icon}
                    </div>

                    {/* 标题 */}
                    <Text strong style={{ fontSize: 15, color: BRAND.textPrimary, marginTop: 2 }}>
                      {role.label}
                    </Text>

                    {/* 描述 */}
                    <div style={{ fontSize: 11, color: BRAND.textSecondary, lineHeight: 1.5, minHeight: 48 }}>
                      {role.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ Step 1: 基本信息 ============ */}
        {step === 1 && (
          <Card style={{
            borderRadius: 14, border: `1px solid ${BRAND.border}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            {selectedRole && (
              <div style={{
                marginBottom: 20, padding: '12px 16px',
                background: BRAND.primaryBg, borderRadius: 10,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 22 }}>{ROLE_CONFIG[selectedRole].icon}</span>
                <div>
                  <Text strong style={{ fontSize: 14 }}>{ROLE_CONFIG[selectedRole].label}</Text>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                    {ROLE_CONFIG[selectedRole].entityType === 'INSTITUTION' ? '机构入驻 · 需企业资质' : '个人入驻 · 需执业资质'}
                  </Text>
                </div>
              </div>
            )}

            <Form form={form} layout="vertical" size="large" style={{ maxWidth: 480 }}>

              {/* 药房表单 */}
              {isPharmacy && (
                <>
                  <Form.Item name="pharmacyName" label="药房名称" rules={[{ required: true, message: '请输入药房名称' }]}>
                    <Input prefix={<ShopOutlined style={{ color: BRAND.textTertiary }} />}
                      placeholder="与营业执照一致的全称" style={{ borderRadius: 10 }} />
                  </Form.Item>
                  <Form.Item name="licenseNo" label="营业执照注册号" rules={[{ required: true, message: '请输入统一社会信用代码' }]}>
                    <Input prefix={<FileProtectOutlined style={{ color: BRAND.textTertiary }} />}
                      placeholder="统一社会信用代码" style={{ borderRadius: 10 }} />
                  </Form.Item>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item name="legalPerson" label="法定代表人" rules={[{ required: true, message: '请输入法人姓名' }]}>
                        <Input prefix={<UserOutlined style={{ color: BRAND.textTertiary }} />}
                          placeholder="法人姓名" style={{ borderRadius: 10 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="legalPhone" label="法人手机号" rules={[
                        { required: true, message: '请输入手机号' },
                        { pattern: /^1[3-9]\d{9}$/, message: '格式不正确' },
                      ]}>
                        <Input prefix={<PhoneOutlined style={{ color: BRAND.textTertiary }} />}
                          placeholder="法人手机号" style={{ borderRadius: 10 }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="address" label="注册地址" rules={[{ required: true, message: '请输入注册地址' }]}>
                    <Input prefix={<EnvironmentOutlined style={{ color: BRAND.textTertiary }} />}
                      placeholder="与营业执照一致" style={{ borderRadius: 10 }} />
                  </Form.Item>
                  <Form.Item name="bizHours" label="营业时间">
                    <Input prefix={<ClockCircleOutlined style={{ color: BRAND.textTertiary }} />}
                      placeholder="例如 08:00-22:00" style={{ borderRadius: 10 }} />
                  </Form.Item>
                  <Form.Item name="businessScope" label="经营范围">
                    <Select mode="tags" placeholder="选择或输入经营范围" style={{ borderRadius: 10 }}
                      options={PH_DEPT_OPTIONS.map(o => ({ label: o, value: o }))} />
                  </Form.Item>
                </>
              )}

              {/* 个人入驻表单 */}
              {!isPharmacy && (
                <>
                  <Form.Item name="realName" label="真实姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                    <Input prefix={<UserOutlined style={{ color: BRAND.textTertiary }} />}
                      placeholder="与身份证一致" style={{ borderRadius: 10 }} />
                  </Form.Item>
                  <Form.Item name="phone" label="手机号码" rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '格式不正确' },
                  ]}>
                    <Input prefix={<PhoneOutlined style={{ color: BRAND.textTertiary }} />}
                      placeholder="手机号" style={{ borderRadius: 10 }} />
                  </Form.Item>
                  <Form.Item name="idCard" label="身份证号" rules={[
                    { required: true, message: '请输入身份证号' },
                  ]}>
                    <Input prefix={<IdcardOutlined style={{ color: BRAND.textTertiary }} />}
                      placeholder="18位身份证号" style={{ borderRadius: 10 }} />
                  </Form.Item>
                  {isPharmacist && (
                    <Form.Item name="affiliatedPharmacy" label="归属药店" rules={[{ required: true, message: '请选择归属药店' }]}
                      extra={<span style={{ fontSize: 11, color: BRAND.textTertiary }}>药师必须归属已入驻的药房方可审方</span>}>
                      <Select placeholder="搜索选择已入驻药店" showSearch style={{ borderRadius: 10 }}>
                        <Select.Option value="PH_001">仁心大药房（越秀区）</Select.Option>
                        <Select.Option value="PH_002">惠民药房（天河区）</Select.Option>
                      </Select>
                    </Form.Item>
                  )}
                  {isDoctorOrPharmacist && (
                    <Form.Item name="affiliatedOrg" label={isPharmacist ? '执业药店' : '执业医院/机构'} rules={[{ required: true, message: '请填写执业机构' }]}>
                      <Input prefix={<BankOutlined style={{ color: BRAND.textTertiary }} />}
                        placeholder={isPharmacist ? '执业药店名称' : '例如 市人民医院'} style={{ borderRadius: 10 }} />
                    </Form.Item>
                  )}
                  {!isDoctorOrPharmacist && (
                    <Form.Item name="affiliatedOrg" label="所在机构/单位">
                      <Input prefix={<BankOutlined style={{ color: BRAND.textTertiary }} />}
                        placeholder="例如 XX健康管理公司" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  )}
                  <Form.Item name="title" label="职称/职位">
                    <Select placeholder="请选择职称" style={{ borderRadius: 10 }}>
                      {titleOptions.map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
                    </Select>
                  </Form.Item>
                  {specialtyConfig && (
                    <Form.Item name="specialties" label={specialtyConfig.label}>
                      <Select mode="tags" placeholder="选择或输入擅长领域" style={{ borderRadius: 10 }}
                        options={specialtyConfig.options.map(o => ({ label: o, value: o }))} />
                    </Form.Item>
                  )}
                </>
              )}
            </Form>
          </Card>
        )}

        {/* ============ Step 2: 资质上传（与 /merchant 管理端共用 CertUploadPanel） ============ */}
        {step === 2 && selectedRole && (
          <Card style={{
            borderRadius: 14, border: `1px solid ${BRAND.border}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            <div style={{ maxWidth: 720 }}>
              <CertUploadPanel
                specs={certSpecs}
                value={certUploads}
                onChange={setCertUploads}
              />
            </div>
          </Card>
        )}

        {/* ============ 底部按钮 ============ */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 24, marginBottom: 40,
        }}>
          {step > 0 ? (
            <Button onClick={() => setStep(step - 1)}
              icon={<LeftOutlined />}
              style={{ borderRadius: 10, height: 40, padding: '0 20px' }}>
              上一步
            </Button>
          ) : (
            <Button onClick={handleBack}
              style={{ borderRadius: 10, height: 40, padding: '0 20px' }}>
              返回
            </Button>
          )}

          {step === 2 && (
            <Button type="primary" size="large" onClick={handleSubmit}
              loading={submitting}
              disabled={submitting}
              icon={<FormOutlined />}
              style={{
                borderRadius: 12, height: 46, padding: '0 32px',
                fontSize: 15, fontWeight: 600,
                background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryLight})`,
                border: 'none', boxShadow: `0 4px 12px ${BRAND.primary}40`,
              }}>
              {submitting ? '提交中...' : '提交申请'}
            </Button>
          )}

          {step < 2 && (
            <Button type="primary" size="large"
              onClick={() => {
                if (step === 0 && !selectedRole) { message.warning('请选择入驻角色'); return; }
                if (step === 1) {
                  form.validateFields().then(() => {
                    // Step1→2：先保存表单值（Form 在 step===2 卸载后会丢失字段）
                    const formValues = form.getFieldsValue();
                    setStep1FormValues(formValues);
                    // 按手机号精准查找已有申请
                    const phone = isPharmacy ? formValues.legalPhone : formValues.phone;
                    if (phone && /^1[3-9]\d{9}$/.test(phone)) {
                      const found = lookupByPhone(phone);
                      if (found) {
                        if (found.status === 'NEED_SUPPLEMENT' || found.status === 'REJECTED') {
                          message.info('该手机号已有入驻记录，请前往审核进度页面查看');
                          navigate(`/status?appId=${found.id}&phone=${encodeURIComponent(phone)}`);
                          return;
                        }
                        if (found.status === 'DRAFT') {
                          setExistingAppId(found.id);
                          message.info('检测到未提交的草稿，将继续填写资质并提交');
                        } else {
                          // 申请已在处理中（PENDING/INFO_APPROVED/APPROVED/签约中等）
                          const statusLabel = STATUS_LABEL[found.status] || found.status;
                          message.info(`该手机号已有入驻申请（${statusLabel}），无需重复提交，请查看申请进度`);
                          setExistingAppId(found.id);
                          setSubmitted(true);
                          return;
                        }
                      }
                    }
                    setStep(2);
                  }).catch((err) => {
                    if (!err?.errorFields?.length) return;
                    // 滚动到第一个报错字段（使用 Antd Form 原生方法）
                    const firstFieldName = err.errorFields[0].name;
                    form.scrollToField(firstFieldName);
                    message.warning(`请完善 ${err.errorFields.length} 项信息后继续`);
                  });
                  return;
                }
                setStep(step + 1);
              }}
              icon={<RightOutlined />}
              iconPosition="end"
              style={{
                borderRadius: 12, height: 46, padding: '0 32px',
                fontSize: 15, fontWeight: 600,
                background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.primaryLight})`,
                border: 'none', boxShadow: `0 4px 12px ${BRAND.primary}40`,
              }}>
              下一步
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingApplyPage;
