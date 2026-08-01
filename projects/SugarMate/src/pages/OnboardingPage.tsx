/**
 * 入驻审核管理 — V3.1.0（2026-07-30）
 *
 * 变更记录：
 * - V3.1.0：移除培训流程（签约后直接上线），列"角色"→"入驻类型"，菜单重组
 *
 * 入驻流水线：审核→签约→上线 + 异常流
 *
 * 功能模块：
 * - Tab 筛选：全部分组 / 待审核 / 审核通过 / 需补充 / 已驳回 / 签约中 / 已上线
 * - 分步审核弹窗：信息核对 → 资质审核 → 补充/通过/驳回
 * - SLA 超时追踪与预警
 * - 签约/上线状态管理
 * - 批量审批与批量补充通知
 * - 服务商完整信息面板
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table, Tag, Button, Space, Card, Input, Row, Col, Statistic,
  Modal, Steps, Form, Select, Descriptions, message, Typography, Divider,
  Tabs, Badge, Tooltip, Progress, Timeline, Popconfirm, Upload, Collapse,
  Radio,
} from 'antd';
import {
  SearchOutlined, EyeOutlined, CheckOutlined, CloseOutlined,
  InboxOutlined, AuditOutlined, ReloadOutlined,
  WarningOutlined, ExclamationCircleOutlined,
  SolutionOutlined, SafetyCertificateOutlined,
  RocketOutlined, StopOutlined,
  ExclamationCircleFilled, ClockCircleOutlined,
  SendOutlined, FormOutlined, PlayCircleOutlined,
  FileImageOutlined, FilePdfOutlined, FileOutlined, DownloadOutlined,
} from '@ant-design/icons';
import {
  useOnboardingStore, type OnboardingStatus,
  STATUS_LABEL, STATUS_STEP_MAP, ROLE_CONFIG, ONBOARD_STEPS,
} from '@/stores/onboardingStore';
import { useMerchantStore, normalizeRole } from '@/stores/merchantStore';

const { Text, Paragraph } = Typography;

const ROLE_COLOR_MAP: Record<string, string> = {
  PH: 'blue', DR: 'green', PR: 'purple', NT: 'orange', HM: 'cyan',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'processing',
  INFO_APPROVED: 'blue',
  CERT_APPROVED: 'geekblue',
  NEED_SUPPLEMENT: 'warning',
  REJECTED: 'error',
  APPROVED: 'cyan',
  SIGNING: 'purple',
  SIGNED: 'magenta',
  ONLINE: 'success',
  FROZEN: 'default',
  WITHDRAWN: '#8c8c8c',
};

const OnboardingPage: React.FC = () => {
  const store = useOnboardingStore();
  const merchantStore = useMerchantStore();

  // === 状态管理 ===
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [curAppId, setCurAppId] = useState<string | null>(null);

  // 审核弹窗
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [auditInfoResult, setAuditInfoResult] = useState<string>('');
  const [auditCertResult, setAuditCertResult] = useState<string>('');
  const [auditReason, setAuditReason] = useState('');
  const [supplementItems, setSupplementItems] = useState<string>('');
  /** 单证草稿状态（certId -> 'valid'|'invalid'|'expired'），打开审核弹窗时初始化为各证照当前status */
  const [certDraft, setCertDraft] = useState<Record<string, 'valid' | 'invalid' | 'expired' | 'pending'>>({});
  /** 单证备注（certId -> note） */
  const [certNotes, setCertNotes] = useState<Record<string, string>>({});

  // 培训管理弹窗（已移除）
  // const [trainingOpen, setTrainingOpen] = useState(false);

  useEffect(() => {
    store.initMockData();
    // P0 修复：清理 addMerchant 历史遗留的 DRAFT 孤儿数据
    store.cleanupOrphanDrafts();
  }, []);

  // 从 store 实时派生 curApp，确保审核操作后状态自动更新
  const curApp = useMemo(() =>
    curAppId ? (store.applications.find(a => a.id === curAppId) || null) : null,
    [store.applications, curAppId],
  );
  const curConfig = curApp ? ROLE_CONFIG[curApp.role] : null;

  // === 筛选 ===
  const filterByTab = useCallback((apps: typeof store.applications) => {
    switch (activeTab) {
      case 'pending': return apps.filter(a => a.status === 'PENDING');
      case 'info_approved': return apps.filter(a => a.status === 'INFO_APPROVED');
      case 'cert_approved': return apps.filter(a => a.status === 'CERT_APPROVED');
      case 'approved': return apps.filter(a => a.status === 'APPROVED');
      case 'supplement': return apps.filter(a => a.status === 'NEED_SUPPLEMENT');
      case 'rejected': return apps.filter(a => a.status === 'REJECTED');
      case 'signing': return apps.filter(a => a.status === 'SIGNING' || a.status === 'SIGNED');
      case 'online': return apps.filter(a => a.status === 'ONLINE');
      case 'frozen': return apps.filter(a => a.status === 'FROZEN');
      case 'withdrawn': return apps.filter(a => a.status === 'WITHDRAWN');
      default: return apps;
    }
  }, [activeTab]);

  const filtered = useMemo(() => {
    let list = filterByTab(store.applications.filter(a => a.status !== 'DRAFT'));
    if (search) {
      list = list.filter(a =>
        a.name.includes(search) || a.company.includes(search) ||
        ROLE_CONFIG[a.role]?.label.includes(search) || a.id.includes(search)
      );
    }
    return list;
  }, [store.applications, activeTab, search, filterByTab]);

  // === 统计 ===
  // P0 修复：total 排除 DRAFT（与下方 filtered 行为一致）
  // 防止 addMerchant 联动遗留的 DRAFT 孤儿数据被算入"全部"
  const activeApps = useMemo(
    () => store.applications.filter(a => a.status !== 'DRAFT'),
    [store.applications]
  );
  const stats = useMemo(() => ({
    total: activeApps.length,
    pending: activeApps.filter(a => a.status === 'PENDING').length,
    infoApproved: activeApps.filter(a => a.status === 'INFO_APPROVED').length,
    supplement: activeApps.filter(a => a.status === 'NEED_SUPPLEMENT').length,
    rejected: activeApps.filter(a => a.status === 'REJECTED').length,
    approved: activeApps.filter(a => a.status === 'APPROVED').length,
    signing: activeApps.filter(a => a.status === 'SIGNING' || a.status === 'SIGNED').length,
    online: activeApps.filter(a => a.status === 'ONLINE').length,
    frozen: activeApps.filter(a => a.status === 'FROZEN').length,
    withdrawn: activeApps.filter(a => a.status === 'WITHDRAWN').length,
    slaOvertime: activeApps.filter(a => {
      const s = store.checkSLAStatus(a.id);
      return (a.status === 'PENDING' || a.status === 'INFO_APPROVED') && s.overtime;
    }).length,
  }), [activeApps, store]);

  // ============ 审核操作 ============

  const openAudit = (appId: string) => {
    setCurAppId(appId);
    setAuditStep(0);
    setAuditInfoResult('');
    setAuditCertResult('');
    setAuditReason('');
    setSupplementItems('');
    // 初始化单证草稿为当前各证照状态
    const app = store.getAppById(appId);
    const draft: Record<string, 'valid' | 'invalid' | 'expired' | 'pending'> = {};
    const notes: Record<string, string> = {};
    app?.certificates.forEach(c => {
      draft[c.id] = c.status;
      notes[c.id] = '';
    });
    setCertDraft(draft);
    setCertNotes(notes);
    // 自动派生：当前已标记为 invalid/expired 的证书自动加入补充清单
    if (app) {
      const items = app.certificates
        .filter(c => c.status === 'invalid' || c.status === 'expired')
        .map(c => `${c.type}（${c.status === 'expired' ? '已过期' : '无效'}）`);
      setSupplementItems(items.join('\n'));
    }
    setAuditOpen(true);
  };

  /** 实时同步单证状态到 store（用户切换 Radio 时立即写回） */
  const handleCertDraftChange = (certId: string, newStatus: 'valid' | 'invalid' | 'expired' | 'pending') => {
    setCertDraft(d => ({ ...d, [certId]: newStatus }));
    if (!curApp) return;
    const note = certNotes[certId] || '';
    store.updateCertStatus(curApp.id, certId, newStatus, '运营审核', note);

    // 联动更新补充资料项：invalid/expired 自动加入，valid/pending 自动移除
    const cert = curApp.certificates.find(c => c.id === certId);
    if (!cert) return;
    const currentItems = supplementItems.split('\n').filter(Boolean);
    const itemKey = `${cert.type}（`;
    const filtered = currentItems.filter(line => !line.startsWith(itemKey));
    if (newStatus === 'invalid' || newStatus === 'expired') {
      filtered.push(`${cert.type}（${newStatus === 'expired' ? '已过期' : '无效'}）`);
    }
    setSupplementItems(filtered.join('\n'));
  };

  /** 单证状态自动派生汇总结论：当用户切换单证 Radio 时联动 Select 显示值 */
  useEffect(() => {
    if (auditStep !== 1 || !curApp || curApp.certificates.length === 0) return;
    const statuses = curApp.certificates.map(c => certDraft[c.id] || 'pending');
    const hasInvalid = statuses.some(s => s === 'invalid');
    const hasExpired = statuses.some(s => s === 'expired');
    const allValid = statuses.every(s => s === 'valid');
    if (allValid) setAuditCertResult('valid');
    else if (hasExpired) setAuditCertResult('expired');
    else if (hasInvalid) setAuditCertResult('partial');
    else setAuditCertResult('');
  }, [certDraft, auditStep, curApp?.id]);

  const handleAuditInfoApprove = () => {
    if (!curApp) return;
    store.approveInfoCheck(curApp.id, '运营审核', auditReason || '信息核对无误');
    // 【P2-10】同步进度到对应商家记录
    syncMerchantStatus(curApp, 'INFO_APPROVED');
    setAuditStep(1);
    message.success('信息审核通过，进入资质审核');
  };

  const handleAuditCertsCheck = (result: string) => {
    setAuditCertResult(result);
  };

  // 【P2-10】同步入驻审核进度到商家记录
  // V2.0: 改用 applyNo 精确匹配，避免 name/phone 变更后匹配失效
  const syncMerchantStatus = (app: OnboardingApplication, targetStatus: string) => {
    const merchants = merchantStore.merchants;  // 修复: getMerchants() 不存在，直接访问 Zustand state
    // 优先按 applyNo 精确匹配，降级到 name+phone
    let matched = merchants.find(m => m.applyNo === app.id);
    if (!matched) {
      matched = merchants.find(m =>
        m.name === app.name && m.phone === app.phone
      );
    }
    if (matched) {
      merchantStore.changeStatus(matched.id, targetStatus as any, '运营审核', '入驻审核进度同步');
    }
  };

  const doApprove = () => {
    if (!curApp) return;
    try {
      // 1. 更新入驻申请状态
      store.approveCerts(curApp.id, '运营审核', auditReason || '所有资质齐全有效');
      store.approveApplication(curApp.id, '运营审核', auditReason || '审核通过');

      // 2. 【数据联动】创建统一商家/成员记录 → 资质沉淀到证照中心
      merchantStore.onboardToMerchant(
        curApp.id,
        curApp.role,
        curApp.name,
        curApp.phone || '',
        {
          company: curApp.company,
          address: curApp.address,
          title: curApp.title,
          specialties: curApp.specialties,
          licenseNo: (curApp as any).licenseNo,
          gender: curApp.gender,
          idCard: curApp.idCard,
          affiliatedPharmacyName: (curApp as any).affiliatedPharmacyName,
          businessScope: curApp.businessScope,
        },
        (curApp.certificates || []).map(c => ({
          id: c.id,
          certNo: '',
          type: c.type as any,
          name: c.name,
          fileUrl: c.fileUrl,
          status: (c.status || 'valid') as any,
          expireAt: c.expiryDate ? new Date(c.expiryDate).getTime() : undefined,
          issuedAt: undefined,
          issuer: c.notes,
        })),
        '运营审核',
      );

      message.success('审核通过，已同步创建商家记录并沉淀证照');
    } catch (e) {
      console.error('审核通过处理异常', e);
      message.error('审核处理失败，请重试');
      return;
    }
    // 无论成功与否都关闭弹窗回到列表
    setAuditOpen(false);
  };

  const handleAuditReject = () => {
    if (!curApp) return;
    if (!auditReason) { message.warning('驳回时必须填写原因'); return; }
    store.rejectApplication(curApp.id, '运营审核', auditReason);
    syncMerchantStatus(curApp, 'REJECTED');
    message.success('已驳回');
    setAuditOpen(false);
  };

  const handleAuditSupplement = () => {
    if (!curApp) return;
    const items = supplementItems ? supplementItems.split('\n').filter(Boolean) : ['需补充资料'];
    store.requestSupplement(curApp.id, '运营审核', auditReason || '请补充资料', items);
    syncMerchantStatus(curApp, 'NEED_SUPPLEMENT');
    message.warning('已通知申请人补充资料');
    setAuditOpen(false);
  };

  // ============ 签约/培训/上线操作 ============

  const handleSendContract = () => {
    if (!curApp) return;
    try {
      // 1. 更新入驻申请状态 + 生成合同号（onboardingStore）
      if (!store.sendContract(curApp.id)) {
        message.error('合同发送失败，请确认商家状态正确');
        return;
      }
      // 2. 【数据联动】同步合同到商家记录 → 直接调用 sendContract 生成完整 contractId
      const mRole = normalizeRole(curApp.role);
      const merchants = merchantStore.getMerchantsByRole(mRole);
      const match = merchants.find(m => m.applyNo === curApp.id);
      if (match) {
        // sendContract 内部状态机校验（APPROVED→SIGNING），生成完整合同 {contractId, status: 'sent'}
        // 不再用 updateContract({status:'sent'}) 单独设置，避免合同缺少 contractId
        merchantStore.sendContract(match.id);
      }
      message.success('电子合同已生成并发送，请通知服务商在个人中心签署');
    } catch (e) {
      console.error('发送合同异常', e);
      message.error('发送合同失败，请重试');
    }
  };

  const handleMarkSigned = () => {
    if (!curApp) return;
    store.signContract(curApp.id);
    // 【数据联动】同步签约 + 签署到商家记录
    const mRole = normalizeRole(curApp.role);
    const merchants = merchantStore.getMerchantsByRole(mRole);
    const match = merchants.find(m => m.applyNo === curApp.id);
    if (match) {
      merchantStore.updateContract(match.id, { status: 'signed' });
      // 同步已签署状态
      merchantStore.changeStatus(match.id, 'SIGNED', '服务商', '完成签约');
    }
    message.success('已标记为已签署');
  };

  // 培训相关操作已移除
  // const handleMarkTrained = () => {
  //   if (!curApp) return;
  //   store.completeAllTraining(curApp.id);
  //   message.success('培训已完成');
  //   setTrainingOpen(false);
  // };

  const handleSetOnline = () => {
    if (!curApp) return;
    store.setOnline(curApp.id, '运营审核', '审核通过，正式上线');
    // 【数据联动】同步上线状态到商家记录 + 初始化评级
    const mRole = normalizeRole(curApp.role);
    const merchants = merchantStore.getMerchantsByRole(mRole);
    let match = merchants.find(m => m.applyNo === curApp.id);
    // 容错：如果 merchant 记录不存在（历史数据/部分流程跳过），自动创建
    if (!match) {
      match = merchantStore.onboardToMerchant(
        curApp.id, curApp.role, curApp.name, curApp.phone || '',
        {
          company: curApp.company,
          address: curApp.address,
          title: curApp.title,
          specialties: curApp.specialties,
          licenseNo: (curApp as any).licenseNo,
          gender: curApp.gender,
          idCard: curApp.idCard,
          affiliatedPharmacyName: (curApp as any).affiliatedPharmacyName,
          businessScope: curApp.businessScope,
        },
        (curApp.certificates || []).map(c => ({
          id: c.id,
          certNo: '',
          type: c.type as any,
          name: c.name,
          fileUrl: c.fileUrl,
          status: (c.status || 'valid') as any,
          expireAt: c.expiryDate ? new Date(c.expiryDate).getTime() : undefined,
          issuedAt: undefined,
          issuer: c.notes,
        })),
        '运营审核',
      );
    }
    // 强制上线（STATUS_TRANSITIONS 已支持 APPROVED/SIGNING/SIGNED → ONLINE）
    merchantStore.setOnline(match.id, '运营审核');
    // 初始化评级
    merchantStore.updateRating(match.id, {
      level: 'DEFAULT', score: 0, serviceScore: 0, qualityScore: 0, fulfillmentRate: 0, totalOrders: 0,
      ratedAt: Date.now(),
    });
    message.success('已上线');
  };

  const handleFreeze = () => {
    if (!curApp) return;
    Modal.confirm({
      title: '确认冻结该服务商？',
      content: '冻结后该服务商将无法接收订单和开展服务',
      onOk: () => {
        store.freezeApplication(curApp.id, '运营审核', '服务商违规，冻结处理');
        // 【数据联动】同步冻结状态到商家记录
        const mRole = normalizeRole(curApp.role);
        const merchants = merchantStore.getMerchantsByRole(mRole);
        const match = merchants.find(m => m.applyNo === curApp.id);
        if (match) merchantStore.freezeMerchant(match.id, '运营审核', '服务商违规，冻结处理');
        message.success('已冻结');
      },
    });
  };

  const handleUnfreeze = () => {
    if (!curApp) return;
    Modal.confirm({
      title: '确认解冻该服务商？',
      content: '解冻后将恢复该服务商的订单接收和服务能力',
      onOk: () => {
        store.setOnline(curApp.id, '运营审核', '解冻恢复运营');
        // 【数据联动】同步解冻到商家记录
        const mRole = normalizeRole(curApp.role);
        const merchants = merchantStore.getMerchantsByRole(mRole);
        const match = merchants.find(m => m.applyNo === curApp.id);
        if (match) merchantStore.setOnline(match.id, '运营审核');
        message.success('已解冻，服务商恢复上线');
      },
    });
  };

  // ============ 批量审核 ============
  const handleBatchApprove = () => {
    if (selectedRowKeys.length === 0) { message.warning('请先选择要审核的申请'); return; }
    Modal.confirm({
      title: `确认批量通过 ${selectedRowKeys.length} 条申请？`,
      content: '通过后将进入签约和上线环节，同时创建对应商家记录',
      onOk: () => {
        selectedRowKeys.forEach(id => {
          const app = store.getAppById(id);
          if (!app) return;
          store.approveInfoCheck(id, '运营批量审核', '批量通过');
          store.approveCerts(id, '运营批量审核', '批量通过');
          store.approveApplication(id, '运营批量审核', '批量通过');
          // 【数据联动】创建统一商家记录
          merchantStore.onboardToMerchant(
            app.id, app.role, app.name, app.phone || '',
            {
              company: app.company, address: app.address,
              title: app.title, specialties: app.specialties,
              licenseNo: (app as any).licenseNo,
              gender: app.gender, idCard: app.idCard,
              affiliatedPharmacyName: (app as any).affiliatedPharmacyName,
              businessScope: app.businessScope,
            },
            (app.certificates || []).map(c => ({
              id: c.id, certNo: '', type: c.type as any, name: c.name,
              fileUrl: c.fileUrl, status: (c.status || 'valid') as any,
              expireAt: c.expiryDate ? new Date(c.expiryDate).getTime() : undefined,
            })),
            '运营批量审核',
          );
        });
        setSelectedRowKeys([]);
        message.success(`已批量通过 ${selectedRowKeys.length} 条申请，同步创建商家记录`);
      },
    });
  };

  // ============ 表格列 ============
  const columns = [
    {
      title: '编号', dataIndex: 'id', width: 90, key: 'id',
    },
    {
      title: '名称', dataIndex: 'name', width: 160, key: 'name',
      render: (v: string, r: { role: string; id: string; phone: string }) => (
        <Space>
          <span>{ROLE_CONFIG[r.role as keyof typeof ROLE_CONFIG]?.icon || ''}</span>
          <a onClick={() => { setCurAppId(r.id); setDetailOpen(true); }}>
            {v || <span style={{ color: '#999' }}>未命名 ({r.phone || '无手机号'})</span>}
          </a>
        </Space>
      ),
    },
    {
      title: '角色', dataIndex: 'role', width: 90, key: 'role',
      render: (rt: string) => <Tag color={ROLE_COLOR_MAP[rt as keyof typeof ROLE_COLOR_MAP]}>{ROLE_CONFIG[rt as keyof typeof ROLE_CONFIG]?.label}</Tag>,
    },
    {
      title: '机构', dataIndex: 'company', width: 160, key: 'company', ellipsis: true,
    },
    {
      title: '状态', dataIndex: 'status', width: 120, key: 'status',
      render: (s: OnboardingStatus) => (
        <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</Tag>
      ),
    },
    {
      title: '当前环节', dataIndex: 'currentStep', width: 100, key: 'step',
      render: (s: number, r: any) => (
        <span style={{ fontSize: 12, color: '#888' }}>
          {ONBOARD_STEPS[Math.max(0, s - 1)]?.title || '-'}
        </span>
      ),
    },
    {
      title: '提交时间', dataIndex: 'submittedAt', width: 110, key: 'time',
      render: (v: number) => v ? new Date(v).toLocaleDateString('zh-CN') : '-',
    },
    {
      title: 'SLA', key: 'sla', width: 80,
      render: (_: any, r: any) => {
        const s = store.checkSLAStatus(r.id);
        if (r.status !== 'PENDING' && r.status !== 'INFO_APPROVED') return <span style={{ color: '#ccc' }}>-</span>;
        if (s.overtime) return <Tag color="red" icon={<ClockCircleOutlined />}>超时</Tag>;
        return <span style={{ color: '#888', fontSize: 12 }}>{s.daysLeft}天</span>;
      },
    },
    {
      title: '操作', key: 'action', width: 180, fixed: 'right' as const,
      render: (_: any, r: any) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />}
            onClick={() => { setCurAppId(r.id); setDetailOpen(true); }}>详情</Button>
          {r.status === 'PENDING' && (
            <Button size="small" type="primary" icon={<AuditOutlined />}
              onClick={() => openAudit(r.id)}>审核</Button>
          )}
          {r.status === 'INFO_APPROVED' && (
            <Button size="small" type="primary" icon={<AuditOutlined />}
              onClick={() => openAudit(r.id)}>继续审核</Button>
          )}
          {r.status === 'CERT_APPROVED' && (
            <Popconfirm title="确认通过该申请？" onConfirm={() => { store.approveApplication(r.id, '运营审核', '确认通过'); message.success('审核通过'); }}>
              <Button size="small" type="primary" icon={<CheckOutlined />}>确认通过</Button>
            </Popconfirm>
          )}
          {r.status === 'FROZEN' && (
            <Popconfirm title="确认解冻该服务商？" onConfirm={() => {
              store.setOnline(r.id, '运营审核', '解冻恢复运营');
              const mRole = normalizeRole(r.role);
              const merchants = merchantStore.getMerchantsByRole(mRole);
              const match = merchants.find((m: any) => m.applyNo === r.id);
              if (match) merchantStore.setOnline(match.id, '运营审核');
              message.success('已解冻');
            }}>
              <Button size="small" type="primary" icon={<PlayCircleOutlined />}>解冻</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // ============ 详情弹窗 ============
  const renderDetailModal = () => (
    <Modal
      title={`入驻详情 — ${curApp?.name || ''}`}
      open={detailOpen}
      onCancel={() => { setDetailOpen(false); }}
      afterClose={() => setCurAppId(null)}
      width={720}
      footer={
        <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
          {curApp && curApp.status === 'PENDING' && (
            <>
              <Button type="primary" icon={<AuditOutlined />}
                onClick={() => { setDetailOpen(false); openAudit(curApp.id); }}>进入审核</Button>
            </>
          )}
          {curApp && curApp.status === 'INFO_APPROVED' && (
            <>
              <Button type="primary" icon={<AuditOutlined />}
                onClick={() => { setDetailOpen(false); openAudit(curApp.id); }}>继续审核资质</Button>
            </>
          )}
          {curApp && curApp.status === 'CERT_APPROVED' && (
            <Popconfirm title="确认审核通过？" description="将正式通过该入驻申请，进入签约流程" onConfirm={() => { store.approveApplication(curApp.id, '运营审核', '确认审核通过'); setDetailOpen(false); message.success('审核通过'); }}>
              <Button type="primary" icon={<CheckOutlined />}>确认审核通过</Button>
            </Popconfirm>
          )}
          {curApp && curApp.status === 'REJECTED' && (
            <Text type="secondary" style={{ fontSize: 12, marginRight: 8 }}>该申请已被驳回，申请人可重新提交</Text>
          )}
          {curApp && curApp.status === 'NEED_SUPPLEMENT' && (
            <Text type="warning" style={{ fontSize: 12, marginRight: 8 }}>等待申请人补充资料后重新审核</Text>
          )}
          {curApp && curApp.status === 'APPROVED' && (
            <Popconfirm title="确认发送电子合同" description="合同将发送至服务商，由服务商在个人中心签署" onConfirm={() => { handleSendContract(); setDetailOpen(false); }}>
              <Button type="primary" icon={<SendOutlined />}>发送电子合同</Button>
            </Popconfirm>
          )}
          {curApp && curApp.status === 'SIGNING' && (
            <Popconfirm title="确认该服务商已完成电子签署？" onConfirm={() => { handleMarkSigned(); setDetailOpen(false); }}>
              <Button type="primary" icon={<SolutionOutlined />}>标记已签署</Button>
            </Popconfirm>
          )}
          {curApp && curApp.status === 'SIGNED' && (
            <Button type="primary" icon={<RocketOutlined />}
              onClick={() => { handleSetOnline(); setDetailOpen(false); }}>确认上线</Button>
          )}
          {curApp && curApp.status === 'ONLINE' && (
            <Button danger icon={<StopOutlined />} onClick={() => { handleFreeze(); setDetailOpen(false); }}>冻结服务商</Button>
          )}
          {curApp && curApp.status === 'FROZEN' && (
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => { handleUnfreeze(); setDetailOpen(false); }}>解冻恢复</Button>
          )}
          <Button onClick={() => { setDetailOpen(false); }}>关闭</Button>
        </Space>
      }
    >
      {curApp && (
        <div>
          {/* 基本信息 */}
          <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }} title="基本信息">
            <Descriptions.Item label="申请编号">{curApp.id}</Descriptions.Item>
            <Descriptions.Item label="角色类型">
              <Tag color={ROLE_COLOR_MAP[curApp.role]}>{curConfig?.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={curApp.entityType === 'INSTITUTION' ? '机构名称' : '姓名'}>{curApp.name}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{curApp.phone}</Descriptions.Item>
            <Descriptions.Item label="所属机构">{curApp.company}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={STATUS_COLOR[curApp.status]}>{STATUS_LABEL[curApp.status]}</Tag>
            </Descriptions.Item>
            {curApp.idCard && <Descriptions.Item label="身份证号">{curApp.idCard}</Descriptions.Item>}
            {curApp.title && <Descriptions.Item label="职称">{curApp.title}</Descriptions.Item>}
            {curApp.specialties && curApp.specialties.length > 0 && (
              <Descriptions.Item label="擅长领域" span={2}>
                {curApp.specialties.map(s => <Tag key={s}>{s}</Tag>)}
              </Descriptions.Item>
            )}
            {curApp.legalPerson && <Descriptions.Item label="法人代表">{curApp.legalPerson}</Descriptions.Item>}
            {curApp.licenseNo && <Descriptions.Item label="执照号">{curApp.licenseNo}</Descriptions.Item>}
            <Descriptions.Item label="提交时间">
              {curApp.submittedAt ? new Date(curApp.submittedAt).toLocaleString('zh-CN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="审核SLA">
              {curApp.slaDeadline ? (
                <span>
                  {new Date(curApp.slaDeadline).toLocaleDateString('zh-CN')}
                  {store.checkSLAStatus(curApp.id).overtime && (
                    <Tag color="red" style={{ marginLeft: 8 }}>超时</Tag>
                  )}
                </span>
              ) : '-'}
            </Descriptions.Item>
          </Descriptions>

          {/* 资质列表 */}
          <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }} title="资质证书">
            {curApp.certificates.length > 0 ? (
              curApp.certificates.map(cert => (
                <Descriptions.Item key={cert.id} label={cert.type}>
                  <Space direction="vertical" style={{ width: '100%' }} size={4}>
                    <Space>
                      <span>{cert.name}</span>
                      <Tag color={
                        cert.status === 'valid' ? 'success' :
                        cert.status === 'expired' ? 'error' :
                        cert.status === 'invalid' ? 'error' : 'default'
                      }>
                        {{ pending: '待审核', valid: '有效', expired: '已过期', invalid: '无效' }[cert.status]}
                      </Tag>
                      {cert.expiryDate && (
                        <Text type="secondary" style={{ fontSize: 11 }}>有效期至 {cert.expiryDate}</Text>
                      )}
                    </Space>
                    {cert.fileUrl && (
                      <Space>
                        <Button
                          size="small"
                          icon={cert.fileUrl.endsWith('.pdf') ? <FilePdfOutlined /> :
                               /\.(jpg|jpeg|png|gif|webp)$/i.test(cert.fileUrl) ? <FileImageOutlined /> :
                               <FileOutlined />}
                          onClick={() => window.open(cert.fileUrl, '_blank')}
                        >
                          查看附件
                        </Button>
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = cert.fileUrl;
                            a.download = cert.name || cert.fileUrl.split('/').pop() || 'attachment';
                            a.click();
                          }}
                        >
                          下载
                        </Button>
                      </Space>
                    )}
                    {!cert.fileUrl && (
                      <Tag color="warning" style={{ fontSize: 11 }}>未上传附件</Tag>
                    )}
                  </Space>
                </Descriptions.Item>
              ))
            ) : (
              <Descriptions.Item label="-">
                <Text type="secondary">暂无证照信息</Text>
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* 签约 */}
          {curApp.contract && (
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }} title="电子签约">
              <Descriptions.Item label="合同编号">{curApp.contract.contractId}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={{ pending: 'default', sent: 'processing', signed: 'success', expired: 'error' }[curApp.contract.status]}>
                  {{ pending: '待生成', sent: '待签署', signed: '已签署', expired: '已过期' }[curApp.contract.status]}
                </Tag>
              </Descriptions.Item>
              {curApp.contract.signedAt && (
                <Descriptions.Item label="签署时间">{new Date(curApp.contract.signedAt).toLocaleString('zh-CN')}</Descriptions.Item>
              )}
            </Descriptions>
          )}

          {/* 培训（已移除） */}
          {/* {curApp.training && (
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ marginBottom: 8, display: 'block' }}>培训情况</Text>
              <Progress ... />
            </div>
          )} */}

          {/* 状态变更历史 */}
          <Collapse ghost size="small" items={[{
            key: 'history',
            label: `状态变更历史（${curApp.statusHistory.length}条）`,
            children: (
              <Timeline items={curApp.statusHistory.map(h => ({
                color: h.to === 'REJECTED' ? 'red' :
                       h.to === 'NEED_SUPPLEMENT' ? 'orange' :
                       h.to === 'ONLINE' ? 'green' : 'blue',
                children: (
                  <div>
                    <Text style={{ fontSize: 12 }}>
                      <Tag>{STATUS_LABEL[h.from]}</Tag> → <Tag color="blue">{STATUS_LABEL[h.to]}</Tag>
                    </Text>
                    <div style={{ fontSize: 11, color: '#888' }}>
                      {new Date(h.at).toLocaleString('zh-CN')} · {h.operator}
                    </div>
                    {h.note && <div style={{ fontSize: 12, color: '#555' }}>{h.note}</div>}
                  </div>
                ),
              }))} />
            ),
          }]} />
        </div>
      )}
    </Modal>
  );

  // ============ 审核弹窗 ============
  const renderAuditModal = () => (
    <Modal
      title={`入驻审核 — ${curApp?.name || ''}（${curConfig?.label || ''}）`}
      open={auditOpen}
      onCancel={() => { setAuditOpen(false); }}
      afterClose={() => { setCurAppId(null); setAuditStep(0); setAuditReason(''); setCertDraft({}); setCertNotes({}); setSupplementItems(''); }}
      width={680}
      footer={
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space>
            {auditStep > 0 && <Button onClick={() => setAuditStep(auditStep - 1)}>上一步</Button>}
            <Button onClick={() => { setAuditOpen(false); }}>取消</Button>
          </Space>
          <Space>
            {auditStep === 0 && (
              <Button type="primary" onClick={handleAuditInfoApprove}>通过信息核对 →</Button>
            )}
            {auditStep === 1 && (
              <>
                {(() => {
                  // 基于单证状态计算按钮可用性
                  const certStatuses = curApp.certificates.map(c => certDraft[c.id] || 'pending');
                  const allValid = certStatuses.length > 0 && certStatuses.every(s => s === 'valid');
                  const anyInvalid = certStatuses.some(s => s === 'invalid' || s === 'expired');
                  return (
                    <>
                      <Tooltip title="申请人需补充资料后重新提交">
                        <Button type="primary" danger onClick={handleAuditSupplement}
                          disabled={!anyInvalid || !auditReason}>
                          要求补充资料
                        </Button>
                      </Tooltip>
                      <Tooltip title="审核不通过，申请关闭">
                        <Button danger onClick={handleAuditReject}
                          disabled={!auditReason}>驳回</Button>
                      </Tooltip>
                      <Popconfirm
                        title="确认审核通过？"
                        description={`确认"${curApp?.name}"的信息和资质无误，点击确定后将立即审核通过并创建商家记录。`}
                        onConfirm={doApprove}
                        okText="确认通过"
                        cancelText="再检查一下"
                      >
                        <Button type="primary"
                          disabled={!allValid}>全部通过</Button>
                      </Popconfirm>
                    </>
                  );
                })()}
              </>
            )}
          </Space>
        </Space>
      }
      destroyOnClose
    >
      <Steps current={auditStep} size="small" style={{ marginBottom: 24 }}
        items={[
          { title: '信息核对', description: '基本信息真实性' },
          { title: '资质审核', description: curApp ? ROLE_CONFIG[curApp.role]?.requiredCerts.join('、') : '' },
        ]}
      />

      {curApp && (
        <>
          {auditStep === 0 && (
            <div>
              <Card size="small" title={`${curConfig?.label}基本信息`} style={{ marginBottom: 12 }}>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="角色类型">
                    <Tag color={ROLE_COLOR_MAP[curApp.role]}>{curConfig?.label}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={curApp.entityType === 'INSTITUTION' ? '机构名称' : '姓名'}>{curApp.name}</Descriptions.Item>
                  <Descriptions.Item label="所属机构">{curApp.company}</Descriptions.Item>
                  <Descriptions.Item label="联系电话">{curApp.phone}</Descriptions.Item>
                  {curApp.legalPerson && <Descriptions.Item label="法人代表">{curApp.legalPerson}</Descriptions.Item>}
                  {curApp.licenseNo && <Descriptions.Item label="执照号">{curApp.licenseNo}</Descriptions.Item>}
                  <Descriptions.Item label="提交时间">{curApp.submittedAt ? new Date(curApp.submittedAt).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
                  <Descriptions.Item label="审核SLA">
                    {curApp.slaDeadline ? new Date(curApp.slaDeadline).toLocaleDateString('zh-CN') : '-'}
                    {store.checkSLAStatus(curApp.id).overtime && (
                      <Tag color="red" style={{ marginLeft: 8 }}>超时</Tag>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
              <Form.Item label="信息核对备注">
                <Input.TextArea rows={2} value={auditReason} onChange={e => setAuditReason(e.target.value)}
                  placeholder="可选：补充信息核对备注" />
              </Form.Item>
            </div>
          )}

          {auditStep === 1 && (
            <div>
              <Card size="small" title={`资质文件审核（${curConfig?.requiredCerts.join('、')}）`} style={{ marginBottom: 12 }}>
                <div style={{ marginBottom: 12 }}>
                  {curConfig?.requiredCerts.map((cert, i) => (
                    <Tag key={i} color={['blue', 'green', 'purple', 'orange'][i % 4]}
                      style={{ padding: '4px 12px', marginBottom: 4, fontSize: 13 }}>{cert}</Tag>
                  ))}
                </div>

                {/* 单证审核汇总统计 */}
                {(() => {
                  const stats = curApp.certificates.reduce(
                    (acc, c) => {
                      const s = certDraft[c.id] || 'pending';
                      if (s === 'valid') acc.valid++;
                      else if (s === 'invalid') acc.needSupp++;
                      else if (s === 'expired') acc.rejected++;
                      else acc.pending++;
                      return acc;
                    },
                    { valid: 0, needSupp: 0, rejected: 0, pending: 0 }
                  );
                  const total = curApp.certificates.length;
                  const allPassed = stats.valid === total && total > 0;
                  return (
                    <div style={{
                      padding: '8px 12px', marginBottom: 10,
                      background: allPassed ? '#f6ffed' : stats.rejected > 0 || stats.needSupp > 0 ? '#fff2e8' : '#e6f7ff',
                      borderRadius: 4, fontSize: 13,
                    }}>
                      <Space size="large">
                        <span>📋 共 <Text strong>{total}</Text> 张</span>
                        <span style={{ color: '#52c41a' }}>✅ 已通过 <Text strong>{stats.valid}</Text></span>
                        {stats.needSupp > 0 && <span style={{ color: '#fa8c16' }}>⚠️ 需补充 <Text strong>{stats.needSupp}</Text></span>}
                        {stats.rejected > 0 && <span style={{ color: '#f5222d' }}>❌ 已驳回 <Text strong>{stats.rejected}</Text></span>}
                        {stats.pending > 0 && <span style={{ color: '#999' }}>⏳ 待审核 <Text strong>{stats.pending}</Text></span>}
                        <span style={{ color: allPassed ? '#52c41a' : '#fa8c16' }}>
                          {allPassed ? '✓ 全部通过，可审核通过' : stats.rejected > 0 ? '✗ 存在驳回证件，建议驳回' : '⚠ 部分证件需补充，建议要求补充资料'}
                        </span>
                      </Space>
                    </div>
                  );
                })()}

                {curApp.certificates.map(cert => (
                  <div key={cert.id} style={{
                    padding: '10px 12px', marginBottom: 8,
                    background: '#fafafa', borderRadius: 6,
                    border: certDraft[cert.id] === 'invalid' || certDraft[cert.id] === 'expired' ? '1px solid #ffccc7' :
                             certDraft[cert.id] === 'valid' ? '1px solid #b7eb8f' : '1px solid #d9d9d9',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: 500 }}>{cert.type}</Text>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{cert.name}</div>
                        {cert.fileUrl && (
                          <div style={{ marginTop: 6 }}>
                            <Button
                              size="small"
                              icon={cert.fileUrl.endsWith('.pdf') ? <FilePdfOutlined /> :
                                   /\.(jpg|jpeg|png|gif|webp)$/i.test(cert.fileUrl) ? <FileImageOutlined /> :
                                   <FileOutlined />}
                              onClick={() => window.open(cert.fileUrl, '_blank')}
                            >
                              查看附件
                            </Button>
                            <Button
                              size="small"
                              icon={<DownloadOutlined />}
                              style={{ marginLeft: 8 }}
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = cert.fileUrl!;
                                a.download = cert.name || cert.fileUrl!.split('/').pop() || 'attachment';
                                a.click();
                              }}
                            >
                              下载
                            </Button>
                          </div>
                        )}
                        {!cert.fileUrl && (
                          <Tag color="warning" style={{ marginTop: 6, fontSize: 11 }}>未上传附件</Tag>
                        )}
                      </div>
                      {/* 单证精细化审核 Radio */}
                      <Radio.Group
                        size="small"
                        value={certDraft[cert.id] || 'pending'}
                        onChange={e => handleCertDraftChange(cert.id, e.target.value)}
                        style={{ marginLeft: 12 }}
                      >
                        <Radio.Button value="valid" style={{ fontSize: 12 }}>✅ 通过</Radio.Button>
                        <Radio.Button value="invalid" style={{ fontSize: 12 }}>⚠️ 需补充</Radio.Button>
                        <Radio.Button value="expired" style={{ fontSize: 12 }}>❌ 驳回</Radio.Button>
                      </Radio.Group>
                    </div>
                  </div>
                ))}

                {curApp.role === 'PH' && (
                  <Text style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                    药店入驻需四证齐全：营业执照、药品经营许可证、GSP证书、法人身份证。缺一不可。
                  </Text>
                )}
                {curApp.role === 'PR' && (
                  <Text style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                    药剂师入驻需确认其归属药店已完成入驻，且药师+药店法人双签后方可上线。
                  </Text>
                )}
              </Card>

              <Form.Item label="资质审核结论" required>
                <Select placeholder="请选择审核结论" value={auditCertResult || undefined}
                  disabled
                  onChange={v => setAuditCertResult(v)}>
                  <Select.Option value="valid">✅ 资质齐全有效 — 建议通过</Select.Option>
                  <Select.Option value="partial">⚠️ 部分资质缺失 — 建议补充</Select.Option>
                  <Select.Option value="expired">❌ 资质已过期 — 建议驳回</Select.Option>
                  <Select.Option value="invalid">❌ 资质无效 — 建议驳回</Select.Option>
                </Select>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  💡 结论由上方每张证照的单证审核自动汇总生成
                </Text>
              </Form.Item>

              <Form.Item label={auditCertResult === 'valid' ? '通过备注（可选）' : '原因说明（必填）'}>
                <Input.TextArea rows={3} value={auditReason} onChange={e => setAuditReason(e.target.value)}
                  placeholder={
                    auditCertResult === 'valid' ? '可选：补充审核备注' :
                    '请填写原因，将展示给申请人'
                  } />
              </Form.Item>

              {auditCertResult !== 'valid' && auditCertResult !== '' && (
                <Form.Item label="需补充的资料项（一行一项）">
                  <Input.TextArea rows={3} value={supplementItems} onChange={e => setSupplementItems(e.target.value)}
                    placeholder="例如：&#10;身份证正面（人像面）&#10;执业医师资格证（最新有效期）" />
                </Form.Item>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  );

  // ============ 培训管理弹窗（已移除 V3.1.0） ============
  // const renderTrainingModal = () => (
  //   <Modal title="培训管理" open={trainingOpen} ...>...</Modal>
  // );

  // ============ 主渲染 ============

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={3}>
          <Card size="small" styles={{ body: { padding: '12px' } }}>
            <Statistic title="全部" value={stats.total} valueStyle={{ fontSize: 24 }} />
          </Card>
        </Col>
        <Col span={3}>
          <Card size="small" styles={{ body: { padding: '12px' } }}>
            <Statistic title="待审核" value={stats.pending}
              valueStyle={{ color: '#faad14', fontSize: 24 }}
              suffix={stats.slaOvertime > 0 ? <Tooltip title={`${stats.slaOvertime}条已超时`}><WarningOutlined style={{ color: '#ff4d4f', fontSize: 16 }} /></Tooltip> : undefined}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card size="small" styles={{ body: { padding: '12px' } }}>
            <Statistic title="信息已审" value={stats.infoApproved} valueStyle={{ color: '#1677ff', fontSize: 24 }} />
          </Card>
        </Col>
        <Col span={3}>
          <Card size="small" styles={{ body: { padding: '12px' } }}>
            <Statistic title="需补充" value={stats.supplement} valueStyle={{ color: '#fa8c16', fontSize: 24 }} />
          </Card>
        </Col>
        <Col span={3}>
          <Card size="small" styles={{ body: { padding: '12px' } }}>
            <Statistic title="已驳回" value={stats.rejected} valueStyle={{ color: '#ff4d4f', fontSize: 24 }} />
          </Card>
        </Col>
        <Col span={3}>
          <Card size="small" styles={{ body: { padding: '12px' } }}>
            <Statistic title="审核通过" value={stats.approved} valueStyle={{ color: '#1890ff', fontSize: 24 }} />
          </Card>
        </Col>
        <Col span={3}>
          <Card size="small" styles={{ body: { padding: '12px' } }}>
            <Statistic title="签约中" value={stats.signing} valueStyle={{ color: '#722ed1', fontSize: 24 }} />
          </Card>
        </Col>
        <Col span={3}>
          <Card size="small" styles={{ body: { padding: '12px' } }}>
            <Statistic title="已上线" value={stats.online} valueStyle={{ color: '#52c41a', fontSize: 24 }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={3}>
          <Card size="small" styles={{ body: { padding: '12px' } }}>
            <Statistic title="已冻结" value={stats.frozen} valueStyle={{ color: '#8c8c8c', fontSize: 24 }} />
          </Card>
        </Col>
        <Col span={3}>
          <Card size="small" styles={{ body: { padding: '12px' } }}>
            <Statistic title="已撤回" value={stats.withdrawn} valueStyle={{ color: '#8c8c8c', fontSize: 24 }} />
          </Card>
        </Col>
        <Col span={18}>
          <Card size="small" styles={{ body: { padding: '12px' } }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Input prefix={<SearchOutlined />} placeholder="搜索名称/机构/角色/编号"
                value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 320 }} />
              <Space>
                <Button size="small" icon={<AuditOutlined />} onClick={handleBatchApprove}
                  disabled={selectedRowKeys.length === 0}>
                  批量通过（{selectedRowKeys.length}）
                </Button>
                <Button size="small" icon={<ReloadOutlined />} onClick={() => setSelectedRowKeys([])}>
                  清空选择
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Tab 筛选 */}
      <Card
        title="入驻审核管理"
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => { store.initMockData(); message.success('已刷新'); }}>
            刷新
          </Button>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={(key) => { setActiveTab(key); setSelectedRowKeys([]); }}
          items={[
            { key: 'all', label: '全部' },
            { key: 'pending', label: <Badge count={stats.pending} size="small" offset={[6, -4]}><span style={{ paddingRight: 4 }}>待审核</span></Badge> },
            { key: 'info_approved', label: <span>信息已审 {stats.infoApproved > 0 && <Tag color="processing" style={{ marginLeft: 4 }}>{stats.infoApproved}</Tag>}</span> },
            { key: 'supplement', label: <span>需补充 {stats.supplement > 0 && <Tag color="warning" style={{ marginLeft: 4 }}>{stats.supplement}</Tag>}</span> },
            { key: 'rejected', label: '已驳回' },
            { key: 'approved', label: '审核通过' },
            { key: 'signing', label: '签约中' },
            { key: 'online', label: '已上线' },
            { key: 'frozen', label: <span>已冻结 {stats.frozen > 0 && <Tag style={{ marginLeft: 4 }}>{stats.frozen}</Tag>}</span> },
            { key: 'withdrawn', label: <span>已撤回 {stats.withdrawn > 0 && <Tag style={{ marginLeft: 4 }}>{stats.withdrawn}</Tag>}</span> },
          ]}
        />

        <Table
          rowKey="id"
          rowSelection={{
            selectedRowKeys,
            onChange: (keys, rows) => {
              const pendingKeys = rows.filter(r => r.status === 'PENDING').map(r => r.id);
              setSelectedRowKeys(pendingKeys);
            },
            getCheckboxProps: (r: any) => ({
              disabled: r.status !== 'PENDING',
            }),
          }}
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 15, showSizeChanger: false }}
          size="middle"
          scroll={{ x: 1000 }}
        />
      </Card>

      {renderDetailModal()}
      {renderAuditModal()}
      {/* 培训弹窗已移除 */}
      {/* {renderTrainingModal()} */}
    </div>
  );
};

export default OnboardingPage;
