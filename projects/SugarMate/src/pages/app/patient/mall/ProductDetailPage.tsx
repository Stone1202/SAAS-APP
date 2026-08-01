/**
 * APP商城 — 商品详情页
 * 数据源：productStore（通过 productId 获取完整商品信息）
 * 
 * 闭环：商品管理维护商品 → 商城详情展示 → 规格选择 → 加入购物车/立即购买
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Typography, Space, Divider, InputNumber, Badge, Skeleton, FloatButton, message } from 'antd';
import {
  ShoppingCartOutlined, ThunderboltOutlined, LeftOutlined,
  ShareAltOutlined, StarFilled, MedicineBoxOutlined, CheckCircleFilled,
  WarningFilled,
} from '@ant-design/icons';
import { useProductStore, type Product, type ProductSpec } from '@/stores/productStore';

const { Title, Text, Paragraph } = Typography;

const CAT_EMOJI: Record<string, string> = {
  '血糖监测': '📟',
  '胰岛素注射': '💉',
  'OTC药品': '💊',
  '健康食品': '🍬',
  '医疗辅具': '🩹',
};

const formatSales = (count: number): string => {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return `${count}`;
};

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const nav = useNavigate();
  const { products, loading, loadProducts, loadProductDetail, currentProduct } = useProductStore();
  const [selectedSpecIndex, setSelectedSpecIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (products.length === 0) loadProducts({ page_size: 50 });
    // 先从列表中查找，找不到就拉取详情
    if (!products.find(p => p.id === productId)) {
      loadProductDetail(productId || '');
    }
  }, [productId]);

  // 直接使用 store 中的 currentProduct（如果跟路由 productId 匹配）或从 products 列表中查找
  const product: Product | null = useMemo(() => {
    if (currentProduct && currentProduct.id === productId) return currentProduct;
    return products.find(p => p.id === productId) || null;
  }, [currentProduct, products, productId]);

  // 当前选中的规格
  const currentSpec = useMemo(() => {
    if (!product || product.specifications.length === 0) return null;
    return product.specifications[selectedSpecIndex] || product.specifications[0];
  }, [product, selectedSpecIndex]);

  // 实际价格
  const actualPrice = currentSpec?.price_override ?? product?.price ?? 0;
  const stock = currentSpec?.stock ?? product?.stock ?? 0;
  const emoji = product ? (CAT_EMOJI[product.category_name] || '📦') : '📦';

  const handleAddToCart = () => {
    console.log('加入购物车:', { productId, specId: currentSpec?.id, quantity });
    message.success(`${product?.name} ×${quantity} 已加入购物车`);
  };

  const handleBuyNow = () => {
    // TODO: 创建订单
    console.log('立即购买:', { productId, specId: currentSpec?.id, quantity });
  };

  if (loading && !product) {
    return (
      <div style={{ padding: 12, background: '#f7f8fa', minHeight: '100vh' }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Title level={5}>商品不存在或已下架</Title>
        <Button onClick={() => nav(-1)}>返回</Button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 80, background: '#f7f8fa', minHeight: '100vh' }}>
      {/* 顶部导航 */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', borderBottom: '1px solid #f0f0f0',
      }}>
        <Button type="text" icon={<LeftOutlined />} onClick={() => nav(-1)} />
        <Text strong ellipsis style={{ flex: 1, textAlign: 'center', fontSize: 14 }}>
          商品详情
        </Text>
        <Button type="text" icon={<ShareAltOutlined />} />
      </div>

      {/* 商品大图 */}
      <div style={{
        height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 80, background: 'linear-gradient(135deg, #f0f5ff, #e6f7ff)',
        position: 'relative',
      }}>
        {emoji}
        {product.market_price > 0 && product.price / product.market_price <= 0.8 && (
          <Tag color="red" style={{ position: 'absolute', top: 12, left: 12, fontSize: 11 }}>
            {(100 - Math.round((product.price / product.market_price) * 100))}% OFF
          </Tag>
        )}
        {product.sales_count > 10000 && (
          <Tag color="volcano" style={{ position: 'absolute', top: 12, right: 12, fontSize: 11 }}>
            🔥 爆款
          </Tag>
        )}
      </div>

      {/* 商品基本信息 */}
      <Card bodyStyle={{ padding: '12px 16px' }} style={{ borderRadius: 0, marginBottom: 8 }}>
        {/* 价格行 */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <Text style={{ fontSize: 22, fontWeight: 700, color: '#f5222d' }}>
            ¥{actualPrice}
          </Text>
          {product.market_price > actualPrice && (
            <Text delete style={{ color: '#bbb', fontSize: 12 }}>
              ¥{product.market_price}
            </Text>
          )}
          {product.sales_count > 0 && (
            <Text style={{ fontSize: 11, color: '#999', marginLeft: 4 }}>
              {formatSales(product.sales_count)}人付款
            </Text>
          )}
        </div>

        {/* 标题 + 标签 */}
        <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
          <Title level={5} style={{ margin: 0, flex: 1 }}>
            {product.name}
          </Title>
        </div>

        <Space size={4} wrap style={{ marginTop: 8 }}>
          <Tag color="blue">
            <MedicineBoxOutlined /> {product.merchant_name}
          </Tag>
          <Tag>{product.category_name}</Tag>
          {product.is_otc ? (
            <Tag color="green">OTC</Tag>
          ) : (
            <Tag color="orange"><WarningFilled /> 处方器械</Tag>
          )}
          {product.stock > 0 ? (
            <Tag color="success" icon={<CheckCircleFilled />}>有货</Tag>
          ) : (
            <Tag color="error">缺货</Tag>
          )}
          <Tag>库存 {stock}</Tag>
          {(product as any).cold_chain_config?.required && (
            <Tag color="cyan">🧊 冷链</Tag>
          )}
        </Space>

        {/* 来源标签 */}
        <div style={{ marginTop: 12, fontSize: 11, color: '#999' }}>
          <Tag color="geekblue" style={{ fontSize: 10, lineHeight: '16px' }}>
            来源：商品管理 · ID: {product.id}
          </Tag>
          {product.otc_license_no && (
            <Text style={{ fontSize: 10, color: '#bbb', marginLeft: 8 }}>
              注册证号：{product.otc_license_no}
            </Text>
          )}
          {(product as any).cold_chain_config?.required && (product as any).cold_chain_config?.storage_spec && (
            <Text style={{ fontSize: 10, color: '#bbb', marginLeft: 8 }}>
              储存：{(product as any).cold_chain_config.storage_spec}
            </Text>
          )}
        </div>
      </Card>

      {/* 规格选择 */}
      {product.specifications.length > 0 && (
        <Card title="商品规格" bodyStyle={{ padding: '8px 16px 12px' }} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {product.specifications.map((spec, idx) => (
              <div
                key={spec.id}
                onClick={() => setSelectedSpecIndex(idx)}
                style={{
                  border: selectedSpecIndex === idx
                    ? '2px solid #1890ff' : '1px solid #e8e8e8',
                  borderRadius: 8, padding: '6px 14px',
                  cursor: spec.stock > 0 ? 'pointer' : 'not-allowed',
                  opacity: spec.stock > 0 ? 1 : 0.4,
                  background: selectedSpecIndex === idx ? '#e6f7ff' : '#fff',
                  fontSize: 13, transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}
              >
                <span>{spec.value}</span>
                {spec.price_override && spec.price_override !== product.price && (
                  <Text style={{
                    fontSize: 11, color: '#f5222d', fontWeight: 600, marginTop: 2,
                  }}>
                    ¥{spec.price_override}
                  </Text>
                )}
                <Text style={{ fontSize: 10, color: '#999' }}>库存{spec.stock}</Text>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 商品描述 */}
      <Card title="商品详情" bodyStyle={{ padding: '8px 16px 12px' }} style={{ marginBottom: 8 }}>
        <Paragraph style={{ fontSize: 13, color: '#666', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {product.description || '暂无详情描述'}
        </Paragraph>

        {/* 规格明细表 */}
        {product.specifications.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text strong style={{ fontSize: 13 }}>规格明细</Text>
            <div style={{
              marginTop: 8, background: '#fafafa', borderRadius: 8, padding: 8,
            }}>
              {product.specifications.map(spec => (
                <div key={spec.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '4px 8px', fontSize: 12, color: '#666',
                  borderBottom: '1px solid #f5f5f5',
                }}>
                  <span>{spec.name}：{spec.value}</span>
                  <Text style={{
                    fontWeight: 500,
                    color: spec.price_override ? '#f5222d' : '#666',
                  }}>
                    {spec.price_override ? `¥${spec.price_override}` : `¥${product.price}`}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 底部购买栏 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #f0f0f0',
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <Text style={{ fontSize: 12, color: '#999' }}>数量</Text>
          <InputNumber
            min={1} max={stock} value={quantity} onChange={v => setQuantity(v || 1)}
            size="small" style={{ width: 70 }}
          />
        </div>
        <Button
          icon={<ShoppingCartOutlined />}
          size="large"
          style={{ flex: 1, borderRadius: 20, height: 42, fontWeight: 600, borderColor: '#ff4d4f', color: '#ff4d4f' }}
          onClick={handleAddToCart}
        >
          加入购物车
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<ThunderboltOutlined />}
          style={{
            flex: 1, borderRadius: 20, height: 42, fontWeight: 600,
            background: 'linear-gradient(135deg, #ff4d4f, #f5222d)', border: 'none',
          }}
          onClick={handleBuyNow}
        >
          立即购买
        </Button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
