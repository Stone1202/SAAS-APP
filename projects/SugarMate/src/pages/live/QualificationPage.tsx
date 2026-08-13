/**
 * PG-SUG-LIVE 资质管理 V1.0.0
 * 
 * 上传资质证照（医生证/营养师证/药剂师证）、审核状态查看、
 * 资质有效期管理、直播权限开通状态、直播分类设置。
 * OCL约束：仅医生/药剂师+有直播资质才能展示处方药。
 * 关联UC-SUG-LIVE-003 主播资质管理
 */
import React, { useState } from 'react';
import {
  Typography, Card, Button, Space, Tag, Row, Col,
  Upload, Descriptions, Timeline, Modal, Form, Input,
  DatePicker, Select, message, Alert, Badge,
} from 'antd';
import {
  IdcardOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined,
  UploadOutlined, PlusOutlined, ExclamationCircleOutlined,
  MedicineBoxOutlined, EnvironmentOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import MobileFrame from '../../components/MobileFrame';

const { Text, Title } = Typography;

interface Qualification {
  id: string; type: string; status: 'approved' | 'pending' | 'rejected' | 'expired';
  issueDate: string; expireDate: string; file: string; note?: string;
}

const quals: Qualification[] = [
  { id: '1', type: '执业医师资格证', status: 'approved', issueDate: '2020-06-15', expireDate: '2025-06-14', file: '医师证.pdf' },
  { id: '2', type: '内分泌科主治医师', status: 'approved', issueDate: '2023-01-10', expireDate: '2028-01-09', file: '职称证.pdf' },
];

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  approved: { color: 'green', icon: <CheckCircleOutlined />, label: '审核通过' },
  pending: { color: 'orange', icon: <ClockCircleOutlined />, label: '审核中' },
  rejected: { color: 'red', icon: <CloseCircleOutlined />, label: '审核驳回' },
  expired: { color: 'default', icon: <ExclamationCircleOutlined />, label: '已过期' },
};

const Page: React.FC = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [form] = Form.useForm();

  return (
    <MobileFrame title="资质管理" tabs={[]} basePath="live">
      <div style={{ padding: 12 }}>
        {/* 直播权限状态 */}
        <Card style={{
          borderRadius: 12, marginBottom: 12,
          background: 'linear-gradient(135deg, #f6ffed, #e6ffe6)',
          border: '1px solid #b7eb8f',
        }}>
          <Space>
            <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
            <div>
              <Text strong style={{ fontSize: 14, color: '#389e0d' }}>直播权限已开通</Text>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                资质齐全有效，可进行健康科普/讲堂/带货直播
              </Text>
            </div>
          </Space>
          <div style={{ marginTop: 8 }}>
            <Space size={4}>
              <Tag color="blue">健康科普</Tag>
              <Tag color="purple">医生讲堂</Tag>
              <Tag color="orange">直播带货</Tag>
            </Space>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: '#ff4d4f' }}>
            <ExclamationCircleOutlined /> 带货直播展示处方药需药剂师+药店双资质
          </div>
        </Card>

        {/* 资质列表 */}
        <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text strong style={{ fontSize: 13 }}>资质证照</Text>
          <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => setUploadModalOpen(true)}>
            上传资质
          </Button>
        </Space>

        {quals.map(q => (
          <Card key={q.id} size="small" style={{ marginBottom: 8, borderRadius: 10 }}>
            <Row align="middle">
              <Col>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: '#f0f5ff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>
                  <IdcardOutlined style={{ color: '#1677ff' }} />
                </div>
              </Col>
              <Col flex={1} style={{ paddingLeft: 10 }}>
                <Text strong style={{ fontSize: 13 }}>{q.type}</Text>
                <div style={{ marginTop: 2 }}>
                  <Tag color={statusConfig[q.status].color} icon={statusConfig[q.status].icon}>
                    {statusConfig[q.status].label}
                  </Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 2 }}>
                  有效期：{q.issueDate} ~ {q.expireDate}
                </Text>
              </Col>
              <Col>
                <Button size="small" type="link">查看</Button>
              </Col>
            </Row>
          </Card>
        ))}

        {/* 审核记录 Timeline */}
        <Card size="small" style={{ borderRadius: 10, marginTop: 12 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>审核记录</Text>
          <Timeline
            items={[
              { color: 'green', children: <div><Text style={{ fontSize: 12 }}>资质审核通过</Text><br /><Text type="secondary" style={{ fontSize: 10 }}>2023-01-10</Text></div> },
              { color: 'orange', children: <div><Text style={{ fontSize: 12 }}>直播权限申请</Text><br /><Text type="secondary" style={{ fontSize: 10 }}>2026-07-15 提交</Text></div> },
              { color: 'green', children: <div><Text style={{ fontSize: 12 }}>直播权限开通</Text><br /><Text type="secondary" style={{ fontSize: 10 }}>2026-07-16 审核通过</Text></div> },
            ]}
          />
        </Card>

        {/* 上传Modal */}
        <Modal
          title="上传资质"
          open={uploadModalOpen}
          onCancel={() => setUploadModalOpen(false)}
          onOk={() => { setUploadModalOpen(false); message.success('资质已提交审核'); }}
          width={320}
        >
          <Form form={form} layout="vertical" size="small">
            <Form.Item label="资质类型" name="type" rules={[{ required: true }]}>
              <Select
                placeholder="选择资质类型"
                options={[
                  { label: '执业医师资格证', value: 'doctor' },
                  { label: '执业药师资格证', value: 'pharmacist' },
                  { label: '职称证书', value: 'title' },
                  { label: '其他资质', value: 'other' },
                ]}
              />
            </Form.Item>
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item label="签发日期" name="issueDate"><DatePicker style={{ width: '100%' }} /></Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="到期日期" name="expireDate"><DatePicker style={{ width: '100%' }} /></Form.Item>
              </Col>
            </Row>
            <Form.Item label="上传证照" name="file">
              <Upload beforeUpload={() => false} listType="picture" maxCount={1}>
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MobileFrame>
  );
};

export default Page;
