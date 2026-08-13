/**
 * 知识卡片弹出组件 — 共享组件
 * KnowledgeLivePage 复用
 */
import React from 'react';
import { Button, Space } from 'antd';
import { CloseOutlined, FileTextOutlined, QuestionCircleOutlined } from '@ant-design/icons';

export interface KnowledgeCard {
  id: string;
  order: number;
  title: string;
  points: string[];
}

interface KnowledgeCardPopupProps {
  card: KnowledgeCard | null;
  onDismiss: () => void;
}

const KnowledgeCardPopup: React.FC<KnowledgeCardPopupProps> = ({ card, onDismiss }) => {
  if (!card) return null;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 290,
          zIndex: 20,
          animation: 'pomCardSlideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #fff 70%, #f0f9ff 100%)',
            borderRadius: 14,
            boxShadow: '0 8px 32px rgba(24,144,255,0.2), 0 2px 8px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: '1px solid rgba(24,144,255,0.1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 60%, #69b1ff 100%)',
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Space>
              <FileTextOutlined style={{ color: '#fff', fontSize: 16 }} />
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                {card.title}
              </span>
            </Space>
            <CloseOutlined
              style={{
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                fontSize: 14,
              }}
              onClick={onDismiss}
            />
          </div>
          {/* Content */}
          <div style={{ padding: '14px 16px' }}>
            {card.points.map((p, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 10,
                  padding: '8px 10px',
                  background: 'rgba(22,119,255,0.04)',
                  borderRadius: 8,
                  borderLeft: '3px solid #1677ff',
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#1677ff',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{ fontSize: 12, color: '#333', lineHeight: 1.6 }}
                >
                  {p}
                </span>
              </div>
            ))}
          </div>
          {/* Footer */}
          <div
            style={{
              padding: '8px 16px',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Button
              type="primary"
              shape="round"
              ghost
              size="small"
              icon={<QuestionCircleOutlined />}
            >
              向医生提问
            </Button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pomCardSlideIn {
          0% { opacity: 0; transform: translateX(-50%) translateY(-30px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
};

export default KnowledgeCardPopup;
