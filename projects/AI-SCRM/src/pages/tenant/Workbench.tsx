import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Skeleton, message } from 'antd';
import {
  TeamOutlined,
  MessageOutlined,
  ScheduleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { useTodoStore } from '../../stores/useTodoStore';
import { useCommunicationStore } from '../../stores/useCommunicationStore';

export default function Workbench() {
  const navigate = useNavigate();
  const { tenantStats, loading, loadTenantStats } = useDashboardStore();
  const { todos, loadAll: loadTodos, complete: completeTodo } = useTodoStore();
  const { records, loadRecords } = useCommunicationStore();

  useEffect(() => {
    loadTenantStats();
    loadTodos({ status: 'pending' });
    loadRecords();
  }, []);

  if (loading || !tenantStats) {
    return (
      <div className="page-container">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  const pendingTodos = todos.filter(t => t.status === 'pending').slice(0, 5);
  const recentRecords = records.slice(0, 10);

  return (
    <div className="page-container">
      {/* 快捷入口 */}
      <div className="quick-actions">
        <div className="quick-action-card" onClick={() => navigate('/tenant/customers')}>
          <div className="action-icon"><TeamOutlined /></div>
          <div className="action-label">客户管理</div>
        </div>
        <div className="quick-action-card" onClick={() => navigate('/tenant/communication')}>
          <div className="action-icon"><MessageOutlined /></div>
          <div className="action-label">开始沟通</div>
        </div>
        <div className="quick-action-card" onClick={() => navigate('/tenant/todos')}>
          <div className="action-icon"><ScheduleOutlined /></div>
          <div className="action-label">待办任务</div>
        </div>
      </div>

      {/* 概览卡片 */}
      <div className="card-grid">
        <div className="stat-card">
          <div className="stat-value">{tenantStats.todayTodos}</div>
          <div className="stat-label">今日待办</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tenantStats.todayCommunications}</div>
          <div className="stat-label">今日沟通</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tenantStats.newCustomersThisWeek}</div>
          <div className="stat-label">本周新增客户</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tenantStats.followUpCompletionRate}%</div>
          <div className="stat-label">跟进完成率</div>
        </div>
      </div>

      {/* 待办列表 + 消息提醒 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card
          title="待办列表"
          extra={<a onClick={() => navigate('/tenant/todos')}>查看全部 →</a>}
        >
          {pendingTodos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>暂无待办</div>
          ) : (
            pendingTodos.map((todo) => (
              <div
                key={todo.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #F5F5F5',
                }}
              >
                <div>
                  <span className={`priority-dot ${todo.priority.toLowerCase()}`} />
                  {todo.title}
                </div>
                <a
                  onClick={async () => {
                    await completeTodo(todo.id);
                    message.success('待办已标记完成');
                  }}
                >
                  完成
                </a>
              </div>
            ))
          )}
        </Card>

        <Card title="消息提醒" extra={<a>查看全部 →</a>}>
          <div style={{ padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
            <span style={{ color: '#FF4D4F' }}>⚠️ 客户张三情绪负面</span>
            <span style={{ color: '#999', marginLeft: 8, fontSize: 12 }}>3分钟前</span>
          </div>
          <div style={{ padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
            <span style={{ color: '#1677FF' }}>📋 跟进任务已生成</span>
            <span style={{ color: '#999', marginLeft: 8, fontSize: 12 }}>10分钟前</span>
          </div>
          <div style={{ padding: '10px 0' }}>
            <span style={{ color: '#52C41A' }}>✅ 客户李四已付款</span>
            <span style={{ color: '#999', marginLeft: 8, fontSize: 12 }}>30分钟前</span>
          </div>
        </Card>
      </div>

      {/* 最近沟通 */}
      <Card title="最近沟通" extra={<a onClick={() => navigate('/tenant/communication/records')}>查看全部 →</a>}>
        {recentRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>暂无沟通记录</div>
        ) : (
          recentRecords.map((r) => (
            <div
              key={r.id}
              style={{
                padding: '10px 0',
                borderBottom: '1px solid #F5F5F5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                {r.channel === '企微' ? '💬' : r.channel === '电话' ? '📞' : r.channel === '短信' ? '📱' : '📧'}
                {' '}{r.customerName} - {r.channel} - {r.content?.slice(0, 30)}...
              </div>
              <span style={{ color: '#999', fontSize: 12 }}>
                {new Date(r.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
