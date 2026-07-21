import { useEffect } from 'react';
import { Card, Calendar, Badge, Tag, Select, Space, Button } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useTodoStore } from '../../stores/useTodoStore';

export default function FollowCalendar() {
  const { todos, loading, loadAll } = useTodoStore();

  useEffect(() => { loadAll({ status: 'pending' }); }, []);

  const dateCellRender = (date: Dayjs) => {
    const dayStr = date.format('YYYY-MM-DD');
    const dayTodos = todos.filter(t => t.dueDate?.startsWith(dayStr));
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayTodos.map((t) => (
          <li key={t.id} style={{ marginBottom: 2 }}>
            <Badge
              color={t.priority === 'P0' ? 'red' : t.priority === 'P1' ? 'orange' : 'default'}
              text={<span style={{ fontSize: 11 }}>{t.title?.slice(0, 8)}{t.title?.length > 8 ? '...' : ''}</span>}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>跟近日历</h1>
        <div className="description">以日历视图查看和管理跟进待办，支持拖拽调整和筛选</div>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <Button icon={<LeftOutlined />}>上一周</Button>
            <span style={{ fontWeight: 600, fontSize: 16 }}>
              {dayjs().format('YYYY年M月 第W周')}
            </span>
            <Button icon={<RightOutlined />}>下一周</Button>
          </Space>
          <Space>
            <Tag.CheckableTag checked style={{ padding: '4px 12px' }}>周视图</Tag.CheckableTag>
            <Tag.CheckableTag checked={false} style={{ padding: '4px 12px' }}>月视图</Tag.CheckableTag>
            <Select defaultValue="all" style={{ width: 120 }} options={[{ label: '全部坐席', value: 'all' }]} />
          </Space>
        </div>

        <Calendar
          fullscreen
          dateCellRender={dateCellRender}
          headerRender={() => null}
        />
      </Card>
    </div>
  );
}
