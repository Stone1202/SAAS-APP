/**
 * PG-SUG-PC-001 药房管理 V3.0.0
 *
 * V3.0.0 改造（与 /apply 入驻入口完全对齐）：
 * - 只展示已通过入驻审核 + 上线的药房（ONLINE 状态）
 * - 移除所有审批相关操作（上/下/签约/审核）—— 由 /onboarding 统一管理
 * - "添加药房"流程：MerchantAddDrawer 内部调用
 *   merchantStore.addMerchant() → 联动 onboardingStore.createApplication(DRAFT)
 *   → onboardingStore.submitApplication(PENDING)
 *   → 审核通过后自动同步到 资质中心(/certificates) + 合同管理(/contracts)
 * - 编辑：直接 updateMerchant（不触发审核）
 * - 顶部增加流程引导卡片
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, Tag, Button, Space, Card, Row, Col, Statistic,
  Modal, Input, message, Typography, Popconfirm,
  Image, Divider, Descriptions, Alert,
} from 'antd';
import {
  SearchOutlined, EyeOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, ReloadOutlined, RocketOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useMerchantStore } from '@/stores/merchantStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { MerchantRecord } from '@/stores/merchantStore';
import { STATUS_LABEL, STATUS_COLOR, ROLE_COLOR } from '@/contracts/merchant';
import MerchantAddDrawer from '@/components/MerchantAddDrawer';
import type { MerchantAddFormData } from '@/components/MerchantAddDrawer';

const { Text } = Typography;

const MerchantListPage: React.FC = () => {
  const {
    merchants, updateMerchant, deleteMerchant, initMockData: initMerchantMock,
  } = useMerchantStore();
  const onboardingStore = useOnboardingStore();

  useEffect(() => {
    initMerchantMock();
    onboardingStore.initMockData();
  }, []);

  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [curMerchant, setCurMerchant] = useState<MerchantRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editTarget, setEditTarget] = useState<MerchantRecord | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // 仅显示已上线药房（已通过入驻审核）
  const pharmacyList = useMemo(() => {
    let list = merchants
      .filter(m => m.role === 'PHARMACY')
      .filter(m => m.lifecycleStatus === 'ONLINE');
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter(m =>
        m.name?.toLowerCase().includes(kw) ||
        m.company?.toLowerCase().includes(kw) ||
        m.phone?.includes(kw) ||
        m.licenseNo?.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [merchants, search]);

  const stats = useMemo(() => ({
    total: pharmacyList.length,
    // P0 修复：原实现从 pharmacyList(已过滤 ONLINE) 中再 filter ONLINE → 永远等于 total，无意义
    // 修正为"本月新增"：按 joinedAt 在本月范围内的统计
    thisMonth: pharmacyList.filter(m => {
      if (!m.joinedAt) return false;
      const d = new Date(m.joinedAt);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length,
  }), [pharmacyList]);

  /** 编辑：直接更新商家（不触发审核） */
  const handleEdit = (data: MerchantAddFormData) => {
    if (!editTarget) return;
    updateMerchant(editTarget.id, {
      name: data.pharmacyName,
      phone: data.legalPhone || editTarget.phone,
      company: data.licenseNo,
      licenseNo: data.licenseNo,
      businessScope: (data.businessScope || []).join('、'),
      address: data.address,
      certificates: data.certificates,
    });
    setDrawerOpen(false);
    setEditTarget(null);
    message.success('药房信息已更新');
  };

  const handleDelete = (id: string) => {
    deleteMerchant(id);
    message.success('已删除');
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) { message.warning('请先选择'); return; }
    Modal.confirm({
      title: `确认批量删除 ${selectedRowKeys.length} 条记录？`,
      content: '此操作不可恢复',
      onOk: () => {
        selectedRowKeys.forEach(id => deleteMerchant(id));
        setSelectedRowKeys([]);
        message.success(`已删除 ${selectedRowKeys.length} 条`);
      },
    });
  };

  const columns = [
    { title: '药房名称', dataIndex: 'name', width: 180, ellipsis: true },
    { title: '统一社会信用代码', dataIndex: 'company', width: 180, ellipsis: true, render: (v: string) => v || '-' },
    { title: '药品经营许可证', dataIndex: 'licenseNo', width: 160, ellipsis: true, render: (v: string) => v || '-' },
    { title: '法人', key: 'legalPerson', width: 100, render: (_: any, r: any) => r.legalPerson || '-' },
    { title: '手机号', dataIndex: 'phone', width: 120 },
    { title: '经营范围', dataIndex: 'businessScope', width: 180, ellipsis: true, render: (v: string) => v || '-' },
    { title: '入驻时间', dataIndex: 'joinedAt', width: 120,
      render: (v: number) => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
    { title: '状态', dataIndex: 'lifecycleStatus', width: 100,
      render: () => (
        <Tag color="success" icon={<CheckCircleOutlined />}>已上线</Tag>
      )},
    { title: '操作', width: 180, fixed: 'right' as const,
      render: (_: any, r: MerchantRecord) => (
        <Space size="small" wrap>
          <Button size="small" icon={<EyeOutlined />}
            onClick={() => { setCurMerchant(r); setDetailOpen(true); }}>详情</Button>
          <Button size="small" icon={<EditOutlined />}
            onClick={() => { setEditTarget(r); setFormMode('edit'); setDrawerOpen(true); }}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )},
  ];

  const renderDetailModal = () => (
    <Modal
      title={`药房详情 — ${curMerchant?.name || ''}`}
      open={detailOpen}
      onCancel={() => { setDetailOpen(false); setCurMerchant(null); }}
      footer={<Button onClick={() => { setDetailOpen(false); setCurMerchant(null); }}>关闭</Button>}
      width={720}
      destroyOnClose
    >
      {curMerchant && (
        <div>
          <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="编号">{curMerchant.applyNo || curMerchant.id}</Descriptions.Item>
            <Descriptions.Item label="角色"><Tag color={ROLE_COLOR.PHARMACY}>药房</Tag></Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color="success" icon={<CheckCircleOutlined />}>已上线</Tag></Descriptions.Item>
            <Descriptions.Item label="创建时间">{new Date(curMerchant.createdAt).toLocaleString('zh-CN')}</Descriptions.Item>
            <Descriptions.Item label="入驻时间">{curMerchant.joinedAt ? new Date(curMerchant.joinedAt).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" style={{ margin: '8px 0', fontSize: 14, fontWeight: 600 }}>主体信息</Divider>
          <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="药房名称" span={2}>{curMerchant.name}</Descriptions.Item>
            <Descriptions.Item label="手机号">{curMerchant.phone}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{curMerchant.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="统一社会信用代码" span={2}>{curMerchant.company || '-'}</Descriptions.Item>
            <Descriptions.Item label="药品经营许可证">{curMerchant.licenseNo || '-'}</Descriptions.Item>
            <Descriptions.Item label="经营范围" span={2}>{curMerchant.businessScope || '-'}</Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>{[curMerchant.province, curMerchant.city, curMerchant.district, curMerchant.address].filter(Boolean).join(' ') || '-'}</Descriptions.Item>
          </Descriptions>

          {curMerchant.certificates?.length > 0 && (
            <>
              <Divider orientation="left" style={{ margin: '8px 0', fontSize: 14, fontWeight: 600 }}>资质附件（{curMerchant.certificates.length} 项）</Divider>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                {curMerchant.certificates.map((c, i) => (
                  <div key={i} style={{ width: 180, border: '1px solid #f0f0f0', borderRadius: 8, padding: 10, background: '#fafafa' }}>
                    {c.fileUrl ? (
                      <Image
                        src={c.fileUrl} alt={c.name}
                        style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
                        preview={{ mask: '点击预览' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', borderRadius: 6, color: '#999', fontSize: 12 }}>暂无图片</div>
                    )}
                    <div style={{ marginTop: 8, fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                    {c.certNo && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>编号: {c.certNo}</div>}
                    {c.expiryDate && <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>有效期至: {c.expiryDate}</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );

  return (
    <div>
      {/* 流程引导卡片 */}
      <Alert
        type="info"
        showIcon
        icon={<RocketOutlined />}
        message="药房管理 — 数据流转说明"
        description={
          <div style={{ fontSize: 12, lineHeight: 1.8 }}>
            本页仅展示<b>已上线</b>药房（已通过入驻审核）。
            添加药房后，申请将进入 <b>[入驻审核管理]</b> 走完审批流程；
            审核通过后，将自动同步到 <b>资质中心</b>、<b>合同管理</b>。
            所有审核操作（上/下/签约）请前往入驻审核管理。
          </div>
        }
        style={{ marginBottom: 16, borderRadius: 10 }}
      />

      <Card
        title="药房管理（仅已上线）"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setFormMode('add');
            setEditTarget(null);
            setDrawerOpen(true);
          }}>
            添加药房
          </Button>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}><Card size="small"><Statistic title="已上线药房总数" value={stats.total} prefix={<CheckCircleOutlined style={{ color: 'var(--color-success)' }} />} /></Card></Col>
          <Col span={12}><Card size="small"><Statistic title="本月新增" value={stats.thisMonth} valueStyle={{ color: 'var(--color-info)' }} /></Card></Col>
        </Row>

        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索药房名称/信用代码/许可证号"
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />
          <Button icon={<ReloadOutlined />} onClick={() => setSearch('')}>重置</Button>
          {selectedRowKeys.length > 0 && (
            <Button danger onClick={handleBatchDelete}>
              批量删除 ({selectedRowKeys.length})
            </Button>
          )}
        </Space>

        <Table
          rowKey="id"
          dataSource={pharmacyList}
          columns={columns}
          pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }}
          size="middle"
          scroll={{ x: 1400 }}
          rowSelection={{
            selectedRowKeys,
            onChange: keys => setSelectedRowKeys(keys as string[]),
          }}
        />
      </Card>

      {renderDetailModal()}

      {/* 添加/编辑药房抽屉（资质上传与 /apply 完全一致，5 项独立 Dragger） */}
      <MerchantAddDrawer
        open={drawerOpen}
        mode={formMode}
        role="PHARMACY"
        initialData={formMode === 'edit' && editTarget ? {
          role: 'PHARMACY',
          entityType: editTarget.entityType || 'INSTITUTION',
          pharmacyName: editTarget.name,
          licenseNo: editTarget.company || editTarget.licenseNo || '',
          legalPerson: (editTarget as any).legalPerson || '',
          legalPhone: editTarget.phone || '',
          address: editTarget.address || '',
          bizHours: (editTarget as any).bizHours || '',
          businessScope: editTarget.businessScope ? editTarget.businessScope.split(/[,、，]/) : [],
          certificates: editTarget.certificates || [],
        } : undefined}
        onClose={() => { setDrawerOpen(false); setEditTarget(null); }}
        onSubmit={formMode === 'edit' ? handleEdit : undefined}
      />
    </div>
  );
};

export default MerchantListPage;