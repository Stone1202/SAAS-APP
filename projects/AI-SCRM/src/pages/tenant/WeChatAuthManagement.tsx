import { useState } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, message, Tooltip } from 'antd';
import { PlusOutlined, ReloadOutlined, StopOutlined, SyncOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// PG-TNT-PC-020 企微授权管理（FN-WX-PC-001）
interface WeChatAccount {
  id: string;
  corpId: string;
  corpName: string;
  employeeCount: number;
  customerCount: number;
  groupCount: number;
  syncStatus: 'PENDING' | 'SYNCING' | 'AUTHORIZED' | 'EXPIRED' | 'REVOKED';
  syncAt: string;
  createdAt: string;
}

const mockData: WeChatAccount[] = [
  {
    id: 'W001',
    corpId: 'ww1234567890abcdef',
    corpName: '九天科技销售部',
    employeeCount: 35,
    customerCount: 1280,
    groupCount: 12,
    syncStatus: 'AUTHORIZED',
    syncAt: '2026-07-23 09:30:00',
    createdAt: '2026-01-15',
  },
  {
    id: 'W002',
    corpId: 'ww0987654321fedcba',
    corpName: '九天科技客服部',
    employeeCount: 18,
    customerCount: 560,
    groupCount: 6,
    syncStatus: 'SYNCING',
    syncAt: '2026-07-23 10:00:00',
    createdAt: '2026-03-20',
  },
  {
    id: 'W003',
    corpId: 'wwabcdef1234567890',
    corpName: '九天科技市场部',
    employeeCount: 12,
    customerCount: 0,
    groupCount: 1,
    syncStatus: 'EXPIRED',
    syncAt: '2026-06-15 08:00:00',
    createdAt: '2026-02-01',
  },
];

const statusMap: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'default', label: '待授权' },
  SYNCING: { color: 'processing', label: '同步中' },
  AUTHORIZED: { color: 'success', label: '已授权' },
  EXPIRED: { color: 'warning', label: '已过期' },
  REVOKED: { color: 'error', label: '已解除' },
};

export default function WeChatAuthManagement() {
  const [dataSource, setDataSource] = useState<WeChatAccount[]>(mockData);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [syncLoading, setSyncLoading] = useState<string | null>(null);

  const handleAdd = () => setModalOpen(true);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const newAccount: WeChatAccount = {
        id: `W${Date.now()}`,
        corpId: values.corpId,
        corpName: values.corpName,
        employeeCount: 0,
        customerCount: 0,
        groupCount: 0,
        syncStatus: 'PENDING',
        syncAt: '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setDataSource(prev => [...prev, newAccount]);
      setModalOpen(false);
      form.resetFields();
      message.success('已发起企微授权，待管理员在企业微信后台确认');
      // 模拟授权确认后开始同步
      setTimeout(() => {
        setDataSource(prev => prev.map(a =>
          a.id === newAccount.id && a.syncStatus === 'PENDING'
            ? { ...a, syncStatus: 'SYNCING', syncAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
            : a
        ));
      }, 3000);
      setTimeout(() => {
        setDataSource(prev => prev.map(a =>
          a.id === newAccount.id && a.syncStatus === 'SYNCING'
            ? { ...a, syncStatus: 'AUTHORIZED', employeeCount: 5, customerCount: 42 }
            : a
        ));
      }, 8000);
    } catch {
      // validation failed
    }
  };

  const handleReSync = (record: WeChatAccount) => {
    setSyncLoading(record.id);
    message.info('正在重新同步客户数据...');
    setTimeout(() => {
      setDataSource(prev => prev.map(a =>
        a.id === record.id
          ? { ...a, syncStatus: 'AUTHORIZED', syncAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
          : a
      ));
      setSyncLoading(null);
      message.success('数据同步完成');
    }, 2000);
  };

  const handleRevoke = (record: WeChatAccount) => {
    Modal.confirm({
      title: `确认解除「${record.corpName}」的企微授权？`,
      content: '解除后将无法同步该企微账号下的客户和客户群数据，历史数据保留。',
      okText: '确认解除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setDataSource(prev => prev.map(a =>
          a.id === record.id ? { ...a, syncStatus: 'REVOKED' } : a
        ));
        message.success('已解除企微授权');
      },
    });
  };

  const columns: ColumnsType<WeChatAccount> = [
    {
      title: '企业名称',
      dataIndex: 'corpName',
      key: 'corpName',
      width: 180,
    },
    {
      title: 'CorpID',
      dataIndex: 'corpId',
      key: 'corpId',
      width: 220,
      ellipsis: true,
    },
    {
      title: '授权状态',
      dataIndex: 'syncStatus',
      key: 'syncStatus',
      width: 100,
      render: (status: string) => {
        const cfg = statusMap[status] || { color: 'default', label: status };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: '员工数',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      width: 80,
      align: 'center',
    },
    {
      title: '客户数',
      dataIndex: 'customerCount',
      key: 'customerCount',
      width: 80,
      align: 'center',
    },
    {
      title: '客户群数',
      dataIndex: 'groupCount',
      key: 'groupCount',
      width: 90,
      align: 'center',
    },
    {
      title: '最后同步',
      dataIndex: 'syncAt',
      key: 'syncAt',
      width: 170,
      render: (val: string) => val || '—',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.syncStatus === 'AUTHORIZED' || record.syncStatus === 'EXPIRED' ? (
            <Tooltip title="重新同步客户和客户群数据">
              <Button
                size="small"
                icon={<ReloadOutlined />}
                loading={syncLoading === record.id}
                onClick={() => handleReSync(record)}
              >
                同步
              </Button>
            </Tooltip>
          ) : null}
          {record.syncStatus !== 'REVOKED' && record.syncStatus !== 'PENDING' ? (
            <Tooltip title="解除该企微账号的授权绑定">
              <Button
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={() => handleRevoke(record)}
              >
                解除
              </Button>
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>企微授权管理</h1>
        <div className="description">
          管理企业微信多账号授权与数据同步，支持一个租户绑定多个企微账号
        </div>
      </div>

      <Card
        title="已授权企微账号"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加授权
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: '暂无授权企微账号，点击「添加授权」绑定您的企业微信' }}
          size="middle"
        />
      </Card>

      <Modal
        title="添加企微授权"
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText="发起授权"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="企业名称"
            name="corpName"
            rules={[{ required: true, message: '请输入企业名称' }]}
          >
            <Input placeholder="如：九天科技销售部" />
          </Form.Item>
          <Form.Item
            label="CorpID"
            name="corpId"
            rules={[{ required: true, message: '请输入企业微信CorpID' }]}
            extra="在企业微信管理后台「我的企业—企业信息」中查看"
          >
            <Input placeholder="如：ww1234567890abcdef" />
          </Form.Item>
          <Form.Item
            label="CorpSecret（密钥）"
            name="corpSecret"
            rules={[{ required: true, message: '请输入CorpSecret' }]}
            extra="用于API数据同步，加密存储"
          >
            <Input.Password placeholder="请输入CorpSecret" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
