/**
 * 直播间管理 — PC 运营后台
 * 创建/配置直播间 → 自动生成推拉流地址 → 设置分辨率/美颜/录制
 * V2.0 — 接入共享 Store，与 LIVE 端联动
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Slider, Switch, Tag, Space,
  Typography, message, Popconfirm, Tooltip, Descriptions,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, VideoCameraOutlined,
  CopyOutlined, SettingOutlined, LinkOutlined, ControlOutlined,
} from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useLiveStore, type LiveRoom } from '@/stores/liveStore';

const { Title } = Typography;

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  offline: { color: 'default', label: '离线' },
  ready: { color: 'blue', label: '就绪' },
  live: { color: 'red', label: '直播中' },
};

const RES_OPTIONS = [
  { label: '720p (高清)', value: '720p' },
  { label: '1080p (全高清)', value: '1080p' },
];

const LiveRoomManagePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterSessionId = searchParams.get('sessionId') || '';

  const {
    liveRooms, liveSessions,
    addLiveRoom, updateLiveRoom, removeLiveRoom,
    initMockData,
  } = useLiveStore();

  const [search, setSearch] = useState('');
  const [sessionFilter, setSessionFilter] = useState<string>(filterSessionId);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRoom, setDetailRoom] = useState<LiveRoom | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => { initMockData(); }, []);
  useEffect(() => { setSessionFilter(filterSessionId); }, [filterSessionId]);

  const filteredRooms = useMemo(() => {
    let list = liveRooms;
    if (sessionFilter) list = list.filter(r => r.sessionId === sessionFilter);
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter(r => r.roomName.toLowerCase().includes(kw) || r.sessionTopic.toLowerCase().includes(kw));
    }
    return list;
  }, [liveRooms, sessionFilter, search]);

  const sessionsWithoutRoom = useMemo(() =>
    liveSessions.filter(s => !liveRooms.find(r => r.sessionId === s.id)),
  [liveSessions, liveRooms]);

  const handleOpenCreate = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      resolution: '1080p', bitrate: 4000, frameRate: 30,
      beautyEnabled: true, recordingStrategy: 'auto',
    });
    if (sessionFilter) form.setFieldValue('sessionId', sessionFilter);
    setModalOpen(true);
  };

  const handleEdit = (record: LiveRoom) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const session = liveSessions.find(s => s.id === values.sessionId);

    if (editingId) {
      updateLiveRoom(editingId, {
        sessionId: values.sessionId,
        sessionTopic: session?.topic || '',
        roomName: values.roomName,
        resolution: values.resolution,
        bitrate: values.bitrate,
        frameRate: values.frameRate,
        beautyEnabled: values.beautyEnabled,
        recordingStrategy: values.recordingStrategy,
      });
      message.success('直播间已更新');
    } else {
      const id = `RM-${String(Date.now()).slice(-6)}`;
      const newRoom: LiveRoom = {
        id,
        sessionId: values.sessionId,
        sessionTopic: session?.topic || '',
        roomName: values.roomName,
        pushUrl: `rtmp://push.sugarmate.com/live/${id}?key=${Math.random().toString(36).slice(2, 10)}`,
        pullUrl: `https://pull.sugarmate.com/live/${id}.m3u8`,
        resolution: values.resolution,
        bitrate: values.bitrate,
        frameRate: values.frameRate,
        beautyEnabled: values.beautyEnabled,
        recordingStrategy: values.recordingStrategy,
        status: 'offline',
      };
      addLiveRoom(newRoom);
      // 关联到场次
      const { updateLiveSession } = useLiveStore.getState();
      updateLiveSession(values.sessionId, { roomId: id });
      message.success('直播间已创建，推拉流地址已自动生成');
    }
    setModalOpen(false);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    removeLiveRoom(id);
    message.success('直播间已删除');
  };

  const handleViewDetail = (record: LiveRoom) => {
    setDetailRoom(record);
    setDetailOpen(true);
  };

  const handleCopyUrl = (url: string, label: string) => {
    navigator.clipboard.writeText(url).then(() => message.success(`${label}已复制`));
  };

  const handleGoProducts = (room: LiveRoom) => {
    navigate(`/live-mgmt/products?roomId=${room.id}`);
  };

  const selectedSessionTopic = sessionFilter
    ? liveSessions.find(s => s.id === sessionFilter)?.topic
    : '';

  const columns: ColumnsType<LiveRoom> = [
    { title: '房间编号', dataIndex: 'id', key: 'id', width: 100 },
    {
      title: '直播间名称', dataIndex: 'roomName', key: 'roomName',
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: '关联场次', dataIndex: 'sessionTopic', key: 'sessionTopic', ellipsis: true, width: 200,
    },
    {
      title: '画质', key: 'quality', width: 140,
      render: (_, r) => (
        <Space size={4}>
          <Tag color="blue">{r.resolution}</Tag>
          <span style={{ fontSize: 11, color: '#999' }}>{r.bitrate}Kbps</span>
        </Space>
      ),
    },
    {
      title: '美颜', key: 'beauty', width: 70, align: 'center',
      render: (_, r) => r.beautyEnabled ? <Tag color="pink">ON</Tag> : <Tag>OFF</Tag>,
    },
    {
      title: '录制', dataIndex: 'recordingStrategy', key: 'recording', width: 80, align: 'center',
      render: (v: string) => {
        const m: Record<string, string> = { auto: '自动', manual: '手动', none: '关闭' };
        return <Tag>{m[v] || v}</Tag>;
      },
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90, align: 'center',
      render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 340, fixed: 'right' as const,
      render: (_, record) => {
        const session = liveSessions.find(s => s.id === record.sessionId);
        return (
        <Space size="small">
          <Button size="small" icon={<SettingOutlined />} type="link"
            onClick={() => handleViewDetail(record)}>推流地址</Button>
          <Button size="small" icon={<EditOutlined />} type="link"
            onClick={() => handleEdit(record)}>编辑</Button>
          <Button size="small" icon={<ControlOutlined />} type="link" style={{ color: '#1890ff' }}
            onClick={() => window.open(`/live-mgmt/control?roomId=${record.id}`, '_blank')}>中控</Button>
          <Button size="small" icon={<VideoCameraOutlined />} type="link"
            onClick={() => window.open(`/live-mgmt/stream?roomId=${record.id}`, '_blank')}>推流</Button>
          {session?.liveType === 'shopping' && (
            <Button size="small" type="link" onClick={() => handleGoProducts(record)}>商品</Button>
          )}
          <Popconfirm title="确定删除此直播间？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" icon={<DeleteOutlined />} type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            <VideoCameraOutlined /> 直播间管理
            {selectedSessionTopic && <Tag color="purple" style={{ marginLeft: 12 }}>{selectedSessionTopic}</Tag>}
          </Title>
        }
        extra={
          <Space>
            <Select
              allowClear placeholder="按场次筛选"
              style={{ width: 220 }}
              value={sessionFilter || undefined}
              onChange={(v) => setSessionFilter(v || '')}
              options={liveSessions.map(s => ({ label: s.topic, value: s.id }))}
            />
            <Input.Search
              placeholder="搜索直播间"
              allowClear style={{ width: 180 }}
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              创建直播间
            </Button>
          </Space>
        }
      >
        <Table<LiveRoom>
          columns={columns}
          dataSource={filteredRooms}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: t => `共 ${t} 间` }}
          scroll={{ x: 1050 }}
        />
      </Card>

      {/* ====== 创建/编辑弹窗 ====== */}
      <Modal
        title={editingId ? '编辑直播间' : '创建直播间'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={handleSubmit}
        width={680}
        okText={editingId ? '保存修改' : '创建直播间'}
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="sessionId" label="关联场次" rules={[{ required: true, message: '请选择关联场次' }]}>
            <Select
              placeholder="选择场次"
              options={(editingId ? liveSessions : sessionsWithoutRoom).map(s => ({
                label: `${s.topic}（${s.startTime}）`,
                value: s.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="roomName" label="直播间名称" rules={[{ required: true, message: '请输入直播间名称' }]}>
            <Input placeholder="如：科普1号间" maxLength={20} showCount />
          </Form.Item>
          <Form.Item name="resolution" label="推流分辨率" rules={[{ required: true }]}>
            <Select options={RES_OPTIONS} />
          </Form.Item>
          <Form.Item name="bitrate" label={<span>视频码率 <Tag>{form.getFieldValue('bitrate')?.toString() || '4000'} Kbps</Tag></span>}>
            <Slider min={1000} max={8000} step={500} marks={{ 1000: '1M', 4000: '4M', 8000: '8M' }} />
          </Form.Item>
          <Form.Item name="frameRate" label={<span>帧率 <Tag>{form.getFieldValue('frameRate')?.toString() || '30'} fps</Tag></span>}>
            <Slider min={15} max={60} step={5} marks={{ 15: '15', 30: '30', 60: '60' }} />
          </Form.Item>
          <Form.Item name="beautyEnabled" label="美颜开关" valuePropName="checked">
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          <Form.Item name="recordingStrategy" label="录制策略">
            <Select
              options={[
                { label: '自动录制（开播即录）', value: 'auto' },
                { label: '手动录制（中控触发）', value: 'manual' },
                { label: '不录制', value: 'none' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ====== 推流地址详情 ====== */}
      <Modal
        title="推流地址详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={560}
      >
        {detailRoom && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="直播间">{detailRoom.roomName}</Descriptions.Item>
            <Descriptions.Item label="推流地址 (RTMP)">
              <Space>
                <code style={{ fontSize: 11, wordBreak: 'break-all' }}>{detailRoom.pushUrl}</code>
                <Tooltip title="复制推流地址">
                  <Button size="small" icon={<CopyOutlined />} type="link"
                    onClick={() => handleCopyUrl(detailRoom.pushUrl, '推流地址')} />
                </Tooltip>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="拉流地址 (HLS)">
              <Space>
                <code style={{ fontSize: 11, wordBreak: 'break-all' }}>{detailRoom.pullUrl}</code>
                <Tooltip title="复制拉流地址">
                  <Button size="small" icon={<CopyOutlined />} type="link"
                    onClick={() => handleCopyUrl(detailRoom.pullUrl, '拉流地址')} />
                </Tooltip>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="画质">{detailRoom.resolution} · {detailRoom.bitrate}Kbps · {detailRoom.frameRate}fps</Descriptions.Item>
            <Descriptions.Item label="美颜">{detailRoom.beautyEnabled ? '已开启' : '未开启'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default LiveRoomManagePage;
