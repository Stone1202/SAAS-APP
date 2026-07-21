import { Card, Descriptions, Tag, Table } from 'antd';

// PG-TNT-PC-011 客户360视图（简化覆盖）
export default function Customer360() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>客户360视图</h1>
        <div className="description">全面了解客户的全生命周期信息和行为轨迹</div>
      </div>

      <Card style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h3 style={{ color: '#999' }}>客户360视图功能开发中</h3>
        <p style={{ color: '#bbb', marginTop: 8 }}>
          该功能将在 Sprint 2 中实现完整的信息聚合看板，<br />
          包括客户生命周期阶段、价值评分、行为轨迹、关联分析等
        </p>
      </Card>
    </div>
  );
}
