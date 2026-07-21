import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Space, Input, Select, Modal, Form, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import { useOpsStore } from '../../stores/useOpsStore';
import type { Tenant } from '../../contracts/schemas';

const statusMap: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: 'green', label: '活跃' },
  PENDING: { color: 'orange', label: '审核中' },
  TRIAL: { color: 'blue', label: '试用' },
  GRACE: { color: 'gold', label: '宽限期' },
  SUSPENDED: { color: 'red', label: '挂起' },
  CLOSED: { color: 'default', label: '已关闭' },
};

export default function TenantList() {
  const navigate = useNavigate();
  const { tenants, loading, loadTenants, approveTenant, rejectTenant } = useOpsStore();
  const [approvalModal, setApprovalModal] = useState<{ open: boolean; tenant: Tenant | null }>({ open: false, tenant: null });
  const [form] = Form.useForm();

  useEffect(() => { loadTenants(); }, []);

  const columns: ColumnsType<Tenant> = [
    { title: '租户ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '企业名称', dataIndex: 'companyName', key: 'companyName', width: 160 },
    { title: '行业', dataIndex: 'industry', key: 'industry', width: 80, render: (v: string) => <Tag>{v}</Tag> },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (v: string) => <Tag color={v === '企业版' ? 'red' : v === '专业版' ? 'purple' : 'blue'}>{v}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label}</Tag>,
    },
    { title: '到期日', dataIndex: 'expireDate', key: 'expireDate', width: 110 },
    {
      title: '健康度',
      dataIndex: 'healthScore',
      key: 'healthScore',
      width: 90,
      render: (v: number) => {
        const color = v >= 80 ? '#52C41A' : v >= 60 ? '#FAAD14' : '#FF4D4F';
        return <Tag color={color}>{v}</Tag>;
      },
    },
    {
      title: 'AI用量',
      dataIndex: 'aiUsagePercent',
      key: 'aiUsagePercent',
      width: 80,
      render: (v: number) => `${v}%`,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, r) => (
        <Space>
          <a onClick={() => navigate(`/ops/tenants/${r.id}`)}>详情</a>
          {r.status === 'PENDING' && (
            <a onClick={() => { setApprovalModal({ open: true, tenant: r }); form.resetFields(); }}>
              审核
            </a>
          )}
        </Space>
      ),
    },
  ];

  const handleApprove = async () => {
    try {
      const values = await form.validateFields();
      await approveTenant(approvalModal.tenant!.id, values);
      message.success('租户审核通过');
      setApprovalModal({ open: false, tenant: null });
    } catch { /* validation */ }
  };

  const handleReject = async () => {
    Modal.confirm({
      title: '驳回申请',
      content: '确定驳回该租户的申请？驳回后将发送通知。',
      okText: '确定驳回',
      okType: 'danger',
      onOk: async () => {
        await rejectTenant(approvalModal.tenant!.id, '不满足入驻条件');
        message.success('已驳回');
        setApprovalModal({ open: false, tenant: null });
      },
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>租户列表</h1>
        <div className="description">管理所有SAAS租户，支持审核、查看详情和状态监控</div>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Input prefix={<SearchOutlined />} placeholder="搜索企业名称..." style={{ width: 240 }} allowClear />
            <Select defaultValue="all" style={{ width: 100 }} options={[
              { label: '全部状态', value: 'all' },
              { label: '活跃', value: 'ACTIVE' },
              { label: '审核中', value: 'PENDING' },
              { label: '试用', value: 'TRIAL' },
            ]} />
          </Space>
          <Button type="primary">新建租户</Button>
        </div>

        <Table
          columns={columns}
          dataSource={tenants}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 个租户` }}
        />
      </Card>

      {/* 审核弹窗 */}
      <Modal
        title={`审核租户 - ${approvalModal.tenant?.companyName}`}
        open={approvalModal.open}
        onOk={handleApprove}
        onCancel={() => setApprovalModal({ open: false, tenant: null })}
        width={640}
        okText="审核通过，开通租户"
        footer={[
          <Button key="reject" danger onClick={handleReject}>驳回</Button>,
          <Button key="approve" type="primary" onClick={handleApprove}>审核通过，开通租户</Button>,
        ]}
      >
        {approvalModal.tenant && (
          <div style={{ marginTop: 16 }}>
            <Card size="small" style={{ marginBottom: 16, background: '#F5F5F5' }}>
              <div>企业名称：{approvalModal.tenant.companyName}</div>
              <div>所属行业：{approvalModal.tenant.industry}</div>
              <div>申请版本：{approvalModal.tenant.version}</div>
              <div>联系人：{approvalModal.tenant.contactName} {approvalModal.tenant.contactPhone}</div>
              <div>公司规模：{approvalModal.tenant.companySize}</div>
            </Card>
            <Form form={form} layout="vertical">
              <Form.Item name="version" label="开通版本" rules={[{ required: true }]} initialValue={approvalModal.tenant.version}>
                <Select options={[
                  { label: '体验版', value: '体验版' },
                  { label: '基础版', value: '基础版' },
                  { label: '专业版', value: '专业版' },
                  { label: '企业版', value: '企业版' },
                ]} />
              </Form.Item>
              <Form.Item name="trialDays" label="试用时长" rules={[{ required: true }]} initialValue={15}>
                <Select options={[
                  { label: '7天', value: 7 },
                  { label: '15天', value: 15 },
                  { label: '30天', value: 30 },
                ]} />
              </Form.Item>
              <Form.Item name="notes" label="备注">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
