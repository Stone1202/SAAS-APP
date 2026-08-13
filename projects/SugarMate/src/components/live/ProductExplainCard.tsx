/**
 * 商品讲解卡 — 共享组件（视频上层弹出的大卡片）
 * ShoppingLivePage / AppLiveWatchPage 复用
 *
 * Props:
 *   product       — 商品数据
 *   holderLabel   — 讲解者标签（"主播正在讲解" / "中控台正在讲解"），默认"主播正在讲解"
 *   onClose       — 关闭回调
 *   onBuyNow      — 立即抢购回调
 */
import React from 'react';
import { Button, Tag, Typography, Space, Row, Col, Progress } from 'antd';
import {
  CloseOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  FireOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export interface ProductExplainData {
  productName: string;
  livePrice: number;
  normalPrice: number;
  productImage: string;
  allocatedStock: number;
  soldCount?: number; // 已售数量，默认 allocatedStock * 0.65
}

interface ProductExplainCardProps {
  product: ProductExplainData | null;
  holderLabel?: string;
  onClose: () => void;
  onBuyNow: () => void;
}

const ProductExplainCard: React.FC<ProductExplainCardProps> = ({
  product,
  holderLabel = '主播正在讲解',
  onClose,
  onBuyNow,
}) => {
  if (!product) return null;

  const sold = product.soldCount ?? Math.max(10, Math.floor(product.allocatedStock * 0.65));
  const soldPercent = Math.max(10, Math.min(100, Math.round((sold / product.allocatedStock) * 100)));

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 280,
          zIndex: 20,
          background: 'linear-gradient(135deg, #fff5f0 0%, #fff 50%, #fff0e6 100%)',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(255,77,79,0.3), 0 2px 8px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          animation: 'pomBounceIn 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
        }}
      >
        {/* 顶部标签 */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Space size={4}>
            <FireOutlined style={{ color: '#fff' }} />
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
              {holderLabel}
            </span>
          </Space>
          <CloseOutlined
            style={{ color: '#fff', cursor: 'pointer' }}
            onClick={onClose}
          />
        </div>
        {/* 商品信息 */}
        <div style={{ padding: '16px' }}>
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                flexShrink: 0,
              }}
            >
              {product.productImage || '📦'}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 4,
                  color: '#333',
                }}
              >
                {product.productName}
              </div>
              <Space align="baseline">
                <span
                  style={{
                    color: '#ff4d4f',
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: 'DIN, monospace',
                  }}
                >
                  ¥{product.livePrice}
                </span>
                <Text
                  delete
                  style={{ fontSize: 12, color: '#999' }}
                >
                  ¥{product.normalPrice}
                </Text>
                <Tag
                  color="red"
                  style={{ fontSize: 10, lineHeight: '16px', margin: 0 }}
                >
                  -{Math.round((1 - product.livePrice / product.normalPrice) * 100)}%
                </Tag>
              </Space>
            </div>
          </div>
          {/* 库存进度 */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                marginBottom: 4,
              }}
            >
              <span style={{ color: '#999' }}>已抢</span>
              <span style={{ color: '#ff4d4f', fontWeight: 600 }}>
                {sold}件 / {product.allocatedStock}件
              </span>
            </div>
            <Progress
              percent={soldPercent}
              showInfo={false}
              strokeColor={{ from: '#ff4d4f', to: '#ff7875' }}
              size="small"
            />
          </div>
          {/* 操作按钮 */}
          <Row gutter={8}>
            <Col span={16}>
              <Button
                type="primary"
                danger
                block
                size="large"
                shape="round"
                onClick={onBuyNow}
                style={{ height: 44, fontWeight: 600, fontSize: 15 }}
              >
                <ShoppingCartOutlined /> 立即抢购
              </Button>
            </Col>
            <Col span={8}>
              <Button
                block
                size="large"
                shape="round"
                style={{
                  height: 44,
                  borderColor: '#ff4d4f',
                  color: '#ff4d4f',
                }}
              >
                <HeartOutlined />
              </Button>
            </Col>
          </Row>
        </div>
      </div>
      <style>{`
        @keyframes pomBounceIn {
          0% { opacity: 0; transform: translateX(-50%) scale(0.7); }
          60% { opacity: 1; transform: translateX(-50%) scale(1.05); }
          100% { transform: translateX(-50%) scale(1); }
        }
      `}</style>
    </>
  );
};

export default ProductExplainCard;
