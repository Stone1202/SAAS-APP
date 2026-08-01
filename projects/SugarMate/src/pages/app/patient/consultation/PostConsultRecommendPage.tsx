import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Image, Tag, Toast } from 'antd-mobile';
import AppPageFrame from '../../../../components/AppPageFrame';
import { useConsultationStore } from '../../../../stores/consultationStore';
import type { PostConsultRecommend } from '@contracts/consultation';

const PostConsultRecommendPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { loadRecommends, recommends, clickRecommendItem, init } = useConsultationStore();
  const [rec, setRec] = useState<PostConsultRecommend | null>(null);

  useEffect(() => {
    init().then(async () => {
      await loadRecommends(orderId || '');
    });
  }, [orderId]);

  useEffect(() => {
    if (recommends.length > 0) setRec(recommends[0]);
  }, [recommends]);

  const handleClick = async (skuId: string) => {
    if (orderId) await clickRecommendItem(orderId, skuId);
  };

  const handleGoOrder = (productId: string) => {
    // 在所有推荐中查找对应商品
    const item = recommends.flatMap(r => r.items).find(i => i.product_id === productId);
    if (!item) {
      Toast.show({ content: '未找到该推荐商品' });
      return;
    }
    // 跳转到下单确认页，通过 URL search 参数传递商品信息
    const params = new URLSearchParams({
      product_id: item.product_id,
      product_name: item.product_name,
      price: String(item.price),
      product_image: item.product_image || '',
      product_type: item.product_type || 'OTC',
      require_prescription: String(item.require_prescription),
    });
    navigate(`/app/mall/checkout?${params.toString()}`);
  };

  return (
    <AppPageFrame title="问诊推荐">
      <div style={{ padding: 16, paddingBottom: 100 }}>
        <Card style={{ borderRadius: 12, marginBottom: 12, background: 'linear-gradient(135deg, #e8f4fd 0%, #f0f7ff 100%)' }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>🎯 基于本次问诊的智能推荐</div>
          <div style={{ fontSize: 13, color: '#666' }}>
            {rec?.source === 'RX_BASED'
              ? '根据您的处方，为您推荐以下商品'
              : rec?.source === 'SYMPTOM_BASED'
                ? '根据您的情况，为您推荐以下商品'
                : '为您精选的商品推荐'}
          </div>
        </Card>

        {rec?.items.map(item => (
          <Card key={item.sku_id} style={{ borderRadius: 12, marginBottom: 12 }} onClick={() => handleClick(item.sku_id)}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 80, height: 80, borderRadius: 8, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#999', flexShrink: 0 }}>
                {item.product_type}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.product_name}</div>
                <div style={{ fontSize: 12, color: '#52c41a', marginBottom: 4 }}>💡 {item.reason}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  {item.require_prescription && <Tag color="warning" style={{ fontSize: 10, padding: '1px 6px' }}>需处方</Tag>}
                  <Tag color="default" style={{ fontSize: 10, padding: '1px 6px' }}>{{
                    OTC: 'OTC', RX: '处方药', DEVICE: '器械', FOOD: '食品', SUPPLEMENT: '保健品', DAILY: '日用品', SERVICE: '服务'
                  }[item.product_type] || item.product_type}</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#ff4d4f' }}>¥{item.price / 100}</span>
                  <Button color="primary" size="small" fill="outline" style={{ borderRadius: 14, fontSize: 12 }}
                    onClick={(e) => { e.stopPropagation(); handleGoOrder(item.product_id); }}>
                    立即购买
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        <Button
          color="primary"
          block
          style={{ borderRadius: 24, marginTop: 8 }}
          onClick={() => navigate(`/app/consultation/evaluate/${orderId}`)}
        >
          去评价问诊
        </Button>
      </div>
    </AppPageFrame>
  );
};

export default PostConsultRecommendPage;
