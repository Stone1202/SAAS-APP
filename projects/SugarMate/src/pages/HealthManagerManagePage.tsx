/**
 * PG-SUG-PC-011 健管师管理 V3.0.0
 * 
 * V3.0.0 改造：
 * - 从 NutritionistManagePage 中独立出来，作为5角色独立管理项之一
 * - 使用统一 MerchantStore
 * - 使用统一 MerchantFormModal 添加/编辑
 * - 对齐入驻申请表单字段
 * - 对齐统一状态机
 */
import React, { useEffect, useState } from 'react';
import {
  Table, Tag, Button, Space, Card, Row, Col, Statistic,
  Modal, Descriptions, message, Input, Typography, Popconfirm,
} from 'antd';
import {
  SearchOutlined, EyeOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, CheckOutlined, CloseOutlined,
} from '@ant-design/icons';
import { useMerchantStore } from '@/stores/merchantStore';
import type { MerchantRecord, MerchantLifecycleStatus } from '@/stores/merchantStore';
import { STATUS_LABEL, STATUS_COLOR, ROLE_LABEL } from '@/contracts/merchant';
import { useOnboardingStore } from '@/stores/onboardingStore';
import MerchantFormModal, { type MerchantFormData } from '@/components/MerchantFormModal';

const { Text } = Typography;

const HealthManagerManagePage: React.FC = () => {
  const role = 'HEALTH_MANAGER' as const;
  const {
    getMerchantsByRole, addMerchant, updateMerchant, deleteMerchant,
    approveMerchant, rejectMerchant, setOnline, freezeMerchant, initMockData,
  } = useMerchantStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [curItem, setCurItem] = useState<MerchantRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editTarget, setEditTarget] = useState<MerchantRecord | null>(null);

  useEffect(() => { initMockData(); }, [initMockData]);

  // 全部原始数据
  const allItems = getMerchantsByRole(role);

  // 筛选（搜索+状态）
  const list = allItems.filter(p => {
    const matchSearch = !search ||
      p.name?.includes(search) ||
      p.company?.includes(search) ||
      p.title?.includes(search) ||
      p.phone?.includes(search);
    const matchStatus = statusFilter === 'all' || p.lifecycleStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  // 统计（基于全部原始数据）
  const stats = {
    total: allItems.length,
    pending: allItems.filter(p => p.lifecycleStatus === 'PENDING').length,
    supplement: allItems.filter(p => p.lifecycleStatus === 'NEED_SUPPLEMENT').length,
    rejected: allItems.filter(p => p.lifecycleStatus === 'REJECTED').length,
    approved: allItems.filter(p => p.lifecycleStatus === 'APPROVED' || p.lifecycleStatus === 'INFO_APPROVED' || p.lifecycleStatus === 'CERT_APPROVED').length,
    online: allItems.filter(p => p.lifecycleStatus === 'ONLINE').length,
  };

  // 操作
  const handleAdd = (data: MerchantFormData) => {
    const merchant = addMerchant({
      role, name: data.name, phone: data.phone, email: data.email,
      gender: data.gender, idCard: data.idCard, title: data.title,
      specialties: data.specialties, company: data.company,
      certificates: data.certificates,
    });
    // P0 修复：addMerchant 联动创建 DRAFT 后必须提交到审核流
    // addMerchant 内部写入真实 store 状态（非 hook 快照），需用 getState() 直读
    const appState = useOnboardingStore.getState();
    const apps = appState.applications.filter(
      a => a.phone === merchant.phone && a.status === 'DRAFT'
    );
    if (apps.length > 0) {
      const latest = apps.reduce((acc, cur) => cur.createdAt > acc.createdAt ? cur : acc);
      appState.submitApplication(latest.id);
    }
    setFormOpen(false);
    message.success(`健康管理师添加成功，已进入审核流程`);
  };

  const handleEdit = (data: MerchantFormData) => {
    if (!editTarget) return;
    updateMerchant(editTarget.id, {
      name: data.name, phone: data.phone, email: data.email,
      gender: data.gender, idCard: data.idCard, title: data.title,
      specialties: data.specialties, company: data.company,
      certificates: data.certificates,
    });
    setFormOpen(false); setEditTarget(null);
    message.success('信息已更新');
  };

  const handleDelete = (id: string) => { deleteMerchant(id); message.success('已删除'); };
  const handleApprove = (id: string) => { approveMerchant(id, '运营管理员', '审核通过'); message.success('审核通过'); };
  const handleReject = (id: string) => { rejectMerchant(id, '运营管理员', '不符合要求'); message.warning('已驳回'); };
  const handleOnline = (id: string) => { setOnline(id, '运营管理员'); message.success('已上线'); };
  const handleFreeze = (id: string) => { freezeMerchant(id, '运营管理员', '违规处理'); message.warning('已冻结'); };

  const columns = [
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '认证等级', dataIndex: 'title', width: 140 },
    { title: '执业机构', dataIndex: 'company', width: 160, ellipsis: true, render: (v: string) => v || '-' },
    { title: '服务方向', dataIndex: 'specialties', width: 180, ellipsis: true,
      render: (v: string[]) => v?.join('、') || '-' },
    { title: '手机号', dataIndex: 'phone', width: 120 },
    { title: '证照', key: 'certs', width: 80,
      render: (_: any, r: MerchantRecord) => `${r.certificates?.length || 0} 份` },
    { title: '状态', dataIndex: 'lifecycleStatus', width: 90,
      render: (s: MerchantLifecycleStatus) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</Tag> },
    { title: '操作', width: 240, fixed: 'right', render: (_: any, r: MerchantRecord) => (
      <Space size="small" wrap>
        <Button size="small" icon={<EyeOutlined />} onClick={() => { setCurItem(r); setDetailOpen(true); }}>详情</Button>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setEditTarget(r); setFormMode('edit'); setFormOpen(true); }}>编辑</Button>
        {r.lifecycleStatus === 'PENDING' && (
          <Popconfirm title="确认审核通过？" onConfirm={() => handleApprove(r.id)}>
            <Button size="small" type="primary" icon={<CheckOutlined />} />
          </Popconfirm>
        )}
        {r.lifecycleStatus === 'PENDING' && (
          <Popconfirm title="确认驳回？" onConfirm={() => handleReject(r.id)}>
            <Button size="small" danger icon={<CloseOutlined />} />
          </Popconfirm>
        )}
        {r.lifecycleStatus === 'ONLINE' && (
          <Popconfirm title="确认冻结？" onConfirm={() => handleFreeze(r.id)}>
            <Button size="small" danger>冻结</Button>
          </Popconfirm>
        )}
        {r.lifecycleStatus === 'FROZEN' && (
          <Popconfirm title="确认恢复上线？" onConfirm={() => handleOnline(r.id)}>
            <Button size="small" type="primary">上线</Button>
          </Popconfirm>
        )}
        {r.lifecycleStatus !== 'ONLINE' && (
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        )}
      </Space>
    )},
  ];

  const statusCards = [
    { key: 'all', label: '全部', count: stats.total, color: '#262626' },
    { key: 'PENDING', label: '待审核', count: stats.pending, color: '#faad14' },
    { key: 'NEED_SUPPLEMENT', label: '需补充', count: stats.supplement, color: '#fa8c16' },
    { key: 'REJECTED', label: '已驳回', count: stats.rejected, color: '#ff4d4f' },
    { key: 'APPROVED', label: '审核通过', count: stats.approved, color: '#1890ff' },
    { key: 'ONLINE', label: '已上线', count: stats.online, color: '#52c41a' },
  ];

  return (
    <div>
      {/* 统计卡片 + 搜索区域 */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        {statusCards.map(s => (
          <Col span={3} key={s.key}>
            <Card
              size="small"
              styles={{ body: { padding: '12px', cursor: 'pointer' } }}
              onClick={() => setStatusFilter(s.key)}
              style={{
                borderColor: statusFilter === s.key ? '#1890ff' : undefined,
                background: statusFilter === s.key ? '#e6f7ff' : '#fff',
              }}
            >
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: statusFilter === s.key ? '#1890ff' : s.color }}>
                {s.count}
              </div>
            </Card>
          </Col>
        ))}
        <Col span={6}>
          <Card size="small" styles={{ body: { padding: '12px' } }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="搜索姓名/执业机构/认证等级/手机号"
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
              style={{ width: '100%' }}
            />
          </Card>
        </Col>
      </Row>
      <Card
        title="健康管理师管理"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setFormMode('add'); setEditTarget(null); setFormOpen(true); }}>新增健康管理师</Button>}
      >
        <Table rowKey="id" dataSource={list} columns={columns} pagination={{ pageSize: 10, showTotal: t => `共 ${t} 位` }} size="middle" scroll={{ x: 'max-content' }} />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="健康管理师详情"
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setCurItem(null); }}
        footer={<Button onClick={() => { setDetailOpen(false); setCurItem(null); }}>关闭</Button>}
        width={560}
        destroyOnClose
      >
        {curItem && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="姓名">{curItem.name}</Descriptions.Item>
            <Descriptions.Item label="性别">{curItem.gender === 'M' ? '男' : curItem.gender === 'F' ? '女' : '-'}</Descriptions.Item>
            <Descriptions.Item label="认证等级">{curItem.title || '-'}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={STATUS_COLOR[curItem.lifecycleStatus]}>{STATUS_LABEL[curItem.lifecycleStatus]}</Tag></Descriptions.Item>
            <Descriptions.Item label="执业机构" span={2}>{curItem.company || '-'}</Descriptions.Item>
            <Descriptions.Item label="手机号">{curItem.phone}</Descriptions.Item>
            <Descriptions.Item label="来源"><Tag>{curItem.source === 'apply' ? '入驻申请' : '管理端添加'}</Tag></Descriptions.Item>
            <Descriptions.Item label="服务方向" span={2}>{curItem.specialties?.join('、') || '-'}</Descriptions.Item>
            {curItem.applyNo && <Descriptions.Item label="申请编号" span={2}>{curItem.applyNo}</Descriptions.Item>}
            <Descriptions.Item label="入驻时间">{curItem.joinedAt ? new Date(curItem.joinedAt).toLocaleDateString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="证照" span={2}>
              {curItem.certificates?.length > 0
                ? curItem.certificates.map((c, i) => <Tag key={i} color={c.status === 'valid' ? 'green' : 'default'}>{c.name}</Tag>)
                : '无'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 添加/编辑表单 */}
      <MerchantFormModal
        open={formOpen}
        mode={formMode}
        role={role}
        initialData={formMode === 'edit' && editTarget ? {
          role: editTarget.role, entityType: editTarget.entityType,
          name: editTarget.name, phone: editTarget.phone, email: editTarget.email,
          gender: editTarget.gender, idCard: editTarget.idCard, title: editTarget.title,
          specialties: editTarget.specialties, company: editTarget.company,
          certificates: editTarget.certificates,
        } : undefined}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSubmit={formMode === 'add' ? handleAdd : handleEdit}
      />
    </div>
  );
};

export default HealthManagerManagePage;
