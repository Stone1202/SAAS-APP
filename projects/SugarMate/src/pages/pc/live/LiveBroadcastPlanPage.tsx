/**
 * 开播计划管理 — PC 运营后台
 * 运营创建开播计划 → 分配开播人（医生/营养师） → 场次管理
 * V2.0 — 接入共享 Store，与 LIVE 端联动
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker, Tag, Space,
  Typography, message, Popconfirm, Upload,
} from 'antd';
import {
  PlusOutlined, EyeOutlined, EditOutlined,
  DeleteOutlined, CalendarOutlined, PlayCircleOutlined, UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useLiveStore, type BroadcastPlan } from '@/stores/liveStore';
import { useMerchantStore } from '@/stores/merchantStore';
import { ROLE_LABEL } from '@/contracts/merchant';
import type { MerchantRole } from '@/contracts/merchant';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

/** 可以担任主播的角色 */
const BROADCASTER_ROLES: MerchantRole[] = ['DOCTOR', 'NUTRITIONIST', 'PHARMACIST'];

/** MerchantRole → BroadcastPlan.broadcasterType */
const ROLE_TO_TYPE: Record<string, BroadcastPlan['broadcasterType']> = {
  DOCTOR: 'doctor',
  NUTRITIONIST: 'nutritionist',
  PHARMACIST: 'nutritionist', // 药师展现在营养师分组
};

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending: { color: 'blue', label: '待开播' },
  active: { color: 'green', label: '进行中' },
  finished: { color: 'default', label: '已结束' },
};

const LiveBroadcastPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    broadcastPlans,
    addBroadcastPlan, updateBroadcastPlan, removeBroadcastPlan,
    initMockData,
  } = useLiveStore();

  // ---- 从成员管理中获取可用主播 ----
  const { merchants } = useMerchantStore();

  /** 活跃的医生/营养师/药师 → 可分配为开播人 */
  const availableBroadcasters = useMemo(() => {
    return merchants
      .filter(m => BROADCASTER_ROLES.includes(m.role))
      .filter(m => m.lifecycleStatus === 'ONLINE')
      .map(m => ({
        id: m.id,
        name: m.name,
        role: m.role,
        roleLabel: ROLE_LABEL[m.role],
        type: ROLE_TO_TYPE[m.role],
        dept: m.department || m.specialties?.[0] || '',
        phone: m.phone,
      }));
  }, [merchants]);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => { initMockData(); }, []);

  const filteredPlans = useMemo(() => {
    if (!search) return broadcastPlans;
    const kw = search.toLowerCase();
    return broadcastPlans.filter(p =>
      p.name.toLowerCase().includes(kw) ||
      p.broadcasterName.toLowerCase().includes(kw),
    );
  }, [broadcastPlans, search]);

  const handleOpenCreate = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: BroadcastPlan) => {
    setEditingId(record.id);
    const matched = availableBroadcasters.find(
      (b: any) => b.name === record.broadcasterName,
    );
    form.setFieldsValue({
      name: record.name,
      broadcasterId: matched?.id,
      period: record.period.map((d: string) => dayjs(d)),
      description: record.description,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const matched = availableBroadcasters.find((b: any) => b.id === values.broadcasterId)!;
    const period: [string, string] = [
      values.period[0].format('YYYY-MM-DD'),
      values.period[1].format('YYYY-MM-DD'),
    ];

    if (editingId) {
      updateBroadcastPlan(editingId, {
        name: values.name,
        broadcasterId: matched.id,
        broadcasterName: matched.name,
        broadcasterType: matched.type,
        period,
        description: values.description,
      });
      message.success('开播计划已更新');
    } else {
      const newPlan: BroadcastPlan = {
        id: `BP-${String(Date.now()).slice(-6)}`,
        broadcasterId: matched.id,
        name: values.name,
        broadcasterName: matched.name,
        broadcasterType: matched.type,
        period,
        sessionCount: 0,
        coverUrl: '',
        description: values.description || '',
        status: 'pending',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      addBroadcastPlan(newPlan);
      message.success('开播计划已创建');
    }
    setModalOpen(false);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    removeBroadcastPlan(id);
    message.success('计划已删除');
  };

  const handleViewSessions = (record: BroadcastPlan) => {
    navigate(`/live-mgmt/sessions?planId=${record.id}`);
  };

  const columns: ColumnsType<BroadcastPlan> = [
    { title: '计划编号', dataIndex: 'id', key: 'id', width: 100 },
    {
      title: '计划名称', dataIndex: 'name', key: 'name',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '开播人', key: 'broadcaster', width: 150,
      render: (_, r) => {
        const member = availableBroadcasters.find(b => b.id === r.broadcasterId);
        const roleLabel = member?.roleLabel || (r.broadcasterType === 'doctor' ? '医生' : '营养师');
        const roleColor = r.broadcasterType === 'doctor' ? 'blue' : (member?.role === 'PHARMACIST' ? 'purple' : 'orange');
        return (
          <Space>
            <Tag color={roleColor}>{roleLabel}</Tag>
            <span>{r.broadcasterName}</span>
          </Space>
        );
      },
    },
    {
      title: '计划周期', key: 'period', width: 220,
      render: (_, r) => (
        <Space>
          <CalendarOutlined style={{ color: '#999' }} />
          <span>{r.period[0]} ~ {r.period[1]}</span>
        </Space>
      ),
    },
    {
      title: '场次数', dataIndex: 'sessionCount', key: 'sessionCount', width: 80, align: 'center',
      render: (v: number) => <Tag color={v > 0 ? 'blue' : 'default'}>{v} 场</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100, align: 'center',
      render: (s: string) => <Tag color={STATUS_MAP[s].color}>{STATUS_MAP[s].label}</Tag>,
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 110 },
    {
      title: '操作', key: 'action', width: 260, fixed: 'right' as const,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} type="link" onClick={() => handleViewSessions(record)}>
            查看场次
          </Button>
          <Button size="small" icon={<EditOutlined />} type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除此计划？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" icon={<DeleteOutlined />} type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={<Space><Title level={5} style={{ margin: 0 }}>开播计划管理</Title></Space>}
        extra={
          <Space>
            <Input.Search
              placeholder="搜索计划名称或开播人"
              allowClear style={{ width: 260 }}
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              创建开播计划
            </Button>
          </Space>
        }
      >
        <Table<BroadcastPlan>
          columns={columns}
          dataSource={filteredPlans}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑开播计划' : '创建开播计划'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={handleSubmit}
        width={600}
        okText={editingId ? '保存修改' : '创建计划'}
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="计划名称" rules={[{ required: true, message: '请输入计划名称' }]}>
            <Input placeholder="如：6月糖尿病科普系列" maxLength={50} showCount />
          </Form.Item>
          <Form.Item name="broadcasterId" label="开播人（从成员管理中选择）" rules={[{ required: true, message: '请选择开播人' }]}>
            <Select
              placeholder="从成员管理中选择医生、营养师或药师"
              showSearch
              optionFilterProp="label"
              options={availableBroadcasters.map((b: any) => ({
                label: `${b.name} · ${b.roleLabel}${b.dept ? ` · ${b.dept}` : ''}${b.phone ? ` (${b.phone})` : ''}`,
                value: b.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="period" label="计划周期" rules={[{ required: true, message: '请选择计划周期' }]}>
            <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
          </Form.Item>
          <Form.Item name="coverUrl" label="封面图">
            <Upload.Dragger accept="image/*" maxCount={1} beforeUpload={() => false} listType="picture-card">
              <div>
                <UploadOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                <p style={{ marginTop: 8 }}>上传计划封面</p>
              </div>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item name="description" label="计划描述">
            <TextArea rows={4} placeholder="描述此开播计划的内容和目的" maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LiveBroadcastPlanPage;
