/**
 * PG-SUG-PC-023 商品管理列表（PC后台）V2.1.0
 * 增强：规格动态管理 + 图片管理 + 冷链配置 + OTC证号 + 完整商品信息
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Tag, Input, Card, Row, Col, Statistic, Space, Button,
  Modal, Form, Select, InputNumber, Switch, message, Popconfirm, Typography,
  Divider, Tooltip,
} from 'antd';
import {
  SearchOutlined, AuditOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, ShoppingOutlined, MinusCircleOutlined,
} from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';
import type { Product, ProductSpec } from '@/contracts/productMgmt';

const { Text } = Typography;

// ===== 常量映射 =====

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  DRAFT: { color: 'default', label: '草稿' },
  ON_SHELF: { color: 'success', label: '上架' },
  OFF_SHELF: { color: 'default', label: '下架' },
  AUDITING: { color: 'processing', label: '审核中' },
  AUDIT_REJECTED: { color: 'error', label: '审核驳回' },
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  DEVICE: '设备', OTC: 'OTC药品', RX: '处方药',
  FOOD: '食品', DAILY: '日用品', SERVICE: '服务',
};

const PRODUCT_TYPE_COLORS: Record<string, string> = {
  DEVICE: 'blue', OTC: 'orange', RX: 'red',
  FOOD: 'green', DAILY: 'purple', SERVICE: 'cyan',
};

/** 分类名 → 分类ID（与 MOCK_CATEGORIES 对齐） */
const CATEGORY_MAP: Record<string, string> = {
  '血糖监测': 'cat-001', 'CGM设备': 'cat-001', '血糖试纸': 'cat-001',
  '胰岛素注射': 'cat-002', '胰岛素泵': 'cat-002',
  'OTC药品': 'cat-003', '保健品': 'cat-003',
  '健康食品': 'cat-004', '食品饮料': 'cat-004',
  '医疗辅具': 'cat-005', '医疗器械': 'cat-005',
  '服务': 'cat-006',
};

const CATEGORY_OPTIONS = [
  { value: '血糖监测', label: '血糖监测' },
  { value: '胰岛素注射', label: '胰岛素注射' },
  { value: 'OTC药品', label: 'OTC药品' },
  { value: '健康食品', label: '健康食品' },
  { value: '医疗辅具', label: '医疗辅具' },
  { value: '服务', label: '服务' },
];

/** 商家名 → ID */
const MERCHANT_ID_MAP: Record<string, string> = {
  'XX大药房': 'm-001', '仁心大药房': 'm-001',
  '赵药师药房': 'm-002',
  '张医生诊所': 'm-003',
  '王营养师工作室': 'm-005', '健康营养工作室': 'm-005',
};

const MERCHANT_OPTIONS = [
  { value: 'XX大药房', label: 'XX大药房' },
  { value: '赵药师药房', label: '赵药师药房' },
  { value: '张医生诊所', label: '张医生诊所' },
  { value: '王营养师工作室', label: '王营养师工作室' },
  { value: '仁心大药房', label: '仁心大药房' },
  { value: '健康营养工作室', label: '健康营养工作室' },
];

const PRODUCT_TYPE_OPTIONS = [
  { value: 'DEVICE', label: '设备' }, { value: 'OTC', label: 'OTC药品' },
  { value: 'RX', label: '处方药' }, { value: 'FOOD', label: '食品' },
  { value: 'DAILY', label: '日用品' }, { value: 'SERVICE', label: '服务' },
];

const COLD_PACKAGE_OPTIONS = [
  { value: 'INSULATED_BOX', label: '保温箱' },
  { value: 'REFRIGERATED_VEHICLE', label: '冷藏车' },
  { value: 'NONE', label: '无特殊包装' },
];

const COLD_BREAK_OPTIONS = [
  { value: 'DESTROY_ON_BREAK', label: '断链销毁' },
  { value: 'REASSESS_ON_BREAK', label: '重新评估' },
  { value: 'VISUAL_ONLY', label: '仅外观检查' },
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'ON_SHELF', label: '上架' },
  { value: 'OFF_SHELF', label: '下架' },
];

// ===== 规格输入行组件 =====
interface SpecRowProps {
  field: { key: number; name: number; key_desc: string };
  remove: (index: number) => void;
}

const SpecInputRow: React.FC<SpecRowProps> = ({ field, remove }) => (
  <Row gutter={8} align="middle" style={{ marginBottom: 8 }}>
    <Col span={5}>
      <Form.Item {...field} name={[field.name, 'name']} noStyle
        rules={[{ required: true, message: '必填' }]}>
        <Input placeholder="规格名(如尺码)" />
      </Form.Item>
    </Col>
    <Col span={5}>
      <Form.Item {...field} name={[field.name, 'value']} noStyle
        rules={[{ required: true, message: '必填' }]}>
        <Input placeholder="规格值(如L码)" />
      </Form.Item>
    </Col>
    <Col span={5}>
      <Form.Item {...field} name={[field.name, 'price_override']} noStyle>
        <InputNumber placeholder="价格±" min={-99999} precision={2} style={{ width: '100%' }} />
      </Form.Item>
    </Col>
    <Col span={5}>
      <Form.Item {...field} name={[field.name, 'stock']} noStyle
        rules={[{ required: true, message: '必填' }]}>
        <InputNumber placeholder="库存" min={0} style={{ width: '100%' }} />
      </Form.Item>
    </Col>
    <Col span={4}>
      <MinusCircleOutlined style={{ color: '#ff4d4f', cursor: 'pointer' }}
        onClick={() => remove(field.name)} />
    </Col>
  </Row>
);

// ===== 表单主体（独立组件以使用 Form.useWatch） =====
const ProductFormContent: React.FC = () => {
  const productType = Form.useWatch('product_type');
  const isOtc = Form.useWatch('is_otc');
  const showColdChain = productType === 'RX';
  const showOtcLicense = isOtc || productType === 'OTC';

  return (
    <>
      {/* ===== 基本信息 ===== */}
      <Divider orientation="left" plain style={{ fontSize: 13, marginTop: 0 }}>基本信息</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input placeholder="如：雅培瞬感CGM传感器" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select placeholder="选择分类" options={CATEGORY_OPTIONS} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="product_type" label="商品类型" rules={[{ required: true }]}>
            <Select placeholder="选择类型" options={PRODUCT_TYPE_OPTIONS} />
          </Form.Item>
        </Col>
      </Row>

      {/* ===== 价格库存评分 ===== */}
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item name="price" label="售价(¥)" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="market_price" label="市场价(¥)">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="stock" label="总库存" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="rating" label="评分" tooltip="1.0~5.0，APP端展示">
            <InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      {/* ===== 商家与状态 ===== */}
      <Row gutter={16}>
        <Col span={10}>
          <Form.Item name="merchant_name" label="所属商家" rules={[{ required: true }]}>
            <Select placeholder="选择商家" options={MERCHANT_OPTIONS} />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item name="is_otc" label="OTC药品" valuePropName="checked">
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item name="status" label="商品状态" rules={[{ required: true }]}>
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Col>
        <Col span={4} />
      </Row>

      {/* ===== OTC证号（条件显示） ===== */}
      {showOtcLicense && (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="otc_license_no" label="OTC批准文号"
              rules={showOtcLicense ? [{ required: true, message: 'OTC/处方药必须填写批准文号' }] : []}>
              <Input placeholder="如：国药准字H20023370" />
            </Form.Item>
          </Col>
        </Row>
      )}

      {/* ===== 冷链配置（条件显示） ===== */}
      {showColdChain && (
        <>
          <Divider orientation="left" plain style={{ fontSize: 13 }}>
            <Tag color="blue">冷链配置</Tag>
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name={['cold_chain_config', 'type']} label="冷链类型" rules={[{ required: true }]}
                initialValue="COLD">
                <Select options={[
                  { value: 'COLD', label: '冷藏（2~8°C）' },
                  { value: 'FROZEN', label: '冷冻（≤ -18°C）' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={['cold_chain_config', 'storage_spec']} label="储存规格" initialValue="2~8°C避光保存">
                <Input placeholder="如：2~8°C避光保存" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={['cold_chain_config', 'transport_duration_max']} label="最大运输时长(分钟)"
                initialValue={2880}>
                <InputNumber min={60} max={10080} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name={['cold_chain_config', 'package_type']} label="包装类型" initialValue="INSULATED_BOX">
                <Select options={COLD_PACKAGE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={['cold_chain_config', 'break_action']} label="断链处理" initialValue="DESTROY_ON_BREAK">
                <Select options={COLD_BREAK_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={['cold_chain_config', 'max_resend_count']} label="最大补发次数" initialValue={2}>
                <InputNumber min={0} max={5} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name={['cold_chain_config', 'required']} hidden initialValue={true}>
            <Input />
          </Form.Item>
        </>
      )}

      {/* ===== 商品图片 ===== */}
      <Divider orientation="left" plain style={{ fontSize: 13 }}>商品图片</Divider>
      <Form.List name="images">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Row key={field.key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                <Col flex="auto">
                  <Form.Item {...field} noStyle rules={[{ type: 'url', message: '请输入有效的图片URL' }]}>
                    <Input placeholder="输入图片URL（如 https://example.com/img.jpg）" />
                  </Form.Item>
                </Col>
                <Col>
                  <DeleteOutlined style={{ color: '#ff4d4f', cursor: 'pointer' }} onClick={() => remove(field.name)} />
                </Col>
              </Row>
            ))}
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
              添加图片
            </Button>
          </>
        )}
      </Form.List>

      {/* ===== 规格动态管理 ===== */}
      <Divider orientation="left" plain style={{ fontSize: 13 }}>规格管理</Divider>
      <div style={{ background: '#fafafa', padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 12, color: '#888' }}>
        <Row gutter={8}>
          <Col span={5}>规格名</Col>
          <Col span={5}>规格值</Col>
          <Col span={5}>价格调整(¥)</Col>
          <Col span={5}>规格库存</Col>
          <Col span={4} />
        </Row>
      </div>
      <Form.List name="specifications">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <SpecInputRow key={field.key} field={field} remove={remove} />
            ))}
            <Button type="dashed" onClick={() => add({ id: `spec-${Date.now()}`, name: '', value: '', stock: 0 })}
              block icon={<PlusOutlined />}>
              添加规格
            </Button>
          </>
        )}
      </Form.List>

      {/* ===== 商品描述 ===== */}
      <Form.Item name="description" label="商品描述" style={{ marginTop: 16 }}>
        <Input.TextArea rows={3} placeholder="商品详细描述..." />
      </Form.Item>
    </>
  );
};

// ===== 主页面 =====
const ProductManagePage: React.FC = () => {
  const { ad } = useUserStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ad!.get<any>('/products/list');
      setProducts(Array.isArray(res?.list) ? res.list : []);
    } catch { setProducts([]); }
    setLoading(false);
  }, [ad]);

  useEffect(() => { load(); }, [load]);

  // 新增商品
  const handleOpenNew = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'DRAFT',
      product_type: 'DEVICE',
      is_otc: false,
      images: [],
      specifications: [],
    });
    setFormOpen(true);
  };

  // 编辑商品：回填所有字段（含嵌套）
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    form.setFieldsValue({
      ...p,
      category: p.category_name || p.category,
      cold_chain_config: p.cold_chain_config ?? {
        required: false, type: 'NONE',
        storage_spec: '', transport_duration_max: 2880,
        package_type: 'NONE', break_action: 'DESTROY_ON_BREAK', max_resend_count: 0,
      },
      images: p.images || [],
      specifications: (p.specifications || []).map((s: ProductSpec) => ({
        id: s.id, name: s.name, value: s.value,
        price_override: s.price_override, stock: s.stock,
      })),
    });
    setFormOpen(true);
  };

  // 保存：构建完整载荷提交适配器
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const specs: ProductSpec[] = (values.specifications || []).map((s: any, idx: number) => ({
        id: s.id || `spec-${Date.now()}-${idx}`,
        name: s.name || '',
        value: s.value || '',
        price_override: s.price_override ?? undefined,
        stock: s.stock ?? 0,
      }));

      const totalSpecStock = specs.reduce((sum: number, s: any) => sum + (s.stock || 0), 0);

      const payload = {
        name: values.name,
        category: values.category,
        category_name: values.category,
        category_id: CATEGORY_MAP[values.category] || 'cat-001',
        product_type: values.product_type,
        price: values.price,
        market_price: values.market_price,
        stock: values.stock ?? totalSpecStock,
        rating: values.rating,
        merchant_name: values.merchant_name,
        merchant_id: MERCHANT_ID_MAP[values.merchant_name] || 'm-001',
        is_otc: values.is_otc ?? false,
        status: values.status || 'DRAFT',
        images: (values.images || []).filter(Boolean),
        specifications: specs,
        description: values.description,
        otc_license_no: values.otc_license_no,
        sales_count: editingProduct?.sales_count ?? 0,
      };

      // 附加冷链配置（仅当 product_type === 'RX' 时）
      if (values.product_type === 'RX' && values.cold_chain_config) {
        (payload as any).cold_chain_config = {
          ...values.cold_chain_config,
          required: true,
        };
      }

      if (editingProduct) {
        await ad!.put(`/products/${editingProduct.id}`, payload);
        message.success('商品已更新');
      } else {
        await ad!.post('/products', payload);
        message.success('商品已创建');
      }
      await load();
      setFormOpen(false);
      form.resetFields();
    } catch { /* validation error */ }
  };

  const handleBatch = async (action: 'ON_SHELF' | 'OFF_SHELF' | 'DELETE') => {
    const label = action === 'ON_SHELF' ? '上架' : action === 'OFF_SHELF' ? '下架' : '删除';
    try {
      await ad!.post('/products/batch', { ids: selectedRowKeys, action });
      if (action === 'DELETE') {
        setProducts(prev => prev.filter(p => !selectedRowKeys.includes(p.id)));
      } else {
        setProducts(prev => prev.map(p => selectedRowKeys.includes(p.id) ? { ...p, status: action } : p));
      }
      message.success(`已${label} ${selectedRowKeys.length} 个商品`);
      setSelectedRowKeys([]);
    } catch { message.error(`批量${label}失败`); }
  };

  const filtered = products.filter(p =>
    !search || p.name.includes(search) || p.merchant_name?.includes(search)
  );

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
  };

  const cols = [
    { title: '商品名称', dataIndex: 'name', width: 180 },
    { title: '分类', dataIndex: 'category_name', width: 90 },
    {
      title: '类型', dataIndex: 'product_type', width: 72,
      render: (v: string) => <Tag color={PRODUCT_TYPE_COLORS[v] || 'default'}>{PRODUCT_TYPE_LABELS[v] || v}</Tag>,
    },
    { title: '商家', dataIndex: 'merchant_name', width: 110, ellipsis: true },
    { title: '售价', dataIndex: 'price', width: 70, render: (v: number) => `¥${v}` },
    { title: '库存', dataIndex: 'stock', width: 65, render: (v: number) => v?.toLocaleString() },
    { title: '评分', dataIndex: 'rating', width: 55, render: (v?: number) => v?.toFixed(1) ?? '-' },
    {
      title: 'OTC', dataIndex: 'is_otc', width: 55,
      render: (v: boolean) => v ? <Tag color="orange">OTC</Tag> : <Tag>-</Tag>,
    },
    {
      title: '冷链', dataIndex: 'cold_chain_config', width: 55,
      render: (cc: any) => cc?.required
        ? <Tooltip title={`${cc?.storage_spec || ''} · ${cc?.type || ''}`}>
            <Tag color="blue">冷链</Tag>
          </Tooltip>
        : <Tag>-</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', width: 70,
      render: (s: string) => <Tag color={STATUS_MAP[s]?.color}>{STATUS_MAP[s]?.label || s}</Tag>,
    },
    { title: '销量', dataIndex: 'sales_count', width: 60, render: (v: number) => v?.toLocaleString() },
    { title: '操作', width: 130, render: (_: any, r: Product) => (
      <Space size="small">
        {r.status === 'AUDITING' && <Button size="small" type="primary" icon={<AuditOutlined />}>审核</Button>}
        <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(r)}>编辑</Button>
        <Popconfirm title="确认删除?" onConfirm={() => handleBatch('DELETE')}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ];

  // 统计
  const onShelf = products.filter(p => p.status === 'ON_SHELF').length;
  const auditing = products.filter(p => p.status === 'AUDITING').length;
  const otcCount = products.filter(p => p.is_otc).length;
  const coldChainCount = products.filter(p => (p as any).cold_chain_config?.required).length;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}><Card><Statistic title="商品总数" value={products.length} /></Card></Col>
        <Col span={4}><Card><Statistic title="待审核" value={auditing} valueStyle={{ color: 'var(--color-warning)' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="上架中" value={onShelf} valueStyle={{ color: 'var(--color-success)' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="OTC商品" value={otcCount} /></Card></Col>
        <Col span={4}><Card><Statistic title="冷链商品" value={coldChainCount} /></Card></Col>
        <Col span={4}><Card><Statistic title="SKU数" value={products.reduce((s, p) => s + Math.max((p.specifications?.length || 0), 1), 0)} /></Card></Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Input prefix={<SearchOutlined />} placeholder="搜索商品名/商家" value={search}
              onChange={e => setSearch(e.target.value)} allowClear style={{ width: 260 }} />
          </Space>
          <Space>
            {selectedRowKeys.length > 0 && (
              <>
                <Button icon={<ShoppingOutlined />} onClick={() => handleBatch('ON_SHELF')}>批量上架</Button>
                <Button onClick={() => handleBatch('OFF_SHELF')}>批量下架</Button>
                <Popconfirm title={`确认删除 ${selectedRowKeys.length} 个商品？`} onConfirm={() => handleBatch('DELETE')}>
                  <Button danger icon={<DeleteOutlined />}>批量删除</Button>
                </Popconfirm>
                <Text type="secondary">已选 {selectedRowKeys.length} 项</Text>
              </>
            )}
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenNew}>新增商品</Button>
          </Space>
        </div>
        <Table
          rowKey="id"
          dataSource={filtered}
          columns={cols}
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="middle"
          scroll={{ x: 1200 }}
          rowSelection={rowSelection}
        />
      </Card>

      {/* ===== 新增/编辑商品 Modal ===== */}
      <Modal
        title={editingProduct ? '编辑商品' : '新增商品'}
        open={formOpen}
        onOk={handleSave}
        onCancel={() => { setFormOpen(false); form.resetFields(); }}
        okText="保存"
        cancelText="取消"
        width={800}
        destroyOnClose
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical">
          <ProductFormContent />
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagePage;
