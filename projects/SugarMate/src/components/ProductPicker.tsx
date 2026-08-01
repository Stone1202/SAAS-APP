/**
 * ProductPicker — 统一商品选择器
 * 数据源：productStore（统一商品中心）
 * 
 * 使用场景：
 * - 直播间选品（LiveProductConfigPage）
 * - 营销活动选品
 * - 内容关联商品
 * - 订单关联商品
 * 
 * Props:
 * - mode: 'transfer' | 'table' | 'select'
 * - selectedIds: 已选中的 productId[]
 * - onSelect: 选中回调 (ids: string[]) => void
 * - filterStatus: 过滤状态，默认 'ON_SHELF'
 * - multi: 是否多选，默认 true
 * - excludeIds: 排除的 productId[]
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Table, Select, Tag, Typography, Space, Input, Empty, Spin } from 'antd';
import { SearchOutlined, ShoppingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useProductStore, type Product } from '@/stores/productStore';

const { Text } = Typography;

const CAT_EMOJI: Record<string, string> = {
  '血糖监测': '📟', '胰岛素注射': '💉', 'OTC药品': '💊', '健康食品': '🍬', '医疗辅具': '🩹',
};

const formatSales = (count: number): string => {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万已售`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k已售`;
  return `${count}已售`;
};

interface ProductPickerProps {
  /** 选择模式 */
  mode?: 'table' | 'select';
  /** 已选中的 productId 列表 */
  selectedIds?: string[];
  /** 选中回调 — 返回选中的 productId 数组 */
  onSelect?: (ids: string[]) => void;
  /** 过滤商品状态，默认 ON_SHELF */
  filterStatus?: 'ON_SHELF' | 'OFF_SHELF' | 'ALL';
  /** 是否多选 */
  multi?: boolean;
  /** 排除的 productId */
  excludeIds?: string[];
  /** 分页大小 */
  pageSize?: number;
  /** 自定义高度 */
  height?: number;
}

const ProductPicker: React.FC<ProductPickerProps> = ({
  mode = 'table',
  selectedIds = [],
  onSelect,
  filterStatus = 'ON_SHELF',
  multi = true,
  excludeIds = [],
  pageSize = 10,
  height,
}) => {
  const { products, loading, loadProducts } = useProductStore();
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    loadProducts({ page_size: 50 });
  }, []);

  // 可用商品列表
  const availableProducts = useMemo(() => {
    let list = products.filter(p => !excludeIds.includes(p.id));
    if (filterStatus !== 'ALL') list = list.filter(p => p.status === filterStatus);
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(kw) ||
        p.category_name?.toLowerCase().includes(kw) ||
        p.merchant_name?.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [products, filterStatus, excludeIds, keyword]);

  // 表格列定义
  const columns: ColumnsType<Product> = [
    {
      title: '商品', key: 'name', width: 240,
      render: (_, r) => (
        <Space>
          <span style={{ fontSize: 18 }}>{CAT_EMOJI[r.category_name] || '📦'}</span>
          <div>
            <Text strong style={{ fontSize: 13 }}>{r.name}</Text>
            <div style={{ fontSize: 11, color: '#999' }}>
              {r.merchant_name} · {r.category_name}
              <Tag color="geekblue" style={{ fontSize: 9, lineHeight: '14px', padding: '0 3px', marginLeft: 4 }}>
                {r.id}
              </Tag>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '价格', dataIndex: 'price', key: 'price', width: 80, align: 'center' as const,
      render: (v: number) => <Text style={{ color: '#f5222d', fontWeight: 600 }}>¥{v}</Text>,
    },
    {
      title: '库存', dataIndex: 'stock', key: 'stock', width: 60, align: 'center' as const,
    },
    {
      title: '销量', dataIndex: 'sales_count', key: 'sales', width: 80, align: 'center' as const,
      render: (v: number) => <Text style={{ fontSize: 11, color: '#999' }}>{formatSales(v)}</Text>,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 70, align: 'center' as const,
      render: (s: string) => {
        const color = s === 'ON_SHELF' ? 'green' : s === 'OFF_SHELF' ? 'default' : 'orange';
        const label = s === 'ON_SHELF' ? '上架' : s === 'OFF_SHELF' ? '下架' : '草稿';
        return <Tag color={color}>{label}</Tag>;
      },
    },
  ];

  // Select 模式
  if (mode === 'select') {
    return (
      <Select
        mode={multi ? 'multiple' : undefined}
        placeholder="选择商品…"
        showSearch
        value={selectedIds}
        onChange={(vals) => onSelect?.(vals as string[])}
        filterOption={(input, option) =>
          (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
        }
        style={{ width: '100%' }}
        options={availableProducts.map(p => ({
          label: `${CAT_EMOJI[p.category_name] || '📦'} ${p.name} (¥${p.price} · ${p.merchant_name})`,
          value: p.id,
        }))}
      />
    );
  }

  // Table 模式（默认）
  return (
    <div>
      <Input
        prefix={<SearchOutlined />}
        placeholder="搜索商品名称、分类、商户…"
        allowClear
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      <Table<Product>
        columns={columns}
        dataSource={availableProducts}
        rowKey="id"
        loading={loading}
        size="small"
        rowSelection={
          multi
            ? {
                selectedRowKeys: selectedIds,
                onChange: (keys) => onSelect?.(keys as string[]),
                preserveSelectedRowKeys: true,
              }
            : {
                type: 'radio',
                selectedRowKeys: selectedIds,
                onChange: (keys) => onSelect?.(keys as string[]),
              }
        }
        pagination={{ pageSize, showTotal: t => `共 ${t} 件商品` }}
        scroll={height ? { y: height } : undefined}
        locale={{ emptyText: <Empty description="暂无符合条件的商品" /> }}
      />
    </div>
  );
};

export default ProductPicker;
