/**
 * PG-SUG-LIVE 创建直播间 V1.0.0
 * 
 * 主播创建新直播间：设置主题、封面、分类、开播时间，
 * 生成腾讯云CSS推流地址，关联商品清单（带货场景）。
 * 关联UC-SUG-LIVE-001 健康科普直播全流程
 */
import React, { useState } from 'react';
import {
  Typography, Card, Form, Input, Select, Button, Upload,
  Space, Tag, DatePicker, Switch, Divider, message,
} from 'antd';
import {
  UploadOutlined, VideoCameraOutlined, ShoppingOutlined,
  ClockCircleOutlined, LinkOutlined, CopyOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import MobileFrame from '../../components/MobileFrame';
import { useLiveStore } from '../../stores/liveStore';

const { Text, Title } = Typography;
const { TextArea } = Input;

const categories = [
  { label: '健康科普', value: 'knowledge' },
  { label: '医生讲堂', value: 'lecture' },
  { label: '直播带货', value: 'shopping' },
  { label: '互动问答', value: 'qa' },
];

const Page: React.FC = () => {
  const [form] = Form.useForm();
  const addLiveRoom = useLiveStore((s) => s.addLiveRoom);
  const [coverFile, setCoverFile] = useState<UploadFile[]>([]);
  const [pushAddr, setPushAddr] = useState('');
  const [category, setCategory] = useState<string>('knowledge');

  const handleCreate = () => {
    const fakeAddr = `rtmp://push.sugarmate.com/live/${Date.now()}`;
    setPushAddr(fakeAddr);
    // 写入 liveStore（含 category，用于跨端状态同步）
    addLiveRoom({
      id: `RM-${Date.now().toString(36).toUpperCase()}`,
      sessionId: '',
      sessionTopic: form.getFieldValue('title') || '新建直播间',
      roomName: form.getFieldValue('title') || '新建直播间',
      category: category as 'knowledge' | 'lecture' | 'shopping' | 'qa',
      pushUrl: fakeAddr,
      pullUrl: fakeAddr.replace('push', 'pull') + '.m3u8',
      resolution: '1080p',
      bitrate: 4000,
      frameRate: 30,
      beautyEnabled: true,
      recordingStrategy: 'auto',
      status: 'offline',
    });
    message.success('直播间创建成功，已生成推流地址');
  };

  return (
    <MobileFrame title="创建直播间" tabs={[]} basePath="live">
      <div style={{ padding: 12 }}>
        <Form form={form} layout="vertical" size="small">
          <Form.Item label="直播主题" name="title" rules={[{ required: true, message: '请输入直播主题' }]}>
            <Input placeholder="如：糖尿病患者夏季饮食指南" maxLength={30} />
          </Form.Item>

          <Form.Item label="直播分类" name="category" initialValue="knowledge">
            <Select
              options={categories}
              placeholder="选择分类"
              onChange={setCategory}
            />
          </Form.Item>

          <Form.Item label="封面图" name="cover">
            <Upload
              listType="picture-card"
              fileList={coverFile}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              accept="image/*"
            >
              {coverFile.length < 1 && '上传封面'}
            </Upload>
          </Form.Item>

          <Form.Item label="内容大纲" name="outline">
            <TextArea
              rows={3}
              placeholder="描述本次直播的主要内容大纲…"
              maxLength={200}
            />
          </Form.Item>

          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="开播时间" name="startTime">
                <DatePicker
                  showTime
                  placeholder="选择时间"
                  style={{ width: '100%' }}
                  suffixIcon={<ClockCircleOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="预计时长" name="duration">
                <Select
                  placeholder="选择时长"
                  options={[
                    { label: '30分钟', value: 30 },
                    { label: '60分钟', value: 60 },
                    { label: '90分钟', value: 90 },
                    { label: '120分钟', value: 120 },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          {category === 'shopping' && (
            <Card size="small" title={<Space><ShoppingOutlined />关联商品</Space>} style={{ marginBottom: 12, borderRadius: 10 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                从商城选择直播带货商品，可设置直播专属优惠价
              </Text>
              <Button size="small" type="dashed" block style={{ marginTop: 8 }} icon={<ShoppingOutlined />}>
                添加商品
              </Button>
            </Card>
          )}

          <div style={{ margin: '12px 0' }}>
            <Space>
              <Text style={{ fontSize: 12 }}>录制直播</Text>
              <Switch size="small" defaultChecked />
            </Space>
            <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 2 }}>
              开启后自动云端录制，生成回放
            </Text>
          </div>
        </Form>

        {pushAddr && (
          <Card size="small" style={{ borderRadius: 10, background: '#f6ffed', marginBottom: 12 }}>
            <Text strong style={{ fontSize: 12, color: '#52c41a' }}>推流地址已生成：</Text>
            <div style={{
              background: '#fff', padding: '4px 8px', borderRadius: 6,
              fontSize: 11, wordBreak: 'break-all', marginTop: 4,
            }}>
              {pushAddr}
            </div>
            <Space style={{ marginTop: 6 }}>
              <Button size="small" icon={<CopyOutlined />} type="primary" ghost>复制地址</Button>
              <Button size="small" icon={<VideoCameraOutlined />}>开始推流</Button>
            </Space>
            <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 4 }}>
              推流前请先确认美颜/滤镜/推流参数已配置
            </Text>
          </Card>
        )}

        <Button
          type="primary"
          block
          size="large"
          icon={<VideoCameraOutlined />}
          onClick={handleCreate}
          style={{ borderRadius: 8, height: 44 }}
        >
          创建直播间
        </Button>
      </div>
    </MobileFrame>
  );
};

export default Page;
