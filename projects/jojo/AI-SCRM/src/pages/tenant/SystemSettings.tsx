import { Card, Form, Input, Select, Button, Divider, message } from 'antd';

// PG-TNT-PC-015 系统设置（简化覆盖）
export default function SystemSettings() {
  const [form] = Form.useForm();

  const handleSave = () => {
    message.success('设置已保存');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>系统设置</h1>
        <div className="description">团队管理和权限配置</div>
      </div>

      <Card title="团队信息">
        <Form form={form} layout="vertical">
          <Form.Item label="团队名称" initialValue="九天科技销售团队">
            <Input />
          </Form.Item>
          <Form.Item label="行业">
            <Select mode="multiple" defaultValue={['大健康', '美妆']} options={[
              { label: '大健康', value: '大健康' },
              { label: '美妆', value: '美妆' },
              { label: '药业', value: '药业' },
              { label: '百货', value: '百货' },
            ]} />
          </Form.Item>
          <Button type="primary" onClick={handleSave}>保存设置</Button>
        </Form>
      </Card>

      <Card title="权限配置" style={{ marginTop: 16 }}>
        <div style={{ color: '#999', textAlign: 'center', padding: 40 }}>
          权限配置功能开发中，敬请期待
        </div>
      </Card>
    </div>
  );
}
