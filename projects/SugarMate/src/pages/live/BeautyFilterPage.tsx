/**
 * PG-SUG-LIVE 美颜设置 V1.0.0
 * 
 * 主播直播前/直播中美颜效果调节，基于腾讯云特效SDK。
 * 支持磨皮/美白/瘦脸/大眼/滤镜等参数实时预览调整。
 */
import React, { useState } from 'react';
import { Typography, Card, Slider, Row, Col, Segmented, Space, Button } from 'antd';
import { SkinOutlined, EyeOutlined, ExperimentOutlined } from '@ant-design/icons';
import MobileFrame from '../../components/MobileFrame';

const { Text } = Typography;

interface BeautyParam {
  key: string;
  label: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  defaultVal: number;
}

const params: BeautyParam[] = [
  { key: 'smooth', label: '磨皮', icon: <SkinOutlined />, min: 0, max: 100, defaultVal: 50 },
  { key: 'white', label: '美白', icon: <SkinOutlined />, min: 0, max: 100, defaultVal: 40 },
  { key: 'thinFace', label: '瘦脸', icon: <ExperimentOutlined />, min: 0, max: 100, defaultVal: 30 },
  { key: 'bigEye', label: '大眼', icon: <EyeOutlined />, min: 0, max: 100, defaultVal: 25 },
  { key: 'sharp', label: '锐化', icon: <EyeOutlined />, min: 0, max: 100, defaultVal: 20 },
  { key: 'vFace', label: 'V脸', icon: <ExperimentOutlined />, min: 0, max: 100, defaultVal: 15 },
];

const filters = ['原图', '自然', '清透', '元气', '日系', '暖调', '冷调'];

const Page: React.FC = () => {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(params.map(p => [p.key, p.defaultVal]))
  );
  const [filter, setFilter] = useState('自然');

  return (
    <MobileFrame title="美颜设置" tabs={[]} basePath="live">
      <div style={{ padding: 12 }}>
        {/* 预览区 */}
        <div
          style={{
            height: 200, borderRadius: 10, marginBottom: 12,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, flexDirection: 'column',
          }}
        >
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 8, fontSize: 24,
          }}>
            👤
          </div>
          <Text style={{ color: '#fff', fontSize: 12 }}>实时预览区域</Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>
            基于腾讯云特效SDK
          </Text>
        </div>

        {/* 滤镜 */}
        <Text strong style={{ fontSize: 13, marginBottom: 6, display: 'block' }}>滤镜</Text>
        <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', marginBottom: 16, paddingBottom: 4 }}>
          {filters.map(f => (
            <Button
              key={f}
              size="small"
              type={filter === f ? 'primary' : 'default'}
              shape="round"
              onClick={() => setFilter(f)}
              style={{ marginRight: 8 }}
            >
              {f}
            </Button>
          ))}
        </div>

        {/* 美颜参数 */}
        <Text strong style={{ fontSize: 13, marginBottom: 6, display: 'block' }}>美颜</Text>
        {params.map(p => (
          <div key={p.key} style={{ marginBottom: 12 }}>
            <Row align="middle" justify="space-between" style={{ marginBottom: 2 }}>
              <Col>
                <Space size={4}>
                  {p.icon}
                  <Text style={{ fontSize: 12 }}>{p.label}</Text>
                </Space>
              </Col>
              <Col><Text style={{ fontSize: 12, color: '#1677ff' }}>{values[p.key]}</Text></Col>
            </Row>
            <Slider
              min={p.min}
              max={p.max}
              value={values[p.key]}
              onChange={v => setValues(prev => ({ ...prev, [p.key]: v }))}
              size={undefined as any}
            />
          </div>
        ))}

        <Row gutter={8} style={{ marginTop: 8 }}>
          <Col span={12}>
            <Button block onClick={() => setValues(Object.fromEntries(params.map(p => [p.key, p.defaultVal])))}>
              恢复默认
            </Button>
          </Col>
          <Col span={12}>
            <Button block type="primary">
              应用效果
            </Button>
          </Col>
        </Row>
      </div>
    </MobileFrame>
  );
};

export default Page;
