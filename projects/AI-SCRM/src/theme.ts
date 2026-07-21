import type { ThemeConfig } from 'antd';

/**
 * AI-SCRM Design Tokens → Ant Design Theme 映射
 * 对齐设计文档 3.1-3.5 节
 */
export const theme: ThemeConfig = {
  token: {
    // 主色
    colorPrimary: '#1677FF',
    colorSuccess: '#52C41A',
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',
    colorInfo: '#1677FF',
    // 中性色
    colorText: 'rgba(0,0,0,0.88)',
    colorTextSecondary: 'rgba(0,0,0,0.45)',
    colorTextDisabled: 'rgba(0,0,0,0.25)',
    colorBgLayout: '#F5F5F5',
    colorBgContainer: '#FFFFFF',
    colorBorder: '#D9D9D9',
    // 字体
    fontSize: 14,
    fontSizeHeading1: 24,
    fontSizeHeading2: 20,
    fontSizeHeading3: 16,
    fontSizeHeading4: 14,
    // 圆角
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    // 阴影（近似Ant Design默认，已足够）
    // 行高
    lineHeight: 1.5714285714285714,
  },
  components: {
    Table: {
      rowHoverBg: '#E6F4FF',
      headerBg: '#FAFAFA',
    },
    Layout: {
      siderBg: '#001529',
    },
    Menu: {
      darkItemBg: '#001529',
    },
  },
};
