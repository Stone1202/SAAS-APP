/**
 * 支付页 V1.0.0
 * 
 * 职能：
 * 1. 订单金额确认
 * 2. 支付方式选择（微信支付 / 易宝支付）
 * 3. 倒计时（30分钟超时自动取消）
 * 4. 跳转支付网关
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Card, Button, Space, Tag, Divider, Radio, message, Progress } from 'antd';
import { WechatOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import AppPageFrame from '../../../../components/AppPageFrame';

const PAY_TIMEOUT = 30 * 60; // 30分钟

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<'WECHAT' | 'YEEPAY'>('WECHAT');
  const [remaining, setRemaining] = useState(PAY_TIMEOUT);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const timerRef = useRef<number>();

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          message.warning('订单已超时，即将取消');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const handlePay = async () => {
    setPaying(true);
    // Sim 支付处理（实际通过易宝/微信支付网关）
    await new Promise(resolve => setTimeout(resolve, 1200));
    setPaying(false);
    setPaid(true);
    message.success('支付成功！');
    // 场景2B闭环：支付成功→跳转订单详情页
    setTimeout(() => {
      if (orderId) {
        navigate(`/app/mine/order/${orderId}`);
      } else {
        navigate('/app/mine/orders');
      }
    }, 800);
  };

  return (
    <AppPageFrame title="支付">
      <div style={{ padding: '16px' }}>
        {/* 支付倒计时 */}
        <Card size="small" style={{ borderRadius: 12, marginBottom: 12, textAlign: 'center' }}>
          <ClockCircleOutlined style={{ fontSize: 20, color: remaining < 300 ? '#f5222d' : '#faad14' }} />
          <Typography.Text style={{ marginLeft: 8, fontSize: 16, fontWeight: 700, color: remaining < 300 ? '#f5222d' : '#333' }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
            超时后订单将自动取消
          </Typography.Text>
          <Progress
            percent={((PAY_TIMEOUT - remaining) / PAY_TIMEOUT) * 100}
            showInfo={false}
            strokeColor={remaining < 300 ? '#ff4d4f' : '#1677ff'}
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* 订单金额 */}
        <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography.Text type="secondary">订单金额</Typography.Text>
            <Typography.Text strong style={{ fontSize: 24, color: '#f5222d' }}>
              ¥233.00
            </Typography.Text>
          </div>
          <Divider style={{ margin: '8px 0' }} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            订单号：SG202607290001
          </Typography.Text>
        </Card>

        {/* 支付方式 */}
        <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }} title="选择支付方式">
          <Radio.Group value={channel} onChange={e => setChannel(e.target.value)} style={{ width: '100%' }}>
            <div style={{ padding: '12px', border: channel === 'WECHAT' ? '1px solid #1677ff' : '1px solid #f0f0f0', borderRadius: 8, marginBottom: 8 }}>
              <Radio value="WECHAT">
                <Space>
                  <WechatOutlined style={{ color: '#07c160', fontSize: 24 }} />
                  <Typography.Text strong>微信支付</Typography.Text>
                </Space>
              </Radio>
            </div>
            <div style={{ padding: '12px', border: channel === 'YEEPAY' ? '1px solid #1677ff' : '1px solid #f0f0f0', borderRadius: 8 }}>
              <Radio value="YEEPAY">
                <Space>
                  <DollarOutlined style={{ color: '#1677ff', fontSize: 24 }} />
                  <Typography.Text strong>易宝支付</Typography.Text>
                </Space>
              </Radio>
            </div>
          </Radio.Group>
        </Card>

        <Button
          type="primary"
          size="large"
          block
          loading={paying}
          disabled={paid}
          onClick={handlePay}
          style={{ borderRadius: 12, height: 48, marginTop: 16 }}
        >
          {paid ? '支付成功，即将跳转...' : '立即支付 ¥233.00'}
        </Button>
      </div>
    </AppPageFrame>
  );
}
