import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  CopyOutlined,
  EyeOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ShoppingOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useOpsStore } from '../../stores/useOpsStore';
import type { Tenant } from '../../contracts/schemas';

const { Option } = Select;
const { Text, Link } = Typography;

const searchFieldOptions = [
  { value: 'all', label: '全部' },
  { value: 'id', label: '租户编号' },
  { value: 'contactPhone', label: '租户手机号' },
];

const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 'ACTIVE', label: '正常' },
  { value: 'PENDING', label: '待审核' },
  { value: 'TRIAL', label: '体验中' },
  { value: 'GRACE', label: '宽限期' },
  { value: 'SUSPENDED', label: '已停用' },
  { value: 'CLOSED', label: '已关闭' },
];

const statusTagMap: Record<string, { color: string }> = {
  ACTIVE: { color: 'success' },
  PENDING: { color: 'processing' },
  TRIAL: { color: 'blue' },
  GRACE: { color: 'warning' },
  SUSPENDED: { color: 'error' },
  CLOSED: { color: 'default' },
};

function formatDateTime(iso?: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function TenantList() {
  const navigate = useNavigate();
  const { tenants, loading, loadTenants, toggleTenantEnabled, approveTenant, rejectTenant } = useOpsStore();

  const [searchForm, setSearchForm] = useState({
    field: 'all',
    keyword: '',
    status: 'all' as string,
  });

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      let hit = true;
      if (searchForm.status !== 'all') {
        // Match by Tenant status (ACTIVE/PENDING/etc), fallback to enabled boolean for backward compat
        if (t.status) {
          hit = hit && t.status === searchForm.status;
        } else {
          const enabled = searchForm.status === 'true' || searchForm.status === 'ACTIVE';
          const disabled = searchForm.status === 'false' || searchForm.status === 'SUSPENDED';
          if (!enabled && !disabled) return false;
          hit = hit && (enabled ? t.enabled : !t.enabled);
        }
      }
      if (searchForm.keyword.trim()) {
        const kw = searchForm.keyword.trim().toLowerCase();
        const field = searchForm.field;
        const matchId = !!(field === 'all' || field === 'id' ? t.id?.toLowerCase().includes(kw) : false);
        const matchName = !!(field === 'all' ? t.companyName?.toLowerCase().includes(kw) : false);
        const matchPhone = !!(field === 'all' || field === 'contactPhone' ? t.contactPhone?.toLowerCase().includes(kw) : false);
        hit = hit && (matchId || matchName || matchPhone);
      }
      return hit;
    });
  }, [tenants, searchForm]);

  const handleToggleEnabled = async (tenant: Tenant, checked: boolean) => {
    try {
      await toggleTenantEnabled(tenant.id);
      message.success(`${tenant.companyName} 已${checked ? '启用' : '禁用'}`);
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const handleApprove = async (tenant: Tenant) => {
    try {
      await approveTenant(tenant.id, { version: tenant.version || '基础版' });
      message.success(`「${tenant.companyName}」审核通过，已激活`);
    } catch (e: any) {
      message.error(e.message || '审核失败');
    }
  };

  const handleReject = async (tenant: Tenant) => {
    try {
      await rejectTenant(tenant.id, '资质审核不通过');
      message.info(`「${tenant.companyName}」审核不通过`);
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const handleAction = (tenant: Tenant, action: string) => {
    // 对齐知识库「租户管理_1.html」操作入口；具体详情页若未实现则给出占位提示
    const routeMap: Record<string, string> = {
      qualification: `/ops/tenants/${tenant.id}/qualification`,
      versionOrders: `/ops/tenants/${tenant.id}/version-orders`,
      contract: `/ops/tenants/${tenant.id}/contract`,
      resourceOrders: `/ops/tenants/${tenant.id}/resource-orders`,
      virtualAccount: `/ops/tenants/${tenant.id}/virtual-account`,
    };
    const route = routeMap[action];
    if (route) {
      navigate(route);
    } else {
      message.info(`打开：${tenant.companyName} - ${action}`);
    }
  };

  const columns = [
    {
      title: '租户编号',
      dataIndex: 'id',
      key: 'id',
      width: 220,
      render: (id: string) => (
        <Space size={4}>
          <Text copyable={{ text: id, icon: <CopyOutlined /> }}>{id}</Text>
        </Space>
      ),
    },
    {
      title: '租户联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 160,
      render: (phone?: string) => phone || '-',
    },
    {
      title: '注册时间',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
      width: 180,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '租户状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status?: string) => {
        const cfg = statusTagMap[status || ''] || { color: 'default' };
        return <Tag color={cfg.color}>{status || '—'}</Tag>;
      },
    },
    {
      title: '是否启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 110,
      align: 'center' as const,
      render: (enabled: boolean, record: Tenant) => (
        <Switch
          checked={enabled}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          onChange={(checked) => handleToggleEnabled(record, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 400,
      render: (_: unknown, record: Tenant) => (
        <Space size={12} wrap>
          {record.status === 'PENDING' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
              >
                通过
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record)}
              >
                不通过
              </Button>
            </>
          )}
          <Link onClick={() => handleAction(record, 'qualification')}>
            <EyeOutlined /> 查看资质
          </Link>
          <Link onClick={() => handleAction(record, 'versionOrders')}>
            <HistoryOutlined /> 版本订购记录
          </Link>
          <Link onClick={() => handleAction(record, 'contract')}>
            <FileTextOutlined /> 查看合同
          </Link>
          <Link onClick={() => handleAction(record, 'resourceOrders')}>
            <ShoppingOutlined /> 资源订购记录
          </Link>
          <Link onClick={() => handleAction(record, 'virtualAccount')}>
            <WalletOutlined /> 虚拟账户管理
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="租户管理"
        extra={
          <Tag color="blue">知识库来源：运营域租户管理_1.html</Tag>
        }
      >
        <Form layout="inline" style={{ marginBottom: 24 }}>
          <Form.Item label="查询">
            <Select
              value={searchForm.field}
              style={{ width: 120 }}
              onChange={(field) => setSearchForm((s) => ({ ...s, field }))}
            >
              {searchFieldOptions.map((o) => (
                <Option key={o.value} value={o.value}>{o.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Input
              placeholder="请输入搜索值"
              value={searchForm.keyword}
              onChange={(e) => setSearchForm((s) => ({ ...s, keyword: e.target.value }))}
              style={{ width: 240 }}
              allowClear
            />
          </Form.Item>
          <Form.Item label="状态">
            <Select
              value={searchForm.status}
              style={{ width: 110 }}
              onChange={(status) => setSearchForm((s) => ({ ...s, status }))}
            >
              {statusOptions.map((o) => (
                <Option key={o.value} value={o.value}>{o.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={() => {
                loadTenants({
                  status: searchForm.status === 'all' ? undefined : searchForm.status,
                  search: searchForm.keyword,
                  searchField: searchForm.field === 'all' ? undefined : searchForm.field,
                });
              }}
            >
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              onClick={() => {
                setSearchForm({ field: 'all', keyword: '', status: 'all' });
                loadTenants();
              }}
            >
              重置
            </Button>
          </Form.Item>
        </Form>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={filteredTenants}
          columns={columns}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1100 }}
        />
      </Card>
    </div>
  );
}
