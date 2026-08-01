/**
 * PG-SUG-PC-007 资质证照中心 V3.0.0
 *
 * V3.0.0 改造：按「所属人/商家」聚合展示
 * - 一个商家一行，不再按单条证照平铺
 * - 行内聚合该商家的全部证照类型与状态
 * - 详情弹窗展示该商家的主体信息 + 全部资质附件（可预览）
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Table, Tag, Button, Card, Space, Input, Select, Statistic, Row, Col, Typography,
  Modal, Descriptions, Tabs, Badge, Divider, Image, Empty,
} from 'antd';
import {
  SearchOutlined, EyeOutlined, ReloadOutlined, FileTextOutlined,
  ShopOutlined, UserAddOutlined,
} from '@ant-design/icons';
import { useMerchantStore } from '@/stores/merchantStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { MerchantRecord, MerchantRole, Certificate } from '@/stores/merchantStore';
import type { OnboardingApplication, OnboardingStatus } from '@/stores/onboardingStore';
import { ROLE_LABEL, CERT_TYPE_LABEL, STATUS_LABEL, STATUS_COLOR } from '@/contracts/merchant';
import { normalizeRole } from '@/contracts/merchant';

const { Text, Title } = Typography;
const { Option } = Select;

/** 单条统一资质视图 */
interface UnifiedCertView {
  id: string;
  certNo: string;
  certType: string;
  certTypeLabel: string;
  name: string;
  fileUrl?: string;
  status: 'valid' | 'pending' | 'expired' | 'invalid';
  expireAt?: number;
  issuedAt?: number;
  issuer?: string;
  notes?: string;
  ownerId: string;
  ownerName: string;
  ownerRole: MerchantRole;
  ownerRoleLabel: string;
  ownerStatus: string;
  source: 'apply' | 'admin_add';
  sourceLabel: string;
  applyNo?: string;
  rawMerchant?: MerchantRecord;
  rawApplication?: OnboardingApplication;
}

/** 按所属人聚合的证照组 */
interface OwnerCertGroup {
  ownerId: string;
  ownerName: string;
  ownerRole: MerchantRole;
  ownerRoleLabel: string;
  ownerStatus: string;
  source: 'apply' | 'admin_add';
  sourceLabel: string;
  applyNo?: string;
  totalCerts: number;
  validCount: number;
  pendingCount: number;
  expiredCount: number;
  invalidCount: number;
  certTypes: string[];
  certs: UnifiedCertView[];
  rawMerchant?: MerchantRecord;
  rawApplication?: OnboardingApplication;
}

const CERT_STATUS_COLOR: Record<string, string> = {
  valid: 'green',
  pending: 'orange',
  expired: 'red',
  invalid: 'default',
};

const CERT_STATUS_TEXT: Record<string, string> = {
  valid: '有效',
  pending: '待审',
  expired: '过期',
  invalid: '无效',
};

const isAppCertApproved = (status: OnboardingStatus) =>
  ['APPROVED', 'SIGNING', 'SIGNED', 'ONLINE'].includes(status);

const CertificateCenterPage: React.FC = () => {
  const { merchants, initMockData: initMerchantData } = useMerchantStore();
  const { applications, initMockData: initOnboardingData } = useOnboardingStore();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<MerchantRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'apply' | 'admin_add'>('all');
  const [detailGroup, setDetailGroup] = useState<OwnerCertGroup | null>(null);

  useEffect(() => {
    initMerchantData();
    initOnboardingData();
  }, [initMerchantData, initOnboardingData]);

  // ==================== 双数据源聚合 → 平铺资质 ====================
  const unifiedCerts = useMemo((): UnifiedCertView[] => {
    const result: UnifiedCertView[] = [];
    const seenCertIds = new Set<string>();

    merchants.forEach(m => {
      (m.certificates || []).forEach(c => {
        const key = `${m.id}#${c.id}`;
        if (seenCertIds.has(key)) return;
        seenCertIds.add(key);
        result.push({
          id: c.id,
          certNo: c.certNo || '-',
          certType: c.type,
          certTypeLabel: CERT_TYPE_LABEL[c.type] || c.type,
          name: c.name,
          fileUrl: c.fileUrl,
          status: c.status,
          expireAt: c.expireAt,
          issuedAt: c.issuedAt,
          issuer: c.issuer,
          notes: c.notes,
          ownerId: m.id,
          ownerName: m.name,
          ownerRole: m.role,
          ownerRoleLabel: ROLE_LABEL[m.role],
          ownerStatus: m.lifecycleStatus,
          source: m.source,
          sourceLabel: m.source === 'apply' ? '入驻申请' : '后台添加',
          applyNo: m.applyNo,
          rawMerchant: m,
        });
      });
    });

    applications.forEach(app => {
      if (!isAppCertApproved(app.status)) return;
      const alreadyOnboarded = merchants.some(m => m.applyNo === app.id);
      if (alreadyOnboarded) return;
      const normalizedRole = normalizeRole(app.role);
      (app.certificates || []).forEach(c => {
        const key = `${app.id}#${c.id}`;
        if (seenCertIds.has(key)) return;
        seenCertIds.add(key);
        result.push({
          id: c.id,
          certNo: (c as any).certNo || '-',
          certType: c.type,
          certTypeLabel: CERT_TYPE_LABEL[c.type] || c.type,
          name: c.name,
          fileUrl: c.fileUrl,
          status: c.status,
          expireAt: c.expiryDate ? new Date(c.expiryDate).getTime() : undefined,
          issuedAt: undefined,
          issuer: c.notes,
          notes: c.notes,
          ownerId: app.id,
          ownerName: app.name,
          ownerRole: normalizedRole,
          ownerRoleLabel: ROLE_LABEL[normalizedRole],
          ownerStatus: app.status,
          source: 'apply',
          sourceLabel: '入驻申请',
          applyNo: app.id,
          rawApplication: app,
        });
      });
    });

    return result;
  }, [merchants, applications]);

  // ==================== 按所属人聚合 ====================
  const ownerGroups = useMemo((): OwnerCertGroup[] => {
    const map = new Map<string, OwnerCertGroup>();
    unifiedCerts.forEach(cert => {
      const g = map.get(cert.ownerId);
      if (g) {
        g.certs.push(cert);
        g.totalCerts++;
        if (cert.status === 'valid') g.validCount++;
        if (cert.status === 'pending') g.pendingCount++;
        if (cert.status === 'expired') g.expiredCount++;
        if (cert.status === 'invalid') g.invalidCount++;
        if (!g.certTypes.includes(cert.certTypeLabel)) g.certTypes.push(cert.certTypeLabel);
      } else {
        map.set(cert.ownerId, {
          ownerId: cert.ownerId,
          ownerName: cert.ownerName,
          ownerRole: cert.ownerRole,
          ownerRoleLabel: cert.ownerRoleLabel,
          ownerStatus: cert.ownerStatus,
          source: cert.source,
          sourceLabel: cert.sourceLabel,
          applyNo: cert.applyNo,
          totalCerts: 1,
          validCount: cert.status === 'valid' ? 1 : 0,
          pendingCount: cert.status === 'pending' ? 1 : 0,
          expiredCount: cert.status === 'expired' ? 1 : 0,
          invalidCount: cert.status === 'invalid' ? 1 : 0,
          certTypes: [cert.certTypeLabel],
          certs: [cert],
          rawMerchant: cert.rawMerchant,
          rawApplication: cert.rawApplication,
        });
      }
    });
    return Array.from(map.values());
  }, [unifiedCerts]);

  // ==================== 筛选（商家维度）====================
  const filtered = useMemo(() => {
    let list = ownerGroups;
    if (roleFilter !== 'all') list = list.filter(g => g.ownerRole === roleFilter);
    if (sourceFilter !== 'all') list = list.filter(g => g.source === sourceFilter);
    if (statusFilter !== 'all') {
      list = list.filter(g => {
        if (statusFilter === 'valid') return g.validCount > 0;
        if (statusFilter === 'pending') return g.pendingCount > 0;
        if (statusFilter === 'expired') return g.expiredCount > 0;
        if (statusFilter === 'invalid') return g.invalidCount > 0;
        return true;
      });
    }
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter(g =>
        g.ownerName?.toLowerCase().includes(kw) ||
        g.applyNo?.toLowerCase().includes(kw) ||
        g.certTypes.some(t => t.includes(kw))
      );
    }
    return list;
  }, [ownerGroups, roleFilter, sourceFilter, statusFilter, search]);

  // ==================== 统计 ====================
  const stats = useMemo(() => {
    const totalOwners = ownerGroups.length;
    const totalCerts = unifiedCerts.length;
    const valid = unifiedCerts.filter(c => c.status === 'valid').length;
    const expired = unifiedCerts.filter(c => c.status === 'expired').length;
    const pending = unifiedCerts.filter(c => c.status === 'pending').length;
    const expiringSoon = unifiedCerts.filter(c => {
      if (c.status !== 'valid' || !c.expireAt) return false;
      return c.expireAt - Date.now() < 30 * 86400000;
    }).length;
    return { totalOwners, totalCerts, valid, expired, pending, expiringSoon };
  }, [ownerGroups, unifiedCerts]);

  // ==================== 表格列 ====================
  const columns = [
    {
      title: '所属人/商家',
      width: 180,
      render: (_: any, g: OwnerCertGroup) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: 14 }}>{g.ownerName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {g.source === 'apply' ? <ShopOutlined /> : <UserAddOutlined />}
            {' '}{g.sourceLabel}
          </Text>
          {g.applyNo && <Text type="secondary" style={{ fontSize: 11 }}>编号: {g.applyNo}</Text>}
        </Space>
      ),
    },
    {
      title: '角色',
      width: 80,
      render: (_: any, g: OwnerCertGroup) => <Tag color="blue">{g.ownerRoleLabel}</Tag>,
    },
    {
      title: '证照套数',
      width: 140,
      render: (_: any, g: OwnerCertGroup) => (
        <Space size={4}>
          <Badge count={g.totalCerts} style={{ backgroundColor: '#1890ff' }} />
          <Space size={0}>
            {g.validCount > 0 && <Tag color="green" style={{ fontSize: 11, padding: '0 4px' }}>{g.validCount}有效</Tag>}
            {g.pendingCount > 0 && <Tag color="orange" style={{ fontSize: 11, padding: '0 4px' }}>{g.pendingCount}待审</Tag>}
            {g.expiredCount > 0 && <Tag color="red" style={{ fontSize: 11, padding: '0 4px' }}>{g.expiredCount}过期</Tag>}
          </Space>
        </Space>
      ),
    },
    {
      title: '证照类型',
      render: (_: any, g: OwnerCertGroup) => (
        <Space size={4} wrap>
          {g.certTypes.map(t => (
            <Tag key={t} color="cyan" style={{ fontSize: 11, margin: 0 }}>{t}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      width: 100,
      render: (_: any, g: OwnerCertGroup) => {
        if (g.expiredCount > 0) return <Tag color="red">有过期证照</Tag>;
        if (g.pendingCount > 0) return <Tag color="orange">有待审证照</Tag>;
        if (g.validCount === g.totalCerts) return <Tag color="green">全部有效</Tag>;
        return <Tag>部分异常</Tag>;
      },
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, g: OwnerCertGroup) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetailGroup(g)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* 统计卡片区 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small">
            <Statistic title="商家/申请人" value={stats.totalOwners} suffix="个" />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="证照总数" value={stats.totalCerts} suffix="份" />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="有效" value={stats.valid} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="待审核" value={stats.pending} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="已过期" value={stats.expired} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic title="即将过期(30天)" value={stats.expiringSoon} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      {/* 主表格 */}
      <Card title="资质证照中心">
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索商家名称/申请编号/证照类型"
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            style={{ width: 260 }}
          />
          <Select value={roleFilter} onChange={v => setRoleFilter(v)} style={{ width: 120 }}>
            <Option value="all">全部角色</Option>
            <Option value="PHARMACY">药房</Option>
            <Option value="DOCTOR">医生</Option>
            <Option value="PHARMACIST">药剂师</Option>
            <Option value="NUTRITIONIST">营养师</Option>
          </Select>
          <Select value={statusFilter} onChange={v => setStatusFilter(v)} style={{ width: 140 }}>
            <Option value="all">全部状态</Option>
            <Option value="valid">含有效证照</Option>
            <Option value="pending">含待审证照</Option>
            <Option value="expired">含过期证照</Option>
            <Option value="invalid">含无效证照</Option>
          </Select>
          <Select value={sourceFilter} onChange={v => setSourceFilter(v)} style={{ width: 120 }}>
            <Option value="all">全部来源</Option>
            <Option value="apply">入驻申请</Option>
            <Option value="admin_add">后台添加</Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setSourceFilter('all'); }}
          >
            重置
          </Button>
        </Space>

        <Table
          rowKey="ownerId"
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 10, showTotal: t => `共 ${t} 个商家/申请人` }}
          size="middle"
        />
      </Card>

      {/* 详情弹窗：展示该商家的全部资质 */}
      <Modal
        title={<><FileTextOutlined /> {detailGroup?.ownerName} — 资质详情</>}
        open={!!detailGroup}
        onCancel={() => setDetailGroup(null)}
        footer={<Button onClick={() => setDetailGroup(null)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detailGroup && (
          <Tabs defaultActiveKey="certs">
            {/* Tab 1: 全部资质附件 */}
            <Tabs.TabPane tab={`资质附件 (${detailGroup.totalCerts})`} key="certs">
              {detailGroup.certs.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {detailGroup.certs.map(cert => (
                    <div
                      key={cert.id}
                      style={{
                        width: 200,
                        border: '1px solid #f0f0f0',
                        borderRadius: 8,
                        padding: 12,
                        background: '#fafafa',
                      }}
                    >
                      {cert.fileUrl ? (
                        <Image
                          src={cert.fileUrl}
                          alt={cert.name}
                          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
                          preview={{ mask: '点击预览' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%', height: 120, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', background: '#eee', borderRadius: 6,
                          color: '#999', fontSize: 12,
                        }}>
                          暂无图片
                        </div>
                      )}
                      <div style={{ marginTop: 10, fontSize: 13, fontWeight: 500 }}>{cert.name}</div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                        {cert.certTypeLabel} · 编号: {cert.certNo}
                      </div>
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Tag size="small" color={CERT_STATUS_COLOR[cert.status]}>
                          {CERT_STATUS_TEXT[cert.status]}
                        </Tag>
                        {cert.issuer && <Text type="secondary" style={{ fontSize: 11 }}>{cert.issuer}</Text>}
                      </div>
                      {cert.expireAt && (
                        <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                          有效期至: {new Date(cert.expireAt).toLocaleDateString('zh-CN')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="暂无资质附件" />
              )}
            </Tabs.TabPane>

            {/* Tab 2: 主体信息 */}
            <Tabs.TabPane tab="主体信息" key="owner">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="名称" span={2}>
                  <Text strong>{detailGroup.ownerName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="角色">
                  <Tag color="blue">{detailGroup.ownerRoleLabel}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="来源">
                  <Tag color={detailGroup.source === 'apply' ? 'green' : 'purple'}>{detailGroup.sourceLabel}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={STATUS_COLOR[detailGroup.ownerStatus as any] || 'default'}>
                    {STATUS_LABEL[detailGroup.ownerStatus as any] || detailGroup.ownerStatus}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="申请编号">{detailGroup.applyNo || '-'}</Descriptions.Item>
              </Descriptions>

              {detailGroup.rawMerchant && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <Title level={5}>商家详细</Title>
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="电话">{detailGroup.rawMerchant.phone}</Descriptions.Item>
                    <Descriptions.Item label="邮箱">{detailGroup.rawMerchant.email || '-'}</Descriptions.Item>
                    <Descriptions.Item label="机构">{detailGroup.rawMerchant.company || '-'}</Descriptions.Item>
                    <Descriptions.Item label="地址">
                      {[detailGroup.rawMerchant.province, detailGroup.rawMerchant.city, detailGroup.rawMerchant.address]
                        .filter(Boolean).join(' ') || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="科室/职称" span={2}>
                      {detailGroup.rawMerchant.department || '-'} / {detailGroup.rawMerchant.title || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="擅长领域" span={2}>
                      {detailGroup.rawMerchant.specialties?.join('、') || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}

              {detailGroup.rawApplication && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <Title level={5}>入驻申请信息</Title>
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="电话">{detailGroup.rawApplication.phone}</Descriptions.Item>
                    <Descriptions.Item label="机构">{detailGroup.rawApplication.company || '-'}</Descriptions.Item>
                    <Descriptions.Item label="申请状态">
                      <Tag>{detailGroup.rawApplication.status}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="提交时间">
                      {detailGroup.rawApplication.submittedAt
                        ? new Date(detailGroup.rawApplication.submittedAt).toLocaleString('zh-CN')
                        : '-'}
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}
            </Tabs.TabPane>

            {/* Tab 3: 审核记录 → 双源合并：入驻申请审核记录 + 商家档案审核记录 */}
            {(() => {
              // 合并两个来源的审核记录（去重：按id）
              const appLogs = detailGroup.rawApplication?.reviewLogs || [];
              const merchantLogs = detailGroup.rawMerchant?.reviewLogs || [];
              const seen = new Set<string>();
              const merged = [
                ...appLogs.filter(l => { if (seen.has(l.id)) return false; seen.add(l.id); return true; }),
                ...merchantLogs.filter(l => { if (seen.has(l.id)) return false; seen.add(l.id); return true; }),
              ];
              if (merged.length === 0) return null;
              return (
                <Tabs.TabPane tab={`审核记录 (${merged.length})`} key="review">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {merged.map(log => (
                      <Card key={log.id} size="small">
                        <Space>
                          <Tag color={log.result === 'ok' ? 'green' : 'orange'}>
                            {log.result === 'ok' ? '通过' : log.result === 'insufficient' ? '需补充' : log.result}
                          </Tag>
                          <Text strong>{log.step === 'info_review' ? '信息审核' : log.step === 'cert_review' ? '资质审核' : log.step}</Text>
                        </Space>
                        <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                          审核人：{log.reviewedBy} · {new Date(log.reviewedAt).toLocaleString('zh-CN')}
                        </div>
                        <div style={{ marginTop: 2, fontSize: 12 }}>备注：{log.comment}</div>
                      </Card>
                    ))}
                  </Space>
                </Tabs.TabPane>
              );
            })()}
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default CertificateCenterPage;
