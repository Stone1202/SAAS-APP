/**
 * 资质上传面板（公共组件）V1.1.0
 *
 * 变更记录：
 * - V1.0.0：初版，从 MerchantAddDrawer/OnboardingApplyPage 抽离
 * - V1.1.0：支持多槽位（正反/正副）独立上传。CertSpec 新增 slotLabels：
 *   - slotLabels 存在时：UI 渲染 N 个独立 Dragger，每个槽位强制上传 1 张，必填校验按槽位进行
 *   - 例：ID_CARD → ['正面', '反面']，DRUG_LICENSE → ['正本', '副本']
 *   - CertUploadItem 新增 slotFiles?: UploadFile[] 字段，按索引 0..N-1 存储
 *   - 收集方需遍历 slotFiles（如 OnboardingApplyPage.collectCertificates / MerchantAddDrawer.buildCertificates）
 */
import React, { useMemo } from 'react';
import { Upload, message, Alert, Input, DatePicker, Form, Row, Col, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs, { type Dayjs } from 'dayjs';
import { CERT_TYPE_LABEL } from '@/contracts/merchant';

const { Dragger } = Upload;
const { Text } = Typography;

/** 单条证书的规格说明 */
export interface CertSpec {
  type: string;             // 证书类型（与 CERT_TYPE_LABEL key 对齐）
  name: string;             // 证书显示名
  maxCount: number;         // 最多可上传张数
  required: boolean;        // 是否必填
  hint?: string;            // 提示文案
  /**
   * 多张证件的槽位标签（按顺序）。
   * - 设置时：UI 渲染 N 个独立 Dragger，每个槽位独立必填、独立上限 1 张
   * - 不设置：保持原行为，渲染单个 Dragger（多文件平铺）
   * - 例：身份证 → ['正面', '反面']，药品经营许可证 → ['正本', '副本']
   */
  slotLabels?: string[];
}

/** 单条证书的运行时数据 */
export interface CertUploadItem {
  type: string;
  name: string;
  files: UploadFile[];              // 普通模式：多张文件平铺
  certNo?: string;                  // 证书编号
  expireAt?: string;                // 有效期（ISO 字符串）
  required: boolean;
  /**
   * 多槽位模式：按 slotLabels 索引 0..N-1 存储每个槽位的文件
   * - slotLabels 不存在：忽略此字段
   * - slotLabels 存在：每个槽位独立 1 张，files 字段保持为空数组
   */
  slotFiles?: UploadFile[];
}

/** 药店入驻需要上传的资质规格 */
export const PH_CERT_SPECS: CertSpec[] = [
  { type: 'BUSINESS_LICENSE', name: CERT_TYPE_LABEL.BUSINESS_LICENSE, maxCount: 1, required: true, hint: '清晰完整的营业执照原件照片或扫描件' },
  { type: 'DRUG_LICENSE', name: CERT_TYPE_LABEL.DRUG_LICENSE, maxCount: 2, required: true, slotLabels: ['正本', '副本'], hint: '需上传药品经营许可证正本与副本' },
  { type: 'GSP_CERT', name: CERT_TYPE_LABEL.GSP_CERT, maxCount: 1, required: true, hint: 'GSP 认证证书（药品经营质量管理规范认证）' },
  { type: 'FOOD_LICENSE', name: CERT_TYPE_LABEL.FOOD_LICENSE, maxCount: 1, required: false, hint: '食品经营许可证（如有）' },
  { type: 'ID_CARD', name: CERT_TYPE_LABEL.ID_CARD, maxCount: 2, required: true, slotLabels: ['正面', '反面'], hint: '需上传法人身份证正面与反面' },
];

/** 个人专家角色对应的证书类型 */
export const PERSONAL_CERT_TYPE: Record<string, string> = {
  DOCTOR: 'DOCTOR_CERT',
  PHARMACIST: 'PHARMACIST_CERT',
  NUTRITIONIST: 'NUTRITIONIST_CERT',
  HEALTH_MANAGER: 'HEALTH_MANAGER_CERT',
};

/** 个人专家角色对应的证书显示名 */
export const PERSONAL_CERT_LABEL: Record<string, string> = {
  DOCTOR: CERT_TYPE_LABEL.DOCTOR_CERT,
  PHARMACIST: CERT_TYPE_LABEL.PHARMACIST_CERT,
  NUTRITIONIST: CERT_TYPE_LABEL.NUTRITIONIST_CERT,
  HEALTH_MANAGER: CERT_TYPE_LABEL.HEALTH_MANAGER_CERT,
};

/** 根据个人角色返回资质规格列表 */
export const getPersonalCertSpecs = (role: string): CertSpec[] => {
  const personalCertType = PERSONAL_CERT_TYPE[role] || 'PERSONAL_CERT';
  const personalCertLabel = CERT_TYPE_LABEL[personalCertType] || '执业证书';
  return [
    { type: 'ID_CARD', name: CERT_TYPE_LABEL.ID_CARD, maxCount: 2, required: true, slotLabels: ['正面', '反面'], hint: '需上传身份证正面与反面' },
    { type: personalCertType, name: personalCertLabel, maxCount: 1, required: true, hint: `清晰完整的${personalCertLabel}原件照片或扫描件` },
  ];
};

/** 根据规格列表构造一个全空的运行时数据结构 */
export const buildEmptyCertUploads = (specs: CertSpec[]): Record<string, CertUploadItem> => {
  const out: Record<string, CertUploadItem> = {};
  for (const spec of specs) {
    const item: CertUploadItem = {
      type: spec.type,
      name: spec.name,
      files: [],
      required: spec.required,
    };
    if (spec.slotLabels && spec.slotLabels.length > 0) {
      item.slotFiles = spec.slotLabels.map(() => null as unknown as UploadFile);
    }
    out[spec.type] = item;
  }
  return out;
};

export interface CertUploadPanelProps {
  specs: CertSpec[];
  value: Record<string, CertUploadItem>;
  onChange: (next: Record<string, CertUploadItem>) => void;
  /** 顶部副标题（如："需上传以下 3 类证照：身份证（正反两面）、注册营养师证书"） */
  subtitle?: string;
  /** 自定义底部提示，默认通用"资质审核提示" */
  footerHint?: string;
}

const FILE_SIZE_LIMIT_MB = 10;
const ACCEPT_IMAGES = 'image/*';
const ACCEPT_PDF = '.pdf';

const beforeUploadCheck = (file: File): boolean => {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  if (!isImage && !isPdf) {
    message.error('仅支持 JPG / PNG / PDF 格式');
    return Upload.LIST_IGNORE;
  }
  const isLt10M = file.size / 1024 / 1024 < FILE_SIZE_LIMIT_MB;
  if (!isLt10M) {
    message.error(`单文件不能超过 ${FILE_SIZE_LIMIT_MB}MB`);
    return Upload.LIST_IGNORE;
  }
  return true;
};

const CertUploadPanel: React.FC<CertUploadPanelProps> = ({ specs, value, onChange, subtitle, footerHint }) => {
  const updateCert = (type: string, patch: Partial<CertUploadItem>) => {
    onChange({ ...value, [type]: { ...value[type], ...patch } });
  };

  /**
   * 普通模式：上传单张
   */
  const handleUpload = (type: string) => (file: File) => {
    const before = value[type]?.files || [];
    if (before.length >= 1) {
      message.warning('此证书已上传，请先删除再重新上传');
      return Upload.LIST_IGNORE;
    }
    updateCert(type, { files: [{ uid: `${type}-${Date.now()}`, name: file.name, status: 'done', originFileObj: file as any } as UploadFile] });
    return false; // 阻止 antd 自动上传
  };

  /**
   * 多槽位模式：上传到指定槽位
   */
  const handleSlotUpload = (type: string, slotIndex: number) => (file: File) => {
    const item = value[type];
    const slotFiles = (item.slotFiles || []).slice();
    if (slotFiles[slotIndex]) {
      message.warning('此槽位已上传，请先删除再重新上传');
      return Upload.LIST_IGNORE;
    }
    slotFiles[slotIndex] = {
      uid: `${type}-slot${slotIndex}-${Date.now()}`,
      name: file.name,
      status: 'done',
      originFileObj: file as any,
    } as UploadFile;
    updateCert(type, { slotFiles });
    return false;
  };

  /**
   * 普通模式：删除文件
   */
  const handleRemove = (type: string) => () => {
    updateCert(type, { files: [] });
  };

  /**
   * 多槽位模式：删除指定槽位
   */
  const handleSlotRemove = (type: string, slotIndex: number) => () => {
    const item = value[type];
    const slotFiles = (item.slotFiles || []).slice();
    slotFiles[slotIndex] = null as unknown as UploadFile;
    updateCert(type, { slotFiles });
  };

  const handleCertNoChange = (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCert(type, { certNo: e.target.value });
  };

  const handleExpireAtChange = (type: string) => (date: Dayjs | null) => {
    updateCert(type, { expireAt: date ? date.toISOString() : undefined });
  };

  /**
   * 多槽位 Dragger 渲染
   */
  const renderSlotDragger = (spec: CertSpec) => {
    const item = value[spec.type];
    const slotFiles = (item?.slotFiles || []) as UploadFile[];
    const slotCount = spec.slotLabels!.length;
    return (
      <div className="cert-slot-grid">
        {spec.slotLabels!.map((label, idx) => {
          const f = slotFiles[idx];
          const uploaded = !!f;
          return (
            <div key={idx} className={`cert-slot ${uploaded ? 'cert-slot--uploaded' : 'cert-slot--empty'}`}>
              <div className="cert-slot__label">
                {label}
                {spec.required && <span className="cert-required-mark"> *</span>}
              </div>
              {!uploaded ? (
                <Dragger
                  accept={`${ACCEPT_IMAGES},${ACCEPT_PDF}`}
                  multiple={false}
                  showUploadList={false}
                  beforeUpload={beforeUploadCheck}
                  customRequest={() => {}}
                  onChange={info => {
                    const file = info.file as unknown as File;
                    if (file) handleSlotUpload(spec.type, idx)(file);
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖拽上传</p>
                  <p className="ant-upload-hint">JPG / PNG / PDF · ≤{FILE_SIZE_LIMIT_MB}MB</p>
                </Dragger>
              ) : (
                <div className="cert-slot__preview">
                  <div className="cert-slot__file-name">{f.name}</div>
                  <a className="cert-slot__remove" onClick={handleSlotRemove(spec.type, idx)}>删除</a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * 普通模式 Dragger 渲染
   */
  const renderSingleDragger = (spec: CertSpec) => {
    const item = value[spec.type];
    const uploaded = (item?.files?.length || 0) > 0;
    const f = uploaded ? item.files[0] : null;
    return (
      <div className="cert-single">
        {!uploaded ? (
          <Dragger
            accept={`${ACCEPT_IMAGES},${ACCEPT_PDF}`}
            multiple={false}
            showUploadList={false}
            beforeUpload={beforeUploadCheck}
            customRequest={() => {}}
            onChange={info => {
              const file = info.file as unknown as File;
              if (file) handleUpload(spec.type)(file);
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽上传{spec.name}</p>
            <p className="ant-upload-hint">支持 JPG / PNG / PDF，单文件 {FILE_SIZE_LIMIT_MB}MB</p>
          </Dragger>
        ) : (
          <div className="cert-single__preview">
            <div className="cert-single__file-name">{f!.name}</div>
            <a className="cert-single__remove" onClick={handleRemove(spec.type)}>删除</a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="cert-upload-panel">
      {subtitle && <div className="cert-upload-panel__subtitle">{subtitle}</div>}
      {specs.map((spec, idx) => {
        const item = value[spec.type];
        const expireAt = item?.expireAt ? dayjs(item.expireAt) : null;
        const hasSlots = !!(spec.slotLabels && spec.slotLabels.length > 0);
        return (
          <div key={spec.type} className={`cert-card ${spec.required ? 'cert-card--required' : ''}`}>
            <div className="cert-card__title">
              <span>{spec.name}</span>
              {spec.required && <span className="cert-required-mark"> *</span>}
              <span className="cert-card__size-hint">≤{FILE_SIZE_LIMIT_MB}MB</span>
            </div>
            <Row gutter={16} align="top">
              <Col xs={24} md={hasSlots ? 24 : 14}>
                {hasSlots ? renderSlotDragger(spec) : renderSingleDragger(spec)}
                {spec.hint && <div className="cert-card__hint">{spec.hint}</div>}
              </Col>
              <Col xs={24} md={hasSlots ? 24 : 10}>
                <Form.Item label="证书编号（可选）" colon={false} className="cert-card__form-item">
                  <Input
                    prefix={<span style={{ opacity: 0.5 }}>📄</span>}
                    placeholder="如：证书编号"
                    value={item?.certNo}
                    onChange={handleCertNoChange(spec.type)}
                    allowClear
                  />
                </Form.Item>
                <Form.Item label="有效期至（可选）" colon={false} className="cert-card__form-item">
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="年/月/日"
                    value={expireAt}
                    onChange={handleExpireAtChange(spec.type)}
                    format="YYYY-MM-DD"
                    showTime={false}
                  />
                </Form.Item>
              </Col>
            </Row>
            {idx < specs.length - 1 && <div className="cert-card__divider" />}
          </div>
        );
      })}
      <Alert
        type="warning"
        showIcon
        message={footerHint || '资质审核提示'}
        description="请确保上传的资质文件清晰完整且在有效期内。审核不通过可重新提交，虚假资质将被永久列入黑名单。"
        className="cert-upload-panel__footer-alert"
      />
    </div>
  );
};

export default CertUploadPanel;
