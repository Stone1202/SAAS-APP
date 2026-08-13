/**
 * 营销活动 — PC 运营后台
 * 为直播间配置优惠券/秒杀/预约有礼 → 活动时段/预算管理
 * V2.0 — 接入共享 Store，与 LIVE 端联动
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Tag, Space,
  Typography, message, Popconfirm,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined,
  ThunderboltOutlined, RedEnvelopeOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useLiveStore, type MarketingActivity } from '@/stores/liveStore';

const { Title } = Typography;
const { TextArea } = Input;

const TYPE_OPTIONS = [
  { label: '🟢 优惠券', value: 'coupon' },
  { label: '🔴 限时秒杀', value: 'flash_sale' },
  { label: '🟡 预约有礼', value: 'reservation_gift' },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  coupon: <RedEnvelopeOutlined />,
  flash_sale: <ThunderboltOutlined />,
  reservation_gift: <GiftOutlined />,
};

const TYPE_COLORS: Record<string, string> = {
  coupon: 'green',
  flash_sale: 'red',
  reservation_gift: 'gold',
};

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: '草稿' },
  active: { color: 'green', label: '生效中' },
  ended: { color: 'default', label: '已结束' },
};

const LiveMarketingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const filterRoomId = searchParams.get('roomId') || '';

  const {
    marketingActivities, liveRooms,
    addMarketingActivity, updateMarketingActivity, removeMarketingActivity,
    initMockData,
  } = useLiveStore();

  const [search, setSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState<string>(filterRoomId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => { initMockData(); }, []);
  useEffect(() => { setRoomFilter(filterRoomId); }, [filterRoomId]);

  const filteredActivities = useMemo(() => {
    let list = marketingActivities;
    if (roomFilter) list = list.filter(a => a.roomId === roomFilter);
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter(a => a.activityName.toLowerCase().includes(kw));
    }
    return list;
  }, [marketingActivities, roomFilter, search]);

  const handleOpenCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ type: 'coupon', status: 'draft' });
    if (roomFilter) form.setFieldValue('roomId', roomFilter);
    setModalOpen(true);
  };

  const handleEdit = (record: MarketingActivity) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      time: [dayjs(record.startTime), dayjs(record.endTime)],
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const room = liveRooms.find(r => r.id === values.roomId);

    if (editingId) {
      updateMarketingActivity(editingId, {
        activityName: values.activityName,
        type: values.type,
        roomId: values.roomId,
        roomName: room?.roomName || '',
        content: values.content,
        startTime: values.time[0].format('YYYY-MM-DD HH:mm'),
        endTime: values.time[1].format('YYYY-MM-DD HH:mm'),
        budget: values.budget,
      });
      message.success('营销活动已更新');
    } else {
      const newActivity: MarketingActivity = {
        id: `MA-${String(Date.now()).slice(-6)}`,
        activityName: values.activityName,
        type: values.type,
        roomId: values.roomId,
        roomName: room?.roomName || '',
        content: values.content,
        startTime: values.time[0].format('YYYY-MM-DD HH:mm'),
        endTime: values.time[1].format('YYYY-MM-DD HH:mm'),
        budget: values.budget,
        status: values.status || 'draft',
      };
      addMarketingActivity(newActivity);
      message.success('营销活动已创建');
    }
    setModalOpen(false);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    removeMarketingActivity(id);
    message.success('活动已删除');
  };

  const selectedRoomName = roomFilter
    ? liveRooms.find(r => r.id === roomFilter)?.roomName
    : '';

  const columns: ColumnsType<MarketingActivity> = [
    { title: '活动编号', dataIndex: 'id', key: 'id', width: 100 },
    {
      title: '活动名称', dataIndex: 'activityName', key: 'activityName',
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: '类型', dataIndex: 'type', key: 'type', width: 110, align: 'center',
      render: (t: string) => (
        <Tag color={TYPE_COLORS[t]} icon={TYPE_ICONS[t]}>
          {{ coupon: '优惠券', flash_sale: '限时秒杀', reservation_gift: '预约有礼' }[t]}
        </Tag>
      ),
    },
    {
      title: '直播间', dataIndex: 'roomName', key: 'roomName', width: 130, ellipsis: true,
    },
    {
      title: '活动内容', dataIndex: 'content', key: 'content', width: 260, ellipsis: true,
    },
    {
      title: '有效时间', key: 'time', width: 280,
      render: (_, r) => <span style={{ fontSize: 12 }}>{r.startTime} ~ {r.endTime}</span>,
    },
    {
      title: '预算', dataIndex: 'budget', key: 'budget', width: 100, align: 'right',
      render: (v: number) => v ? <span style={{ color: '#ff4d4f' }}>¥{v.toLocaleString()}</span> : <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90, align: 'center',
      render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 160, fixed: 'right' as const,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} type="link"
            onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除此活动？" onConfirm={() => handleDelete(record.id)}>
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
            <GiftOutlined /> 营销活动
            {selectedRoomName && <Tag color="red" style={{ marginLeft: 12 }}>{selectedRoomName}</Tag>}
          </Title>
        }
        extra={
          <Space>
            <Select
              allowClear placeholder="按直播间筛选"
              style={{ width: 200 }}
              value={roomFilter || undefined}
              onChange={(v) => setRoomFilter(v || '')}
              options={liveRooms.map(r => ({ label: r.roomName, value: r.id }))}
            />
            <Input.Search
              placeholder="搜索活动名称"
              allowClear style={{ width: 180 }}
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              创建活动
            </Button>
          </Space>
        }
      >
        <Table<MarketingActivity>
          columns={columns}
          dataSource={filteredActivities}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: t => `共 ${t} 个活动` }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑营销活动' : '创建营销活动'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={handleSubmit}
        width={600}
        okText={editingId ? '保存修改' : '创建活动'}
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="activityName" label="活动名称" rules={[{ required: true, message: '请输入活动名称' }]}>
            <Input placeholder="如：新人专享优惠券" maxLength={30} showCount />
          </Form.Item>
          <Form.Item name="type" label="活动类型" rules={[{ required: true }]}>
            <Select options={TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="roomId" label="关联直播间" rules={[{ required: true, message: '请选择直播间' }]}>
            <Select
              placeholder="选择直播间"
              options={liveRooms.map(r => ({ label: r.roomName, value: r.id }))}
            />
          </Form.Item>
          <Form.Item name="content" label="活动内容" rules={[{ required: true, message: '请输入活动详情' }]}>
            <TextArea rows={3} placeholder="如：满99减20元优惠券，限量500张" maxLength={500} showCount />
          </Form.Item>
          <Form.Item name="time" label="生效时段" rules={[{ required: true, message: '请选择活动时段' }]}>
            <DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="budget" label="活动预算（元）">
            <InputNumber min={0} max={999999} style={{ width: '100%' }} placeholder="不填则不限制" />
          </Form.Item>
          {!editingId && (
            <Form.Item name="status" label="状态">
              <Select
                options={[
                  { label: '草稿（暂不生效）', value: 'draft' },
                  { label: '立即生效', value: 'active' },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default LiveMarketingPage;
