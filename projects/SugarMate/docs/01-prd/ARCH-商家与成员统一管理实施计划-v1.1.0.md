# 商家与成员统一管理实施计划 v1.1.0

> 原则：商家 + 医生 + 药剂师 + 营养师/HM 统一走"添加→审核→通过"的完整流程
> 表单：后台自行添加的表单必须与入驻申请表单字段完全一致
> 界面：所有角色管理页与商家管理页保持统一结构（列表+新增+编辑+审核流）

---

## 一、当前问题速览

### 1.1 商家管理页（MerchantListPage）现状

```
┌─────────────────────────────────────────┐
│  入驻申请(0)    商家列表(0)              │  ← 两个Tab
├─────────────────────────────────────────┤
│  [搜索] [状态筛选▼]                      │
│  ┌────────┬────────┬──────┬──────┐     │
│  │申请编号│商家名称│类型  │状态  │...  │  ← 列表展示
│  ├────────┼────────┼──────┼──────┤     │
│  │...     │...     │药房  │PENDING│    │
│  └────────┴────────┴──────┴──────┘     │
│                              [通过][驳回]│  ← 仅PENDING可操作
└─────────────────────────────────────────┘

❌ 缺失：没有"新增商家"按钮
❌ 缺失：商家列表无编辑/删除
❌ 缺失：审核只有一步通过/驳回，无分步审核
❌ 缺失：状态只有4种，与申请端12态不同步
```

### 1.2 成员管理页（Doctor/Pharmacist/Nutritionist）现状

```
┌─────────────────────────────────────────┐
│  医生管理                                │
├─────────────────────────────────────────┤
│  [搜索] [状态筛选▼]                      │
│  ┌────────┬────────┬──────┬──────┐     │
│  │姓名    │手机号  │职称  │状态  │...  │  ← 纯展示
│  └────────┴────────┴──────┴──────┘     │
│                              [详情]      │  ← 仅查看
└─────────────────────────────────────────┘

❌ 缺失：没有"新增医生"按钮
❌ 缺失：没有"编辑"功能
❌ 缺失：没有"删除"功能
❌ 缺失：没有审核流程（直接显示 ACTIVE）
```

---

## 二、统一页面结构规范

所有角色管理页（商家+医生+药剂师+营养师/HM）必须统一为以下结构：

```
┌──────────────────────────────────────────────────────────────┐
│  {角色名称}管理                                               │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │ 待审核 N │ │ 已通过 N │ │ 总数 N   │     ← 统计卡片      │
│  └──────────┘ └──────────┘ └──────────┘                     │
├──────────────────────────────────────────────────────────────┤
│  [ + 新增{角色} ]  [搜索] [状态筛选▼] [类型筛选▼]            │  ← 操作栏
├──────────────────────────────────────────────────────────────┤
│  ┌────┬────────┬────────┬──────┬──────┬──────┬──────────┐   │
│  │姓名│手机号  │机构/科室│类型  │状态  │提交时间│  操作   │   │  ← 表格
│  ├────┼────────┼────────┼──────┼──────┼──────┼──────────┤   │
│  │张三│138**** │朝阳医院│医生  │待审核│07-30  │[通过][驳回][详情][编辑][删除]│
│  │李四│139**** │同仁堂  │药房  │已通过│07-28  │[详情][编辑][冻结][删除]      │
│  └────┴────────┴────────┴──────┴──────┴──────┴──────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 操作按钮按状态显示规则

| 状态 | 显示按钮 |
|------|----------|
| PENDING（待审核） | [信息核对][驳回][详情][编辑][删除] |
| INFO_REVIEWING（信息核对中） | [信息通过][要求补充][驳回][详情] |
| INFO_APPROVED（信息已通过） | [资质审核][驳回][详情] |
| CERT_REVIEWING（资质审核中） | [资质通过][要求补充][驳回][详情] |
| CERT_APPROVED（资质已通过） | [终审通过][驳回][详情] |
| NEED_SUPPLEMENT（需补充） | [重新提交后→PENDING][详情][编辑] |
| REJECTED（已驳回） | [重新提交][详情][编辑][删除] |
| APPROVED（审核通过） | [发送合同→SIGNING][详情][编辑] |
| SIGNING（签约中） | [确认签约→SIGNED][详情] |
| SIGNED（已签约） | [上线→ONLINE][详情] |
| ONLINE（已上线） | [冻结][详情][编辑] |
| FROZEN（已冻结） | [解冻→ONLINE][详情] |

---

## 三、公共组件拆分方案

当前 `OnboardingApplyPage.tsx` 中 900+ 行的表单逻辑必须拆分为可复用的公共组件：

```
src/components/merchant/
  ├── MerchantForm.tsx              # 统一表单容器（角色切换+分步导航）
  ├── RoleSelector.tsx              # 角色选择卡片（药房/医生/药剂师/营养师/HM）
  ├── StepNavigator.tsx             # 分步导航条（基础信息→资质上传→提交预览）
  ├── BaseInfoSection.tsx           # 基础信息表单（姓名/电话/地址等，所有角色共有）
  ├── InstitutionSection.tsx        # 机构专属字段（法人/执照/经营范围）
  ├── ProfessionalSection.tsx       # 个人专业字段（职称/科室/擅长领域/性别）
  ├── CertUploadSection.tsx         # 资质上传组件（根据角色动态显示上传项）
  ├── ReviewTimeline.tsx            # 审核时间线（展示 statusHistory）
  ├── MerchantStatusTag.tsx         # 统一状态标签（14态）
  ├── MerchantRoleTag.tsx           # 统一角色标签
  ├── MerchantTable.tsx             # 统一列表表格（支持按角色/状态筛选+操作列）
  ├── MerchantDetailModal.tsx       # 详情弹窗（展示完整信息+审核历史）
  └── AuditActionModal.tsx          # 审核操作弹窗（通过/驳回/补充+原因输入）
```

---

## 四、商家管理页改造详设

### 4.1 改造后页面结构

```tsx
// src/pages/MerchantManagePage.tsx（重命名自 MerchantListPage）
// 合并"入驻申请"和"商家列表"为一个统一的商家管理页

const MerchantManagePage: React.FC = () => {
  const { ad } = useUserStore();
  
  // 状态
  const [list, setList] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>();
  const [typeFilter, setTypeFilter] = useState<string>();
  
  // 弹窗状态
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'create' | 'edit'; record?: Merchant }>({ open: false, mode: 'create' });
  const [detailModal, setDetailModal] = useState<{ open: boolean; record?: Merchant }>({ open: false });
  const [auditModal, setAuditModal] = useState<{ open: boolean; type: 'info' | 'cert' | 'final' | 'reject' | 'supplement'; record?: Merchant }>({ open: false, type: 'final' });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; record?: Merchant }>({ open: false });

  // 加载数据
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/merchants', { params: { role: 'PHARMACY', status: statusFilter, search, page: 1 } });
      setList(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setList([]); }
    setLoading(false);
  }, [ad, statusFilter, search]);

  // 审核操作
  const handleAudit = async (id: string, action: AuditAction, reason?: string) => {
    await ad!.post(`/merchants/${id}/audit`, { action, reason });
    message.success('操作成功');
    load();
  };

  // 删除
  const handleDelete = async (id: string) => {
    await ad!.delete(`/merchants/${id}`);
    message.success('删除成功');
    load();
  };

  // 表格列定义
  const columns = [
    { title: '商家名称', dataIndex: 'name', width: 160 },
    { title: '入驻类型', dataIndex: 'role', width: 90, render: (r: MerchantRole) => <MerchantRoleTag role={r} /> },
    { title: '联系人', dataIndex: 'contactName', width: 90 },
    { title: '联系电话', dataIndex: 'contactPhone', width: 120 },
    { title: '地区', width: 120, render: (_: any, r: Merchant) => `${r.province || ''}${r.city || ''}` },
    { title: '状态', dataIndex: 'status', width: 110, render: (s: OnboardingStatus) => <MerchantStatusTag status={s} /> },
    { title: '提交时间', dataIndex: 'submittedAt', width: 120, render: (v: number) => v ? new Date(v).toLocaleDateString() : '-' },
    { title: '操作', width: 220, fixed: 'right', render: (_: any, r: Merchant) => (
      <Space>
        {/* 按状态显示不同操作按钮 */}
        {r.status === 'PENDING' && (
          <>
            <Button size="small" type="primary" onClick={() => setAuditModal({ open: true, type: 'info', record: r })}>信息核对</Button>
            <Button size="small" danger onClick={() => setAuditModal({ open: true, type: 'reject', record: r })}>驳回</Button>
          </>
        )}
        {r.status === 'INFO_REVIEWING' && (
          <>
            <Button size="small" type="primary" onClick={() => handleAudit(r.id, 'info_pass')}>信息通过</Button>
            <Button size="small" onClick={() => setAuditModal({ open: true, type: 'supplement', record: r })}>要求补充</Button>
            <Button size="small" danger onClick={() => setAuditModal({ open: true, type: 'reject', record: r })}>驳回</Button>
          </>
        )}
        {r.status === 'INFO_APPROVED' && (
          <>
            <Button size="small" type="primary" onClick={() => setAuditModal({ open: true, type: 'cert', record: r })}>资质审核</Button>
            <Button size="small" danger onClick={() => setAuditModal({ open: true, type: 'reject', record: r })}>驳回</Button>
          </>
        )}
        {r.status === 'CERT_REVIEWING' && (
          <>
            <Button size="small" type="primary" onClick={() => handleAudit(r.id, 'cert_pass')}>资质通过</Button>
            <Button size="small" onClick={() => setAuditModal({ open: true, type: 'supplement', record: r })}>要求补充</Button>
            <Button size="small" danger onClick={() => setAuditModal({ open: true, type: 'reject', record: r })}>驳回</Button>
          </>
        )}
        {r.status === 'CERT_APPROVED' && (
          <>
            <Button size="small" type="primary" onClick={() => handleAudit(r.id, 'approve')}>终审通过</Button>
            <Button size="small" danger onClick={() => setAuditModal({ open: true, type: 'reject', record: r })}>驳回</Button>
          </>
        )}
        {r.status === 'APPROVED' && (
          <>
            <Button size="small" type="primary" onClick={() => handleAudit(r.id, 'send_contract')}>发送合同</Button>
            <Button size="small" onClick={() => setFormModal({ open: true, mode: 'edit', record: r })}>编辑</Button>
          </>
        )}
        {r.status === 'SIGNING' && (
          <Button size="small" type="primary" onClick={() => handleAudit(r.id, 'sign')}>确认签约</Button>
        )}
        {r.status === 'SIGNED' && (
          <Button size="small" type="primary" onClick={() => handleAudit(r.id, 'online')}>上线</Button>
        )}
        {r.status === 'ONLINE' && (
          <>
            <Button size="small" onClick={() => setFormModal({ open: true, mode: 'edit', record: r })}>编辑</Button>
            <Button size="small" danger onClick={() => handleAudit(r.id, 'freeze')}>冻结</Button>
          </>
        )}
        {r.status === 'FROZEN' && (
          <Button size="small" type="primary" onClick={() => handleAudit(r.id, 'unfreeze')}>解冻</Button>
        )}
        {r.status === 'REJECTED' && (
          <>
            <Button size="small" onClick={() => setFormModal({ open: true, mode: 'edit', record: r })}>重新提交</Button>
            <Button size="small" danger onClick={() => setDeleteModal({ open: true, record: r })}>删除</Button>
          </>
        )}
        <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailModal({ open: true, record: r })}>详情</Button>
      </Space>
    )},
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="待审核" value={list.filter(m => ['PENDING','INFO_REVIEWING','CERT_REVIEWING'].includes(m.status)).length} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已通过" value={list.filter(m => ['APPROVED','SIGNING','SIGNED','ONLINE'].includes(m.status)).length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已驳回" value={list.filter(m => m.status === 'REJECTED').length} valueStyle={{ color: '#f5222d' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="总数" value={list.length} /></Card></Col>
      </Row>

      {/* 操作栏 + 表格 */}
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormModal({ open: true, mode: 'create' })}>新增商家</Button>
          <Input prefix={<SearchOutlined />} placeholder="搜索商家名/联系人/电话" value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 240 }} />
          <Select placeholder="状态筛选" allowClear style={{ width: 140 }} value={statusFilter} onChange={setStatusFilter}
            options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))} />
        </Space>
        <Table rowKey="id" dataSource={filtered} columns={columns} loading={loading} scroll={{ x: 1200 }} pagination={{ pageSize: 10 }} />
      </Card>

      {/* 新增/编辑弹窗 - 复用入驻申请表单 */}
      <Modal title={formModal.mode === 'create' ? '新增商家' : '编辑商家'} open={formModal.open} width={800} footer={null} onCancel={() => setFormModal({ open: false, mode: 'create' })}>
        <MerchantForm 
          mode={formModal.mode} 
          initialData={formModal.record} 
          fixedRole="PHARMACY"
          onSubmit={async (data) => {
            if (formModal.mode === 'create') {
              await ad!.post('/merchants', { ...data, role: 'PHARMACY', status: 'PENDING', source: 'manual' });
              message.success('新增成功，已提交审核');
            } else {
              await ad!.put(`/merchants/${formModal.record!.id}`, data);
              message.success('更新成功');
            }
            setFormModal({ open: false, mode: 'create' });
            load();
          }}
          onCancel={() => setFormModal({ open: false, mode: 'create' })}
        />
      </Modal>

      {/* 详情弹窗 */}
      <Modal title="商家详情" open={detailModal.open} width={700} footer={null} onCancel={() => setDetailModal({ open: false })}>
        {detailModal.record && <MerchantDetailModal record={detailModal.record} />}
      </Modal>

      {/* 审核弹窗 */}
      <Modal title="审核操作" open={auditModal.open} onOk={...} onCancel={...}>
        <AuditActionModal type={auditModal.type} record={auditModal.record} />
      </Modal>
    </div>
  );
};
```

### 4.2 关键变更点

| 变更项 | 当前 | 改造后 |
|--------|------|--------|
| 页面名称 | `MerchantListPage` | `MerchantManagePage` |
| Tab结构 | 入驻申请 + 商家列表 两个Tab | 统一为一个列表，状态筛选区分 |
| 新增功能 | ❌ 无 | ✅ 新增商家按钮 + 表单弹窗 |
| 编辑功能 | ❌ 无 | ✅ 编辑按钮（非审核中状态可编辑） |
| 删除功能 | ❌ 无 | ✅ 删除按钮（仅草稿/驳回状态） |
| 审核流程 | 一步通过/驳回 | 四步：信息核对→资质审核→终审通过→签约上线 |
| 状态显示 | 4种（PENDING/IN_REVIEW/APPROVED/REJECTED） | 14种完整状态 |
| 数据来源 | `/applications` + `/merchants` 两个API | 统一 `/merchants?role=PHARMACY` |

---

## 五、成员管理页统一改造

### 5.1 医生管理页改造

```tsx
// src/pages/DoctorManagePage.tsx

const DoctorManagePage: React.FC = () => {
  const { ad } = useUserStore();
  const [list, setList] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>();
  const [formModal, setFormModal] = useState<{ open: boolean; mode: 'create' | 'edit'; record?: Merchant }>({ open: false, mode: 'create' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // 统一从 /merchants 加载，按角色筛选
      const res = await ad!.get<any>('/merchants', { params: { role: 'DOCTOR', status: statusFilter, search } });
      setList(Array.isArray(res?.list) ? res.list : Array.isArray(res) ? res : []);
    } catch { setList([]); }
    setLoading(false);
  }, [ad, statusFilter, search]);

  const columns = [
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '手机号', dataIndex: 'phone', width: 120 },
    { title: '身份证号', dataIndex: 'idCard', width: 150, render: (v: string) => v ? `${v.slice(0, 6)}****${v.slice(-4)}` : '-' },
    { title: '职称', dataIndex: 'title', width: 100 },
    { title: '科室', dataIndex: 'department', width: 100 },
    { title: '医院/机构', dataIndex: 'companyName', width: 150 },
    { title: '擅长领域', dataIndex: 'specialties', width: 150, render: (v: string[]) => v?.join('、') || '-' },
    { title: '性别', dataIndex: 'gender', width: 60, render: (v: string) => v === 'M' ? '男' : v === 'F' ? '女' : '-' },
    { title: '状态', dataIndex: 'status', width: 110, render: (s: OnboardingStatus) => <MerchantStatusTag status={s} /> },
    { title: '提交时间', dataIndex: 'submittedAt', width: 120, render: (v: number) => v ? new Date(v).toLocaleDateString() : '-' },
    { title: '操作', width: 220, fixed: 'right', render: (_: any, r: Merchant) => (
      <Space>
        {/* 与商家管理页完全一致的审核按钮逻辑 */}
        {r.status === 'PENDING' && (
          <>
            <Button size="small" type="primary" onClick={() => handleAudit(r.id, 'info_review')}>信息核对</Button>
            <Button size="small" danger onClick={() => setAuditModal({ open: true, type: 'reject', record: r })}>驳回</Button>
          </>
        )}
        {r.status === 'INFO_REVIEWING' && (
          <>
            <Button size="small" type="primary" onClick={() => handleAudit(r.id, 'info_pass')}>信息通过</Button>
            <Button size="small" onClick={() => setAuditModal({ open: true, type: 'supplement', record: r })}>要求补充</Button>
            <Button size="small" danger onClick={() => setAuditModal({ open: true, type: 'reject', record: r })}>驳回</Button>
          </>
        )}
        {r.status === 'INFO_APPROVED' && (
          <>
            <Button size="small" type="