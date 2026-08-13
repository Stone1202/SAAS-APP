/**
 * LIVE端 — 直播商品详情页
 * V3.0 — 数据源：liveStore（LiveProduct）+ productStore（商品源完整信息）
 * 闭环：商品管理 → 直播间选品 → LIVE商城 → 商品详情 → 下单购买
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Typography, Skeleton, InputNumber, Space, FloatButton } from 'antd';
import {
  ShoppingCartOutlined, ThunderboltOutlined, ArrowLeftOutlined,
  MedicineBoxOutlined, CheckCircleFilled, WarningFilled, ShopOutlined,
} from '@ant-design/icons';
import { useLiveStore, type LiveProduct } from '@/stores/liveStore';
import { useProductStore, type Product } from '@/stores/productStore';

const { Title, Text, Paragraph } = Typography;

const CAT_EMOJI: Record<string, string> = {
  '血糖监测': '📟', '胰岛素注射': '💉', 'OTC药品': '💊', '健康食品': '🍬', '医疗辅具': '🩹',
};

const formatSales = (count: number): string => {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万已售`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k已售`;
  return `${count}已售`;
};

const LiveProductDetailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const liveProductId = searchParams.get('id') || '';
  const roomId = searchParams.get('roomId') || '';

  const { liveProducts, initMockData } = useLiveStore();
  const { products: allProducts, loadProducts } = useProductStore();

  const [selectedSpecIndex, setSelectedSpecIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    initMockData();
    loadProducts({ page_size: 50 });
  }, []);

  // 当前 LiveProduct
  const liveProduct = useMemo(() => {
    return liveProducts.find(lp => lp.id === liveProductId) || null;
  }, [liveProducts, liveProductId]);

  // 回源商品（来自 productStore）
  const sourceProduct = useMemo(() => {
    if (!liveProduct) return null;
    return allProducts.find(p => p.id === liveProduct.productId) || null;
  }, [allProducts, liveProduct]);

  const currentSpec = useMemo(() => {
    if (!sourceProduct || sourceProduct.specifications.length === 0) return null;
    return sourceProduct.specifications[selectedSpecIndex] || sourceProduct.specifications[0];
  }, [sourceProduct, selectedSpecIndex]);

  const originPrice = currentSpec?.price_override ?? sourceProduct?.price ?? liveProduct?.normalPrice ?? 0;
  const livePrice = liveProduct?.livePrice || originPrice;
  const stock = currentSpec?.stock ?? sourceProduct?.stock ?? liveProduct?.allocatedStock ?? 0;
  const emoji = sourceProduct ? (CAT_EMOJI[sourceProduct.category_name] || '📦') : (liveProduct?.productImage || '📦');

  // Loading
  const isLoading = !liveProduct && liveProducts.length === 0;

  if (isLoading) {
    return <div style={{ padding: 12, background: '#0a0e27', minHeight: '100vh' }}>
      <Skeleton active paragraph={{ rows: 6 }} />
    </div>;
  }

  if (!liveProduct) {
    return (
      <div style={{ padding: 40, textAlign: 'center', background: '#0a0e27', minHeight: '100vh', color: '#fff' }}>
        <Title level={5} style={{ color: '#fff' }}>商品不存在或已下架</Title>
        <Button onClick={() => nav(-1)}>返回商城</Button>
      </div>
    );
  }

  const discountPercent = livePrice < originPrice ? Math.round((1 - livePrice / originPrice) * 100) : 0;

  return (
    <div style={{ paddingBottom: 80, background: 'linear-gradient(180deg, #0a0e27 0%, #1a1a2e 100%)', minHeight: '100vh' }}>
      {/* 顶部导航 */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', padding: '8px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Button type="text" icon={<ArrowLeftOutlined style={{ color: '#fff' }} />} onClick={() => nav(-1)} />
        <Text strong style={{ flex: 1, textAlign: 'center', color: '#e5e7eb', fontSize: 14 }}>直播商品详情</Text>
      </div>

      {/* 商品图 */}
      <div style={{
        height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 72, background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
        position: 'relative',
      }}>
        {emoji}
        {discountPercent > 0 && (
          <Tag color="red" style={{ position: 'absolute', top: 12, left: 12, fontSize: 11 }}>
            直播 {discountPercent}% OFF
          </Tag>
        )}
        {liveProduct.isPinned && (
          <Tag color="volcano" style={{ position: 'absolute', top: 12, right: 12, fontSize: 11 }}>
            🔥 主播推荐
          </Tag>
        )}
      </div>

      {/* 价格信息 */}
      <Card bodyStyle={{ padding: '12px 16px' }} style={{
        background: 'rgba(30,41,59,0.9)', border: 'none', borderRadius: 0, marginBottom: 8,
      }}>
        {/* 直播价 + 源头对比 */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: 700, color: '#ff4d4f' }}>
            ¥{livePrice}
          </Text>
          <Text delete style={{ color: '#6b7280', fontSize: 13 }}>
            ¥{originPrice}
          </Text>
          {discountPercent > 0 && (
            <Tag color="red" style={{ borderRadius: 4 }}>立省 ¥{(originPrice - livePrice).toFixed(0)}</Tag>
          )}
        </div>

        {/* 商品名 */}
        <Title level={5} style={{ color: '#e5e7eb', marginTop: 10, marginBottom: 0 }}>
          <ShopOutlined style={{ color: '#ff4d4f', marginRight: 6 }} />
          {liveProduct.productName || sourceProduct?.name || ''}
        </Title>

        {/* 标签 */}
        <Space size={4} wrap style={{ marginTop: 8 }}>
          {sourceProduct && (
            <Tag color="blue"><MedicineBoxOutlined /> {sourceProduct.merchant_name}</Tag>
          )}
          {sourceProduct && <Tag>{sourceProduct.category_name}</Tag>}
          {sourceProduct?.is_otc ? <Tag color="green">OTC</Tag> : sourceProduct ? <Tag color="orange"><WarningFilled /> 处方器械</Tag> : null}
          {stock > 0 ? <Tag color="success"><CheckCircleFilled /> 有货</Tag> : <Tag color="error">缺货</Tag>}
          <Tag>库存 {stock}</Tag>
          {liveProduct.roomName && <Tag color="orange">📺 {liveProduct.roomName}</Tag>}
        </Space>

        {/* 来源关联信息 */}
        <div style={{ marginTop: 12, fontSize: 11, display: 'flex', gap: 12 }}>
          <Tag color="geekblue" style={{ fontSize: 10, lineHeight: '16px' }}>
            入口：商品管理 · {sourceProduct?.id || liveProduct.productId}
          </Tag>
          <Tag color="purple" style={{ fontSize: 10, lineHeight: '16px' }}>
            直播商品编号：{liveProduct.id}
          </Tag>
          {sourceProduct?.sales_count > 0 && (
            <Text style={{ color: '#6b7280', fontSize: 10 }}>
              {formatSales(sourceProduct.sales_count)}
            </Text>
          )}
        </div>
      </Card>

      {/* 规格选择 */}
      {sourceProduct && sourceProduct.specifications.length > 0 && (
        <Card title={<Text style={{ color: '#e5e7eb' }}>商品规格</Text>} bodyStyle={{ padding: '8px 16px 12px' }}
          style={{ background: 'rgba(30,41,59,0.9)', border: 'none', marginBottom: 8 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {sourceProduct.specifications.map((spec, idx) => (
              <div
                key={spec.id}
                onClick={() => setSelectedSpecIndex(idx)}
                style={{
                  border: selectedSpecIndex === idx
                    ? '2px solid #ff4d4f' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, padding: '6px 14px',
                  cursor: spec.stock > 0 ? 'pointer' : 'not-allowed',
                  opacity: spec.stock > 0 ? 1 : 0.4,
                  background: selectedSpecIndex === idx ? 'rgba(255,77,79,0.1)' : 'transparent',
                  fontSize: 13, color: '#e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}
              >
                <span>{spec.value}</span>
                {spec.price_override && (
                  <Text style={{ fontSize: 11, color: '#ff4d4f', fontWeight: 600 }}>¥{spec.price_override}</Text>
                )}
                <Text style={{ fontSize: 10, color: '#6b7280' }}>库存{spec.stock}</Text>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 商品描述 */}
      {sourceProduct?.description && (
        <Card title={<Text style={{ color: '#e5e7eb' }}>商品详情</Text>} bodyStyle={{ padding: '8px 16px 12px' }}
          style={{ background: 'rgba(30,41,59,0.9)', border: 'none' }}>
          <Paragraph style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {sourceProduct.description}
          </Paragraph>
        </Card>
      )}

      {/* 底部购买栏 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.3)', zIndex: 10,
      }}>
        <InputNumber
          min={1} max={stock} value={quantity}
          onChange={v => setQuantity(v || 1)}
          size="small" style={{ width: 70 }}
        />
        <Button
          icon={<ShoppingCartOutlined />} size="large"
          style={{ flex: 1, borderRadius: 20, height: 42, fontWeight: 600, color: '#ff4d4f', borderColor: '#ff4d4f' }}
        >
          加入购物车
        </Button>
        <Button
          type="primary" icon={<ThunderboltOutlined />} size="large"
          style={{ flex: 1, borderRadius: 20, height: 42, fontWeight: 600, background: 'linear-gradient(135deg, #ff4d4f, #f5222d)', border: 'none' }}
        >
          直播价购买
        </Button>
      </div>
    </div>
  );
};

export default LiveProductDetailPage;
