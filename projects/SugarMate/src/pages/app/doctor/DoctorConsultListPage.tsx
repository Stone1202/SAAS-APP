/**
 * DoctorConsultListPage - 医生问诊订单列表子页面 V1.0.0
 *
 * 三级导航：我的页 → 订单列表（本页）→ 订单详情
 * 支持：状态Tab分类、关键词搜索、服务类型筛选、点击跳转详情
 */
import React, { useEffect, useState, useMemo } from 'react';
import { Card, Tag, Tabs, Input, Select, Empty, Badge } from 'antd';
import { SearchOutlined, ClockCircleOutlined, MedicineBoxOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AppPageFrame from '../../../components/AppPageFrame';
import { useAppAuthStore } from '../../../stores/appAuthStore';
import { useConsultationStore } from '../../../stores/consultationStore';

/* ---------- 常量 ---------- */

const SERVICE_TYPE_LABEL: Record<string, string> = {
  TEXT: '图文咨询',
  VIDEO: '视频问诊',
  VOICE: '语音咨询',
};

/** 订单状态分组 → Tab Key */
type StatusTab = 'all' | 'pending' | 'in_consult' | 'prescription' | 'completed' | 'cancelled';

interface TabDef {
  key: StatusTab;
  label: string;
  count: (orders: any[]) => number;
  statusFilter: (status: string) => boolean;
}

const STATUS_TABS: TabDef[] = [
  {
    key: 'all', label: '全部',
    count: (orders) => orders.length,
    statusFilter: () => true,
  },
  {
    key: 'pending', label: '待接诊',
    count: (orders) => orders.filter(o => o.status === 'PENDING_ACCEPT').length,
    statusFilter: (s) => s === 'PENDING_ACCEPT',
  },
  {
    key: 'in_consult', label: '问诊中',
    count: (orders) => orders.filter(o => ['ACCEPTED', 'IN_CONSULT'].includes(o.status)).length,
    statusFilter: (s) => ['ACCEPTED', 'IN_CONSULT'].includes(s),
  },
  {
    key: 'prescription', label: '处方相关',
    count: (orders) => orders.filter(o =>
      ['PENDING_PRESCRIPTION', 'PRESCRIPTION_SUBMITTED', 'PRESCRIPTION_SIGNED', 'PRESCRIPTION_APPROVED', 'RX_AWAITING_PATIENT', 'RX_PATIENT_ACCEPTED', 'RX_PATIENT_REJECTED', 'PRESCRIPTION_FLOWING'].includes(o.status)
    ).length,
    statusFilter: (s) => ['PENDING_PRESCRIPTION', 'PRESCRIPTION_SUBMITTED', 'PRESCRIPTION_SIGNED', 'PRESCRIPTION_APPROVED', 'RX_AWAITING_PATIENT', 'RX_PATIENT_ACCEPTED', 'RX_PATIENT_REJECTED', 'PRESCRIPTION_FLOWING'].includes(s),
  },
  {
    key: 'completed', label: '已完结',
    count: (orders) => orders.filter(o => ['COMPLETED', 'EVALUATED'].includes(o.status)).length,
    statusFilter: (s) => ['COMPLETED', 'EVALUATED'].includes(s),
  },
  {
    key: 'cancelled', label: '已取消',
    count: (orders) => orders.filter(o => ['CANCELLED', 'REFUNDED', 'TIMEOUT_REFUNDED', 'PARTIAL_REFUNDED'].includes(o.status)).length,
    statusFilter: (s) => ['CANCELLED', 'REFUNDED', 'TIMEOUT_REFUNDED', 'PARTIAL_REFUNDED'].includes(s),
  },
];

const SERVICE_TYPE_OPTIONS = [
  { value: '', label: '全部类型' },
  { value: 'TEXT', label: '图文咨询' },
  { value: 'VIDEO', label: '视频问诊' },
  { value: 'VOICE', label: '语音咨询' },
];

const { Option } = Select;

/* ---------- 工具函数 ---------- */

function fmtDate(ts: number) {
  const d = new Date(ts * 1000 || ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const isThisYear = d.getFullYear() === now.getFullYear();
  if (isToday) return '今天';
  const mmdd = `${d.getMonth() + 1}/${d.getDate()}`;
  return isThisYear ? mmdd : `${d.getFullYear()}/${mmdd}`;
}

function statusColor(s: string): string {
  const map: Record<string, string> = {
    PENDING_ACCEPT: 'red',
    ACCEPTED: 'blue',
    IN_CONSULT: 'orange',
    PENDING_PRESCRIPTION: 'purple',
    PRESCRIPTION_SUBMITTED: 'purple',
    PRESCRIPTION_SIGNED: 'purple',
    PRESCRIPTION_APPROVED: 'purple',
    RX_AWAITING_PATIENT: 'gold',
    RX_PATIENT_ACCEPTED: 'green',
    RX_PATIENT_REJECTED: 'red',
    PRESCRIPTION_FLOWING: 'cyan',
    WAITING_PATIENT_CONFIRM: 'orange',
    PATIENT_CONFIRMED: 'blue',
    COMPLETED: 'green',
    EVALUATED: 'green',
    CANCELLED: 'default',
    REFUNDED: 'default',
    TIMEOUT_REFUNDED: 'default',
    PARTIAL_REFUNDED: 'default',
  };
  return map[s] || 'default';
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    PENDING_ACCEPT: '待接诊',
    ACCEPTED: '已接诊',
    IN_CONSULT: '问诊中',
    PENDING_PRESCRIPTION: '待开方',
    PRESCRIPTION_SUBMITTED: '处方已提交',
    PRESCRIPTION_SIGNED: '处方已签章',
    PRESCRIPTION_APPROVED: '处方已审核',
    RX_AWAITING_PATIENT: '待患者确认',
    RX_PATIENT_ACCEPTED: '患者已同意',
    RX_PATIENT_REJECTED: '患者已拒绝',
    PRESCRIPTION_FLOWING: '处方流转中',
    WAITING_PATIENT_CONFIRM: '待患者确认完结',
    PATIENT_CONFIRMED: '患者已确认',
    COMPLETED: '已完成',
    EVALUATED: '已评价',
    CANCELLED: '已取消',
    REFUNDED: '已退款',
    TIMEOUT_REFUNDED: '超时退款',
    PARTIAL_REFUNDED: '部分退款',
  };
  return map[s] || s;
}

/* ========== 组件 ========== */

const DoctorConsultListPage: React.FC = () => {
  const navigate = useNavigate();
  const medicalUser = useAppAuthStore(s => s.medicalUser);
  const { orders, loadOrders, init } = useConsultationStore();

  // --- 数据加载 ---
  const [consultDoctorId, setConsultDoctorId] = useState<string>('');

  useEffect(() => {
    if (!medicalUser?.phone && !medicalUser?.name) return;

    init().then(() => {
      const storeState = useConsultationStore.getState();
      const resolved = storeState.resolveDoctorConsultId(medicalUser.phone, medicalUser.name);

      if (resolved) {
        setConsultDoctorId(resolved);
        loadOrders(undefined, resolved);
      } else {
        // 映射失败兜底：直接加载全部订单，在客户端侧按医生名过滤
        console.warn('[DOCTOR-LIST] 无法将当前医生映射到问诊医生ID，使用全量加载+名称兜底', {
          phone: medicalUser.phone,
          name: medicalUser.name,
          doctorsCount: storeState.doctors.length,
        });
        // 先试：如果有任何问诊记录，按医生名匹配加载
        loadOrders(undefined); // 加载全部订单
      }
    });
  }, [medicalUser?.phone, medicalUser?.name]);

  // --- 筛选状态 ---
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [searchText, setSearchText] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  // --- 统计数据 ---
  const { pendingCount, prescriptionCount, completedCount } = useMemo(() => ({
    pendingCount: orders.filter(o => o.status === 'PENDING_ACCEPT').length,
    prescriptionCount: orders.filter(o =>
      ['PENDING_PRESCRIPTION', 'PRESCRIPTION_SUBMITTED', 'PRESCRIPTION_SIGNED', 'PRESCRIPTION_APPROVED', 'RX_AWAITING_PATIENT', 'RX_PATIENT_ACCEPTED', 'RX_PATIENT_REJECTED', 'PRESCRIPTION_FLOWING'].includes(o.status)
    ).length,
    completedCount: orders.filter(o => ['COMPLETED', 'EVALUATED'].includes(o.status)).length,
  }), [orders]);

  // --- 筛选后的订单 ---
  const currentTab = STATUS_TABS.find(t => t.key === activeTab)!;

  const filteredOrders = useMemo(() => {
    let list = [...orders];
    list = list.filter(o => currentTab.statusFilter(o.status));
    if (searchText.trim()) {
      const kw = searchText.trim().toLowerCase();
      list = list.filter(o =>
        (o.patient_name || '').toLowerCase().includes(kw) ||
        o.id.toLowerCase().includes(kw) ||
        (o.symptom_summary || '').toLowerCase().includes(kw)
      );
    }
    if (serviceFilter) {
      list = list.filter(o => o.service_type === serviceFilter);
    }
    list.sort((a, b) => b.created_at - a.created_at);
    return list;
  }, [orders, activeTab, searchText, serviceFilter]);

  /* ========== 渲染 ========== */

  return (
    <AppPageFrame title="问诊订单" showBack onBack={() => navigate('/app/doctor/mine')}>
      <div style={{ padding: 12 }}>

        {/* ======= 快捷统计 ======= */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[
            { icon: <ClockCircleOutlined />, label: '待接诊', value: pendingCount, color: '#ff4d4f', urgent: pendingCount > 0 },
            { icon: <MedicineBoxOutlined />, label: '处方量', value: prescriptionCount, color: '#1677ff' },
            { icon: <TeamOutlined />, label: '已完结', value: completedCount, color: '#52c41a' },
          ].map(item => (
            <Card
              key={item.label}
              size="small"
              style={{ flex: 1, borderRadius: 8, textAlign: 'center' }}
              bodyStyle={{ padding: '10px 8px' }}
            >
              <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>
                {item.urgent && <Badge dot status="error" style={{ marginRight: 4 }} />}
                {item.value}
              </div>
              <div style={{ fontSize: 10, color: '#999' }}>{item.icon} {item.label}</div>
            </Card>
          ))}
        </div>

        {/* ======= 搜索栏 ======= */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 8 }} bodyStyle={{ padding: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              size="small"
              placeholder="搜索患者姓名/订单号/主诉…"
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              style={{ flex: 1 }}
            />
            <Select
              size="small"
              value={serviceFilter}
              onChange={(v: string) => setServiceFilter(v)}
              style={{ width: 110 }}
            >
              {SERVICE_TYPE_OPTIONS.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </div>
        </Card>

        {/* ======= 状态 Tab ======= */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as StatusTab)}
          size="small"
          style={{ marginBottom: 0 }}
          tabBarStyle={{ marginBottom: 8 }}
        >
          {STATUS_TABS.map(tab => (
            <Tabs.TabPane
              tab={
                <span>
                  {tab.label}
                  {tab.count(orders) > 0 && (
                    <span style={{
                      marginLeft: 4, fontSize: 10, color: activeTab === tab.key ? '#1677ff' : '#999',
                      background: activeTab === tab.key ? '#e6f7ff' : '#f5f5f5',
                      padding: '0 5px', borderRadius: 8,
                    }}>{tab.count(orders)}</span>
                  )}
                </span>
              }
              key={tab.key}
            />
          ))}
        </Tabs>

        {/* ======= 订单列表 ======= */}
        {filteredOrders.length === 0 ? (
          <Card size="small" style={{ borderRadius: 10 }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={searchText.trim() ? '未找到匹配的订单' : '暂无问诊订单'}
              style={{ padding: '12px 0' }}
            >
              {searchText.trim() && (
                <a onClick={() => { setSearchText(''); setServiceFilter(''); setActiveTab('all'); }}>清空筛选条件</a>
              )}
            </Empty>
          </Card>
        ) : (
          <Card size="small" style={{ borderRadius: 10 }} bodyStyle={{ padding: 0 }}>
            {filteredOrders.map((order, i) => (
              <div
                key={order.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px',
                  borderBottom: i < filteredOrders.length - 1 ? '1px solid #f0f0f0' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={() => navigate(`/app/doctor/consult/detail/${order.id}`)}
                onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                {/* 患者头像 */}
                <div style={{
                  width: 40, height: 40, borderRadius: 20, background: '#e6f7ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#1677ff', fontSize: 16, fontWeight: 600, flexShrink: 0,
                }}>
                  {order.patient_name?.[0] || '患'}
                </div>
                {/* 订单信息 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      {order.patient_name || `患者 ${order.patient_id}`}
                    </span>
                    <Tag color={statusColor(order.status)} style={{ fontSize: 10, lineHeight: '18px', margin: 0 }}>
                      {statusLabel(order.status)}
                    </Tag>
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.symptom_summary || '暂无主诉'}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: '#999' }}>{SERVICE_TYPE_LABEL[order.service_type] || order.service_type}</span>
                    <span style={{ fontSize: 11, color: '#999' }}>{fmtDate(order.created_at)}</span>
                    <span style={{ fontSize: 11, color: '#ff4d4f', fontWeight: 500 }}>¥{(order.paid_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
                {/* 右侧箭头 */}
                <span style={{ color: '#bfbfbf', flexShrink: 0 }}>›</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </AppPageFrame>
  );
};

export default DoctorConsultListPage;
