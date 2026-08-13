/**
 * 优惠券弹出组件 — 共享组件
 * ShoppingLivePage / AppLiveWatchPage 复用
 */
import React from 'react';
import { Button } from 'antd';
import { CloseOutlined, GiftOutlined } from '@ant-design/icons';

export interface CouponData {
  activityName: string;
  content: string;
}

interface CouponPopupProps {
  coupon: CouponData | null;
  onClaim: () => void;
  onClose: () => void;
}

const CouponPopup: React.FC<CouponPopupProps> = ({ coupon, onClaim, onClose }) => {
  if (!coupon) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        animation: 'pomBounceIn 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
      }}
    >
      <div
        style={{
          width: 260,
          background: 'linear-gradient(135deg, #ff9a3c 0%, #ff6f3c 50%, #ff4d2e 100%)',
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 8px 30px rgba(255,77,47,0.4)',
          position: 'relative',
        }}
      >
        <CloseOutlined
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
          }}
        />
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <GiftOutlined style={{ fontSize: 36, color: '#ffd700' }} />
        </div>
        <div
          style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            textAlign: 'center',
            marginBottom: 6,
          }}
        >
          {coupon.activityName}
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 12,
            textAlign: 'center',
            marginBottom: 14,
          }}
        >
          {coupon.content}
        </div>
        <Button
          block
          type="primary"
          shape="round"
          size="large"
          onClick={onClaim}
          style={{
            background: '#ffd700',
            borderColor: '#ffd700',
            color: '#c41a00',
            fontWeight: 700,
            height: 40,
          }}
        >
          立即领取
        </Button>
      </div>
    </div>
  );
};

export default CouponPopup;
