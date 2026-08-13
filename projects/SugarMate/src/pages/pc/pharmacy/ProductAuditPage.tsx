/**
 * ProductReviewPage — 商品审核中心
 * 所有药店发布的商品（含OTC、处方药、医疗器械、保健品）需经过审核才能上架
 * 审核流程：待审核 → 审核通过（上架）/ 审核驳回（退回修改）
 * V2.2.0 新增
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Card, Table, Tag, Button, Input, Space, Select, Typography, message,
  Modal, Descriptions, Badge, Tabs, Tooltip
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
  SafetyCertificateOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useProductStore } from '@/stores/productStore';

const { Text } = Typography;

const PRODUCT_TYPE_LABEL: Record<string, { text: string; color: string }> = {
  RX: { text: '处方药', color: 'red' },
  OTC: { text: 'OTC', color: 'green' },
  DEVICE: { text: '医疗器械', color: 'blue' },
  FOOD: { text: '保健品', color: 'orange' },
  DAILY: { text: '日用品', color: 'purple' },
  SERVICE: { text: '服务', color: 'cyan' },
};

const PAGE_SIZE = 10;

const ProductAuditPage: React.FC = () => {
  const { products, loadProducts, updateProduct } = useProductStore();

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'PENDING_REVIEW' | 'REVIEWED'>('PENDING_REVIEW');
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    loadProducts({ status: 'ALL' });
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  // 按审核状态过滤
  const pendingList = useMemo(() => {
    return products.filter((p: any) => p.status === 'PENDING_REVIEW' || p.status === 'DRAFT');
  }, [products]);

  const reviewedList = useMemo(() => {
    return products.filter((p: any) =>
      ['ON_SHELF', 'OFF_SHELF', 'BANNED'].includes(p.status),
    );
  }, [products]);

  // 当前Tab的数据
  const rawList = tab === 'PENDING_REVIEW' ? pendingList : reviewedList;

  const filteredList = useMemo(() => {
    let list = [...rawList];
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter((p: any) =>
        p.name?.toLowerCase().includes(kw) ||
        p.merchant_name?.toLowerCase().includes(kw),
      );
    }
    if (typeFilter !== 'ALL') {
      list = list.filter((p: any) => p.product_type === typeFilter);
    }
    return list;
  }, [rawList, keyword, typeFilter]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, page]);

  const handleApprove = useCallback(async (record: any) => {
    Modal.confirm({
      title: `确认审核通过「${record.name}」？`,
      content: (
        <div>
          <p>审核通过后该商品将在APP和小程序上架展示。</p>
          <Descriptions size="small" column={1} style={{ marginTop: 12 }}>
            <Descriptions.Item label="商品类型">
              <Tag color={PRODUCT_TYPE_LABEL[record.product_type]?.color}>
                {PRODUCT_TYPE_LABEL[record.product_type]?.text || record.product_type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="所属药店">{record.merchant_name}</Descriptions.Item>
            <Descriptions.Item label="售价">¥{record.price}</Descriptions.Item>
          </Descriptions>
        </div>
      ),
      okText: '审核通过',
      cancelText: '取消',
      okType: 'primary',
      onOk: async () => {
        await updateProduct(record.id, { status: 'ON_SHELF' } as any);
        message.success(`${record.name} 审核通过，已上架`);
        loadProducts({ status: 'ALL' });
      },
    });
  }, [updateProduct, loadProducts]);

  const handleReject = useCallback(async (record: any) => {
    Modal.confirm({
      title: `确认驳回「${record.name}」？`,
      content: '驳回后商品状态变为草稿，药店需修改后重新提交审核。',
      okText: '确认驳回',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        await updateProduct(record.id, { status: 'DRAFT' } as any);
        message.success(`${record.name} 已驳回`);
        loadProducts({ status: 'ALL' });
      },
    });
  }, [updateProduct, loadProducts]);

  const handleView = useCallback((record: any) => {
    setSelectedProduct(record);
    setDetailVisible(true);
  }, []);

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
      width: 200,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: '商品类型',
      dataIndex: 'product_type',
      key: 'product_type',
      width: 90,
      render: (type: string) => (
        <Tag color={PRODUCT_TYPE_LABEL[type]?.color}>
          {PRODUCT_TYPE_LABEL[type]?.text || type}
        </Tag>
      ),
    },
    {
      title: '所属药店',
      dataIndex: 'merchant_name',
      key: 'merchant_name',
      width: 120,
      render: (text: string) => (
        <Tag color="blue">{text || '-'}</Tag>
      ),
    },
    {
      title: '售价',
      dataIndex: 'price',
      key: 'price',
      width: 80,
      render: (price: number) => (
        <Text strong style={{ color: '#f5222d' }}>¥{price}</Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => {
        const config: Record<string, { text: string; color: string }> = {
          PENDING_REVIEW: { text: '待审核', color: 'orange' },
          DRAFT: { text: '草稿', color: 'default' },
          ON_SHELF: { text: '已上架', color: 'green' },
          OFF_SHELF: { text: '已下架', color: 'default' },
          BANNED: { text: '已封禁', color: 'red' },
        };
        const c = config[status] || { text: status, color: 'default' };
        return <Tag color={c.color}>{c.text}</Tag>;
      },
    },
    {
      title: 'OTC',
      key: 'is_otc',
      width: 60,
      render: (_: any, record: any) => (
        record.is_otc ? <Tag color="green">是</Tag> : <span>-</span>
      ),
    },
    {
      title: '冷链',
      key: 'coldchain',
      width: 60,
      render: (_: any, record: any) => (
        record.cold_chain_config?.required ? <Tag color="cyan">需冷链</Tag> : <span>-</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: tab === 'PENDING_REVIEW' ? 200 : 100,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            详情
          </Button>
          {tab === 'PENDING_REVIEW' && (
            <>
              <Button
                size="small" type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
              >
                通过
              </Button>
              <Button
                size="small" danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record)}
              >
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <SafetyCertificateOutlined />
            <span>商品审核中心</span>
            {tab === 'PENDING_REVIEW' && (
              <Badge count={pendingList.length} overflowCount={99}>
                <Tag color="orange">待审核</Tag>
              </Badge>
            )}
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
        <Tabs
          activeKey={tab}
          onChange={(key) => { setTab(key as any); setPage(1); }}
          items={[
            {
              key: 'PENDING_REVIEW',
              label: <span>待审核 <Badge count={pendingList.length} overflowCount={99} style={{ marginLeft: 4 }} /></span>,
            },
            {
              key: 'REVIEWED',
              label: `已审核`,
            },
          ]}
        />

        {/* 筛选栏 */}
        <Space wrap style={{ marginBottom: 16, width: '100%' }}>
          <Input
            placeholder="搜索商品/药店..."
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(1); }}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="商品类型"
            value={typeFilter}
            onChange={v => { setTypeFilter(v); setPage(1); }}
            style={{ width: 140 }}
            allowClear
            onClear={() => setTypeFilter('ALL')}
          >
            <Select.Option value="ALL">全部类型</Select.Option>
            <Select.Option value="RX">处方药</Select.Option>
            <Select.Option value="OTC">OTC</Select.Option>
            <Select.Option value="DEVICE">医疗器械</Select.Option>
            <Select.Option value="FOOD">保健品</Select.Option>
            <Select.Option value="DAILY">日用品</Select.Option>
            <Select.Option value="SERVICE">服务</Select.Option>
          </Select>
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={paginatedData}
          loading={loading}
          size="middle"
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: filteredList.length,
            onChange: (p) => setPage(p),
            showTotal: (total) => `共 ${total} 条`,
            showSizeChanger: false,
          }}
          locale={{ emptyText: tab === 'PENDING_REVIEW' ? '暂无待审核商品' : '暂无已审核商品' }}
        />
      </Card>

      {/* 商品详情弹窗 */}
      <Modal
        title={`商品详情 - ${selectedProduct?.name || ''}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>关闭</Button>,
          ...(tab === 'PENDING_REVIEW' && selectedProduct
            ? [
                <Button
                  key="reject" danger
                  onClick={() => { handleReject(selectedProduct); setDetailVisible(false); }}
                >
                  驳回
                </Button>,
                <Button
                  key="approve" type="primary"
                  onClick={() => { handleApprove(selectedProduct); setDetailVisible(false); }}
                >
                  审核通过
                </Button>,
              ]
            : []),
        ]}
        width={680}
      >
        {selectedProduct && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="商品ID" span={2}>{selectedProduct.id}</Descriptions.Item>
            <Descriptions.Item label="商品名称" span={2}>{selectedProduct.name}</Descriptions.Item>
            <Descriptions.Item label="商品类型">
              <Tag color={PRODUCT_TYPE_LABEL[selectedProduct.product_type]?.color}>
                {PRODUCT_TYPE_LABEL[selectedProduct.product_type]?.text || selectedProduct.product_type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="OTC标识">{selectedProduct.is_otc ? <Tag color="green">是</Tag> : '否'}</Descriptions.Item>
            <Descriptions.Item label="所属药店">
              <Tag color="blue">{selectedProduct.merchant_name}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="药店ID">{selectedProduct.merchant_id}</Descriptions.Item>
            <Descriptions.Item label="售价">
              <Text strong style={{ color: '#f5222d' }}>¥{selectedProduct.price}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="市场价">
              <Text delete>¥{selectedProduct.market_price || '-'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="库存">{selectedProduct.stock}</Descriptions.Item>
            <Descriptions.Item label="分类">{selectedProduct.category_name || '-'}</Descriptions.Item>
            <Descriptions.Item label="证照号" span={2}>{selectedProduct.otc_license_no || '-'}</Descriptions.Item>
            {selectedProduct.cold_chain_config?.required && (
              <>
                <Descriptions.Item label="冷链储存">{selectedProduct.cold_chain_config.storage_spec}</Descriptions.Item>
                <Descriptions.Item label="运输时效">{Math.round((selectedProduct.cold_chain_config.transport_duration_max || 0) / 60)}小时</Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="商品描述" span={2}>{selectedProduct.description || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ProductAuditPage;
