/**
 * 冷链配送追踪页 V1.0.0 — 场景2A冷链可视化
 *
 * 职能（对应 PRD §7.11.4 场景2场景B2B）：
 * 1. 冷链温度实时曲线（2°C-8°C 合格范围）
 * 2. 温湿度监控面板
 * 3. 物流轨迹时间线
 * 4. 异常告警事件
 * 5. 冷链箱/车辆信息
 *
 * 路由：/app/mine/order/:orderId/track
 */
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Space, Divider, Button, Timeline, Descriptions, Spin, message } from 'antd';
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CarOutlined,
  ShopOutlined,
  HomeOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  CloudOutlined,
} from '@ant-design/icons';
import AppPageFrame from '../../../../components/AppPageFrame';
import { useOrderStore } from '../../../../stores/orderStore';

const TEMP_MIN = 2;  // 冷链温度下限
const TEMP_MAX = 8;  // 冷链温度上限
const HUMIDITY_MIN = 35;
const HUMIDITY_MAX = 75;

// 模拟实时温度数据
function generateTempData(hours: number) {
  const data: { time: string; temp: number; humidity: number }[] = [];
  for (let h = hours; h >= 0; h--) {
    const time = new Date(Date.now() - h * 3600000);
    const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    data.push({
      time: timeStr,
      temp: +(2 + Math.sin(h * 0.8) * 2.5 + Math.random() * 1.5).toFixed(1),
      humidity: +(45 + Math.cos(h * 0.5) * 15 + Math.random() * 5).toFixed(1),
    });
  }
  return data;
}

export default function ColdchainTrackPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { loadOrderDetail, currentOrder, loading } = useOrderStore();
  const [initialized, setInitialized] = useState(false);

  const tempData = useMemo(() => generateTempData(24), []);
  const latest = tempData[tempData.length - 1];
  const isTempNormal = latest.temp >= TEMP_MIN && latest.temp <= TEMP_MAX;
  const isHumidityNormal = latest.humidity >= HUMIDITY_MIN && latest.humidity <= HUMIDITY_MAX;

  // 异常事件
  const alerts = useMemo(() => {
    const events: { time: string; type: 'warning' | 'info' | 'error'; desc: string }[] = [];
    for (let i = 1; i < tempData.length; i++) {
      if (tempData[i].temp > TEMP_MAX || tempData[i].temp < TEMP_MIN) {
        events.push({
          time: tempData[i].time,
          type: 'warning',
          desc: `温度${tempData[i].temp > TEMP_MAX ? '偏高' : '偏低'} ${tempData[i].temp}°C`,
        });
      }
    }
    return events.slice(-5);
  }, [tempData]);

  useEffect(() => {
    if (orderId && !initialized) {
      loadOrderDetail(orderId).then(() => setInitialized(true));
    }
  }, [orderId, initialized]);

  // 冷链设备信息
  const deviceInfo = {
    containerId: `CC${Date.now().toString(36).toUpperCase().slice(-6)}`,
    vehiclePlate: '粤B·XXXXX',
    containerType: '主动制冷·医用保温箱',
    batteryLevel: 85,
    signalStrength: '强',
  };

  if (loading && !initialized) {
    return (
      <AppPageFrame title="冷链追踪">
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
          <Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>加载冷链数据...</Typography.Paragraph>
        </div>
      </AppPageFrame>
    );
  }

  return (
    <AppPageFrame title="冷链追踪">
      <div style={{ padding: '16px', paddingBottom: 80 }}>

        {/* ===== 1. 实时监控面板 ===== */}
        <Card
          size="small"
          style={{
            borderRadius: 12,
            marginBottom: 12,
            background: isTempNormal ? 'linear-gradient(135deg, #f6ffed 0%, #e6fffb 100%)' : 'linear-gradient(135deg, #fff1f0 0%, #fff7e6 100%)',
          }}
        >
          <Typography.Text strong style={{ fontSize: 14 }}>
            <DashboardOutlined /> 实时监控
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
            最后更新：{latest.time}
          </Typography.Text>

          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16 }}>
            {/* 温度 */}
            <div style={{ textAlign: 'center' }}>
              <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                温度
              </Typography.Text>
              <Typography.Text
                strong
                style={{
                  fontSize: 28,
                  color: isTempNormal ? '#52c41a' : '#f5222d',
                  lineHeight: '32px',
                }}
              >
                {latest.temp}
                <span style={{ fontSize: 14 }}>°C</span>
              </Typography.Text>
              <Tag
                color={isTempNormal ? 'success' : 'error'}
                style={{ fontSize: 10, marginTop: 4 }}
              >
                {isTempNormal ? '正常' : '异常'}
              </Tag>
              <Typography.Text type="secondary" style={{ fontSize: 9, display: 'block', marginTop: 2 }}>
                {TEMP_MIN}°C ~ {TEMP_MAX}°C
              </Typography.Text>
            </div>

            {/* 湿度 */}
            <div style={{ textAlign: 'center' }}>
              <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                湿度
              </Typography.Text>
              <Typography.Text
                strong
                style={{
                  fontSize: 28,
                  color: isHumidityNormal ? '#1677ff' : '#faad14',
                  lineHeight: '32px',
                }}
              >
                {latest.humidity}
                <span style={{ fontSize: 14 }}>%</span>
              </Typography.Text>
              <Tag
                color={isHumidityNormal ? 'processing' : 'warning'}
                style={{ fontSize: 10, marginTop: 4 }}
              >
                {isHumidityNormal ? '正常' : '偏湿'}
              </Tag>
              <Typography.Text type="secondary" style={{ fontSize: 9, display: 'block', marginTop: 2 }}>
                {HUMIDITY_MIN}% ~ {HUMIDITY_MAX}%
              </Typography.Text>
            </div>

            {/* 电池 */}
            <div style={{ textAlign: 'center' }}>
              <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                设备电池
              </Typography.Text>
              <Typography.Text
                strong
                style={{
                  fontSize: 28,
                  color: deviceInfo.batteryLevel > 20 ? '#52c41a' : '#faad14',
                  lineHeight: '32px',
                }}
              >
                {deviceInfo.batteryLevel}
                <span style={{ fontSize: 14 }}>%</span>
              </Typography.Text>
              <Tag
                color={deviceInfo.batteryLevel > 20 ? 'success' : 'warning'}
                style={{ fontSize: 10, marginTop: 4 }}
              >
                {deviceInfo.signalStrength}
              </Tag>
              <Typography.Text type="secondary" style={{ fontSize: 9, display: 'block', marginTop: 2 }}>
                信号{deviceInfo.signalStrength}
              </Typography.Text>
            </div>
          </div>
        </Card>

        {/* ===== 2. 温度历史曲线 ===== */}
        <Card
          size="small"
          style={{ borderRadius: 12, marginBottom: 12 }}
          title={
            <Space>
              <LineChartOutlined style={{ color: '#1677ff' }} />
              <span>温度曲线（近24小时）</span>
            </Space>
          }
        >
          <div style={{ position: 'relative', height: 100, borderBottom: '2px solid #f0f0f0' }}>
            {/* 温度上限参考线 */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderTop: '1px dashed #f5222d', zIndex: 1 }}>
              <Typography.Text style={{ fontSize: 9, color: '#f5222d', position: 'absolute', right: 0, top: -10 }}>
                {TEMP_MAX}°C
              </Typography.Text>
            </div>
            {/* 温度下限参考线 */}
            <div style={{ position: 'absolute', top: '75%', left: 0, right: 0, borderTop: '1px dashed #f5222d', zIndex: 1 }}>
              <Typography.Text style={{ fontSize: 9, color: '#f5222d', position: 'absolute', right: 0, top: -10 }}>
                {TEMP_MIN}°C
              </Typography.Text>
            </div>

            {/* SVG 温度曲线 */}
            <svg width="100%" height="100" style={{ position: 'relative', zIndex: 2 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#52c41a" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#52c41a" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* 面积填充 */}
              <path
                d={`M 0,${100 - ((tempData[0].temp - 0) / 12) * 100} ${tempData
                  .map((p, i) => `L ${(i / (tempData.length - 1)) * 100}%,${100 - ((p.temp - 0) / 12) * 100}`)
                  .join(' ')} L 100%,100 L 0,100 Z`}
                fill="url(#tempGradient)"
              />
              {/* 折线 */}
              <polyline
                points={tempData
                  .map((p, i) => `${(i / (tempData.length - 1)) * 100}%,${100 - ((p.temp - 0) / 12) * 100}`)
                  .join(' ')
                }
                fill="none"
                stroke="#52c41a"
                strokeWidth="2"
              />
              {/* 异常点标记 */}
              {tempData
                .map((p, i) => ({ ...p, i }))
                .filter(p => p.temp > TEMP_MAX || p.temp < TEMP_MIN)
                .map(p => (
                  <circle
                    key={p.i}
                    cx={`${(p.i / (tempData.length - 1)) * 100}%`}
                    cy={100 - ((p.temp - 0) / 12) * 100}
                    r="4"
                    fill="#f5222d"
                  />
                ))
              }
            </svg>
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4, textAlign: 'center' }}>
            <WarningOutlined style={{ color: '#f5222d' }} /> 虚线: 合格范围 &nbsp;&nbsp; <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 3, background: '#f5222d', verticalAlign: 'middle' }} /> 异常点
          </Typography.Text>
        </Card>

        {/* ===== 3. 物流轨迹 ===== */}
        <Card
          size="small"
          style={{ borderRadius: 12, marginBottom: 12 }}
          title={
            <Space>
              <CarOutlined style={{ color: '#1677ff' }} />
              <span>物流轨迹</span>
            </Space>
          }
        >
          <Timeline
            items={[
              {
                dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                children: (
                  <div>
                    <Typography.Text strong>深圳南山 · 已签收</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      <ClockCircleOutlined /> 2026-07-31 14:30
                    </Typography.Text>
                  </div>
                ),
              },
              {
                dot: <SyncOutlined style={{ color: '#1677ff' }} />,
                children: (
                  <div>
                    <Typography.Text strong>深圳集散中心 · 运输中</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      <ClockCircleOutlined /> 2026-07-31 10:15 &nbsp;
                      <EnvironmentOutlined /> {latest.temp}°C
                    </Typography.Text>
                  </div>
                ),
              },
              {
                dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                children: (
                  <div>
                    <Typography.Text>广州 · 快件已发出</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      <ClockCircleOutlined /> 2026-07-31 06:00
                    </Typography.Text>
                  </div>
                ),
              },
              {
                dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                children: (
                  <div>
                    <Typography.Text>药房发货 · 顺丰医药冷链</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      <ClockCircleOutlined /> 2026-07-30 18:30
                    </Typography.Text>
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* ===== 4. 异常告警 ===== */}
        {alerts.length > 0 && (
          <Card
            size="small"
            style={{ borderRadius: 12, marginBottom: 12, borderColor: '#ff7a45' }}
            title={
              <Space>
                <WarningOutlined style={{ color: '#fa8c16' }} />
                <span style={{ color: '#d46b08' }}>异常告警</span>
                <Tag color="warning">{alerts.length}条</Tag>
              </Space>
            }
          >
            {alerts.map((alert, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <ThunderboltOutlined style={{ color: '#fa8c16', fontSize: 12 }} />
                <Typography.Text style={{ fontSize: 12 }}>{alert.desc}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 11, marginLeft: 'auto' }}>
                  {alert.time}
                </Typography.Text>
              </div>
            ))}
          </Card>
        )}

        {/* ===== 5. 冷链设备信息 ===== */}
        <Card
          size="small"
          style={{ borderRadius: 12, marginBottom: 12 }}
          title={
            <Space>
              <ShopOutlined />
              <span>冷链设备</span>
            </Space>
          }
        >
          <Descriptions column={1} size="small" colon={false}>
            <Descriptions.Item label="容器编号">{deviceInfo.containerId}</Descriptions.Item>
            <Descriptions.Item label="容器类型">{deviceInfo.containerType}</Descriptions.Item>
            <Descriptions.Item label="运输车辆">{deviceInfo.vehiclePlate}</Descriptions.Item>
            <Descriptions.Item label="电池电量">
              <Space>
                {deviceInfo.batteryLevel}% {deviceInfo.batteryLevel > 50 ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : null}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Button
          block
          size="large"
          style={{ borderRadius: 12, height: 48 }}
          onClick={() => navigate(-1)}
        >
          <HomeOutlined /> 返回
        </Button>
      </div>
    </AppPageFrame>
  );
}
