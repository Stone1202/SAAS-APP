import { useState, useEffect } from 'react';
import { Card, Input, Button, Tabs, Tag, Space, message } from 'antd';
import { SendOutlined, SmileOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useCustomerStore } from '../../stores/useCustomerStore';
import { useCommunicationStore } from '../../stores/useCommunicationStore';

const AiAssistPanel = () => {
  const { aiSuggestions, loadAiSuggestions } = useCommunicationStore();
  const [activeSubTab, setActiveSubTab] = useState('script');
  const [inputText, setInputText] = useState('');

  useEffect(() => { loadAiSuggestions(); }, []);

  const handleAdopt = (content: string) => {
    setInputText(content);
    message.success('话术已填入输入框');
  };

  return (
    <div className="ai-panel" style={{ height: '100%' }}>
      <Tabs
        activeKey={activeSubTab}
        onChange={setActiveSubTab}
        style={{ padding: '0 12px' }}
        items={[
          {
            key: 'script',
            label: '话术推荐',
            children: (
              <div className="panel-section" style={{ border: 'none' }}>
                <div className="panel-section-title">💡 推荐话术</div>
                {aiSuggestions.filter(s => !s.adopted).length === 0 ? (
                  <div style={{ color: '#999', padding: 16, textAlign: 'center' }}>暂无推荐话术</div>
                ) : (
                  aiSuggestions.filter(s => !s.adopted).map((s) => (
                    <div key={s.id} className="ai-script-card">
                      <div className="script-text">{s.content}</div>
                      <Button size="small" type="primary" ghost onClick={() => handleAdopt(s.content)}>
                        采纳
                      </Button>
                    </div>
                  ))
                )}
              </div>
            ),
          },
          {
            key: 'emotion',
            label: '情绪',
            children: (
              <div className="panel-section" style={{ border: 'none' }}>
                <div className="panel-section-title">😊 情绪：中性</div>
                <div className="emotion-curve">
                  <span style={{ color: '#52C41A' }}>🟢</span>
                  ┌──╲──┐<br />
                  │{'    '}╲──│
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: '#999' }}>
                  最近检测：无异常
                </div>
              </div>
            ),
          },
          {
            key: 'intent',
            label: '意图+商品',
            children: (
              <div className="panel-section" style={{ border: 'none' }}>
                <div className="panel-section-title">🎯 意向：比价</div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>
                  置信度 0.85
                </div>
                <div className="panel-section-title">📦 推荐商品</div>
                <div className="ai-product-card">
                  <div style={{ fontWeight: 500 }}>商品A</div>
                  <div style={{ color: '#FF4D4F', fontSize: 16 }}>¥299</div>
                  <Button size="small" type="primary" style={{ marginTop: 8 }}>一键发送</Button>
                </div>
                <div className="ai-product-card">
                  <div style={{ fontWeight: 500 }}>商品B</div>
                  <div style={{ color: '#FF4D4F', fontSize: 16 }}>¥599</div>
                  <Button size="small" type="primary" style={{ marginTop: 8 }}>一键发送</Button>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default function UnifiedCommunication() {
  const { customers, loadAll } = useCustomerStore();
  const [channel, setChannel] = useState('企微');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => { loadAll(); }, []);

  const customer = customers.find(c => c.id === selectedCustomer);

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr 360px', overflow: 'hidden' }}>
        {/* 客户信息侧栏 */}
        <div style={{ background: '#fff', borderRight: '1px solid #F0F0F0', overflow: 'auto', padding: 16 }}>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>选择客户</h3>
          <Input.Search
            placeholder="搜索客户..."
            style={{ marginBottom: 16 }}
            onSearch={(v) => loadAll({ search: v })}
          />
          {customers.slice(0, 20).map((c) => (
            <Card
              key={c.id}
              size="small"
              style={{
                marginBottom: 8,
                cursor: 'pointer',
                borderColor: selectedCustomer === c.id ? '#1677FF' : undefined,
              }}
              onClick={() => setSelectedCustomer(c.id)}
            >
              <div style={{ fontWeight: 500 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{c.phone} · {c.company}</div>
              <Space size={4} style={{ marginTop: 4 }}>
                {c.tags?.map((t) => <Tag key={t} color="blue" style={{ fontSize: 10 }}>{t}</Tag>)}
              </Space>
            </Card>
          ))}
        </div>

        {/* 沟通区 */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#fff' }}>
          {/* 渠道Tab */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F0F0' }}>
            <Space>
              {(['企微', '电话', '短信', '邮件'] as const).map((ch) => (
                <Tag.CheckableTag
                  key={ch}
                  checked={channel === ch}
                  onChange={() => setChannel(ch)}
                  style={{ padding: '4px 16px', fontSize: 14 }}
                >
                  {ch}
                </Tag.CheckableTag>
              ))}
            </Space>
          </div>

          {/* 消息区 */}
          <div style={{ flex: 1, padding: 16, overflow: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {!selectedCustomer ? (
              <div style={{ textAlign: 'center', color: '#999' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                <div style={{ fontSize: 16 }}>请从左侧选择客户开始沟通</div>
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                <div style={{ textAlign: 'center', color: '#999', marginBottom: 16, fontSize: 12 }}>
                  —— 开始与{customer?.name}的沟通 ——
                </div>
                {/* 模拟对话 */}
                <div style={{
                  background: '#E6F4FF',
                  padding: '10px 16px',
                  borderRadius: '6px 6px 6px 0',
                  marginBottom: 12,
                  maxWidth: '70%',
                }}>
                  您好，我对你们的产品比较感兴趣，能介绍一下吗？
                </div>
                <div style={{
                  background: '#F0F0F0',
                  padding: '10px 16px',
                  borderRadius: '6px 6px 0 6px',
                  marginBottom: 12,
                  maxWidth: '70%',
                  marginLeft: 'auto',
                }}>
                  您好！很高兴为您介绍。我们的产品主要功能包括...
                </div>
              </div>
            )}
          </div>

          {/* 输入区 */}
          <div style={{ padding: 16, borderTop: '1px solid #F0F0F0' }}>
            <Input.TextArea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="输入消息..."
              rows={3}
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Space>
                <Button icon={<SmileOutlined />} type="text" />
                <Button icon={<PaperClipOutlined />} type="text" />
              </Space>
              <Button type="primary" icon={<SendOutlined />} disabled={!selectedCustomer || !messageText.trim()}>
                发送
              </Button>
            </div>
          </div>
        </div>

        {/* AI辅助面板 */}
        <AiAssistPanel />
      </div>
    </div>
  );
}
