/**
 * PG-SUG-PC-040 系统配置
 * 支持：Tab分组查看、行内编辑、保存修改
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Tag, Button, Space, Card, Input, Modal, Form, Select, Switch,
  message, Tabs, Row, Col, Statistic, InputNumber, Typography,
} from 'antd';
import {
  SearchOutlined, EditOutlined, SaveOutlined, ReloadOutlined,
  CheckOutlined, CloseOutlined,
} from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const { Text } = Typography;

const SystemConfigPage: React.FC = () => {
  const { ad } = useUserStore();
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [editRecord, setEditRecord] = useState<any>(null);
  const [editValue, setEditValue] = useState<string | number | boolean>('');
  const [editOpen, setEditOpen] = useState(false);
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/system/configs');
      const list = Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : [];
      setConfigs(list);
      setDirtyKeys(new Set());
    } catch { setConfigs([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  const groups = ['all', ...new Set(configs.map((c: any) => c.group).filter(Boolean))];

  const filtered = activeTab === 'all' ? configs : configs.filter(c => c.group === activeTab);

  const handleOpenEdit = (record: any) => {
    const rawValue = record.value || record.default_value;
    setEditRecord(record);
    setEditValue(
      typeof rawValue === 'boolean' ? rawValue :
      typeof rawValue === 'number' ? rawValue :
      String(rawValue)
    );
    setEditOpen(true);
  };

  const handleConfirmEdit = () => {
    if (!editRecord) return;
    const newValue = typeof editValue === 'string' && editRecord.value_type === 'NUMBER'
      ? Number(editValue)
      : editValue;
    setConfigs(prev => prev.map(c =>
      c.key === editRecord.key ? { ...c, value: newValue, updated_at: Math.floor(Date.now() / 1000) } : c
    ));
    setDirtyKeys(prev => new Set(prev).add(editRecord.key));
    setEditOpen(false);
    setEditRecord(null);
    message.success(`配置项 "${editRecord.key}" 已修改`);
  };

  const handleSaveAll = async () => {
    try {
      const updates = configs
        .filter(c => dirtyKeys.has(c.key))
        .map(c => ({ config_key: c.key, config_value: String(c.value) }));
      await ad!.post('/system/configs/batch', { items: updates });
      message.success(`已保存 ${updates.length} 项配置修改`);
      setDirtyKeys(new Set());
    } catch { message.error('保存失败，请重试'); }
  };

  const COLORS = {
    STRING: 'blue',
    NUMBER: 'green',
    BOOLEAN: 'orange',
    JSON: 'purple',
    ENUM: 'cyan',
  };

  const renderValue = (r: any) => {
    const v = r.value;
    if (typeof v === 'boolean') return <Switch checked={v} disabled />;
    if (typeof v === 'number') return <code style={{ fontWeight: 700 }}>{v}</code>;
    return <code>{String(v)}</code>;
  };

  const cols = [
    { title: '配置项', dataIndex: 'key', width: 200, render: (v: string, r: any) => (
      <Space>
        <code style={{ fontWeight: 600 }}>{v}</code>
        {dirtyKeys.has(v) && <Tag color="processing" style={{ fontSize: 10 }}>已修改</Tag>}
      </Space>
    )},
    { title: '当前值', dataIndex: 'value', width: 200, render: (_: any, r: any) => renderValue(r) },
    { title: '默认值', dataIndex: 'default_value', width: 120, render: (v: any) => (
      <Text type="secondary">{typeof v === 'boolean' ? v.toString() : <code>{v}</code>}</Text>
    )},
    { title: '类型', dataIndex: 'value_type', width: 80, render: (t: string) => <Tag color={COLORS[t] || 'default'}>{t}</Tag> },
    { title: '分组', dataIndex: 'group', width: 100, render: (g: string) => <Tag color="blue">{g}</Tag> },
    { title: '风险', dataIndex: 'risk_level', width: 60, render: (r: string) => {
      const riskMap: Record<string, { color: string; label: string }> = {
        LOW: { color: 'green', label: '低' },
        MEDIUM: { color: 'orange', label: '中' },
        HIGH: { color: 'red', label: '高' },
      };
      return <Tag color={riskMap[r]?.color}>{riskMap[r]?.label}</Tag>;
    }},
    { title: '描述', dataIndex: 'description', width: 200, ellipsis: true },
    { title: '最后修改', dataIndex: 'updated_at', width: 110, render: (v: number) => v ? new Date(v * 1000).toLocaleDateString('zh-CN') : '-' },
    { title: '操作', width: 80, render: (_: any, r: any) => (
      <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(r)}>编辑</Button>
    )},
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="配置项总数" value={configs.length} /></Card></Col>
        <Col span={6}><Card><Statistic title="配置分组" value={groups.length - 1} /></Card></Col>
        <Col span={6}><Card><Statistic title="已修改待保存" value={dirtyKeys.size} valueStyle={{ color: dirtyKeys.size > 0 ? 'var(--color-warning)' : undefined }} /></Card></Col>
        <Col span={6}><Card><Statistic title="最近修改" value="2026-07-29" /></Card></Col>
      </Row>
      <Card
        title="系统配置"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveAll}
              disabled={dirtyKeys.size === 0}
            >
              保存修改 ({dirtyKeys.size})
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'all', label: '全部' },
          ...groups.filter(g => g !== 'all').map(g => ({ key: g, label: g })),
        ]} />
        <Input prefix={<SearchOutlined />} placeholder="搜索配置项" value=""
          onChange={e => {}} allowClear style={{ width: 260, marginBottom: 16 }} 
        />
        <Table rowKey="key" dataSource={filtered} columns={cols} loading={loading} pagination={{ pageSize: 15 }} size="middle" />
      </Card>

      {/* 编辑配置 Modal */}
      <Modal
        title={`编辑配置: ${editRecord?.key || ''}`}
        open={editOpen}
        onOk={handleConfirmEdit}
        onCancel={() => { setEditOpen(false); setEditRecord(null); }}
        okText="确认"
        cancelText="取消"
        width={480}
      >
        {editRecord && (
          <div>
            <p><Text type="secondary">{editRecord.description || '无描述'}</Text></p>
            <div style={{ marginTop: 16 }}>
              <Text strong>当前值:</Text>
              {renderValue(editRecord)}
            </div>
            <div style={{ marginTop: 16 }}>
              {editRecord.value_type === 'BOOLEAN' ? (
                <Space>
                  <Button
                    type={editValue === true ? 'primary' : 'default'}
                    icon={<CheckOutlined />}
                    onClick={() => setEditValue(true)}
                  >启用</Button>
                  <Button
                    type={editValue === false ? 'primary' : 'default'}
                    icon={<CloseOutlined />}
                    danger
                    onClick={() => setEditValue(false)}
                  >禁用</Button>
                </Space>
              ) : editRecord.value_type === 'NUMBER' ? (
                <InputNumber
                  value={Number(editValue)}
                  onChange={v => setEditValue(v ?? 0)}
                  style={{ width: '100%' }}
                />
              ) : editRecord.value_type === 'ENUM' && editRecord.enum_options ? (
                <Select
                  value={String(editValue)}
                  onChange={v => setEditValue(v)}
                  style={{ width: '100%' }}
                  options={editRecord.enum_options.map((o: string) => ({ value: o, label: o }))}
                />
              ) : (
                <Input.TextArea
                  rows={3}
                  value={String(editValue)}
                  onChange={e => setEditValue(e.target.value)}
                />
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SystemConfigPage;
