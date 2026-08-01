/**
 * 统一商家/成员表单弹窗 V1.0.0
 * 
 * 所有角色（药房/医生/药师/营养师）管理页面的
 * 添加和编辑操作统一使用此组件，确保：
 * 1. 表单字段与入驻申请页一致
 * 2. 审批流程一致（新建自动进入 PENDING 审核）
 * 3. 各角色的必填证照类型一致
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal, Form, Input, Select, Button, Space, Upload, Tag,
  message, Steps, Radio,
} from 'antd';
import type { UploadFile } from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import {
  MerchantRoleEnum,
  type MerchantRole,
  ROLE_LABEL,
  getRoleFieldConfig,
  getRequiredCertsForRole,
  CERT_TYPE_LABEL,
  type Certificate,
} from '@/contracts/merchant';

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

// ==================== 表单数据类型 ====================
export interface MerchantFormData {
  role: MerchantRole;
  entityType: 'INSTITUTION' | 'INDIVIDUAL';
  name: string;
  phone: string;
  email?: string;
  gender?: 'M' | 'F';
  idCard?: string;
  company?: string;
  licenseNo?: string;
  businessScope?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  department?: string;
  title?: string;
  specialties?: string[];
  /** 药师：所属药房名称 */
  affiliatedPharmacyName?: string;
  certificates: Certificate[];
}

// ==================== Props ====================
export interface MerchantFormModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  /** 添加时必须指定角色，编辑时从 initialData 提取 */
  role?: MerchantRole;
  /** 编辑时必须提供 */
  initialData?: MerchantFormData;
  onClose: () => void;
  onSubmit: (data: MerchantFormData) => void;
}

// ==================== 组件 ====================
const MerchantFormModal: React.FC<MerchantFormModalProps> = ({
  open,
  mode,
  role: paramRole,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm<MerchantFormData>();
  const [selectedRole, setSelectedRole] = useState<MerchantRole | undefined>(undefined);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // 获取当前角色的字段配置
  const fieldConfig = selectedRole ? getRoleFieldConfig(selectedRole) : null;
  const requiredCerts = selectedRole ? getRequiredCertsForRole(selectedRole) : [];

  // 初始化表单
  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && initialData) {
      setSelectedRole(initialData.role);
      form.setFieldsValue(initialData);
      // 还原证书文件列表
      const certFiles = initialData.certificates.map((c, i) => ({
        uid: c.id,
        name: c.name,
        status: 'done' as const,
        url: c.fileUrl || '',
        certData: c,
      }));
      setFileList(certFiles);
    } else if (mode === 'add' && paramRole) {
      setSelectedRole(paramRole);
      form.resetFields();
      form.setFieldsValue({ role: paramRole, entityType: 'INDIVIDUAL', certificates: [] });
      setFileList([]);
    } else if (mode === 'add') {
      form.resetFields();
      setSelectedRole(undefined);
      setFileList([]);
    }
  }, [open, mode, initialData, paramRole, form]);

  // 角色变更
  const handleRoleChange = useCallback((value: MerchantRole) => {
    setSelectedRole(value);
    form.resetFields(['entityType', 'name', 'phone', 'email', 'gender', 'idCard',
      'company', 'licenseNo', 'businessScope', 'province', 'city', 'district',
      'address', 'department', 'title', 'specialties', 'affiliatedPharmacyName']);
    form.setFieldsValue({ role: value, entityType: value === 'PHARMACY' ? 'INSTITUTION' : 'INDIVIDUAL' });
    setFileList([]);
  }, [form]);

  // 证照上传处理
  const handleCertUpload = useCallback((file: File) => {
    const certType = requiredCerts[fileList.length] || 'BUSINESS_LICENSE';
    const fakeUrl = URL.createObjectURL(file);
    const cert: Certificate = {
      id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      certNo: '',
      type: certType as Certificate['type'],
      name: file.name,
      fileUrl: fakeUrl,
      status: 'pending',
    };

    const newFile: UploadFile = {
      uid: cert.id,
      name: file.name,
      status: 'done',
      url: fakeUrl,
    };

    setFileList(prev => [...prev, newFile]);

    // 同步更新表单中的 certificates 字段
    const currentCerts = form.getFieldValue('certificates') || [];
    form.setFieldsValue({ certificates: [...currentCerts, cert] });

    return false; // 阻止自动上传
  }, [requiredCerts, fileList, form]);

  const handleRemoveCert = useCallback((file: UploadFile) => {
    setFileList(prev => prev.filter(f => f.uid !== file.uid));
    const currentCerts: Certificate[] = form.getFieldValue('certificates') || [];
    form.setFieldsValue({ certificates: currentCerts.filter(c => c.id !== file.uid) });
  }, [form]);

  // 提交
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // 组装证书数据
      const certificates: Certificate[] = fileList.map(f => {
        const existingCert = (initialData?.certificates || []).find(c => c.id === f.uid);
        if (existingCert) return existingCert;
        return {
          id: f.uid,
          certNo: '',
          type: (requiredCerts[0] || 'BUSINESS_LICENSE') as Certificate['type'],
          name: f.name,
          fileUrl: f.url || f.thumbUrl || '',
          status: 'pending' as const,
        };
      });

      onSubmit({ ...values, certificates });
    } catch (err) {
      // 表单校验失败
    } finally {
      setSubmitting(false);
    }
  }, [form, fileList, initialData, requiredCerts, onSubmit]);

  // ==================== 渲染 ====================
  return (
    <Modal
      title={mode === 'add'
        ? `添加${paramRole ? ROLE_LABEL[paramRole] : '商家/成员'}`
        : `编辑${selectedRole ? ROLE_LABEL[selectedRole] : '商家/成员'}`}
      open={open}
      onCancel={onClose}
      width={720}
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            {mode === 'add' ? '提交审核' : '保存修改'}
          </Button>
        </Space>
      }
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        initialValues={{
          role: paramRole,
          entityType: 'INDIVIDUAL',
          certificates: [],
        }}
      >
        {/* ====== 步骤1: 选择角色（仅添加模式） ====== */}
        {mode === 'add' && !paramRole && (
          <Form.Item
            name="role"
            label="角色类型"
            rules={[{ required: true, message: '请选择角色类型' }]}
          >
            <Select
              placeholder="选择角色类型"
              onChange={handleRoleChange}
              size="large"
              style={{ width: '100%' }}
            >
              {(MerchantRoleEnum.options as readonly MerchantRole[]).map(role => (
                <Option key={role} value={role}>{ROLE_LABEL[role]}</Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* 已选定角色提示 */}
        {paramRole && mode === 'add' && (
          <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f6f8fa', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="blue">{ROLE_LABEL[paramRole]}</Tag>
            <span style={{ color: '#666', fontSize: 13 }}>
              将按{ROLE_LABEL[paramRole]}的入驻标准创建，提交后进入审核流程
            </span>
          </div>
        )}

        {selectedRole && (
          <>
            {/* ====== 步骤2: 主体类型（仅药房） ====== */}
            {selectedRole === 'PHARMACY' && (
              <Form.Item name="entityType" label="主体类型" rules={[{ required: true }]}>
                <Radio.Group>
                  <Radio.Button value="INSTITUTION">企业/机构</Radio.Button>
                  <Radio.Button value="INDIVIDUAL">个体工商户</Radio.Button>
                </Radio.Group>
              </Form.Item>
            )}

            {/* ====== 步骤3: 基本信息 ====== */}
            <div style={{ fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
              基本信息
            </div>

            <Form.Item
              name="name"
              label="名称"
              rules={[{ required: true, message: '请输入名称' }]}
            >
              <Input placeholder={selectedRole === 'PHARMACY' ? '药房/机构全称' : '真实姓名'} size="large" />
            </Form.Item>

            <Space size={16} style={{ width: '100%' }}>
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1\d{10}$/, message: '手机号格式不正确' },
                ]}
                style={{ width: 280 }}
              >
                <Input placeholder="11位手机号" size="large" />
              </Form.Item>

              <Form.Item name="gender" label="性别" style={{ width: 140 }}>
                <Select placeholder="选择" size="large">
                  <Option value="M">男</Option>
                  <Option value="F">女</Option>
                </Select>
              </Form.Item>
            </Space>

            <Space size={16} style={{ width: '100%' }}>
              <Form.Item name="email" label="电子邮箱" style={{ width: 320 }}>
                <Input placeholder="选填" size="large" />
              </Form.Item>

              <Form.Item name="idCard" label="身份证号" style={{ width: 320 }}>
                <Input placeholder="选填" size="large" />
              </Form.Item>
            </Space>

            {/* ====== 步骤4: 机构/专业信息 ====== */}
            <div style={{ fontWeight: 600, marginBottom: 12, marginTop: 8, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
              {selectedRole === 'PHARMACY' ? '机构信息' : '专业信息'}
            </div>

            {/* 药房特有 */}
            {selectedRole === 'PHARMACY' && (
              <>
                <Form.Item name="company" label="统一社会信用代码" rules={[{ required: true }]}>
                  <Input placeholder="18位统一社会信用代码" size="large" />
                </Form.Item>
                <Form.Item name="licenseNo" label="药品经营许可证号" rules={[{ required: true }]}>
                  <Input placeholder="许可证编号" size="large" />
                </Form.Item>
                <Form.Item name="businessScope" label="经营范围" rules={[{ required: true }]}>
                  <TextArea rows={3} placeholder="如：处方药、OTC药品、医疗器械、保健食品" />
                </Form.Item>
              </>
            )}

            {/* 医生特有 */}
            {selectedRole === 'DOCTOR' && (
              <>
                <Form.Item name="company" label="执业机构" rules={[{ required: true }]}>
                  <Input placeholder="医院/诊所名称" size="large" />
                </Form.Item>
                <Space size={16} style={{ width: '100%' }}>
                  <Form.Item name="department" label="所在科室" rules={[{ required: true }]} style={{ width: 300 }}>
                    <Select placeholder="选择科室" size="large">
                      <Option value="内分泌科">内分泌科</Option>
                      <Option value="心血管内科">心血管内科</Option>
                      <Option value="神经内科">神经内科</Option>
                      <Option value="肾内科">肾内科</Option>
                      <Option value="营养科">营养科</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="title" label="职称" rules={[{ required: true }]} style={{ width: 280 }}>
                    <Select placeholder="选择职称" size="large">
                      <Option value="主任医师">主任医师</Option>
                      <Option value="副主任医师">副主任医师</Option>
                      <Option value="主治医师">主治医师</Option>
                      <Option value="住院医师">住院医师</Option>
                    </Select>
                  </Form.Item>
                </Space>
                <Form.Item name="specialties" label="擅长领域">
                  <Select mode="tags" placeholder="输入擅长领域，回车添加" size="large" />
                </Form.Item>
              </>
            )}

            {/* 药师特有 */}
            {selectedRole === 'PHARMACIST' && (
              <>
                <Form.Item name="licenseNo" label="执业药师注册证号" rules={[{ required: true, message: '请输入执业药师注册证号' }]}>
                  <Input placeholder="注册证编号" size="large" />
                </Form.Item>
                <Form.Item name="affiliatedPharmacyName" label="所属药房" rules={[{ required: true, message: '请输入所属药房名称' }]}>
                  <Input placeholder="绑定的药房名称" size="large" />
                </Form.Item>
              </>
            )}

            {/* 营养师特有 */}
            {selectedRole === 'NUTRITIONIST' && (
              <>
                <Form.Item name="title" label="专业资质" rules={[{ required: true }]}>
                  <Select placeholder="选择资质等级" size="large">
                    <Option value="注册营养师">注册营养师</Option>
                    <Option value="公共营养师">公共营养师</Option>
                    <Option value="临床营养师">临床营养师</Option>
                    <Option value="运动营养师">运动营养师</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="specialties" label="服务方向">
                  <Select mode="tags" placeholder="输入服务方向，回车添加" size="large" />
                </Form.Item>
                <Form.Item name="company" label="执业机构">
                  <Input placeholder="选填" size="large" />
                </Form.Item>
              </>
            )}

            {/* 地址信息（所有角色） */}
            {selectedRole === 'PHARMACY' && (
              <>
                <Space size={16} style={{ width: '100%' }}>
                  <Form.Item name="province" label="省份" rules={[{ required: true }]} style={{ width: 200 }}>
                    <Input placeholder="如：广东省" size="large" />
                  </Form.Item>
                  <Form.Item name="city" label="城市" rules={[{ required: true }]} style={{ width: 200 }}>
                    <Input placeholder="如：广州市" size="large" />
                  </Form.Item>
                  <Form.Item name="district" label="区县" style={{ width: 200 }}>
                    <Input placeholder="如：越秀区" size="large" />
                  </Form.Item>
                </Space>
                <Form.Item name="address" label="详细地址" rules={[{ required: true }]}>
                  <Input placeholder="街道门牌号" size="large" />
                </Form.Item>
              </>
            )}

            {(selectedRole === 'DOCTOR' || selectedRole === 'PHARMACIST') && (
              <Space size={16} style={{ width: '100%' }}>
                <Form.Item name="province" label="省份" rules={[{ required: true }]} style={{ width: 200 }}>
                  <Input placeholder="如：广东省" size="large" />
                </Form.Item>
                <Form.Item name="city" label="城市" rules={[{ required: true }]} style={{ width: 200 }}>
                  <Input placeholder="如：广州市" size="large" />
                </Form.Item>
              </Space>
            )}

            {/* ====== 步骤5: 证照上传 ====== */}
            <div style={{ fontWeight: 600, marginBottom: 12, marginTop: 8, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
              证照上传
              <Tag color="red" style={{ marginLeft: 8 }}>必填</Tag>
            </div>

            {requiredCerts.length > 0 && (
              <div style={{ marginBottom: 16, padding: '8px 12px', background: '#fffbe6', borderRadius: 6 }}>
                <span style={{ color: '#d48806', fontSize: 13 }}>
                  需上传以下证照：{requiredCerts.map(c => CERT_TYPE_LABEL[c] || c).join('、')}
                </span>
              </div>
            )}

            <Form.Item name="certificates" style={{ display: 'none' }}>
              <Input />
            </Form.Item>

            <Dragger
              multiple
              fileList={fileList}
              beforeUpload={handleCertUpload}
              onRemove={handleRemoveCert}
              accept=".jpg,.jpeg,.png,.pdf"
              listType="picture"
              maxCount={8}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽证照文件到此区域</p>
              <p className="ant-upload-hint">支持 JPG、PNG、PDF 格式，单文件不超过 10MB</p>
            </Dragger>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default MerchantFormModal;
