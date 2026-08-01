/**
 * PG-SUG-PC-008 合同管理 V2.0.0
 * 
 * V2.0.0 改造：
 * - 使用统一 MerchantStore 替代分散 API 调用
 * - 合同数据来自商家记录的 contract 字段
 * - 支持签约操作联动
 */
import React, { useEffect, useState, useMemo } from 'react';
import { Table, Tag, Button, Card, Space, Input, Select, Statistic, Row, Col, Typography, Modal, Descriptions, message } from 'antd';
import { SearchOutlined, EyeOutlined, SendOutlined, CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMerchantStore } from '@/stores/merchantStore';
import type { MerchantRecord, MerchantRole, MerchantLifecycleStatus, ContractData } from '@/stores/merchantStore';
import { ROLE_LABEL, STATUS_LABEL, STATUS_COLOR } from '@/contracts/merchant';

const { Text } = Typography;
const { Option } = Select;

const CONTRACT_STATUS_COLOR: Record<string, string> = {
  pending: 'default', sent: 'blue', signed: 'green', expired: 'red', terminated: 'default',
};

const ContractManagePage: React.FC = () => {
  const { merchants, sendContract, signContract, initMockData } = useMerchantStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<MerchantRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [curMerchant, setCurMerchant] = useState<MerchantRecord | null>(null);

  useEffect(() => { initMockData(); }, [initMockData]);

  // 筛选有合同的商家
  const contractList = useMemo(() => {
    let list = merchants.filter(m => m.contract); // 只看有合同的
    if (roleFilter !== 'all') list = list.filter(m => m.role === roleFilter);
    if (statusFilter !== 'all') list = list.filter(m => m.contract?.status === statusFilter);
    if (search) {
      list = list.filter(m =>
        m.name?.includes(search) || m.company?.includes(search) || m.contract?.contractId?.includes(search)
      );
    }
    return list;
  }, [merchants, roleFilter, statusFilter, search]);

  const stats = useMemo(() => ({
    total: merchants.filter(m => m.contract).length,
    sending: merchants.filter(m => m.contract?.status === 'sent').length,
    signed: merchants.filter(m => m.contract?.status === 'signed').length,
    pending: merchants.filter(m => m.lifecycleStatus === 'APPROVED' && !m.contract).length,
  }), [merchants]);

  const columns = [
    { title: '商家名称', dataIndex: 'name', width: 180, ellipsis: true },
    { title: '角色', dataIndex: 'role', width: 80,
      render: (v: MerchantRole) => <Tag>{ROLE_LABEL[v]}</Tag> },
    { title: '合同编号', key: 'contractNo', width: 170, ellipsis: true,
      render: (_: any, r: MerchantRecord) => r.contract?.contractId || '-' },
    { title: '合同状态', key: 'contractStatus', width: 100,
      render: (_: any, r: MerchantRecord) => {
        const s = r.contract?.status;
        const labels: Record<string, string> = {
          pending: '待生成', sent: '已发送', signed: '已签约', expired: '已过期', terminated: '已终止',
        };
        return <Tag color={CONTRACT_STATUS_COLOR[s!] || 'default'}>{labels[s!] || s}</Tag>;
      }},
    { title: '签约时间', key: 'signedAt', width: 120,
      render: (_: any, r: MerchantRecord) =>
        r.contract?.signedAt ? new Date(r.contract.signedAt).toLocaleDateString('zh-CN') : '-' },
    { title: '有效期', key: 'validity', width: 140,
      render: (_: any, r: MerchantRecord) => {
        if (!r.contract?.validFrom) return '-';
        return `${new Date(r.contract.validFrom).toLocaleDateString()} ~ ${r.contract.validTo ? new Date(r.contract.validTo).toLocaleDateString() : '长期'}`;
      }},
    { title: '商家状态', dataIndex: 'lifecycleStatus', width: 90,
      render: (s: MerchantLifecycleStatus) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</Tag> },
    { title: '操作', width: 200,
      render: (_: any, r: MerchantRecord) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />}
            onClick={() => { setCurMerchant(r); setDetailOpen(true); }}>详情</Button>
          {r.lifecycleStatus === 'APPROVED' && !r.contract && (
            <Button size="small" type="primary" icon={<SendOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '确认发送电子合同？',
                  content: `将为商家「${r.name}」生成并发送电子合同。`,
                  okText: '确定',
                  cancelText: '取消',
                  centered: true,
                  onOk: () => {
                    try { sendContract(r.id); message.success('电子合同已发送'); }
                    catch (e) { console.error('发送合同失败', e); message.error('发送失败，请重试'); }
                  },
                });
              }}>发送</Button>
          )}
          {r.contract?.status === 'sent' && (
            <Button size="small" type="primary" icon={<CheckOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '确认签约完成？',
                  content: `将把商家「${r.name}」的合同标记为已签约。`,
                  okText: '确定',
                  cancelText: '取消',
                  centered: true,
                  okButtonProps: { type: 'primary' },
                  onOk: () => {
                    try { signContract(r.id); message.success('已签约'); }
                    catch (e) { console.error('签约失败', e); message.error('签约失败，请重试'); }
                  },
                });
              }}>签约</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={5}><Card size="small"><Statistic title="合同总数" value={stats.total} /></Card></Col>
        <Col span={5}><Card size="small"><Statistic title="已签约" value={stats.signed} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={5}><Card size="small"><Statistic title="待签署" value={stats.sending} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col span={5}><Card size="small"><Statistic title="待生成" value={stats.pending} valueStyle={{ color: '#1890ff' }} /></Card></Col>
      </Row>

      <Card title="合同管理">
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索名称/合同编号"
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
          <Select value={roleFilter} onChange={v => setRoleFilter(v)} style={{ width: 110 }}>
            <Option value="all">全部角色</Option>
            <Option value="PHARMACY">药房</Option>
            <Option value="DOCTOR">医生</Option>
            <Option value="PHARMACIST">药师</Option>
            <Option value="NUTRITIONIST">营养师</Option>
          </Select>
          <Select value={statusFilter} onChange={v => setStatusFilter(v)} style={{ width: 110 }}>
            <Option value="all">全部状态</Option>
            <Option value="signed">已签约</Option>
            <Option value="sent">已发送</Option>
            <Option value="pending">待生成</Option>
            <Option value="expired">已过期</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); }}>
            重置
          </Button>
        </Space>

        <Table rowKey="id" dataSource={contractList} columns={columns} pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }} size="middle" />
      </Card>

      {/* 合同详情 */}
      <Modal
        title="合同详情"
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setCurMerchant(null); }}
        footer={<Button onClick={() => { setDetailOpen(false); setCurMerchant(null); }}>关闭</Button>}
        width={500}
      >
        {curMerchant && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="商家名称">{curMerchant.name}</Descriptions.Item>
            <Descriptions.Item label="角色"><Tag>{ROLE_LABEL[curMerchant.role]}</Tag></Descriptions.Item>
            <Descriptions.Item label="合同编号">{curMerchant.contract?.contractId || '-'}</Descriptions.Item>
            <Descriptions.Item label="合同状态">
              <Tag color={CONTRACT_STATUS_COLOR[curMerchant.contract?.status!] || 'default'}>
                {curMerchant.contract?.status === 'signed' ? '已签约' : curMerchant.contract?.status === 'sent' ? '已发送' : curMerchant.contract?.status}
              </Tag>
            </Descriptions.Item>
            {curMerchant.contract?.signedAt && (
              <Descriptions.Item label="签约时间">{new Date(curMerchant.contract.signedAt).toLocaleString('zh-CN')}</Descriptions.Item>
            )}
            {curMerchant.contract?.validFrom && (
              <Descriptions.Item label="有效期">
                {new Date(curMerchant.contract.validFrom).toLocaleDateString()} ~ {curMerchant.contract.validTo ? new Date(curMerchant.contract.validTo).toLocaleDateString() : '长期'}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ContractManagePage;
