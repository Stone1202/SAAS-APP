/**
 * PharmacyProductPage — 药店商品分类管理（可复用）
 * 支持：处方药管理 / 非处方药管理 / 医疗器械 / 保健品
 * 按 product_type 过滤，展示已上架商品列表，关联药店
 * V2.2.0 新增
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card, Table, Tag, Button, Input, Space, Select, Image, Typography, message,
  Modal, Descriptions, Tooltip
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, EyeOutlined, StopOutlined,
  MedicineBoxOutlined, SafetyCertificateOutlined, ExperimentOutlined, CoffeeOutlined,
} from '@ant-design/icons';
import { useProductStore } from '@/stores/productStore';
import { PRODUCT_STATUS_LABEL, PRODUCT_STATUS_COLOR } from '@/contracts/productMgmt';
import type { ProductType } from '@/contracts/trade';

const { Text } = Typography;

// 分类元数据
const CATEGORY_META: Record<string, { title: string; icon: React.ReactNode; productTypes: ProductType[] }> = {
  rx: {
    title: '处方药管理',
    icon: <MedicineBoxOutlined />,
    productTypes: ['RX'],
  },
  otc: {
    title: '非处方药管理',
    icon: <SafetyCertificateOutlined />,
    productTypes: ['OTC'],
  },
  devices: {
    title: '医疗器械',
    icon: <ExperimentOutlined />,
    productTypes: ['DEVICE'],
  },
  supplements: {
    title: '保健品',
    icon: <CoffeeOutlined />,
    productTypes: ['FOOD', 'DAILY'],
  },
};

const PAGE_SIZE = 10;

const PharmacyProductPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { products, loadProducts, toggleProductStatus } = useProductStore();

  // 从路径推断分类
  const category = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/rx')) return 'rx';
    if (path.includes('/otc')) return 'otc';
    if (path.includes('/devices')) return 'devices';
    if (path.includes('/supplements')) return 'supplements';
    return 'rx';
  }, [location.pathname]);

  const meta = CATEGORY_META[category];

  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [merchantFilter, setMerchantFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    loadProducts({ status: 'ALL' });
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  // 按 product_type 过滤
  const filteredProducts = useMemo(() => {
    let list = products.filter((p: any) => meta.productTypes.includes(p.product_type));
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter((p: any) =>
        p.name?.toLowerCase().includes(kw) ||
        p.merchant_name?.toLowerCase().includes(kw),
      );
    }
    if (merchantFilter !== 'ALL') {
      list = list.filter((p: any) => p.merchant_id === merchantFilter);
    }
    if (statusFilter !== 'ALL') {
      list = list.filter((p: any) => p.status === statusFilter);
    }
    return list;
  }, [products, keyword, merchantFilter, statusFilter, meta.productTypes]);

  // 当前页数据
  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  // 去重后的药店列表
  const merchantOptions = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p: any) => {
      if (p.merchant_id && !map.has(p.merchant_id)) {
        map.set(p.merchant_id, p.merchant_name || p.merchant_id);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({
      value: id,
      label: name,
    }));
  }, [products]);

  const handleView = useCallback((record: any) => {
    setSelectedProduct(record);
    setDetailVisible(true);
  }, []);

  const handleOffShelf = useCallback(async (record: any) => {
    Modal.confirm({
      title: `确认下架「${record.name}」？`,
      content: '下架后用户将无法在APP和小程序看到此商品。',
      okText: '确认下架',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        await toggleProductStatus(record.id, 'OFF_SHELF' as any);
        message.success('已下架');
        loadProducts({ status: 'ALL' });
      },
    });
  }, [toggleProductStatus, loadProducts]);

  const handleReShelf = useCallback(async (record: any) => {
    await toggleProductStatus(record.id, 'ON_SHELF' as any);
    message.success('已上架');
    loadProducts({ status: 'ALL' });
  }, [toggleProductStatus, loadProducts]);

  const handleRefresh = () => {
    setLoading(true);
    loadProducts({ status: 'ALL' });
    setTimeout(() => setLoading(false), 300);
  };

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (text: string, record: any) => (
        <Space>
          {record.images?.[0] ? (
            <Image src={record.images[0]} width={40} height={40} style={{ borderRadius: 4, objectFit: 'cover' }} preview />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 4, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              {meta.icon}
            </div>
          )}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '所属药店',
      dataIndex: 'merchant_name',
      key: 'merchant_name',
      width: 130,
      render: (text: string) => (
        <Tag color="blue">{text || '-'}</Tag>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#f5222d' }}>¥{price}</Text>
          {record.market_price > price && (
            <Text delete type="secondary" style={{ fontSize: 11 }}>¥{record.market_price}</Text>
          )}
        </Space>
      ),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      render: (s: number) => (
        <Text type={s < 100 ? 'danger' : undefined}>{s}</Text>
      ),
    },
    {
      title: '销量',
      dataIndex: 'sales_count',
      key: 'sales_count',
      width: 80,
      render: (s: number) => (
        <Text>{s?.toLocaleString() || 0}</Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => (
        <Tag color={PRODUCT_STATUS_COLOR[status as keyof typeof PRODUCT_STATUS_COLOR] || 'default'}>
          {PRODUCT_STATUS_LABEL[status as keyof typeof PRODUCT_STATUS_LABEL] || status}
        </Tag>
      ),
    },
    {
      title: '冷链',
      key: 'coldchain',
      width: 70,
      render: (_: any, record: any) => (
        record.cold_chain_config?.required ? <Tag color="cyan">冷链</Tag> : <span>-</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            详情
          </Button>
          {record.status === 'ON_SHELF' ? (
            <Button size="small" type="link" danger icon={<StopOutlined />} onClick={() => handleOffShelf(record)}>
              下架
            </Button>
          ) : record.status === 'OFF_SHELF' ? (
            <Button size="small" type="link" onClick={() => handleReShelf(record)}>
              上架
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            {meta.icon}
            <span>{meta.title}</span>
            <Tag color="purple">{filteredProducts.length} 个商品</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              刷新
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {/* 筛选栏 */}
        <Space wrap style={{ marginBottom: 16, width: '100%' }}>
          <Input
            placeholder="搜索商品名称/药店..."
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(1); }}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="所属药店"
            value={merchantFilter}
            onChange={v => { setMerchantFilter(v); setPage(1); }}
            style={{ width: 160 }}
            allowClear
            onClear={() => setMerchantFilter('ALL')}
          >
            <Select.Option value="ALL">全部药店</Select.Option>
            {merchantOptions.map(m => (
              <Select.Option key={m.value} value={m.value}>{m.label}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="状态"
            value={statusFilter}
            onChange={v => { setStatusFilter(v); setPage(1); }}
            style={{ width: 120 }}
            allowClear
            onClear={() => setStatusFilter('ALL')}
          >
            <Select.Option value="ALL">全部状态</Select.Option>
            <Select.Option value="ON_SHELF">已上架</Select.Option>
            <Select.Option value="OFF_SHELF">已下架</Select.Option>
            <Select.Option value="BANNED">已封禁</Select.Option>
          </Select>
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={paginatedData}
          loading={loading}
          size="middle"
          scroll={{ x: 1000 }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: filteredProducts.length,
            onChange: (p) => setPage(p),
            showTotal: (total) => `共 ${total} 条`,
            showSizeChanger: false,
          }}
          locale={{ emptyText: `暂无${meta.title}商品` }}
        />
      </Card>

      {/* 商品详情弹窗 */}
      <Modal
        title={`商品详情 - ${selectedProduct?.name || ''}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>,
          selectedProduct?.status === 'ON_SHELF' && (
            <Button key="off" danger onClick={() => { handleOffShelf(selectedProduct); setDetailVisible(false); }}>
              下架
            </Button>
          ),
          selectedProduct?.status === 'OFF_SHELF' && (
            <Button key="on" type="primary" onClick={() => { handleReShelf(selectedProduct); setDetailVisible(false); }}>
              上架
            </Button>
          ),
        ].filter(Boolean)}
        width={640}
      >
        {selectedProduct && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="商品ID" span={2}>{selectedProduct.id}</Descriptions.Item>
            <Descriptions.Item label="商品名称" span={2}>{selectedProduct.name}</Descriptions.Item>
            <Descriptions.Item label="商品类型">
              <Tag color="blue">{selectedProduct.product_type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="所属药店">
              <Tag color="blue">{selectedProduct.merchant_name || '-'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="售价">
              <Text strong style={{ color: '#f5222d' }}>¥{selectedProduct.price}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="市场价">
              <Text delete>¥{selectedProduct.market_price || '-'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="库存">{selectedProduct.stock}</Descriptions.Item>
            <Descriptions.Item label="销量">{(selectedProduct.sales_count || 0).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={PRODUCT_STATUS_COLOR[selectedProduct.status as keyof typeof PRODUCT_STATUS_COLOR]}>
                {PRODUCT_STATUS_LABEL[selectedProduct.status as keyof typeof PRODUCT_STATUS_LABEL]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="OTC标识">{selectedProduct.is_otc ? <Tag color="green">是</Tag> : '否'}</Descriptions.Item>
            <Descriptions.Item label="冷链">
              {selectedProduct.cold_chain_config?.required ? <Tag color="cyan">需要</Tag> : '不需要'}
            </Descriptions.Item>
            <Descriptions.Item label="分类">{selectedProduct.category_name || '-'}</Descriptions.Item>
            <Descriptions.Item label="证照号">{selectedProduct.otc_license_no || '-'}</Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>{selectedProduct.description || '-'}</Descriptions.Item>
            {selectedProduct.cold_chain_config && (
              <>
                <Descriptions.Item label="储存规格">{selectedProduct.cold_chain_config.storage_spec || '-'}</Descriptions.Item>
                <Descriptions.Item label="运输时效">{selectedProduct.cold_chain_config.transport_duration_max ? `${Math.round(selectedProduct.cold_chain_config.transport_duration_max / 60)}小时` : '-'}</Descriptions.Item>
                <Descriptions.Item label="包装类型">{selectedProduct.cold_chain_config.package_type || '-'}</Descriptions.Item>
                <Descriptions.Item label="断链处理">{selectedProduct.cold_chain_config.break_action || '-'}</Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default PharmacyProductPage;
