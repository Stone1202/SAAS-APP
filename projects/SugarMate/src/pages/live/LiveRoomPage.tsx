/**
 * LiveRoomPage — 主播开播页（直播端）
 * PRD FN-SUG-LIVE-001~008 对应：推流/美颜/多机位/贴片/绿幕/定时/连麦/虚拟背景
 */
import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, Tag, Tooltip, Progress, Card, Radio, Slider, Switch, Select } from 'antd';
import {
  ThunderboltOutlined,
  SettingOutlined,
  CameraOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  PieChartOutlined,
  FullscreenOutlined,
  ApiOutlined,
  SkinOutlined,
  ExpandOutlined,
} from '@ant-design/icons';

type StreamStatus = 'idle' | 'preparing' | 'live' | 'paused';

const LiveRoomPage: React.FC = () => {
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [viewers, setViewers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [beautyLevel, setBeautyLevel] = useState(60);
  const [cameraId, setCameraId] = useState('front');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 推流计时 + 模拟观众增长
  useEffect(() => {
    if (status === 'live') {
      timerRef.current = setInterval(() => {
        setElapsed(t => t + 1);
        setViewers(v => v + (Math.random() > 0.7 ? 1 : 0));
        setLikes(l => l + (Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : 0));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const handleGoLive = () => {
    setStatus('preparing');
    setTimeout(() => {
      setStatus('live');
      setViewers(Math.floor(Math.random() * 30) + 10);
    }, 2000);
  };

  const handleEndLive = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('idle');
    setElapsed(0);
  };

  const handlePause = () => setStatus(s => (s === 'paused' ? 'live' : 'paused'));

  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const isLive = status === 'live' || status === 'paused';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1a1a2e' }}>
      {/* ============ 顶部状态栏 ============ */}
      <div style={{ padding: '8px 12px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Space size={12}>
          {isLive ? (
            <Tag color="red" style={{ margin: 0, fontWeight: 700 }}>
              <ThunderboltOutlined /> LIVE {formatElapsed(elapsed)}
            </Tag>
          ) : status === 'preparing' ? (
            <Tag color="orange" style={{ margin: 0 }}>准备中...</Tag>
          ) : (
            <Tag color="default" style={{ margin: 0 }}>未开播</Tag>
          )}
          <span style={{ fontSize: 12, color: '#888' }}>SugarMate 直播</span>
          <Tag style={{ fontSize: 9, background: 'rgba(114,46,209,0.1)', color: '#b37feb', border: '1px solid rgba(114,46,209,0.2)' }}
            title="轻量预览模式：独立数据，不联动运营后台与中控台">
            🧪 轻量预览
          </Tag>
        </Space>
        {isLive && (
          <Space size={4}>
            <Tooltip title={`${viewers} 人观看`}>
              <Tag color="blue" style={{ margin: 0 }}>👥 {viewers}</Tag>
            </Tooltip>
            <Tooltip title={`${likes} 赞`}>
              <Tag color="magenta" style={{ margin: 0 }}>❤️ {likes}</Tag>
            </Tooltip>
          </Space>
        )}
      </div>

      {/* ============ 推流预览区（核心 — 模拟实时画面） ============ */}
      <div style={{
        flex: 1, margin: 8, borderRadius: 8, overflow: 'hidden',
        position: 'relative',
        background: status === 'idle'
          ? 'linear-gradient(135deg, #16213e 0%, #0f3460 50%, #1a1a2e 100%)'
          : 'linear-gradient(135deg, #1a1a2e 0%, #e94560 30%, #0f3460 70%, #1a1a2e 100%)',
        minHeight: 280,
      }}>
        {/* 模拟视频网格背景 */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.02) 20px, rgba(255,255,255,0.02) 21px),
                       repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.02) 20px, rgba(255,255,255,0.02) 21px)`,
          animation: isLive ? 'gridPulse 3s infinite' : 'none',
        }} />

        {/* 主播头像占位 */}
        {isLive && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 120, height: 120, borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 35%, rgba(233,69,96,0.3) 0%, rgba(15,52,96,0.8) 100%)',
            boxShadow: '0 0 60px rgba(233,69,96,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'avatarGlow 2s ease-in-out infinite',
          }}>
            <CameraOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.6)' }} />
          </div>
        )}

        {/* 闲置状态提示 */}
        {status === 'idle' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <CameraOutlined style={{ fontSize: 56, color: 'rgba(255,255,255,0.15)' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>点击下方「开始直播」推流（轻量预览模式）</span>
            <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 10 }}>独立数据，不联动运营后台与中控台</span>
          </div>
        )}

        {/* 暂停蒙版 */}
        {status === 'paused' && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 20, fontWeight: 700,
          }}>
            ⏸ 直播已暂停
          </div>
        )}

        {/* 准备中 */}
        {status === 'preparing' && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            <Progress type="circle" percent={100} status="active" strokeColor="#e94560" size={64} />
            <span style={{ color: '#fff' }}>推流准备中...</span>
          </div>
        )}

        {/* 中央信息叠加 */}
        {isLive && (
          <>
            <div style={{
              position: 'absolute', top: 12, left: 12,
              background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '6px 12px',
              color: '#fff', fontSize: 12,
            }}>
              <Space size={16}>
                <span>🎥 1080P 30fps</span>
                <span>📶 2.4 Mbps</span>
                <span>⚡ {beautyLevel}% 美颜</span>
              </Space>
            </div>
            {/* 时间戳水印 */}
            <div style={{
              position: 'absolute', bottom: 12, right: 12,
              background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: '4px 10px',
              color: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'monospace',
            }}>
              SugarMate Live {new Date().toISOString().slice(0, 19).replace('T', ' ')}
            </div>
          </>
        )}
      </div>

      {/* ============ 控制面板 ============ */}
      <div style={{ padding: '8px 12px 12px', color: '#fff' }}>
        {/* 直播设置 */}
        <Card size="small" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', marginBottom: 8 }}
          bodyStyle={{ padding: '8px 12px' }} title={<span style={{ color: '#fff', fontSize: 12 }}>⚙ 直播设置</span>}>
          <Space direction="vertical" style={{ width: '100%' }} size={4}>
            {/* 摄像头 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#aaa' }}>📷 摄像头</span>
              <Radio.Group value={cameraId} onChange={e => setCameraId(e.target.value)} size="small"
                optionType="button" buttonStyle="solid" style={{ fontSize: 11 }}>
                <Radio.Button value="front">前置</Radio.Button>
                <Radio.Button value="back">后置</Radio.Button>
                <Radio.Button value="external">外部</Radio.Button>
              </Radio.Group>
            </div>
            {/* 美颜 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#aaa' }}>✨ 美颜</span>
              <Slider value={beautyLevel} onChange={setBeautyLevel} min={0} max={100} style={{ width: 120, margin: 0 }}
                trackStyle={{ background: '#e94560' }} />
            </div>
            {/* 声音 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#aaa' }}>🎤 麦克风</span>
              <Switch checkedChildren={<AudioOutlined />} unCheckedChildren={<AudioMutedOutlined />}
                checked={micOn} onChange={setMicOn} size="small" style={{ background: micOn ? '#e94560' : undefined }} />
            </div>
          </Space>
        </Card>

        {/* 操作按钮 */}
        <Space style={{ width: '100%', justifyContent: 'center' }} size={12}>
          {status === 'idle' && (
            <Button type="primary" danger size="large" icon={<ThunderboltOutlined />}
              onClick={handleGoLive}
              style={{ width: 160, height: 44, fontWeight: 700, fontSize: 16, borderRadius: 22 }}>
              开始直播
            </Button>
          )}
          {isLive && (
            <>
              <Button onClick={handlePause} icon={status === 'paused' ? <ExpandOutlined /> : undefined}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}>
                {status === 'paused' ? '继续' : '暂停'}
              </Button>
              <Button danger type="primary" onClick={handleEndLive}
                style={{ fontWeight: 700 }}>
                结束直播
              </Button>
            </>
          )}
        </Space>
      </div>

      {/* grid 动画 */}
      <style>{`
        @keyframes gridPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes avatarGlow { 0%,100%{box-shadow:0 0 40px rgba(233,69,96,0.3)} 50%{box-shadow:0 0 80px rgba(233,69,96,0.6)} }
      `}</style>
    </div>
  );
};

export default LiveRoomPage;
