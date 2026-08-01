/**
 * 药师工作台 — 待审核处方列表
 * 药师终端：通过 /medical/login 登录后进入
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Statistic, Row, Col, List, Tag, Input, Select, Empty, Spin } from 'antd';
import {
  AuditOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  SearchOutlined, FileTextOutlined, UserOutlined,
} from '@ant-design/icons';
import { useConsultationStore } from '@/stores/consultationStore';
import { useAppAuthStore } from '@/stores/appAuthStore';
import type { Prescription } from '@contracts/consultation';

const statusMap: Record<string, { color: string; label: string }> = {
  PENDING_AUDIT: { color: 'orange', label: '待审核' },
  AUDIT_REJECTED: { color: 'red', label: '已驳回' },
  AWAITING_PATIENT_CONFIRM: { color: 'blue', label: '待患者确认' },
  PATIENT_AGREED: { color: 'green', label: '患者已同意' },
  ORDER_CREATED: { color: 'cyan', label: '已下单' },
  FLOWING: { color: 'purple', label: '流转中' },
  OUT_OF_STOCK: { color: 'volcano', label: '缺货' },
  PHARMACY_SWITCHING: { color: 'gold', label: '换药房中' },
};

const PharmacistWorkbenchPage: React.FC = () => {
  const navigate = useNavigate();
  const medicalUser = useAppAuthStore(s => s.medicalUser);
  const {
    prescriptions,
    loading,
    init,
    loadPrescriptions,
  } = useConsultationStore();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    init().then(() => {
      // 加载所有处方（药师视角，不看特定患者）
      loadPrescriptions();
    });
  }, []);

  // 统计数据
  const stats = useMemo(() => {
    const pending = prescriptions.filter(p => p.status === 'PENDING_AUDIT');
    const todayApproved = prescriptions.filter(p =>
      (p.status === 'AWAITING_PATIENT_CONFIRM' || p.status === 'PATIENT_AGREED') &&
      p.reviewed_at && (Date.now() - p.reviewed_at < 86400000)
    );
    const rejected = prescriptions.filter(p => p.status === 'AUDIT_REJECTED');
    return {
      pending: pending.length,
      todayApproved: todayApproved.length,
      rejected: rejected.length,
    };
  }, [prescriptions]);

  // 筛选
  const filteredPrescriptions = useMemo(() => {
    let list = prescriptions;
    if (statusFilter === 'pending') list = list.filter(p => p.status === 'PENDING_AUDIT');
    else if (statusFilter === 'rejected') list = list.filter(p => p.status === 'AUDIT_REJECTED');
    else if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);

    if (searchText) {
      const kw = searchText.toLowerCase();
      list = list.filter(p =>
        p.patient_id?.toLowerCase().includes(kw) ||
        p.drug_name?.toLowerCase().includes(kw) ||
        p.diagnosis?.toLowerCase().includes(kw) ||
        p.id?.toLowerCase().includes(kw)
      );
    }
    return list.sort((a, b) => b.created_at - a.created_at);
  }, [prescriptions, statusFilter, searchText]);

  return (
    <div style={{ padding: 12 }}>
      {/* 统计卡片 */}
      <Row gutter={8} style={{ marginBottom: 12 }}>
        <Col span={8}>
          <Card size="small" style={{ background: '#fff7e6', borderColor: '#ffd591' }}>
            <Statistic
              title={<span style={{ fontSize: 12 }}>待审核</span>}
              value={stats.pending}
              prefix={<AuditOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ fontSize: 20, color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
            <Statistic
              title={<span style={{ fontSize: 12 }}>今日已审</span>}
              value={stats.todayApproved}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ fontSize: 20, color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ background: '#fff2f0', borderColor: '#ffccc7' }}>
            <Statistic
              title={<span style={{ fontSize: 12 }}>驳回</span>}
              value={stats.rejected}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ fontSize: 20, color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索栏 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Input
          placeholder="搜索患者/药品/处方ID..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ flex: 1 }}
          allowClear
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
          options={[
            { label: '全部', value: 'all' },
            { label: '待审核', value: 'pending' },
            { label: '已驳回', value: 'rejected' },
            { label: '待确认', value: 'AWAITING_PATIENT_CONFIRM' },
            { label: '已下单', value: 'ORDER_CREATED' },
          ]}
        />
      </div>

      {/* 处方列表 */}
      <Spin spinning={loading}>
        {filteredPrescriptions.length === 0 ? (
          <Empty description="暂无处方数据" />
        ) : (
          <List
            dataSource={filteredPrescriptions}
            renderItem={pres => {
              const status = statusMap[pres.status as string] || { color: 'default', label: pres.status as string };
              return (
                <Card
                  size="small"
                  style={{ marginBottom: 8, cursor: 'pointer' }}
                  hoverable
                  onClick={() => navigate(`/medical/pharmacist/audit/${pres.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <FileTextOutlined style={{ color: '#0d9488' }} />
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{pres.drug_name || '未命名药品'}</span>
                        <Tag color={status.color} style={{ margin: 0, fontSize: 11 }}>{status.label}</Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>
                        <UserOutlined style={{ marginRight: 4 }} />
                        患者：{pres.patient_id || '未知'}
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>
                        诊断：{pres.diagnosis || '未记录'}
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        处方ID：{pres.id}
                        <span style={{ marginLeft: 12 }}>
                          <ClockCircleOutlined style={{ marginRight: 2 }} />
                          {new Date(pres.created_at).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    {pres.status === 'PENDING_AUDIT' && (
                      <Badge status="processing" text="待审" style={{ fontSize: 11 }} />
                    )}
                  </div>
                </Card>
              );
            }}
          />
        )}
      </Spin>
    </div>
  );
};

export default PharmacistWorkbenchPage;
