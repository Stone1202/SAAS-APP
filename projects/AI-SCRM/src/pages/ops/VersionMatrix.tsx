import { useEffect } from 'react';
import { Card, Table, Tag, Button, Drawer, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useOpsStore } from '../../stores/useOpsStore';

const versions = ['体验版', '基础版', '专业版', '企业版'];

export default function VersionMatrix() {
  const { versionFeatures, loading, loadVersionFeatures } = useOpsStore();

  useEffect(() => { loadVersionFeatures(); }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>版本矩阵配置</h1>
        <div className="description">配置各版本的功能开关、配额和定价信息</div>
      </div>

      <Card extra={<Button type="primary">新增版本</Button>}>
        <Table
          dataSource={versionFeatures}
          rowKey="feature"
          loading={loading}
          pagination={false}
          scroll={{ x: 800 }}
          columns={[
            {
              title: '功能',
              dataIndex: 'feature',
              key: 'feature',
              width: 160,
              fixed: 'left',
              render: (v: string) => <strong>{v}</strong>,
            },
            ...versions.map(v => ({
              title: <Tag color="blue" style={{ fontSize: 13 }}>{v}</Tag>,
              key: v,
              width: 140,
              render: (_: any, r: any) => (
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => message.info(`编辑 ${r.feature} 的 ${v} 配置`)}
                >
                  {r.versions?.[v] || '-'}
                </span>
              ),
            })),
          ]}
        />
      </Card>
    </div>
  );
}
