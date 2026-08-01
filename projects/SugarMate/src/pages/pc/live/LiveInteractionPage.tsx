/**
 * 互动管理 — PC 运营后台
 * 为直播间配置问答/抽奖/投票 → 直播中一键触发
 * V2.0 — 接入共享 Store，与 LIVE 端联动
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag, Space, List, InputNumber,
  Typography, message, Popconfirm,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, MessageOutlined,
  QuestionCircleOutlined, TrophyOutlined, BarChartOutlined,
  PlusCircleOutlined, MinusCircleOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useLiveStore, type InteractionConfig, type QaPreset, type LotteryRule, type PollOption } from '@/stores/liveStore';

const { Title } = Typography;
const { TextArea } = Input;

const TYPE_OPTIONS = [
  { label: '💬 问答互动', value: 'qa' },
  { label: '🎰 抽奖活动', value: 'lottery' },
  { label: '📊 观众投票', value: 'poll' },
];

const TYPE_COLORS: Record<string, string> = { qa: 'purple', lottery: 'gold', poll: 'blue' };
const TYPE_LABELS: Record<string, string> = { qa: '问答', lottery: '抽奖', poll: '投票' };
const TYPE_ICONS: Record<string, React.ReactNode> = {
  qa: <QuestionCircleOutlined />,
  lottery: <TrophyOutlined />,
  poll: <BarChartOutlined />,
};

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  inactive: { color: 'default', label: '未激活' },
  active: { color: 'green', label: '进行中' },
  finished: { color: 'default', label: '已结束' },
};

const LiveInteractionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const filterRoomId = searchParams.get('roomId') || '';

  const {
    interactionConfigs, liveRooms,
    addInteractionConfig, updateInteractionConfig, removeInteractionConfig,
    initMockData,
  } = useLiveStore();

  const [search, setSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState<string>(filterRoomId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<string>('qa');

  useEffect(() => { initMockData(); }, []);
  useEffect(() => { setRoomFilter(filterRoomId); }, [filterRoomId]);

  const filteredConfigs = useMemo(() => {
    let list = interactionConfigs;
    if (roomFilter) list = list.filter(c => c.roomId === roomFilter);
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter(c => c.interactionName.toLowerCase().includes(kw));
    }
    return list;
  }, [interactionConfigs, roomFilter, search]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setSelectedType('qa');
    form.resetFields();
    form.setFieldsValue({ type: 'qa' });
    if (roomFilter) form.setFieldValue('roomId', roomFilter);
    setModalOpen(true);
  };

  const handleEdit = (record: InteractionConfig) => {
    setEditingId(record.id);
    setSelectedType(record.type);
    form.setFieldsValue({
      interactionName: record.interactionName,
      type: record.type,
      roomId: record.roomId,
      description: record.description,
      qaPresets: record.qaPresets?.map(q => `${q.question}|||${q.answer}`),
      pollOptions: record.pollOptions?.map(o => o.option),
      lotteryDrawTime: record.lotteryRule?.drawTime,
      prizes: record.lotteryRule?.prizes.map(p => `${p.name}|${p.count}`),
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const room = liveRooms.find(r => r.id === values.roomId);

    const buildPayload = (): Partial<InteractionConfig> => {
      const base: Partial<InteractionConfig> = {
        interactionName: values.interactionName,
        type: values.type,
        roomId: values.roomId,
        roomName: room?.roomName || '',
        description: values.description || '',
      };
      if (values.type === 'qa' && values.qaPresets?.length) {
        base.qaPresets = (values.qaPresets as string[]).map((s: string) => {
          const [question, answer] = s.split('|||');
          return { question, answer };
        });
      }
      if (values.type === 'lottery') {
        base.lotteryRule = {
          drawTime: values.lotteryDrawTime || '每15分钟',
          prizes: (values.prizes as string[])?.map((s: string) => {
            const [name, count] = s.split('|');
            return { name, count: parseInt(count) || 1 };
          }) || [],
        };
      }
      if (values.type === 'poll' && values.pollOptions?.length) {
        base.pollOptions = (values.pollOptions as string[]).map((o: string) => ({ option: o }));
      }
      return base;
    };

    if (editingId) {
      updateInteractionConfig(editingId, buildPayload());
      message.success('互动配置已更新');
    } else {
      const newConfig: InteractionConfig = {
        id: `INT-${String(Date.now()).slice(-6)}`,
        ...buildPayload(),
        status: 'inactive',
      } as InteractionConfig;
      addInteractionConfig(newConfig);
      message.success('互动配置已创建');
    }
    setModalOpen(false);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    removeInteractionConfig(id);
    message.success('互动已删除');
  };

  const selectedRoomName = roomFilter
    ? liveRooms.find(r => r.id === roomFilter)?.roomName
    : '';

  const columns: ColumnsType<InteractionConfig> = [
    { title: '编号', dataIndex: 'id', key: 'id', width: 100 },
    {
      title: '互动名称', dataIndex: 'interactionName', key: 'interactionName',
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: '类型', dataIndex: 'type', key: 'type', width: 80, align: 'center',
      render: (t: string) => (
        <Tag color={TYPE_COLORS[t]} icon={TYPE_ICONS[t]}>{TYPE_LABELS[t]}</Tag>
      ),
    },
    {
      title: '直播间', dataIndex: 'roomName', key: 'roomName', width: 130, ellipsis: true,
    },
    {
      title: '内容概况', key: 'preview', width: 260, ellipsis: true,
      render: (_, r) => {
        if (r.type === 'qa') return `预设 ${r.qaPresets?.length || 0} 组Q&A`;
        if (r.type === 'lottery') {
          const prizes = r.lotteryRule?.prizes.map(p => `${p.name}×${p.count}`).join(', ');
          return `奖品：${prizes || '无'}`;
        }
        if (r.type === 'poll') return `选项：${r.pollOptions?.map(o => o.option).join('、') || '无'}`;
        return r.description;
      },
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
          <Popconfirm title="确定删除此互动？" onConfirm={() => handleDelete(record.id)}>
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
            <MessageOutlined /> 互动管理
            {selectedRoomName && <Tag color="purple" style={{ marginLeft: 12 }}>{selectedRoomName}</Tag>}
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
              placeholder="搜索互动名称"
              allowClear style={{ width: 180 }}
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              创建互动
            </Button>
          </Space>
        }
      >
        <Table<InteractionConfig>
          columns={columns}
          dataSource={filteredConfigs}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: t => `共 ${t} 个互动` }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑互动配置' : '创建互动配置'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={handleSubmit}
        width={640}
        okText={editingId ? '保存修改' : '创建互动'}
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="interactionName" label="互动名称" rules={[{ required: true, message: '请输入互动名称' }]}>
            <Input placeholder="如：糖尿病问答互动" maxLength={30} showCount />
          </Form.Item>
          <Form.Item name="type" label="互动类型" rules={[{ required: true }]}>
            <Select
              options={TYPE_OPTIONS}
              onChange={(v) => setSelectedType(v)}
            />
          </Form.Item>
          <Form.Item name="roomId" label="关联直播间" rules={[{ required: true, message: '请选择直播间' }]}>
            <Select
              placeholder="选择直播间"
              options={liveRooms.map(r => ({ label: r.roomName, value: r.id }))}
            />
          </Form.Item>
          <Form.Item name="description" label="互动说明">
            <TextArea rows={2} placeholder="简述此互动的玩法" maxLength={200} showCount />
          </Form.Item>

          {/* 问答：预设Q&A对 */}
          {selectedType === 'qa' && (
            <Form.List name="qaPresets">
              {(fields, { add, remove }) => (
                <>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>预设问答</div>
                  {fields.map(({ key, name }, index) => (
                    <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: '#999', width: 20 }}>Q{index + 1}</span>
                      <Form.Item name={name} noStyle rules={[{ required: true, message: '请输入问答对' }]}>
                        <Input placeholder="问题|||答案（用 ||| 分隔）" style={{ width: 420 }} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f' }} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />}>
                    添加问答
                  </Button>
                </>
              )}
            </Form.List>
          )}

          {/* 抽奖：奖品配置 */}
          {selectedType === 'lottery' && (
            <>
              <Form.Item name="lotteryDrawTime" label="开奖时间">
                <Input placeholder="如：每15分钟" />
              </Form.Item>
              <Form.List name="prizes">
                {(fields, { add, remove }) => (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>奖品配置</div>
                    {fields.map(({ key, name }) => (
                      <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                        <Form.Item name={name} noStyle rules={[{ required: true, message: '请输入奖品' }]}>
                          <Input placeholder="奖品名称|数量（如：血糖仪|3）" style={{ width: 300 }} />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f' }} />
                      </Space>
                    ))}
                    <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />}>
                      添加奖品
                    </Button>
                  </>
                )}
              </Form.List>
            </>
          )}

          {/* 投票：选项配置 */}
          {selectedType === 'poll' && (
            <Form.List name="pollOptions">
              {(fields, { add, remove }) => (
                <>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>投票选项</div>
                  {fields.map(({ key, name }) => (
                    <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item name={name} noStyle rules={[{ required: true, message: '请输入选项' }]}>
                        <Input placeholder="选项内容" style={{ width: 420 }} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f' }} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />}>
                    添加选项
                  </Button>
                </>
              )}
            </Form.List>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default LiveInteractionPage;
