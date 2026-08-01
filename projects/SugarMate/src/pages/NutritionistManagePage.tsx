/**
 * PG-NT-PC-001 营养师管理 V3.0.0
 *
 * V3.0.0 改造（与 /apply 营养师入驻入口完全对齐）：
 * - 只展示已通过入驻审核 + 上线的营养师（ONLINE 状态）
 * - 移除所有审批相关操作 — 由 /onboarding 统一管理
 * - 资质上传：身份证正/反面 + 注册营养师证书（与 /apply 一致）
 * - 添加流程：MerchantAddDrawer → merchantStore.addMerchant() → onboardingStore.createApplication(DRAFT)
 *   → onboardingStore.submitApplication(PENDING) → 审核通过后自动同步
 * - 顶部增加流程引导卡片
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, Tag, Button, Space, Card, Row, Col, Statistic,
  Modal, Input, message, Popconfirm, Descriptions, Image, Divider, Alert,
} from 'antd';
import {
  SearchOutlined, EyeOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, ReloadOutlined, RocketOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useMerchantStore } from '@/stores/merchantStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { MerchantRecord } from '@/stores/merchantStore';
import { ROLE_COLOR } from '@/contracts/merchant';
import MerchantAddDrawer from '@/components/MerchantAddDrawer';
import type { MerchantAddFormData } from '@/components/MerchantAddDrawer';

const ROLE = 'NUTRITIONIST' as const;

const NutritionistManagePage: React.FC = () => {
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

  // 全部营养师（用于统计通过率等指标）
  const allNutritionists = useMemo(
    () => merchants.filter(m => m.role === 'NUTRITIONIST'),
    [merchants]
  );

  // 仅显示已上线营养师
  const nutritionistList = useMemo(() => {
    let list = allNutritionists
      .filter(m => m.lifecycleStatus === 'ONLINE');
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter(m =>
        m.name?.toLowerCase().includes(kw) ||
        m.phone?.includes(kw) ||
        m.title?.toLowerCase().includes(kw) ||
        m.company?.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [allNutritionists, search]);

  const stats = useMemo(() => ({
    total: nutritionistList.length,
    // P0 修复：原 stats.total === 入驻通过率 永远相同，无意义
    // 修正为：已上线 / (已上线+已驳回)，百分比形式
    passRate: allNutritionists.length === 0 ? 0 : Math.round(
      (allNutritionists.filter(m => m.lifecycleStatus === 'ONLINE').length /
       (allNutritionists.filter(m => m.lifecycleStatus === 'ONLINE' || m.lifecycleStatus === 'REJECTED').length || 1)) * 100
    ),
  }), [nutritionistList, allNutritionists]);

  /** 编辑：直接 updateMerchant */
  const handleEdit = (data: MerchantAddFormData) => {
    if (!editTarget) return;
    updateMerchant(editTarget.id, {
      name: data.realName,
      phone: data.phone,
      idCard: data.idCard,
      title: data.title,
      company: data.affiliatedOrg,
      specialties: data.specialties,
      certificates: data.certificates,
    });
    setDrawerOpen(false);
    setEditTarget(null);
    message.success('营养师信息已更新');
  };

  const handleDelete = (id: string) => {
    deleteMerchant(id);
    message.success('已删除');
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) { message.warning('请先选择'); return; }
    Modal.confirm({
      title: `确认批量删除 ${selectedRowKeys.length} 条记录？`,
      onOk: () => {
        selectedRowKeys.forEach(id => deleteMerchant(id));
        setSelectedRowKeys([]);
        message.success(`已删除 ${selectedRowKeys.length} 条`);
      },
    });
  };

  const columns = [
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '手机号', dataIndex: 'phone', width: 120 },
    { title: '职称', dataIndex: 'title', width: 140, render: (v: string) => v || '-' },
    { title: '所在机构', dataIndex: 'company', width: 200, ellipsis: true, render: (v: string) => v || '-' },
    { title: '擅长领域', dataIndex: 'specialties', width: 220, render: (v: string[]) => v?.length ? v.join('、') : '-' },
    { title: '入驻时间', dataIndex: 'joinedAt', width: 120,
      render: (v: number) => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
    { title: '状态', width: 100,
      render: () => (
        <Tag color="success" icon={<CheckCircleOutlined />}>已上线</Tag>
      )},
    { title: '操作', width: 200, fixed: 'right' as const,
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
      title={`营养师详情 — ${curMerchant?.name || ''}`}
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
            <Descriptions.Item label="角色"><Tag color={ROLE_COLOR.NUTRITIONIST}>营养师</Tag></Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color="success" icon={<CheckCircleOutlined />}>已上线</Tag></Descriptions.Item>
            <Descriptions.Item label="入驻时间">{curMerchant.joinedAt ? new Date(curMerchant.joinedAt).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" style={{ margin: '8px 0', fontSize: 14, fontWeight: 600 }}>基本信息</Divider>
          <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="姓名">{curMerchant.name}</Descriptions.Item>
            <Descriptions.Item label="手机号">{curMerchant.phone}</Descriptions.Item>
            <Descriptions.Item label="身份证号">{curMerchant.idCard || '-'}</Descriptions.Item>
            <Descriptions.Item label="职称">{curMerchant.title || '-'}</Descriptions.Item>
            <Descriptions.Item label="所在机构" span={2}>{curMerchant.company || '-'}</Descriptions.Item>
            <Descriptions.Item label="擅长领域" span={2}>{curMerchant.specialties?.join('、') || '-'}</Descriptions.Item>
          </Descriptions>

          {curMerchant.certificates?.length > 0 && (
            <>
              <Divider orientation="left" style={{ margin: '8px 0', fontSize: 14, fontWeight: 600 }}>资质证书（{curMerchant.certificates.length} 项）</Divider>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {curMerchant.certificates.map((c, i) => (
                  <div key={i} style={{ width: 180, border: '1px solid #f0f0f0', borderRadius: 8, padding: 10, background: '#fafafa' }}>
                    {c.fileUrl ? (
                      <Image src={c.fileUrl} alt={c.name}
                        style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 6 }}
                        preview={{ mask: '点击预览' }} />
                    ) : (
                      <div style={{ width: '100%', height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', borderRadius: 6, color: '#999', fontSize: 12 }}>暂无图片</div>
                    )}
                    <div style={{ marginTop: 8, fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                    {c.certNo && <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>编号: {c.certNo}</div>}
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
      <Alert
        type="info"
        showIcon
        icon={<RocketOutlined />}
        message="营养师管理 — 数据流转说明"
        description={
          <div style={{ fontSize: 12, lineHeight: 1.8 }}>
            本页仅展示<b>已上线</b>营养师（已通过入驻审核）。
            添加营养师后，申请将进入 <b>[入驻审核管理]</b> 走完审批流程；
            审核通过后，将自动同步到 <b>资质中心</b>、<b>合同管理</b>。
            所有审核操作请前往入驻审核管理。
          </div>
        }
        style={{ marginBottom: 16, borderRadius: 10 }}
      />

      <Card
        title="营养师管理（仅已上线）"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setFormMode('add');
            setEditTarget(null);
            setDrawerOpen(true);
          }}>
            添加营养师
          </Button>
        }
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}><Card size="small"><Statistic title="已上线营养师总数" value={stats.total} prefix={<CheckCircleOutlined style={{ color: 'var(--color-success)' }} />} /></Card></Col>
          <Col span={12}><Card size="small"><Statistic title="入驻通过率" value={stats.passRate} suffix="%" valueStyle={{ color: 'var(--color-info)' }} /></Card></Col>
        </Row>

        <Space style={{ marginBottom: 16 }} wrap>
          <Input prefix={<SearchOutlined />} placeholder="搜索姓名/手机号/职称/所在机构"
            value={search} onChange={e => setSearch(e.target.value)}
            allowClear style={{ width: 280 }} />
          <Button icon={<ReloadOutlined />} onClick={() => setSearch('')}>重置</Button>
          {selectedRowKeys.length > 0 && (
            <Button danger onClick={handleBatchDelete}>
              批量删除 ({selectedRowKeys.length})
            </Button>
          )}
        </Space>

        <Table
          rowKey="id"
          dataSource={nutritionistList}
          columns={columns}
          pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }}
          size="middle"
          scroll={{ x: 1200 }}
          rowSelection={{
            selectedRowKeys,
            onChange: keys => setSelectedRowKeys(keys as string[]),
          }}
        />
      </Card>

      {renderDetailModal()}

      <MerchantAddDrawer
        open={drawerOpen}
        mode={formMode}
        role={ROLE}
        initialData={formMode === 'edit' && editTarget ? {
          role: ROLE,
          entityType: editTarget.entityType || 'INDIVIDUAL',
          realName: editTarget.name || '',
          phone: editTarget.phone || '',
          idCard: editTarget.idCard || '',
          title: editTarget.title || '',
          affiliatedOrg: editTarget.company || '',
          specialties: editTarget.specialties || [],
          certificates: editTarget.certificates || [],
        } : undefined}
        onClose={() => { setDrawerOpen(false); setEditTarget(null); }}
        onSubmit={formMode === 'edit' ? handleEdit : undefined}
      />
    </div>
  );
};

export default NutritionistManagePage;