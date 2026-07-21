import { Card, Progress } from 'antd';

// PG-TNT-PC-014 转化漏斗+员工绩效（简化覆盖）
export default function ConversionFunnel() {
  const stages = [
    { label: '客户触达', count: 1280, percent: 100, color: '#1677FF' },
    { label: '意向沟通', count: 896, percent: 70, color: '#722ED1' },
    { label: '方案提供', count: 512, percent: 40, color: '#FA8C16' },
    { label: '商务谈判', count: 256, percent: 20, color: '#FAAD14' },
    { label: '成交', count: 128, percent: 10, color: '#52C41A' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>转化漏斗+员工绩效</h1>
        <div className="description">跟踪销售转化漏斗各阶段和员工绩效指标（详细图表将在 Sprint 2 实现）</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="转化漏斗">
          {stages.map((s) => (
            <div key={s.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>{s.label}</span>
                <span style={{ color: '#999' }}>{s.count} 人</span>
              </div>
              <Progress percent={s.percent} strokeColor={s.color} showInfo={false} />
            </div>
          ))}
        </Card>

        <Card title="员工绩效 Top 5">
          {[
            { name: '张经理', score: 95, deals: 28 },
            { name: '李顾问', score: 88, deals: 22 },
            { name: '王专员', score: 82, deals: 18 },
            { name: '赵主管', score: 75, deals: 15 },
            { name: '陈助理', score: 68, deals: 12 },
          ].map((e, i) => (
            <div key={e.name} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < 4 ? '1px solid #F5F5F5' : 'none',
            }}>
              <div>
                <span style={{ fontWeight: 500 }}>{i + 1}. {e.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <span>成交 {e.deals} 单</span>
                <Progress type="circle" percent={e.score} size={40} strokeColor="#1677FF" />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
