/**
 * MerchantAddDrawer — 统一商家/角色添加抽屉 V3.0
 *
 * V3.0 重构：资质上传改用公共组件 CertUploadPanel，与 /apply 共用同一份代码
 * - 药房：营业执照 / 药品经营许可证 / GSP证书 / 食品经营许可证 / 法人身份证
 * - 个人（医生/药师/营养师/健康管理师）：
 *   身份证 / 执业证书
 *
 * V2.0 核心改动：
 * 1. 资质上传按角色拆分为 5/3 项独立 Dragger
 * 2. 每项可填 证书编号 + 有效期
 * 3. 提交后通过 merchantStore.addMerchant() 创建商家并联动
 *    onboardingStore.createApplication(DRAFT) → submitApplication(PENDING)
 * 4. 走 /onboarding 完整审批（正常 + 异常），通过后自动同步：
 *    管理列表 + 资质中心(/certificates) + 合同管理(/contracts)
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Drawer, Form, Input, Select, Button, Space, Tag, Divider, Row, Col,
  Upload, message, Alert, Steps, Card, Typography, Tooltip,
} from 'antd';
import type { UploadFile } from 'antd';
import {
  CheckCircleOutlined, FileProtectOutlined,
  MedicineBoxOutlined, SafetyCertificateOutlined, IdcardOutlined,
  UserOutlined, PhoneOutlined, ShopOutlined, EnvironmentOutlined,
  ClockCircleOutlined, BankOutlined, ExclamationCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import {
  useMerchantStore, type MerchantRole, type CreateMerchantInput,
  type Certificate, ROLE_LABEL,
} from '@/stores/merchantStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import CertUploadPanel, {
  type CertUploadItem, PH_CERT_SPECS, PERSONAL_CERT_TYPE,
  PERSONAL_CERT_LABEL, getPersonalCertSpecs, buildEmptyCertUploads,
} from './CertUploadPanel';

const { Title, Text } = Typography;

interface MerchantAddDrawerProps {
  open: boolean;
  mode: 'add' | 'edit';
  role: MerchantRole;
  initialData?: Partial<MerchantAddFormData>;
  onClose: () => void;
  onSubmit?: (data: MerchantAddFormData) => void;
}

/** 表单数据 — 内部结构 */
export interface MerchantAddFormData {
  role: MerchantRole;
  entityType: 'INSTITUTION' | 'INDIVIDUAL';

  // === 药房字段 ===
  pharmacyName?: string;
  licenseNo?: string;       // 统一社会信用代码
  legalPerson?: string;
  legalPhone?: string;
  address?: string;
  bizHours?: string;
  businessScope?: string[];

  // === 个人字段 ===
  realName?: string;
  phone?: string;
  idCard?: string;
  title?: string;
  affiliatedOrg?: string;   // 执业医院/药店
  affiliatedPharmacy?: string; // 药师归属药店
  specialties?: string[];

  // === 资质证书（结构化） ===
  certificates: CertUploadItem[];
}

// ============ 角色 Tag 配置 ============
const ROLE_TAG: Record<MerchantRole, { color: string; label: string; icon: React.ReactNode }> = {
  PHARMACY: { color: 'green', label: '药房入驻', icon: <MedicineBoxOutlined /> },
  DOCTOR: { color: 'blue', label: '医生入驻', icon: <UserOutlined /> },
  PHARMACIST: { color: 'orange', label: '药师入驻', icon: <SafetyCertificateOutlined /> },
  NUTRITIONIST: { color: 'purple', label: '营养师入驻', icon: <IdcardOutlined /> },
  HEALTH_MANAGER: { color: 'cyan', label: '健康管理师入驻', icon: <IdcardOutlined /> },
};

// 营业范围选项（药房）
const PH_DEPT_OPTIONS = ['处方药', 'OTC药品', '医疗器械', '保健品', '中药饮片', '胰岛素冷链', '特殊医学用途配方食品'];

// 擅长领域选项（个人）
const SPECIALTY_OPTIONS: Record<MerchantRole, { label: string; options: string[] }> = {
  PHARMACY: { label: '经营范围', options: [] },
  DOCTOR: { label: '擅长领域', options: ['2型糖尿病', '1型糖尿病', '妊娠糖尿病', '糖尿病肾病', '糖尿病足', '甲状腺疾病', '肥胖管理'] },
  PHARMACIST: { label: '擅长领域', options: ['处方审核', '药物相互作用', '胰岛素用药指导', '慢病用药管理'] },
  NUTRITIONIST: { label: '擅长领域', options: ['糖尿病饮食', '减重管理', '孕期营养', '儿童营养', '肾病饮食', '老年营养'] },
  HEALTH_MANAGER: { label: '擅长领域', options: ['慢病管理', '健康评估', '生活方式指导', '体重管理'] },
};

const TITLE_OPTIONS: Record<MerchantRole, string[]> = {
  PHARMACY: ['药房负责人', '药房经理', '药店店长', '药房主管'],
  DOCTOR: ['主任医师', '副主任医师', '主治医师', '住院医师'],
  PHARMACIST: ['主任药师', '主管药师', '执业药师'],
  NUTRITIONIST: ['注册营养师', '高级营养师', '营养师', '营养指导师'],
  HEALTH_MANAGER: ['高级健康管理师', '健康管理师', '助理健康管理师'],
};

const MerchantAddDrawer: React.FC<MerchantAddDrawerProps> = ({
  open, mode, role, initialData, onClose, onSubmit,
}) => {
  const [form] = Form.useForm();
  const merchantStore = useMerchantStore();
  const onboardingStore = useOnboardingStore();

  // 资质上传：每个证书类型一份独立 state（共用 CertUploadPanel）
  const [certUploads, setCertUploads] = useState<Record<string, CertUploadItem>>({});
  const [submitting, setSubmitting] = useState(false);

  const isPharmacy = role === 'PHARMACY';
  // 当前角色对应的证书规格
  const certSpecs = useMemo(
    () => isPharmacy ? PH_CERT_SPECS : getPersonalCertSpecs(role),
    [isPharmacy, role]
  );

  // 初始化/重置表单
  useEffect(() => {
    if (open) {
      form.resetFields();
      if (mode === 'edit' && initialData) {
        form.setFieldsValue({
          pharmacyName: initialData.pharmacyName,
          licenseNo: initialData.licenseNo,
          legalPerson: initialData.legalPerson,
          legalPhone: initialData.legalPhone,
          address: initialData.address,
          bizHours: initialData.bizHours,
          businessScope: initialData.businessScope,
          realName: initialData.realName,
          phone: initialData.phone,
          idCard: initialData.idCard,
          title: initialData.title,
          affiliatedOrg: initialData.affiliatedOrg,
          affiliatedPharmacy: initialData.affiliatedPharmacy,
          specialties: initialData.specialties,
        });
        // 编辑场景：先用 spec 初始化空项，再用已有数据覆盖
        const uploads = buildEmptyCertUploads(certSpecs);
        (initialData.certificates || []).forEach((c: any) => {
          if (!uploads[c.type]) {
            uploads[c.type] = {
              type: c.type, name: c.name, files: [], required: true,
            };
          }
          if (c.fileUrl || c.name) {
            uploads[c.type].files.push({
              uid: c.id, name: c.name, status: 'done',
              url: c.fileUrl, thumbUrl: c.fileUrl,
            } as any);
          }
          if (c.certNo) uploads[c.type].certNo = c.certNo;
          if (c.expireAt) uploads[c.type].expireAt = c.expireAt;
        });
        setCertUploads(uploads);
      } else {
        // 新增场景：基于 spec 初始化空 state
        setCertUploads(buildEmptyCertUploads(certSpecs));
      }
    }
  }, [open, mode, role, certSpecs]);

  /** 收集所有上传的证书 → Certificate[] */
  const buildCertificates = (): Certificate[] => {
    const certs: Certificate[] = [];
    certSpecs.forEach(spec => {
      const item = certUploads[spec.type];
      if (!item) return;
      // 多槽位模式：每个 slot 单独成一条证书记录，name 带"正面/反面/正本/副本"等后缀
      if (spec.slotLabels && spec.slotLabels.length > 0 && item.slotFiles && item.slotFiles.length > 0) {
        spec.slotLabels.forEach((slotLabel, idx) => {
          const f = item.slotFiles![idx];
          if (!f) return;
          certs.push({
            id: `cert-${item.type}-slot${idx}-${Date.now()}`,
            type: item.type,
            name: `${item.name}（${slotLabel}）`,
            fileUrl: f.thumbUrl || f.url,
            status: 'pending',
            certNo: item.certNo,
            expireAt: item.expireAt,
          });
        });
        return;
      }
      // 普通模式：files 平铺收集
      item.files.forEach((f, idx) => {
        certs.push({
          id: `cert-${item.type}-${Date.now()}-${idx}`,
          type: item.type,
          name: f.name || item.name,
          fileUrl: f.thumbUrl || f.url,
          status: 'pending',
          certNo: item.certNo,
          expireAt: item.expireAt,
        });
      });
    });
    return certs;
  };

  /** 校验必填证书 */
  const validateCertificates = (): { ok: boolean; missing: string[] } => {
    const missing: string[] = [];
    certSpecs.forEach(spec => {
      if (!spec.required) return;
      const item = certUploads[spec.type];
      if (!item) {
        missing.push(spec.name);
        return;
      }
      // 多槽位模式：每个槽位都必须有文件
      if (spec.slotLabels && spec.slotLabels.length > 0) {
        const slotFiles = item.slotFiles || [];
        const missingSlots: string[] = [];
        spec.slotLabels.forEach((label, idx) => {
          if (!slotFiles[idx]) missingSlots.push(label);
        });
        if (missingSlots.length > 0) {
          missing.push(`${item.name}（${missingSlots.join('、')}）`);
        }
        return;
      }
      // 普通模式：至少 1 张
      if (item.files.length === 0) {
        missing.push(item.name);
      }
    });
    return { ok: missing.length === 0, missing };
  };

  /** 提交 */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 校验资质必填
      const { ok, missing } = validateCertificates();
      if (!ok) {
        message.error(`请上传以下资质：${missing.join('、')}`);
        return;
      }

      setSubmitting(true);

      const certificates = buildCertificates();

      // 编辑模式：仅更新商家基本信息
      if (mode === 'edit') {
        // 这里直接走 merchantStore.updateMerchant
        // editTarget 由父组件传入（暂以表单值更新当前商家）
        message.info('编辑模式请通过列表编辑按钮调用 updateMerchant');
        onSubmit?.({
          role, entityType: isPharmacy ? 'INSTITUTION' : 'INDIVIDUAL',
          ...values, certificates,
        });
        setSubmitting(false);
        onClose();
        return;
      }

      // 新增模式：通过 merchantStore.addMerchant → 联动 onboardingStore.createApplication(DRAFT)
      // 然后再 onboardingStore.submitApplication(id) → 进入 PENDING 审核
      const merchantInput: CreateMerchantInput = {
        role,
        entityType: isPharmacy ? 'INSTITUTION' : 'INDIVIDUAL',
        source: 'admin_add',  // 标记来源：管理员添加
        certificates,
      };

      if (isPharmacy) {
        merchantInput.name = values.pharmacyName;
        merchantInput.company = values.pharmacyName;
        merchantInput.licenseNo = values.licenseNo;
        merchantInput.phone = values.legalPhone;
        merchantInput.businessScope = (values.businessScope || []).join('、');
        merchantInput.address = values.address;
        (merchantInput as any).legalPerson = values.legalPerson;
        (merchantInput as any).legalPhone = values.legalPhone;
        (merchantInput as any).bizHours = values.bizHours;
      } else {
        merchantInput.name = values.realName;
        merchantInput.phone = values.phone;
        merchantInput.idCard = values.idCard;
        merchantInput.title = values.title;
        merchantInput.company = values.affiliatedOrg;
        merchantInput.specialties = values.specialties || [];
        if (role === 'PHARMACIST' && values.affiliatedPharmacy) {
          (merchantInput as any).affiliatedPharmacyName = values.affiliatedPharmacy;
          (merchantInput as any).boundPharmacyName = values.affiliatedPharmacy;
        }
      }

      // === 核心：调用 addMerchant 联动创建 DRAFT ===
      const merchant = merchantStore.addMerchant(merchantInput);

      // === 提交到审核流：从 DRAFT → PENDING ===
      // P0 修复 V2：addMerchant 内部通过 useOnboardingStore.getState().createApplication()
      // 同步写入了真正的 store 状态，但 onboardingStore（hook 快照）在本次渲染中
      // 不会更新，必须用 getState() 直读真实状态
      const appState = useOnboardingStore.getState();
      const apps = appState.applications.filter(
        a => a.phone === merchant.phone && a.status === 'DRAFT'
      );
      if (apps.length > 0) {
        // 取最新创建的那条（防止重名手机号历史残留）
        const latest = apps.reduce((acc, cur) => cur.createdAt > acc.createdAt ? cur : acc);
        appState.submitApplication(latest.id);
      }

      // 调用外部回调（如有）
      onSubmit?.({
        role, entityType: isPharmacy ? 'INSTITUTION' : 'INDIVIDUAL',
        ...values, certificates,
      });

      message.success(
        `${ROLE_TAG[role].label}已提交至 [入驻审核管理]，审批通过后将自动同步到管理列表、资质中心、合同管理`
      );

      setSubmitting(false);
      onClose();
    } catch (err) {
      // 校验失败
      setSubmitting(false);
    }
  };

  // ============ 资质上传：使用公共组件 CertUploadPanel ============
  const tag = ROLE_TAG[role];

  return (
    <Drawer
      title={
        <Space>
          <span style={{ fontSize: 20 }}>{tag.icon}</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>
            {mode === 'add' ? `添加${tag.label.replace('入驻', '')}` : `编辑${tag.label.replace('入驻', '')}`}
          </span>
          <Tag color={tag.color} style={{ borderRadius: 6, marginLeft: 8 }}>{tag.label}</Tag>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={720}
      destroyOnClose
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} style={{ borderRadius: 8 }}>取消</Button>
          <Button
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
            icon={mode === 'add' ? <RocketOutlined /> : <CheckCircleOutlined />}
            style={{ borderRadius: 8 }}
          >
            {mode === 'add' ? '提交至入驻审核' : '保存修改'}
          </Button>
        </Space>
      }
    >
      {/* 流程引导 */}
      {mode === 'add' && (
        <Alert
          type="info"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message="数据流转说明"
          description={
            <div style={{ fontSize: 12, lineHeight: 1.7 }}>
              提交后，{tag.label}申请将进入 <b>入驻审核管理</b> 走完审批流程；
              <br />审核通过后，将自动同步到 <b>管理列表（本页）</b>、<b>资质中心</b>、<b>合同管理</b>。
              <br />本页仅展示已上线数据，审核流程请前往 [入驻审核管理]。
            </div>
          }
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        size="middle"
        requiredMark={(label, info) => (
          <>
            {label}
            {info.required && <span style={{ color: '#dc2626', marginLeft: 4 }}>*</span>}
          </>
        )}
      >
        {/* ============ 基本信息 ============ */}
        <Title level={5} style={{ marginBottom: 12 }}>
          <Space>
            <UserOutlined />
            基本信息
          </Space>
        </Title>

        {/* 药房字段 */}
        {isPharmacy && (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="pharmacyName"
                  label="药房名称"
                  rules={[{ required: true, message: '请输入药房名称' }]}
                >
                  <Input prefix={<ShopOutlined />} placeholder="与营业执照一致的全称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="licenseNo"
                  label="营业执照注册号"
                  rules={[{ required: true, message: '请输入统一社会信用代码' }]}
                >
                  <Input prefix={<FileProtectOutlined />} placeholder="统一社会信用代码" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="legalPerson"
                  label="法定代表人"
                  rules={[{ required: true, message: '请输入法人姓名' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="法人姓名" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="legalPhone"
                  label="法人手机号"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '格式不正确' },
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="法人手机号" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="address"
              label="注册地址"
              rules={[{ required: true, message: '请输入注册地址' }]}
            >
              <Input prefix={<EnvironmentOutlined />} placeholder="与营业执照一致" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="bizHours" label="营业时间">
                  <Input prefix={<ClockCircleOutlined />} placeholder="例如 08:00-22:00" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="businessScope" label="经营范围">
                  <Select
                    mode="tags"
                    placeholder="选择或输入经营范围"
                    options={PH_DEPT_OPTIONS.map(o => ({ label: o, value: o }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* 个人字段 */}
        {!isPharmacy && (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="realName"
                  label="真实姓名"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="与身份证一致" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="手机号码"
                  rules={[
                    { required: true, message: '请输入手机号' },
                    { pattern: /^1[3-9]\d{9}$/, message: '格式不正确' },
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="手机号" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="idCard"
                  label="身份证号"
                  rules={[
                    { required: true, message: '请输入身份证号' },
                    { pattern: /^\d{17}[\dX]$/, message: '请输入正确的18位身份证号' },
                  ]}
                >
                  <Input prefix={<IdcardOutlined />} placeholder="18位身份证号" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="title" label="职称/职位">
                  <Select placeholder="请选择职称" options={TITLE_OPTIONS[role].map(t => ({ label: t, value: t }))} />
                </Form.Item>
              </Col>
            </Row>

            {role === 'PHARMACIST' && (
              <Form.Item
                name="affiliatedPharmacy"
                label="归属药店"
                rules={[{ required: true, message: '请填写归属药店' }]}
                extra={<span style={{ fontSize: 11, color: '#94a3b8' }}>药师必须归属已入驻的药房方可审方</span>}
              >
                <Input prefix={<BankOutlined />} placeholder="已入驻药店名称" />
              </Form.Item>
            )}

            {(role === 'DOCTOR' || role === 'PHARMACIST') && (
              <Form.Item
                name="affiliatedOrg"
                label={role === 'PHARMACIST' ? '执业药店' : '执业医院/机构'}
                rules={[{ required: true, message: '请填写执业机构' }]}
              >
                <Input prefix={<BankOutlined />} placeholder={role === 'PHARMACIST' ? '执业药店名称' : '例如 市人民医院'} />
              </Form.Item>
            )}

            {role === 'NUTRITIONIST' && (
              <Form.Item name="affiliatedOrg" label="所在机构/单位">
                <Input prefix={<BankOutlined />} placeholder="例如 XX健康管理公司" />
              </Form.Item>
            )}

            {role === 'HEALTH_MANAGER' && (
              <Form.Item name="affiliatedOrg" label="所在机构/单位">
                <Input prefix={<BankOutlined />} placeholder="例如 XX健康管理公司" />
              </Form.Item>
            )}

            <Form.Item name="specialties" label={SPECIALTY_OPTIONS[role].label}>
              <Select
                mode="tags"
                placeholder="选择或输入擅长领域"
                options={SPECIALTY_OPTIONS[role].options.map(o => ({ label: o, value: o }))}
              />
            </Form.Item>
          </>
        )}

        {/* ============ 资质上传（公共组件 CertUploadPanel） ============ */}
        <Divider style={{ margin: '20px 0 16px' }} />
        <CertUploadPanel
          specs={certSpecs}
          value={certUploads}
          onChange={setCertUploads}
          subtitle={
            isPharmacy
              ? '需上传以下 5 类证照：营业执照、药品经营许可证、GSP证书、食品经营许可证、法人身份证'
              : `需上传以下 3 类证照：身份证（正反两面）、${PERSONAL_CERT_LABEL[role] || '执业证书'}`
          }
        />
      </Form>
    </Drawer>
  );
};

export default MerchantAddDrawer;