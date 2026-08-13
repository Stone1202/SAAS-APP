import { useEffect, useState } from 'react';
import { Card, Calendar, Badge, Tag, Select, Space, Button, Spin, Empty } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useTodoStore } from '../../stores/useTodoStore';

export default function FollowCalendar() {
  const { todos, loading, loadAll } = useTodoStore();
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  useEffect(() => { loadAll({}); }, []);

  const handlePrevMonth = () => setCurrentMonth(prev => prev.subtract(1, 'month'));
  const handleNextMonth = () => setCurrentMonth(prev => prev.add(1, 'month'));

  const dateCellRender = (date: Dayjs) => {
    const dayStr = date.format('YYYY-MM-DD');
    const dayTodos = todos.filter(t => t.dueDate?.startsWith(dayStr));
    if (dayTodos.length === 0) return null;
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayTodos.map((t) => (
          <li key={t.id} style={{ marginBottom: 2 }}>
            <Badge
              color={t.priority === 'P0' ? 'red' : t.priority === 'P1' ? 'orange' : 'default'}
              text={<span style={{ fontSize: 11 }}>{t.title?.slice(0, 10)}{t.title?.length > 10 ? '...' : ''}</span>}
            />
          </li>
        ))}
      </ul>
    );
  };

  const monthCellRender = (date: Dayjs) => {
    const monthStr = date.format('YYYY-MM');
    const count = todos.filter(t => t.dueDate?.startsWith(monthStr)).length;
    if (count === 0) return null;
    return <span style={{ fontSize: 12, color: '#999' }}>待办 {count} 项</span>;
  };

  const pendingCount = todos.filter(t => t.status === 'pending').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>跟近日历</h1>
        <div className="description">
          以日历视图查看管理跟进待办，当前共有
          <Tag color="blue" style={{ margin: '0 4px' }}>{pendingCount} 项待处理</Tag>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <Button icon={<LeftOutlined />} onClick={handlePrevMonth}>上一月</Button>
            <span style={{ fontWeight: 600, fontSize: 16 }}>
              {currentMonth.format('YYYY年M月')}
            </span>
            <Button icon={<RightOutlined />} onClick={handleNextMonth}>下一月</Button>
          </Space>
          <Space>
            <Select
              defaultValue="all"
              style={{ width: 140 }}
              options={[
                { label: `全部 (${todos.length})`, value: 'all' },
                { label: `待处理 (${pendingCount})`, value: 'pending' },
              ]}
              onChange={(val) => loadAll(val === 'pending' ? { status: 'pending' } : {})}
            />
          </Space>
        </div>

        <Spin spinning={loading}>
          {todos.length === 0 && !loading ? (
            <Empty description="暂无待办任务" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <Calendar
              fullscreen
              value={currentMonth}
              onChange={(d) => setCurrentMonth(d)}
              dateCellRender={dateCellRender}
              monthCellRender={monthCellRender}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
}
