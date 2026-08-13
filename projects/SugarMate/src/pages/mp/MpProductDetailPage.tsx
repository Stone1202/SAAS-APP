/**
 * 小程序端 — 商品详情页
 * 数据源：productStore（统一商品中心）
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Typography, Skeleton, InputNumber, Space, FloatButton } from 'antd';
import {
  ShoppingCartOutlined, ThunderboltOutlined, LeftOutlined,
  MedicineBoxOutlined, CheckCircleFilled, WarningFilled,
} from '@ant-design/icons';
import { useProductStore, type Product } from '@/stores/productStore';

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

const MpProductDetailPage: React.FC = () => {
  const nav = useNavigate();
  const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const productId = searchParams.get('productId') || 'p-001';

  const { products, loading, loadProducts } = useProductStore();
  const [selectedSpecIndex, setSelectedSpecIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => { loadProducts({ page_size: 50 }); }, []);

  const product = useMemo(() => products.find(p => p.id === productId) || null, [products, productId]);

  const currentSpec = useMemo(() => {
    if (!product || product.specifications.length === 0) return null;
    return product.specifications[selectedSpecIndex] || product.specifications[0];
  }, [product, selectedSpecIndex]);

  const actualPrice = currentSpec?.price_override ?? product?.price ?? 0;
  const stock = currentSpec?.stock ?? product?.stock ?? 0;
  const emoji = product ? (CAT_EMOJI[product.category_name] || '📦') : '📦';

  if (loading) return <div style={{ padding: 12 }}><Skeleton active paragraph={{ rows: 6 }} /></div>;
  if (!product) return <div style={{ padding: 40, textAlign: 'center' }}><Title level={5}>商品不存在</Title><Button onClick={() => nav(-1)}>返回</Button></div>;

  return (
    <div style={{ paddingBottom: 80, background: '#f7f8fa', minHeight: '100vh' }}>
      {/* 顶部 */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', padding: '8px 12px',
        borderBottom: '1px solid #f0f0f0',
      }}>
        <Button type="text" icon={<LeftOutlined />} onClick={() => nav(-1)} />
        <Text strong style={{ flex: 1, textAlign: 'center' }}>商品详情</Text>
      </div>

      {/* 预览区 */}
      <div style={{
        height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 64, background: 'linear-gradient(135deg, #f0f5ff, #e6f7ff)',
      }}>
        {emoji}
      </div>

      {/* 基本信息 */}
      <Card bodyStyle={{ padding: '12px 16px' }} style={{ borderRadius: 0, marginBottom: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: 700, color: '#f5222d' }}>¥{actualPrice}</Text>
        {product.market_price > actualPrice && (
          <Text delete style={{ color: '#bbb', fontSize: 12, marginLeft: 6 }}>
            ¥{product.market_price}
          </Text>
        )}
        <Title level={5} style={{ marginTop: 8 }}>
          {product.name}
        </Title>
        <Space size={4} wrap style={{ marginTop: 8 }}>
          <Tag color="blue"><MedicineBoxOutlined /> {product.merchant_name}</Tag>
          <Tag>{product.category_name}</Tag>
          {product.is_otc ? <Tag color="green">OTC</Tag> : <Tag color="orange"><WarningFilled /> 处方器械</Tag>}
          {stock > 0 ? <Tag color="success"><CheckCircleFilled /> 有货</Tag> : <Tag color="error">缺货</Tag>}
          <Tag>库存 {stock}</Tag>
        </Space>
        <div style={{ marginTop: 10, fontSize: 11, color: '#999' }}>
          <Tag color="geekblue" style={{ fontSize: 10 }}>来源：商品管理 · ID: {product.id}</Tag>
          {product.sales_count > 0 && <Text style={{ fontSize: 10, color: '#bbb', marginLeft: 8 }}>已售 {formatSales(product.sales_count)}</Text>}
        </div>
      </Card>

      {/* 规格 */}
      {product.specifications.length > 0 && (
        <Card title="商品规格" bodyStyle={{ padding: '8px 16px 12px' }} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {product.specifications.map((spec, idx) => (
              <div
                key={spec.id}
                onClick={() => setSelectedSpecIndex(idx)}
                style={{
                  border: selectedSpecIndex === idx ? '2px solid #1890ff' : '1px solid #e8e8e8',
                  borderRadius: 8, padding: '6px 14px',
                  cursor: spec.stock > 0 ? 'pointer' : 'not-allowed',
                  opacity: spec.stock > 0 ? 1 : 0.4,
                  background: selectedSpecIndex === idx ? '#e6f7ff' : '#fff',
                  fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}
              >
                <span>{spec.value}</span>
                {spec.price_override && spec.price_override !== product.price && (
                  <Text style={{ fontSize: 11, color: '#f5222d', fontWeight: 600 }}>¥{spec.price_override}</Text>
                )}
                <Text style={{ fontSize: 10, color: '#999' }}>库存{spec.stock}</Text>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 描述 */}
      <Card title="商品详情" bodyStyle={{ padding: '8px 16px 12px' }}>
        <Paragraph style={{ fontSize: 13, color: '#666', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {product.description || '暂无详情描述'}
        </Paragraph>
      </Card>

      {/* 购买栏 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #f0f0f0',
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)', zIndex: 10,
      }}>
        <InputNumber min={1} max={stock} value={quantity} onChange={v => setQuantity(v || 1)} size="small" style={{ width: 70 }} />
        <Button icon={<ShoppingCartOutlined />} size="large" style={{ flex: 1, borderRadius: 20, height: 42, fontWeight: 600 }}>加购</Button>
        <Button type="primary" icon={<ThunderboltOutlined />} size="large" style={{ flex: 1, borderRadius: 20, height: 42, fontWeight: 600, background: 'linear-gradient(135deg, #ff4d4f, #f5222d)', border: 'none' }}>立即购买</Button>
      </div>
    </div>
  );
};

export default MpProductDetailPage;
