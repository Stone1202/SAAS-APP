/**
 * LiveInteractPage — 主播互动管理（直播端）
 * PRD FN-SUG-LIVE-004 对应：实时弹幕/IM互动，主播查看+回复+置顶
 *
 * 注意：此文件实际用作「互动」Tab，文件名为历史兼容保留。
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Input, Button, Tag, Empty, Space, Badge, Tooltip, message } from 'antd';
import {
  SendOutlined,
  PushpinOutlined,
  DeleteOutlined,
  MessageOutlined,
  WechatOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';

interface ChatMessage {
  id: number;
  user: string;
  avatar: string;
  content: string;
  type: 'chat' | 'order' | 'question' | 'system';
  liked: boolean;
  pinned: boolean;
  timestamp: string;
}

const MOCK_USERS = ['糖友小李', '糖小宝', '健康达人', '老张养生', '爱运动的喵', '血糖管理师', '甜甜圈', '小吴医生'];
const MOCK_QUESTIONS = [
  '这个CGM能用多久？', '适合孕妇用吗？', '空腹血糖正常范围是多少？',
  '运动后血糖反而升高了？', '二甲双胍有副作用吗？', '套餐包含试纸吗？',
];
const MOCK_CHATS = [
  '讲得太好了！👍', '支持主播', '已下单', '666', '这个知识点很实用',
  '医生讲得真专业', '学到了', '请问怎么测餐后血糖？', '😍😍😍', '收藏了',
];

let msgId = 0;
const genMsg = (): ChatMessage => {
  msgId++;
  const isQuestion = Math.random() < 0.15;
  const isOrder = Math.random() < 0.05;
  return {
    id: msgId,
    user: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)],
    avatar: '',
    content: isOrder
      ? '🎉 下单了 CGM 动态血糖仪'
      : isQuestion
        ? MOCK_QUESTIONS[Math.floor(Math.random() * MOCK_QUESTIONS.length)]
        : MOCK_CHATS[Math.floor(Math.random() * MOCK_CHATS.length)],
    type: isOrder ? 'order' : isQuestion ? 'question' : 'chat',
    liked: Math.random() < 0.3,
    pinned: false,
    timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
};

const LiveSchedulePage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(Array.from({ length: 8 }, genMsg));
  const [replyInput, setReplyInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false); // 模拟直播中
  const [pinnedId, setPinnedId] = useState<number | null>(null);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 模拟实时弹幕
  useEffect(() => {
    if (isStreaming) {
      timerRef.current = setInterval(() => {
        const newMsg = genMsg();
        setMessages(prev => [...prev.slice(-50), newMsg]); // 保留最近50条
      }, 2500);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isStreaming]);

  // 自动滚动到底部
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleReply = useCallback(() => {
    if (!replyInput.trim()) return;
    const reply: ChatMessage = {
      id: Date.now(),
      user: '我（主播）',
      avatar: '',
      content: replyInput,
      type: 'system',
      liked: false,
      pinned: false,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setMessages(prev => [...prev, reply]);
    setReplyInput('');
    message.success('已发送');
  }, [replyInput]);

  const pinMessage = (id: number) => {
    setMessages(prev => prev.map(m => ({ ...m, pinned: m.id === id })));
    setPinnedId(id);
    message.success('已置顶');
  };

  const removeMessage = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const typeColor: Record<string, string> = { chat: 'default', order: 'gold', question: 'blue', system: 'red' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8f9fa', overflow: 'hidden' }}>
      {/* 顶部控制 */}
      <div style={{ padding: '8px 12px', background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size={8}>
          <MessageOutlined />
          <span style={{ fontSize: 13, fontWeight: 600 }}>直播间互动</span>
          <Badge count={messages.length} size="small" />
        </Space>
        <Button size="small" type={isStreaming ? 'primary' : 'default'} danger={isStreaming}
          onClick={() => setIsStreaming(!isStreaming)}>
          {isStreaming ? '⏹ 停止模拟' : '▶ 模拟弹幕'}
        </Button>
      </div>

      {/* 置顶消息 */}
      {pinnedId && (() => {
        const pinned = messages.find(m => m.id === pinnedId);
        if (!pinned) return null;
        return (
          <div style={{
            margin: '4px 8px', padding: '6px 10px', borderRadius: 6,
            background: 'linear-gradient(135deg, #fff7f0, #ffe4d0)',
            border: '1px solid #ffd6a5', fontSize: 12,
          }}>
            <Space>
              <PushpinOutlined style={{ color: '#e94560' }} />
              <span style={{ color: '#666' }}>📌 置顶：</span>
              <span style={{ fontWeight: 500 }}>{pinned.user}：{pinned.content}</span>
              <Button size="small" type="link" danger onClick={() => { setPinnedId(null); setMessages(prev => prev.map(m => ({ ...m, pinned: false }))); }}
                style={{ padding: 0, fontSize: 11 }}>
                取消
              </Button>
            </Space>
          </div>
        );
      })()}

      {/* 消息列表 */}
      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        {messages.length === 0 && <Empty description="暂无互动" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex', gap: 6, padding: '4px 0', alignItems: 'flex-start',
            background: msg.type === 'system' ? '#e6f7ff' : msg.type === 'order' ? '#fffbe6' : 'transparent',
            borderRadius: 4, paddingLeft: 4,
          }}>
            {/* 用户 */}
            <Tag color={typeColor[msg.type]} style={{ margin: 0, fontSize: 10, lineHeight: '18px', flexShrink: 0, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {msg.type === 'order' ? '🛒' : msg.type === 'question' ? '❓' : ''} {msg.user}
            </Tag>
            {/* 内容 */}
            <span style={{ fontSize: 12, flex: 1, wordBreak: 'break-all', lineHeight: '18px' }}>
              {msg.content}
            </span>
            {/* 操作 */}
            <Space size={2} style={{ flexShrink: 0 }}>
              <Tooltip title="置顶"><Button size="small" type="text" icon={<PushpinOutlined style={{ fontSize: 10 }} />}
                onClick={() => pinMessage(msg.id)} style={{ padding: '0 4px', height: 18 }} /></Tooltip>
              <Tooltip title="删除"><Button size="small" type="text" danger icon={<DeleteOutlined style={{ fontSize: 10 }} />}
                onClick={() => removeMessage(msg.id)} style={{ padding: '0 4px', height: 18 }} /></Tooltip>
            </Space>
          </div>
        ))}
        <div ref={msgEndRef} />
      </div>

      {/* 底部回复 */}
      <div style={{ padding: '8px 12px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
        <Input.Search enterButton={<SendOutlined />} placeholder="回复互动消息..."
          value={replyInput} onChange={e => setReplyInput(e.target.value)}
          onSearch={handleReply} size="small" />
      </div>
    </div>
  );
};

export default LiveSchedulePage;
