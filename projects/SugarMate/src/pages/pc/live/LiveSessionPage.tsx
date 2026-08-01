/**
 * 场次管理 — PC 运营后台
 * 关联开播计划 → 排布具体场次（时间/主题/类型）→ 配置直播间
 * V2.0 — 接入共享 Store，与 LIVE 端联动
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker, Tag, Space,
  Typography, message, Popconfirm,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined,
  VideoCameraOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useLiveStore, type LiveSession } from '@/stores/liveStore';

const { Title } = Typography;
const { TextArea } = Input;

const TYPE_MAP: Record<string, { color: string; label: string }> = {
  knowledge: { color: 'blue', label: '科普' },
  lecture: { color: 'purple', label: '讲堂' },
  shopping: { color: 'orange', label: '带货' },
};

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  pending: { color: 'default', label: '待排期' },
  ready: { color: 'blue', label: '已就绪' },
  live: { color: 'red', label: '直播中' },
  ended: { color: 'green', label: '已结束' },
};

const LiveSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterPlanId = searchParams.get('planId') || '';

  const {
    liveSessions, broadcastPlans,
    addLiveSession, updateLiveSession, removeLiveSession,
    initMockData,
  } = useLiveStore();

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>(filterPlanId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => { initMockData(); }, []);
  useEffect(() => { setPlanFilter(filterPlanId); }, [filterPlanId]);

  const filteredSessions = useMemo(() => {
    let list = liveSessions;
    if (planFilter) list = list.filter(s => s.planId === planFilter);
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter(s => s.topic.toLowerCase().includes(kw));
    }
    return list;
  }, [liveSessions, planFilter, search]);

  const handleOpenCreate = () => {
    setEditingId(null);
    form.resetFields();
    if (planFilter) form.setFieldValue('planId', planFilter);
    setModalOpen(true);
  };

  const handleEdit = (record: LiveSession) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      time: [dayjs(record.startTime), dayjs(record.endTime)],
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const plan = broadcastPlans.find(p => p.id === values.planId);

    if (editingId) {
      updateLiveSession(editingId, {
        planId: values.planId,
        planName: plan?.name || '',
        topic: values.topic,
        liveType: values.liveType,
        startTime: values.time[0].format('YYYY-MM-DD HH:mm'),
        endTime: values.time[1].format('YYYY-MM-DD HH:mm'),
      });
      message.success('场次已更新');
    } else {
      const newSession: LiveSession = {
        id: `SS-${String(Date.now()).slice(-6)}`,
        planId: values.planId,
        planName: plan?.name || '',
        topic: values.topic,
        liveType: values.liveType,
        startTime: values.time[0].format('YYYY-MM-DD HH:mm'),
        endTime: values.time[1].format('YYYY-MM-DD HH:mm'),
        coverUrl: '',
        status: 'pending',
      };
      addLiveSession(newSession);
      // 同步更新计划场次数
      const { broadcastPlans, updateBroadcastPlan } = useLiveStore.getState();
      const targetPlan = broadcastPlans.find(p => p.id === values.planId);
      if (targetPlan) {
        const count = liveSessions.filter(s => s.planId === values.planId).length + 1;
        updateBroadcastPlan(values.planId, { sessionCount: count });
      }
      message.success('场次已创建');
    }
    setModalOpen(false);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    const session = liveSessions.find(s => s.id === id);
    removeLiveSession(id);
    if (session) {
      const { broadcastPlans, updateBroadcastPlan } = useLiveStore.getState();
      const plan = broadcastPlans.find(p => p.id === session.planId);
      if (plan && plan.sessionCount > 0) {
        updateBroadcastPlan(session.planId, { sessionCount: plan.sessionCount - 1 });
      }
    }
    message.success('场次已删除');
  };

  const handleConfigRoom = (record: LiveSession) => {
    navigate(`/live-mgmt/rooms?sessionId=${record.id}`);
  };

  const selectedPlanName = planFilter
    ? broadcastPlans.find(p => p.id === planFilter)?.name
    : '';

  const columns: ColumnsType<LiveSession> = [
    { title: '场次编号', dataIndex: 'id', key: 'id', width: 100 },
    {
      title: '所属计划', dataIndex: 'planName', key: 'planName', width: 180,
      ellipsis: true,
    },
    {
      title: '直播主题', dataIndex: 'topic', key: 'topic',
      render: (v: string, r) => (
        <div>
          <span style={{ fontWeight: 500 }}>{v}</span>
          <div style={{ fontSize: 11, color: '#999' }}>
            {r.startTime} · {dayjs(r.endTime).diff(dayjs(r.startTime), 'minute')}分钟
          </div>
        </div>
      ),
    },
    {
      title: '类型', dataIndex: 'liveType', key: 'liveType', width: 80, align: 'center',
      render: (t: string) => <Tag color={TYPE_MAP[t]?.color}>{TYPE_MAP[t]?.label}</Tag>,
    },
    {
      title: '日期', key: 'date', width: 100,
      render: (_, r) => dayjs(r.startTime).format('MM-DD'),
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100, align: 'center',
      render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag>,
    },
    {
      title: '直播间', key: 'room', width: 100, align: 'center',
      render: (_, r) => (
        r.roomId
          ? <Tag color="green" icon={<VideoCameraOutlined />}>已配置</Tag>
          : <Tag>未配置</Tag>
      ),
    },
    {
      title: '操作', key: 'action', width: 220, fixed: 'right' as const,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<VideoCameraOutlined />} type="link"
            onClick={() => handleConfigRoom(record)}>
            配置直播间
          </Button>
          <Button size="small" icon={<EditOutlined />} type="link"
            onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除此场次？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" icon={<DeleteOutlined />} type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            <ClockCircleOutlined /> 场次管理
            {selectedPlanName && <Tag color="blue" style={{ marginLeft: 12 }}>{selectedPlanName}</Tag>}
          </Title>
        }
        extra={
          <Space>
            <Select
              allowClear placeholder="按计划筛选"
              style={{ width: 200 }}
              value={planFilter || undefined}
              onChange={(v) => setPlanFilter(v || '')}
              options={broadcastPlans.map(p => ({ label: p.name, value: p.id }))}
            />
            <Input.Search
              placeholder="搜索场次主题"
              allowClear style={{ width: 200 }}
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              新增场次
            </Button>
          </Space>
        }
      >
        <Table<LiveSession>
          columns={columns}
          dataSource={filteredSessions}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: t => `共 ${t} 场` }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑场次' : '新增场次'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={handleSubmit}
        width={600}
        okText={editingId ? '保存修改' : '创建场次'}
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="planId" label="所属计划" rules={[{ required: true, message: '请选择开播计划' }]}>
            <Select
              placeholder="选择开播计划"
              options={broadcastPlans.map(p => ({ label: p.name, value: p.id }))}
            />
          </Form.Item>
          <Form.Item name="topic" label="直播主题" rules={[{ required: true, message: '请输入直播主题' }]}>
            <Input placeholder="如：糖尿病患者夏季饮食指南" maxLength={50} showCount />
          </Form.Item>
          <Form.Item name="liveType" label="直播类型" rules={[{ required: true, message: '请选择直播类型' }]}>
            <Select
              placeholder="选择类型"
              options={[
                { label: '🧠 科普直播', value: 'knowledge' },
                { label: '📚 专家讲堂', value: 'lecture' },
                { label: '🛍 直播带货', value: 'shopping' },
              ]}
            />
          </Form.Item>
          <Form.Item name="time" label="开播时间" rules={[{ required: true, message: '请选择开播时段' }]}>
            <DatePicker.RangePicker
              showTime format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              placeholder={['开始时间', '结束时间']}
            />
          </Form.Item>
          <Form.Item name="description" label="场次说明">
            <TextArea rows={3} placeholder="本场次的简要说明" maxLength={300} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LiveSessionPage;
