/**
 * LIVE端 — 直播商品页（观众视角）
 * V3.0 — 数据源：liveStore（已配置到该直播间的LiveProduct）
 * 通过 productId 回源 productStore 获取完整商品信息
 */
import React, { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Typography, Empty, Tag, Spin } from 'antd';
import { ShoppingCartOutlined, FireOutlined } from '@ant-design/icons';
import { useLiveStore } from '@/stores/liveStore';
import { useProductStore, type Product } from '@/stores/productStore';

const { Title, Text } = Typography;

const CAT_EMOJI: Record<string, string> = {
  '血糖监测': '📟',
  '胰岛素注射': '💉',
  'OTC药品': '💊',
  '健康食品': '🍬',
  '医疗辅具': '🩹',
};

const formatSales = (count: number): string => {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万已售`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k已售`;
  return `${count}已售`;
};

const LiveProductPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const roomId = searchParams.get('roomId') || 'RM-003';
  const viewerRole = searchParams.get('viewer') || 'audience';

  const { liveProducts, initMockData } = useLiveStore();
  const { products: allProducts, loadProducts, loading: productsLoading } = useProductStore();

  useEffect(() => {
    initMockData();
    loadProducts({ page_size: 50 });
  }, []);

  // 当前直播间上架中的商品
  const roomProducts = useMemo(() => {
    return liveProducts
      .filter(p => p.roomId === roomId && p.status === 'active')
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.sortOrder - b.sortOrder;
      });
  }, [liveProducts, roomId]);

  // 通过 productId 获取商品源的完整信息
  const getSourceProduct = (productId: string): Product | undefined =>
    allProducts.find(p => p.id === productId);

  return (
    <div style={{
      padding: '12px', minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0e27 0%, #1a1a2e 100%)',
    }}>
      {/* 头部 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16,
      }}>
        <div>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>直播商品</Title>
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>共 {roomProducts.length} 件好物</Text>
        </div>
        {viewerRole !== 'audience' && (
          <Tag color="cyan">🎤 {viewerRole}</Tag>
        )}
      </div>

      {/* 内容 */}
      {roomProducts.length === 0 ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 300,
        }}>
          <Empty description={<span style={{ color: '#9ca3af' }}>暂未添加商品</span>} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {roomProducts.map((lp) => {
            const source = getSourceProduct(lp.productId);
            const emoji = lp.productImage || (source ? CAT_EMOJI[source.category_name] || '📦' : '📦');
            const normalPrice = source ? source.price : lp.normalPrice;
            const marketPrice = source?.market_price;
            const totalStock = source?.stock || lp.allocatedStock;
            const sales = source?.sales_count || 0;

            return (
              <Card
                key={lp.id}
                size="small"
                style={{
                  background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))',
                  border: lp.isPinned ? '1px solid rgba(245,34,45,0.4)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, backdropFilter: 'blur(12px)',
                }}
                bodyStyle={{ padding: '10px 12px' }}
                onClick={() => nav(`/live/product-detail?id=${lp.id}&roomId=${roomId}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* 商品图 */}
                  <div style={{
                    width: 64, height: 64, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36, background: 'rgba(255,255,255,0.06)',
                    position: 'relative',
                  }}>
                    {emoji}
                    {lp.isPinned && (
                      <FireOutlined style={{
                        color: '#ff4d4f', position: 'absolute', top: -6, right: -6, fontSize: 14,
                      }} />
                    )}
                  </div>
                  {/* 信息 */}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{
                      color: '#e5e7eb', fontSize: 13, fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {lp.isPinned && <Badge status="processing" style={{ marginRight: 4 }} />}
                      {lp.productName}
                    </div>
                    {source && (
                      <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>
                        <Tag color="geekblue" style={{ fontSize: 9, lineHeight: '16px', padding: '0 4px', margin: 0 }}>
                          {source.id}
                        </Tag>
                        {' '}{source.merchant_name} · {source.category_name}
                        {sales > 0 && <span style={{ marginLeft: 6 }}>{formatSales(sales)}</span>}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                      <Text style={{ color: '#ff4d4f', fontSize: 18, fontWeight: 700 }}>
                        ¥{lp.livePrice}
                      </Text>
                      <Text delete style={{ color: '#6b7280', fontSize: 11 }}>
                        ¥{normalPrice}
                      </Text>
                      {marketPrice && marketPrice > normalPrice && (
                        <Tag color="volcano" style={{ fontSize: 9, lineHeight: '14px', padding: '0 4px', margin: 0 }}>
                          省{(marketPrice - lp.livePrice).toFixed(0)}元
                        </Tag>
                      )}
                    </div>
                  </div>
                  {/* 加购 */}
                  <Button
                    type="primary" size="small" shape="circle"
                    icon={<ShoppingCartOutlined />}
                    style={{
                      background: 'linear-gradient(135deg, #ff4d4f, #f5222d)',
                      border: 'none', flexShrink: 0,
                    }}
                    onClick={(e) => { e.stopPropagation(); }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LiveProductPage;
