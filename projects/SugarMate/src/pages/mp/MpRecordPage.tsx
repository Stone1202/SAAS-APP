/**
 * MP记录页 — 血糖/运动/饮食记录
 */
import React, { useState } from 'react';
import { Segmented, Button, InputNumber, Input, DatePicker } from 'antd';
import MobileFrame, { MP_TABS } from '@/components/MobileFrame';

type RecordType = 'glucose' | 'exercise' | 'diet';

const MpRecordPage: React.FC = () => {
  const [type, setType] = useState<RecordType>('glucose');

  return (
    <MobileFrame title="健康记录" tabs={MP_TABS} basePath="/mp">
      <div style={{ padding: 12 }}>
        <Segmented
          block
          value={type}
          onChange={v => setType(v as RecordType)}
          options={[
            { value: 'glucose', label: '血糖' },
            { value: 'exercise', label: '运动' },
            { value: 'diet', label: '饮食' },
          ]}
          style={{ marginBottom: 16 }}
        />

        {type === 'glucose' && (
          <div>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>当前血糖值</div>
              <div style={{ fontSize: 56, fontWeight: 700, color: 'var(--color-primary)' }}>5.8</div>
              <div style={{ fontSize: 14, color: '#666' }}>mmol/L</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>手动记录</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>血糖值 (mmol/L)</div>
                <InputNumber style={{ width: '100%' }} placeholder="请输入血糖值" min={1} max={33} step={0.1} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>测量时间</div>
                <DatePicker showTime style={{ width: '100%' }} placeholder="选择时间" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>备注</div>
                <Input.TextArea rows={2} placeholder="空腹/餐后/睡前..." />
              </div>
              <Button type="primary" block>保存记录</Button>
            </div>

            {/* 历史记录 */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>最近记录</div>
              {[
                { time: '今天 08:15', value: 5.6, type: '空腹', status: '正常' },
                { time: '今天 12:30', value: 7.2, type: '午餐后2h', status: '偏高' },
                { time: '昨天 08:20', value: 5.4, type: '空腹', status: '正常' },
                { time: '昨天 12:25', value: 6.8, type: '午餐后2h', status: '正常' },
              ].map((item, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: 8, padding: '10px 12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 6,
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#999' }}>{item.time}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>{item.type}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: 20, fontWeight: 700,
                      color: item.value > 7.0 ? '#f5222d' : item.value < 3.9 ? '#fa8c16' : '#52c41a',
                    }}>
                      {item.value}
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: item.value > 7.0 ? '#f5222d' : '#52c41a',
                    }}>
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'exercise' && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏃</div>
            <div style={{ fontSize: 14 }}>运动记录</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>今日步数 4,200 / 目标 6,000</div>
          </div>
        )}

        {type === 'diet' && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🍚</div>
            <div style={{ fontSize: 14 }}>饮食记录</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>今日摄入 1,480 kcal / 目标 1,800 kcal</div>
          </div>
        )}
      </div>
    </MobileFrame>
  );
};

export default MpRecordPage;
