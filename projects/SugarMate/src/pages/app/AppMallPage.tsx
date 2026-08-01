/**
 * APP商城页 — 健康商城（产品浏览）
 * 数据源：productStore（统一商品中心），Mall/Live 共用
 * PRD §2.7.4.1 Tab2子页面：商品分类 + 搜索 + 商品列表 + 购物车
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Tag, Badge, Spin, Empty } from 'antd';
import {
  SearchOutlined, ShoppingCartOutlined, RightOutlined,
  StarFilled, MedicineBoxOutlined,
} from '@ant-design/icons';
import MobileFrame, { APP_PATIENT_TABS } from '@/components/MobileFrame';
import { useProductStore, type Product } from '@/stores/productStore';

/* ========== 销售数格式化 ========== */
function formatSales(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万人付款`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k人付款`;
  return `${count}人付款`;
}

/* ========== 分类 emoji 映射 ========== */
const CAT_EMOJI: Record<string, string> = {
  '血糖监测': '📟',
  '胰岛素注射': '💉',
  'OTC药品': '💊',
  '健康食品': '🍬',
  '医疗辅具': '🩹',
};

/* ========== tag 推断 ========== */
function inferTag(product: Product): { text: string; color: string } | null {
  if (product.sales_count > 10000) return { text: '爆款', color: 'red' };
  if (Date.now() / 1000 - product.created_at < 7 * 86400) return { text: '新品', color: 'green' };
  if (product.market_price > 0 && product.price / product.market_price < 0.75) return { text: '折扣', color: 'volcano' };
  return null;
}

/* ========== 主组件 ========== */
const AppMallPage: React.FC = () => {
  const nav = useNavigate();
  const { products, categories, loading, loadProducts, loadCategories } = useProductStore();
  const [activeCat, setActiveCat] = useState('全部');

  // 初始化加载
  useEffect(() => {
    loadProducts({ page_size: 50 });
    loadCategories();
  }, []);

  // 按分类过滤（分类名匹配 category_name）
  const filteredProducts = activeCat === '全部'
    ? products.filter(p => p.status === 'ON_SHELF')
    : products.filter(p => p.status === 'ON_SHELF' && p.category_name === activeCat);

  // 构造分类列表（动态+固定项）
  const displayCategories = [
    { name: '全部', icon: '🏪', active: activeCat === '全部', id: 'all' },
    ...categories.map(c => ({
      name: c.name,
      icon: c.icon || CAT_EMOJI[c.name] || '📦',
      active: activeCat === c.name,
      id: c.id,
    })),
  ];

  return (
    <MobileFrame title="健康商城" tabs={APP_PATIENT_TABS} basePath="/app">
      <div style={{ padding: '12px 12px 24px', background: '#f7f8fa', minHeight: '100%' }}>

        {/* === 搜索栏 + 购物车 === */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div
            onClick={() => nav('/app/mall/search')}
            style={{
              flex: 1, background: '#fff', borderRadius: 20, padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              border: '1px solid #f0f0f0',
            }}
          >
            <SearchOutlined style={{ color: '#bbb' }} />
            <span style={{ fontSize: 12, color: '#bbb' }}>搜索糖尿病相关商品</span>
          </div>
          <div
            onClick={() => nav('/app/mall/cart')}
            style={{
              width: 40, height: 40, borderRadius: '50%', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', border: '1px solid #f0f0f0', position: 'relative',
            }}
          >
            <ShoppingCartOutlined style={{ fontSize: 18, color: '#1890ff' }} />
            <Badge count={3} size="small" offset={[4, -4]} />
          </div>
        </div>

        {/* === Banner === */}
        <div style={{
          background: 'linear-gradient(135deg, #e6f7ff, #bae7ff)',
          borderRadius: 12, padding: '16px', marginBottom: 14,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>CGM传感器特惠</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>满199减30·限时抢购</div>
            <Tag color="red" style={{ marginTop: 6, borderRadius: 10, fontSize: 10 }}>
              立即抢购 <RightOutlined />
            </Tag>
          </div>
          <div style={{ fontSize: 48 }}>📟</div>
        </div>

        {/* === 分类（动态+兜底） === */}
        <div style={{
          display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4,
        }}>
          {displayCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setActiveCat(cat.name)}
              style={{
                background: activeCat === cat.name ? '#1890ff' : '#fff',
                color: activeCat === cat.name ? '#fff' : '#666',
                borderRadius: 16, padding: '6px 14px', fontSize: 11,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                border: activeCat === cat.name ? 'none' : '1px solid #f0f0f0',
                fontWeight: activeCat === cat.name ? 600 : 400,
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </div>
          ))}
        </div>

        {/* === 商品列表 === */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
        ) : filteredProducts.length === 0 ? (
          <Empty description="暂无商品" />
        ) : (
          <Row gutter={8}>
            {filteredProducts.map((product) => {
              const tag = inferTag(product);
              const catEmoji = CAT_EMOJI[product.category_name] || '📦';
              return (
                <Col span={12} key={product.id} style={{ marginBottom: 10 }}>
                  <Card
                    size="small"
                    style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}
                    bodyStyle={{ padding: 0 }}
                    onClick={() => nav(`/app/mall/product/${product.id}`)}
                  >
                    {/* 商品图 */}
                    <div style={{
                      height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 48, position: 'relative',
                      background: 'linear-gradient(135deg, #f0f5ff, #fafafa)',
                    }}>
                      {catEmoji}
                      {tag && (
                        <Tag color={tag.color} style={{
                          position: 'absolute', top: 4, left: 4, fontSize: 10,
                          borderRadius: 4, margin: 0, padding: '1px 6px',
                        }}>
                          {tag.text}
                        </Tag>
                      )}
                    </div>
                    {/* 信息 */}
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{
                        fontSize: 12, fontWeight: 500, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        lineHeight: 1.4, color: '#1a1a2e',
                      }}>
                        {product.name}
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4,
                      }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#f5222d' }}>
                          ¥{product.price}
                        </span>
                        {product.market_price > product.price && (
                          <span style={{ fontSize: 10, color: '#bbb', textDecoration: 'line-through' }}>
                            ¥{product.market_price}
                          </span>
                        )}
                      </div>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6,
                      }}>
                        <span style={{ fontSize: 10, color: '#bbb' }}>
                          <StarFilled style={{ color: '#faad14', marginRight: 2, fontSize: 10 }} />
                          {product.rating ?? 4.5}
                        </span>
                        <span style={{ fontSize: 9, color: '#bbb' }}>
                          {formatSales(product.sales_count)}
                        </span>
                      </div>
                      <div style={{ fontSize: 9, color: '#ccc', marginTop: 4 }}>
                        <MedicineBoxOutlined style={{ marginRight: 2 }} />{product.merchant_name}
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </MobileFrame>
  );
};

export default AppMallPage;
