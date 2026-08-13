/**
 * MpPageFrame — MP 小程序子页面框架（无底部Tab，有返回+标题）
 * 
 * 用于小程序端非 Tab 级别的子页面
 */
import React from 'react';
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const MpPageFrame: React.FC<Props> = ({ title, children, onBack, rightAction }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: 20,
    }}>
      <div style={{
        width: 390,
        minHeight: 740,
        maxHeight: 'calc(100vh - 60px)',
        overflow: 'hidden',
        border: '8px solid #333',
        borderRadius: 40,
        backgroundColor: '#f5f5f5',
        boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* 微信风格状态栏 */}
        <div style={{
          height: 36,
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          color: '#333',
          fontSize: 11,
          fontWeight: 500,
        }}>
          <span>9:41</span>
          <span>WeChat ⬤⬤⬤</span>
          <span>100% ▮▮▮▮</span>
        </div>

        {/* 导航栏 */}
        <div style={{
          height: 48,
          backgroundColor: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
        }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ fontSize: 16 }}
          />
          <Typography.Text strong style={{ fontSize: 15, flex: 1, textAlign: 'center' }}>
            {title}
          </Typography.Text>
          <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>
            {rightAction}
          </div>
        </div>

        {/* 内容区 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: '#f5f5f5',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MpPageFrame;
