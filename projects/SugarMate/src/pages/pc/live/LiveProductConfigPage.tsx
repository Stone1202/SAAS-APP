/**
 * 直播商品配置 — PC 运营后台
 * V3.0 — 商品池来自 productStore（统一商品中心），LiveProduct 通过 productId 关联
 * 
 * 数据流：productStore.products（中心商品池） → Transfer 选择 → liveStore.addLiveProducts
 * LIVE端读取：liveStore.liveProducts + productStore.products（通过productId回源查完整信息）
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, InputNumber, Tag, Space,
  Typography, message, Popconfirm, Transfer, Switch,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ShoppingOutlined,
  PushpinOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useLiveStore, type LiveProduct, type LiveRoom } from '@/stores/liveStore';
import { useProductStore, type Product } from '@/stores/productStore';

const { Title } = Typography;

const CAT_EMOJI: Record<string, string> = {
  '血糖监测': '📟',
  '胰岛素注射': '💉',
  'OTC药品': '💊',
  '健康食品': '🍬',
  '医疗辅具': '🩹',
};

const LiveProductConfigPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const filterRoomId = searchParams.get('roomId') || '';

  const {
    liveProducts, liveRooms, liveSessions,
    addLiveProducts, updateLiveProduct, removeLiveProduct, pinProduct, unpinProduct,
    initMockData,
  } = useLiveStore();

  const {
    products: allProducts, loading: productsLoading,
    loadProducts,
  } = useProductStore();

  const [search, setSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState<string>(filterRoomId);
  const [batchOpen, setBatchOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(filterRoomId);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LiveProduct | null>(null);
  const [editForm] = Form.useForm();

  // 初始化数据
  useEffect(() => { initMockData(); loadProducts({ page_size: 50 }); }, []);
  useEffect(() => { setRoomFilter(filterRoomId); setSelectedRoomId(filterRoomId); }, [filterRoomId]);

  // 筛选
  const filteredProducts = useMemo(() => {
    let list = liveProducts;
    if (roomFilter) list = list.filter(p => p.roomId === roomFilter);
    if (search) {
      const kw = search.toLowerCase();
      list = list.filter(p => p.productName.toLowerCase().includes(kw));
    }
    return [...list].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return a.sortOrder - b.sortOrder;
    });
  }, [liveProducts, roomFilter, search]);

  // 仅直播带货类型的直播间（目标直播间选择时过滤）
  const shoppingRooms = useMemo(() => {
    const shoppingSessionIds = new Set(
      liveSessions.filter(s => s.liveType === 'shopping').map(s => s.id)
    );
    return liveRooms.filter(r => shoppingSessionIds.has(r.sessionId));
  }, [liveRooms, liveSessions]);

  // 商品池 Transfer dataSource（来自 productStore，只展示已上架商品）
  const transferDataSource = useMemo(() => {
    return allProducts
      .filter(p => p.status === 'ON_SHELF')
      .map(p => ({
        key: p.id,
        title: p.name,
        price: p.price,
        image: CAT_EMOJI[p.category_name] || '📦',
        description: p.merchant_name,
      }));
  }, [allProducts]);

  // 批量添加：从 productStore 选择商品 → 创建 LiveProduct
  const handleBatchAdd = () => {
    if (!selectedRoomId) { message.warning('请先选择目标直播间'); return; }
    if (targetKeys.length === 0) { message.warning('请选择要添加的商品'); return; }
    const room = liveRooms.find(r => r.id === selectedRoomId);
    const existingIds = liveProducts.filter(p => p.roomId === selectedRoomId).map(p => p.productId);
    const newProducts: LiveProduct[] = targetKeys
      .filter(k => !existingIds.includes(k))
      .map((key, i) => {
        const product = allProducts.find(p => p.id === key);
        if (!product) return null!;
        return {
          id: `LP-${Date.now().toString(36)}-${i}`,
          productId: product.id,
          productName: product.name,
          productImage: CAT_EMOJI[product.category_name] || '📦',
          roomId: selectedRoomId,
          roomName: room?.roomName || '',
          normalPrice: product.price,
          livePrice: product.price > 50 ? Math.round(product.price * 0.8 * 100) / 100 : product.price,
          allocatedStock: Math.min(product.stock, 200),
          sortOrder: liveProducts.filter(p => p.roomId === selectedRoomId).length + i + 1,
          isPinned: false,
          status: 'active' as const,
        };
      }).filter(Boolean) as LiveProduct[];
    if (newProducts.length === 0) {
      message.info('所选商品已全部在当前直播间中');
      setBatchOpen(false);
      return;
    }
    addLiveProducts(newProducts);
    message.success(`已添加 ${newProducts.length} 件商品（来源：商品管理）`);
    setBatchOpen(false);
    setTargetKeys([]);
  };

  const handleEdit = (product: LiveProduct) => {
    setEditingProduct(product);
    editForm.setFieldsValue(product);
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    const values = await editForm.validateFields();
    if (editingProduct) {
      updateLiveProduct(editingProduct.id, values);
      message.success('商品配置已更新');
    }
    setEditOpen(false);
  };

  const handleTogglePin = (product: LiveProduct) => {
    if (product.isPinned) unpinProduct(product.id);
    else pinProduct(product.id);
  };

  const handleToggleStatus = (product: LiveProduct) => {
    updateLiveProduct(product.id, {
      status: product.status === 'active' ? 'paused' : 'active',
    });
  };

  const selectedRoomName = roomFilter
    ? liveRooms.find(r => r.id === roomFilter)?.roomName
    : '';

  // 回源查 productStore 获取商品完整信息的辅助函数
  const getSourceProduct = (productId: string) => allProducts.find(p => p.id === productId);

  const columns: ColumnsType<LiveProduct> = [
    {
      title: '商品', key: 'product', width: 280,
      render: (_, r) => {
        const source = getSourceProduct(r.productId);
        return (
          <Space>
            <span style={{ fontSize: 20 }}>{r.productImage || '📦'}</span>
            <div>
              <Space size={4}>
                {r.isPinned && <PushpinOutlined style={{ color: '#ff4d4f' }} />}
                <span style={{ fontWeight: 500 }}>{r.productName}</span>
                {source && (
                  <Tag style={{ fontSize: 10, lineHeight: '16px' }} color="blue">
                    来源：商品管理 {source.id}
                  </Tag>
                )}
              </Space>
              <div style={{ fontSize: 11, color: '#999' }}>
                原价 ¥{r.normalPrice} → <span style={{ color: '#ff4d4f', fontWeight: 500 }}>直播价 ¥{r.livePrice}</span>
                {source && <span style={{ marginLeft: 8 }}>｜总库存 {source.stock}</span>}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: '直播间', dataIndex: 'roomName', key: 'roomName', width: 140, ellipsis: true,
    },
    {
      title: '直播库存', key: 'stock', width: 80, align: 'center' as const,
      render: (_, r) => <span>{r.allocatedStock}</span>,
    },
    {
      title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 60, align: 'center' as const,
    },
    {
      title: '状态', key: 'status', width: 80, align: 'center' as const,
      render: (_, r) => (
        <Switch
          size="small"
          checked={r.status === 'active'}
          onChange={() => handleToggleStatus(r)}
          checkedChildren="上架"
          unCheckedChildren="下架"
        />
      ),
    },
    {
      title: '操作', key: 'action', width: 180, fixed: 'right' as const,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" type="link"
            onClick={() => handleTogglePin(record)}>
            {record.isPinned ? '取消置顶' : '置顶'}
          </Button>
          <Button size="small" icon={<EditOutlined />} type="link"
            onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除此商品？" onConfirm={() => removeLiveProduct(record.id)}>
            <Button size="small" icon={<DeleteOutlined />} type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            <ShoppingOutlined /> 直播商品配置
            {selectedRoomName && <Tag color="orange" style={{ marginLeft: 12 }}>{selectedRoomName}</Tag>}
            <Tag color="blue" style={{ marginLeft: 8, fontSize: 11 }}>
              商品池来源：商品管理（{transferDataSource.length} 件可用）
            </Tag>
          </Title>
        }
        extra={
          <Space>
            <Select
              allowClear placeholder="按直播间筛选"
              style={{ width: 200 }}
              value={roomFilter || undefined}
              onChange={(v) => setRoomFilter(v || '')}
              options={liveRooms.map(r => ({ label: r.roomName, value: r.id }))}
            />
            <Input.Search
              placeholder="搜索商品"
              allowClear style={{ width: 180 }}
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setBatchOpen(true)}>
              批量添加商品
            </Button>
          </Space>
        }
      >
        <Table<LiveProduct>
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: t => `共 ${t} 件` }}
          scroll={{ x: 850 }}
        />
      </Card>

      {/* ====== 批量添加商品弹窗（穿梭框，来源=productStore） ====== */}
      <Modal
        title="批量添加商品到直播间（商品来源：商品管理）"
        open={batchOpen}
        onCancel={() => setBatchOpen(false)}
        onOk={handleBatchAdd}
        width={720}
        okText="添加选中商品"
        cancelText="取消"
      >
        <Form layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item label="目标直播间" required>
            <Select
              style={{ width: 220 }}
              value={selectedRoomId}
              onChange={(v) => setSelectedRoomId(v)}
              options={shoppingRooms.map(r => ({ label: r.roomName, value: r.id }))}
            />
          </Form.Item>
        </Form>
        <Transfer
          dataSource={transferDataSource}
          targetKeys={targetKeys}
          onChange={(keys) => setTargetKeys(keys as string[])}
          render={item => `${item.image} ${item.title} (¥${item.price} · ${item.description})`}
          listStyle={{ width: 300, height: 380 }}
          showSearch
          filterOption={(inputValue, item) =>
            item.title.toLowerCase().includes(inputValue.toLowerCase())
          }
        />
      </Modal>

      {/* ====== 编辑弹窗 ====== */}
      <Modal
        title="编辑商品配置"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleEditSubmit}
        width={480}
        okText="保存"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="livePrice" label="直播专属价（元）" rules={[{ required: true }]}>
            <InputNumber min={0} max={99999} precision={2} style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
          <Form.Item name="allocatedStock" label="直播专享库存" rules={[{ required: true }]}>
            <InputNumber min={1} max={99999} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sortOrder" label="展示排序">
            <InputNumber min={1} max={999} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LiveProductConfigPage;
