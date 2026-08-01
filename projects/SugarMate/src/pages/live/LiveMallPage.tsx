/**
 * LIVE端 — 直播商城页（打开购物袋，在直播中浏览全部可购商品）
 * V3.0 — 数据源：liveStore.liveProducts（当前直播间）+ productStore（回源获取商品详情）
 * 
 * 闭环：商品管理新增/修改商品 → productStore更新 → 直播间重新从productStore关联 →
 *        LIVE商城自动同步最新商品名称/价格/库存等信息
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Empty, Spin, Badge, Input, Tag } from 'antd';
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
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

const LiveMallPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const roomId = searchParams.get('roomId') || 'RM-003';
  const [search, setSearch] = useState('');

  const { liveProducts, initMockData } = useLiveStore();
  const { products: allProducts, loadProducts, loading } = useProductStore();

  useEffect(() => {
    initMockData();
    loadProducts({ page_size: 50 });
  }, []);

  // 当前直播间 上架中的商品 → 回源获取 productStore 完整信息
  const displayProducts = useMemo(() => {
    return liveProducts
      .filter(p => p.roomId === roomId && p.status === 'active')
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.sortOrder - b.sortOrder;
      })
      .map(lp => {
        const source = allProducts.find(p => p.id === lp.productId);
        return { ...lp, source };
      })
      .filter(lp => {
        if (!search) return true;
        const kw = search.toLowerCase();
        return lp.productName.toLowerCase().includes(kw) ||
          lp.source?.category_name?.toLowerCase().includes(kw);
      });
  }, [liveProducts, allProducts, roomId, search]);

  return (
    <div style={{
      padding: '12px', minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0e27 0%, #1a1a2e 100%)',
    }}>
      {/* 头部 */}
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ color: '#fff', margin: 0 }}>🛒 直播商城</Title>
        <Text style={{ color: '#9ca3af', fontSize: 12 }}>
          直播间好物 · 商品来源：商品管理 · {displayProducts.length} 件在售
        </Text>
        <Input
          prefix={<SearchOutlined style={{ color: '#6b7280' }} />}
          placeholder="搜索商品…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
          style={{
            marginTop: 10, borderRadius: 20, background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
          }}
        />
      </div>

      {/* 商品列表 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
      ) : displayProducts.length === 0 ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300,
        }}>
          <Empty description={<span style={{ color: '#9ca3af' }}>暂无商品</span>} />
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10,
        }}>
          {displayProducts.map((lp) => {
            const source = lp.source;
            const emoji = lp.productImage || (source ? CAT_EMOJI[source.category_name] || '📦' : '📦');
            const originPrice = source?.price || lp.normalPrice;
            const originMarketPrice = source?.market_price;
            const canBuy = lp.livePrice > 0;

            return (
              <Card
                key={lp.id}
                size="small"
                style={{
                  background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))',
                  border: lp.isPinned ? '1px solid rgba(245,34,45,0.4)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, backdropFilter: 'blur(12px)',
                  overflow: 'hidden',
                }}
                bodyStyle={{ padding: 0 }}
                onClick={() => nav(`/live/product-detail?id=${lp.id}&roomId=${roomId}`)}
              >
                {/* 商品图 */}
                <div style={{
                  height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 40, background: 'rgba(255,255,255,0.04)', position: 'relative',
                }}>
                  {emoji}
                  {lp.isPinned && (
                    <Badge.Ribbon text="推荐" color="red" style={{ position: 'absolute', top: 0 }} />
                  )}
                </div>
                {/* 信息 */}
                <div style={{ padding: '8px 10px 10px' }}>
                  <div style={{
                    color: '#e5e7eb', fontSize: 12, fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    lineHeight: 1.4, minHeight: 34,
                  }}>
                    {lp.productName}
                  </div>
                  {source && (
                    <Tag color="geekblue" style={{ fontSize: 9, lineHeight: '14px', padding: '0 3px', margin: '4px 0' }}>
                      {source.id} · {source.category_name}
                    </Tag>
                  )}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                    <Text style={{ color: '#ff4d4f', fontSize: 14, fontWeight: 700 }}>
                      ¥{lp.livePrice}
                    </Text>
                    {originPrice > lp.livePrice && (
                      <Text delete style={{ color: '#6b7280', fontSize: 10 }}>
                        ¥{originPrice}
                      </Text>
                    )}
                  </div>
                  {originMarketPrice && originMarketPrice > lp.livePrice && (
                    <div style={{ fontSize: 9, color: '#ef4444', marginTop: 2 }}>
                      省 ¥{(originMarketPrice - lp.livePrice).toFixed(0)}（原价 ¥{originMarketPrice}）
                    </div>
                  )}
                  {source && source.sales_count > 0 && (
                    <div style={{ fontSize: 9, color: '#6b7280', marginTop: 4 }}>
                      已售 {formatSales(source.sales_count)}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LiveMallPage;
