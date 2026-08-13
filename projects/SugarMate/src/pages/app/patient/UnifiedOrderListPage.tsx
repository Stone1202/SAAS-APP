/**
 * V2.0.0 患者统一订单中心
 *
 * 功能：混合展示问诊订单 + 处方订单 + 非处方订单，支持按类型筛选
 * 数据源：consultationStore（问诊订单）+ orderStore（实物订单）
 * 架构：前端视图层合并，不新增 Store
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List, Tabs, Tag, Space, Badge, Empty, NavBar, Skeleton,
} from 'antd-mobile';
import {
  ClockCircleOutline,
} from 'antd-mobile-icons';
import { useConsultationStore } from '@/stores/consultationStore';
import { useOrderStore } from '@/stores/orderStore';
import { useAppAuthStore } from '@/stores/appAuthStore';

// ============================================================
// 统一订单视图类型
// ============================================================
interface UnifiedOrderView {
  unified_id: string;
  source: 'CONSULTATION' | 'TRADE_RX' | 'TRADE_OTC' | 'TRADE_SERVICE';
  display_title: string;
  display_status: string;
  display_amount: number;
  display_items: string[];
  status_color: string;
  created_at: number;
  navigate_to: string;
  primary_action?: { label: string; path: string };
  consultation_id?: string;
  prescription_id?: string;
  trade_order_id?: string;
}

const CONSULTATION_STATUS_LABEL: Record<string, string> = {
  PENDING_ACCEPT: '待接诊',
  ACCEPTED: '已接诊',
  IN_CONSULT: '问诊中',
  PENDING_PRESCRIPTION: '待开方',
  PRESCRIPTION_SUBMITTED: '处方已提交',
  PRESCRIPTION_SIGNED: '处方已签章',
  PRESCRIPTION_APPROVED: '处方已审核',
  RX_AWAITING_PATIENT: '待确认处方',
  RX_PATIENT_ACCEPTED: '已确认处方',
  RX_PATIENT_REJECTED: '已拒绝处方',
  PRESCRIPTION_FLOWING: '处方流转中',
  WAITING_PATIENT_CONFIRM: '待确认完结',
  PATIENT_CONFIRMED: '已确认',
  COMPLETED: '已完成',
  EVALUATED: '已评价',
  REFUNDED: '已退款',
  CANCELED: '已取消',
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING_PAY: '待付款',
  RX_CHECKING: '处方校验中',
  PENDING_DELIVERY: '待发货',
  SHIPPED: '配送中',
  COMPLETED: '已完成',
  REFUNDING: '退款中',
  CANCELLED: '已取消',
  COLD_CHAIN_EXCEPTION: '冷链异常',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_ACCEPT: 'orange',
  ACCEPTED: 'blue',
  IN_CONSULT: '#108ee9',
  PENDING_PRESCRIPTION: 'purple',
  PRESCRIPTION_SUBMITTED: 'purple',
  PRESCRIPTION_SIGNED: 'purple',
  PRESCRIPTION_APPROVED: 'purple',
  RX_AWAITING_PATIENT: 'gold',
  RX_PATIENT_ACCEPTED: 'green',
  RX_PATIENT_REJECTED: 'red',
  PRESCRIPTION_FLOWING: 'cyan',
  WAITING_PATIENT_CONFIRM: 'lime',
  PATIENT_CONFIRMED: 'green',
  EVALUATED: 'green',
  REFUNDED: 'red',
  CANCELED: 'default',
  COMPLETED: 'green',
  PENDING_PAY: 'orange',
  PENDING_DELIVERY: 'blue',
  SHIPPED: 'blue',
  REFUNDING: 'red',
  COLD_CHAIN_EXCEPTION: 'red',
  RX_CHECKING: 'purple',
};

const TAB_CONFIG = [
  { key: 'all', label: '全部' },
  { key: 'CONSULTATION', label: '问诊' },
  { key: 'TRADE_RX', label: '处方药' },
  { key: 'TRADE_OTC', label: '非处方药' },
];

const UnifiedOrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  // 数据源
  const { orders: consultOrders, loadOrders, loading: consultLoading } = useConsultationStore();
  const { orders: tradeOrders, loadOrders: loadTradeOrders, loading: tradeLoading } = useOrderStore();
  const { patientUser } = useAppAuthStore();

  // 加载数据（含处方关联信息）
  useEffect(() => {
    loadOrders(patientUser?.id || 'cus-001');
    loadTradeOrders?.();
  }, [patientUser?.id]);

  // 合并视图
  const unifiedOrders = useMemo((): UnifiedOrderView[] => {
    const views: UnifiedOrderView[] = [];

    // 1. 问诊订单
    for (const c of consultOrders) {
      const statusLabel = CONSULTATION_STATUS_LABEL[c.status] || c.status;
      const shouldShowPatientConfirm = [
        'WAITING_PATIENT_CONFIRM', 'PATIENT_CONFIRMED', 'IN_CONSULT',
        'ACCEPTED', 'PENDING_ACCEPT', 'PENDING_PRESCRIPTION',
        'PRESCRIPTION_SUBMITTED', 'PRESCRIPTION_SIGNED', 'PRESCRIPTION_APPROVED',
        'RX_AWAITING_PATIENT', 'RX_PATIENT_ACCEPTED', 'RX_PATIENT_REJECTED',
        'PRESCRIPTION_FLOWING', 'COMPLETED',
      ].includes(c.status);

      views.push({
        unified_id: `consultation:${c.id}`,
        source: 'CONSULTATION',
        display_title: `图文问诊`,
        display_status: statusLabel,
        display_amount: (c as any).price || 0,
        display_items: [(c as any).chiefComplaint || '在线问诊'],
        status_color: STATUS_COLORS[c.status] || 'default',
        created_at: c.created_at,
        navigate_to: `/app/consultation/chat/${c.id}`,
        primary_action: shouldShowPatientConfirm
          ? { label: '进入问诊', path: `/app/consultation/chat/${c.id}` }
          : (c as any).prescription_id
            ? { label: '查看处方', path: `/app/mine/prescription/${(c as any).prescription_id}` }
            : undefined,
        consultation_id: c.id,
        prescription_id: (c as any).prescription_id,
        trade_order_id: (c as any).trade_order_id,
      });
    }

    // 2. 实物订单（处方订单 + 非处方订单）
    for (const o of tradeOrders) {
      const isRx = (o as any).source === 'PRESCRIPTION';
      const statusLabel = ORDER_STATUS_LABEL[o.status] || o.status;
      const sourceTag: UnifiedOrderView['source'] = isRx ? 'TRADE_RX' : 'TRADE_OTC';

      views.push({
        unified_id: `trade:${o.id}`,
        source: sourceTag,
        display_title: (o.items || []).map((i: any) => i.product_name).join('、') || '商品订单',
        display_status: statusLabel,
        display_amount: o.pay_amount || o.total_amount || 0,
        display_items: (o.items || []).map((i: any) => `${i.product_name} ×${i.quantity}`),
        status_color: STATUS_COLORS[o.status] || 'default',
        created_at: o.created_at,
        navigate_to: `/app/mine/order/${o.id}`,
        primary_action: isRx && (o as any).source_ref
          ? { label: '查看处方', path: `/app/mine/prescription/${(o as any).source_ref}` }
          : undefined,
        prescription_id: isRx ? (o as any).source_ref : undefined,
        trade_order_id: o.id,
      });
    }

    // 按时间倒序
    views.sort((a, b) => b.created_at - a.created_at);
    return views;
  }, [consultOrders, tradeOrders]);

  // 筛选
  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return unifiedOrders;
    return unifiedOrders.filter(o => o.source === activeTab);
  }, [unifiedOrders, activeTab]);

  // Tab badges
  const consultationCount = unifiedOrders.filter(o => o.source === 'CONSULTATION').length;
  const rxCount = unifiedOrders.filter(o => o.source === 'TRADE_RX').length;
  const otcCount = unifiedOrders.filter(o => o.source === 'TRADE_OTC').length;

  const sourceIcons: Record<string, React.ReactNode> = {
    CONSULTATION: <span style={{ fontSize: 18 }}>💬</span>,
    TRADE_RX: <span style={{ fontSize: 18 }}>💊</span>,
    TRADE_OTC: <span style={{ fontSize: 18 }}>🛍️</span>,
    TRADE_SERVICE: <span style={{ fontSize: 18 }}>🔧</span>,
  };

  const sourceLabels: Record<string, string> = {
    CONSULTATION: '问诊',
    TRADE_RX: '处方药',
    TRADE_OTC: '非处方药',
    TRADE_SERVICE: '服务',
  };

  if (consultLoading || tradeLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <NavBar onBack={() => navigate(-1)}>我的订单</NavBar>
        <div style={{ padding: 16 }}>
          <Skeleton.Title animated />
          <Skeleton.Paragraph lineCount={5} animated />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <NavBar onBack={() => navigate(-1)} style={{ background: '#fff' }}>
        我的订单
      </NavBar>

      {/* 分类Tab */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{
          '--title-font-size': '14px',
          background: '#fff',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        } as React.CSSProperties}
      >
        <Tabs.Tab title="全部" key="all" />
        <Tabs.Tab
          title={
            <Badge content={consultationCount > 0 ? consultationCount : null}>问诊</Badge>
          }
          key="CONSULTATION"
        />
        <Tabs.Tab
          title={
            <>
              处方药
              {rxCount > 0 && (
                <span style={{ fontSize: 10, color: '#722ed1', marginLeft: 2 }}>{rxCount}</span>
              )}
            </>
          }
          key="TRADE_RX"
        />
        <Tabs.Tab
          title={
            <>
              非处方药
              {otcCount > 0 && (
                <span style={{ fontSize: 10, color: '#52c41a', marginLeft: 2 }}>{otcCount}</span>
              )}
            </>
          }
          key="TRADE_OTC"
        />
      </Tabs>

      {/* 列表 */}
      <div style={{ padding: '8px 12px' }}>
        {filteredOrders.length === 0 ? (
          <Empty
            description="暂无订单"
            style={{ paddingTop: 80 }}
          />
        ) : (
          <List>
            {filteredOrders.map((uo) => {
              const isConsultation = uo.source === 'CONSULTATION';
              return (
                <List.Item
                  key={uo.unified_id}
                  clickable
                  onClick={() => navigate(uo.navigate_to)}
                  style={{ background: '#fff', marginBottom: 8, borderRadius: 8 }}
                  prefix={
                    <div style={{ marginRight: 12 }}>
                      {sourceIcons[uo.source]}
                    </div>
                  }
                  extra={
                    <Space direction="vertical" align="end" style={{ minWidth: 70 }}>
                      <Tag color={uo.status_color} style={{ fontSize: 11 }}>
                        {uo.display_status}
                      </Tag>
                      {uo.display_amount > 0 && (
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#ff4d4f' }}>
                          ¥{uo.display_amount.toFixed(2)}
                        </span>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={2}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Tag
                          color={isConsultation ? 'blue' : uo.source === 'TRADE_RX' ? 'purple' : 'green'}
                          style={{ fontSize: 10, padding: '0 4px', borderRadius: 3 }}
                        >
                          {sourceLabels[uo.source]}
                        </Tag>
                        <span style={{ fontSize: 12, color: '#666' }}>
                          {uo.display_items.slice(0, 2).join('、')}
                          {uo.display_items.length > 2 && ' ...'}
                        </span>
                      </div>
                      {/* V2.2.3：显示关联链 问诊→处方→订单 */}
                      {uo.prescription_id && (
                        <div style={{ fontSize: 10, color: '#722ed1', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>🔗</span>
                          <span>关联处方：{uo.prescription_id}</span>
                        </div>
                      )}
                      {uo.trade_order_id && (
                        <div style={{ fontSize: 10, color: '#13c2c2', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>📦</span>
                          <span>关联订单：{uo.trade_order_id}</span>
                        </div>
                      )}
                      <Space>
                        <ClockCircleOutline style={{ fontSize: 11, color: '#bbb' }} />
                        <span style={{ fontSize: 11, color: '#bbb' }}>
                          {new Date(uo.created_at).toLocaleString('zh-CN', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </Space>
                    </Space>
                  }
                >
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                    {uo.display_title}
                  </div>
                </List.Item>
              );
            })}
          </List>
        )}
      </div>
    </div>
  );
};

export default UnifiedOrderListPage;
