/**
 * APP-HM回访页
 */
import React from 'react';
import { Card, Tag, Button, Timeline } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, PhoneOutlined } from '@ant-design/icons';
import MobileFrame, { APP_HM_TABS } from '@/components/MobileFrame';

const AppHmVisitPage: React.FC = () => {
  return (
    <MobileFrame title="回访管理" tabs={APP_HM_TABS} basePath="/app/hm">
      <div style={{ padding: 12 }}>
        <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}
          title={<span style={{ fontSize: 13 }}>今日待回访 <Tag color="orange">5</Tag></span>}>
          {[
            { name: '张先生', type: '常规回访', time: '09:00', priority: '高' },
            { name: '李女士', type: '用药提醒', time: '11:00', priority: '中' },
            { name: '王大爷', type: '健康指导', time: '14:00', priority: '中' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 0', borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>
                  {item.name} · {item.type}
                  <Tag color={item.priority === '高' ? 'red' : 'blue'} style={{ fontSize: 10, marginLeft: 6 }}>{item.priority}</Tag>
                </div>
                <div style={{ fontSize: 10, color: '#999' }}>{item.time}</div>
              </div>
              <Button size="small" type="primary" icon={<PhoneOutlined />} style={{ borderRadius: 12 }}>回访</Button>
            </div>
          ))}
        </Card>

        <Card size="small" style={{ borderRadius: 10 }}
          title={<span style={{ fontSize: 13 }}>回访记录</span>}>
          <Timeline items={[
            { color: 'green', children: <><b>07-28</b> 张先生 · 血糖稳定 ✅ · 建议继续保持</> },
            { color: 'green', children: <><b>07-27</b> 李女士 · 用药正常 ✅ · 提醒复查</> },
            { color: 'orange', children: <><b>07-26</b> 王大爷 · 运动不足 ⚠️ · 督促散步</> },
          ]} />
        </Card>
      </div>
    </MobileFrame>
  );
};

export default AppHmVisitPage;
