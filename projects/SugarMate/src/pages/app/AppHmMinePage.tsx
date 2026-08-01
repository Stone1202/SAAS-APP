/**
 * APP-HM我的页
 */
import React from 'react';
import { Card, Avatar, List, Tag } from 'antd';
import { UserOutlined, FileTextOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import MobileFrame, { APP_HM_TABS } from '@/components/MobileFrame';

const AppHmMinePage: React.FC = () => {
  return (
    <MobileFrame title="我的" tabs={APP_HM_TABS} basePath="/app/hm">
      <div style={{ padding: 12 }}>
        <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #fa8c16, #f5222d)', border: 'none', marginBottom: 12 }} bodyStyle={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar size={50} icon={<UserOutlined />} style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
            <div style={{ flex: 1, color: '#fff' }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>陈健康管理师</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>社区中心 · 健康管理师</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 10 }}>
            {[{ label: '管理患者', value: 38 }, { label: '本月回访', value: 86 }, { label: '评分', value: 4.9 }].map(item => (
              <div key={item.label} style={{ flex: 1, textAlign: 'center', color: '#fff' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{item.value}</div>
                <div style={{ fontSize: 10 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card size="small" style={{ borderRadius: 10 }} bodyStyle={{ padding: 0 }}>
          <List size="small" dataSource={[
            { icon: <FileTextOutlined />, label: '资质证照', extra: <Tag color="green">已认证</Tag> },
            { icon: <SettingOutlined />, label: '预警规则配置', extra: <Tag color="blue">自定义</Tag> },
            { icon: <SettingOutlined />, label: '设置', extra: null },
          ]} renderItem={item => (
            <List.Item style={{ padding: '10px 16px', cursor: 'pointer' }} extra={item.extra}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--color-primary)' }}>{item.icon}</span> {item.label}
              </div>
            </List.Item>
          )} />
        </Card>
        <div style={{ textAlign: 'center', padding: 16 }}>
          <a style={{ color: '#999', fontSize: 12 }}><LogoutOutlined /> 退出登录</a>
        </div>
      </div>
    </MobileFrame>
  );
};

export default AppHmMinePage;
