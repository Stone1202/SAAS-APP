/**
 * PG-SUG-LIVE 推流配置 V1.0.0
 * 
 * 多分辨率自适应推流（360p/720p/1080p）、码率/帧率设置、
 * 网络自适应降级（1080p→720p→480p）、断流重连。
 */
import React, { useState } from 'react';
import {
  Typography, Card, Button, Space, Slider, Switch,
  Select, Row, Col, Tag, Descriptions, Divider, Alert,
} from 'antd';
import {
  ApiOutlined, WifiOutlined, SettingOutlined,
  CopyOutlined, ReloadOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import MobileFrame from '../../components/MobileFrame';

const { Text, Title } = Typography;

const resolutions = [
  { label: '360p (标清)', value: 360, bitrate: 800 },
  { label: '720p (高清)', value: 720, bitrate: 1800 },
  { label: '1080p (全高清)', value: 1080, bitrate: 3500 },
];

const Page: React.FC = () => {
  const [resolution, setResolution] = useState(720);
  const [bitrate, setBitrate] = useState(1800);
  const [fps, setFps] = useState(30);
  const [autoAdaptive, setAutoAdaptive] = useState(true);
  const [recordCloud, setRecordCloud] = useState(true);
  const pushAddr = 'rtmp://push.sugarmate.com/live/abc123?key=xxxx';

  const currentRes = resolutions.find(r => r.value === resolution)!;

  return (
    <MobileFrame title="推流配置" tabs={[]} basePath="live">
      <div style={{ padding: 12 }}>
        {/* 网络状态 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12, background: '#f6ffed' }}>
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <Text style={{ color: '#52c41a', fontSize: 13 }}>推流服务已就绪</Text>
          </Space>
          <Space size={24} style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 11 }}><WifiOutlined /> 上行带宽：12.5 Mbps</Text>
            <Text style={{ fontSize: 11 }}>延时：45ms</Text>
            <Text style={{ fontSize: 11 }}>丢包率：0.1%</Text>
          </Space>
        </Card>

        {/* 分辨率 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 10 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
            分辨率与码率
          </Text>
          <Select
            value={resolution}
            onChange={(v) => {
              setResolution(v);
              const r = resolutions.find(r => r.value === v);
              if (r) setBitrate(r.bitrate);
            }}
            options={resolutions}
            style={{ width: '100%', marginBottom: 12 }}
          />
          <div>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12 }}>码率 (kbps)</Text>
              <Text style={{ fontSize: 12, color: '#1677ff' }}>{bitrate}</Text>
            </Space>
            <Slider
              min={500}
              max={5000}
              step={100}
              value={bitrate}
              onChange={setBitrate}
            />
          </div>
          <div>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12 }}>帧率 (FPS)</Text>
              <Text style={{ fontSize: 12, color: '#1677ff' }}>{fps}</Text>
            </Space>
            <Slider
              min={15}
              max={60}
              step={5}
              value={fps}
              onChange={setFps}
            />
          </div>
        </Card>

        {/* 自适应 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 10 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Text strong style={{ fontSize: 13 }}>自适应码率</Text>
              <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
                网络较差时自动降级 1080p→720p→480p
              </Text>
            </div>
            <Switch checked={autoAdaptive} onChange={setAutoAdaptive} size="small" />
          </Space>
        </Card>

        {/* 云端录制 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 10 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Text strong style={{ fontSize: 13 }}>云端录制</Text>
              <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
                自动录制直播内容至腾讯云VOD
              </Text>
            </div>
            <Switch checked={recordCloud} onChange={setRecordCloud} size="small" />
          </Space>
          {recordCloud && (
            <div style={{ marginTop: 8 }}>
              <Select
                size="small"
                defaultValue="all"
                style={{ width: '100%' }}
                options={[
                  { label: '全程录制', value: 'all' },
                  { label: '仅音频', value: 'audio' },
                  { label: '切片录制', value: 'segment' },
                ]}
              />
            </div>
          )}
        </Card>

        {/* 推流地址 */}
        <Card size="small" style={{ borderRadius: 10, marginBottom: 10 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>推流地址</Text>
          <div style={{
            background: '#f5f5f5', padding: 8, borderRadius: 6,
            fontSize: 11, wordBreak: 'break-all',
          }}>
            {pushAddr}
          </div>
          <Space style={{ marginTop: 8 }}>
            <Button size="small" icon={<CopyOutlined />}>复制</Button>
            <Button size="small" icon={<ReloadOutlined />}>重新生成</Button>
          </Space>
        </Card>

        <Alert
          type="warning"
          message="断流重连：30分钟内断流可自动重连，超时需手动重新推流"
          style={{ fontSize: 11, borderRadius: 8 }}
        />
      </div>
    </MobileFrame>
  );
};

export default Page;
