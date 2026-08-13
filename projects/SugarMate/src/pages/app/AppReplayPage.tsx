/**
 * AppReplayPage — APP 患者端「观看回放」页面
 * PRD FN-SUG-LIVE-012：患者可以观看已结束直播的回放内容
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Tag, Badge, Button, Space, Input, Empty, Row, Col, Divider, Slider, Select } from 'antd';
import {
  LeftOutlined, EyeOutlined, ClockCircleOutlined, HeartOutlined,
  MessageOutlined, ShareAltOutlined, PlayCircleOutlined, PauseCircleOutlined,
  StepForwardOutlined, StepBackwardOutlined, FastForwardOutlined, FastBackwardOutlined,
  CaretRightOutlined, DownloadOutlined,
} from '@ant-design/icons';
import MobileFrame, { APP_PATIENT_TABS } from '@/components/MobileFrame';

interface Replay {
  id: string;
  title: string;
  anchor: { name: string; avatar: string; title: string };
  thumbnail: string;
  duration: number; // 秒
  views: number;
  date: string;
  category: '健康' | '饮食' | '活动' | '问答';
  tags: string[];
  description: string;
}

const ALL_REPLAYS: Replay[] = [
  { id: 'r1', title: 'CGM动态血糖仪使用教程', anchor: { name: '张医生', avatar: '👨‍⚕️', title: '内分泌科主治医师' }, thumbnail: '🩸', duration: 2722, views: 1280, date: '2026-07-28', category: '健康', tags: ['CGM', '教程'], description: '详细讲解CGM传感器的佩戴、校准和使用技巧。' },
  { id: 'r2', title: '糖友互助交流会 第12期', anchor: { name: '李主任', avatar: '👨‍🏫', title: '康复科主任' }, thumbnail: '👥', duration: 3735, views: 896, date: '2026-07-27', category: '活动', tags: ['互助', '交流'], description: '糖友线上互助交流，分享控糖心得。' },
  { id: 'r3', title: '糖尿病饮食：一周食谱推荐', anchor: { name: '营养师小王', avatar: '👩‍🍳', title: '注册营养师' }, thumbnail: '🥗', duration: 1890, views: 2100, date: '2026-07-25', category: '饮食', tags: ['食谱', '一周'], description: '7天不重样的控糖食谱，简单易做。' },
  { id: 'r4', title: '低血糖急救与预防', anchor: { name: '张医生', avatar: '👨‍⚕️', title: '内分泌科主治医师' }, thumbnail: '🆘', duration: 1455, views: 3500, date: '2026-07-22', category: '健康', tags: ['低血糖', '急救'], description: '低血糖的识别、处理和预防措施全解。' },
  { id: 'r5', title: '糖友问答专场：你最关心的问题', anchor: { name: '糖友老周', avatar: '👴', title: '10年糖友' }, thumbnail: '❓', duration: 3660, views: 650, date: '2026-07-20', category: '问答', tags: ['问答', '经验'], description: '收集了50个最常见的糖友问题，一一解答。' },
];

const ReplayCard: React.FC<{ replay: Replay; onClick: () => void }> = ({ replay, onClick }) => {
  const fmtDur = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
      : `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <Card size="small" style={{ borderRadius: 10, marginBottom: 8 }} bodyStyle={{ padding: 8 }}
      onClick={onClick} hoverable>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{
          width: 90, height: 60, borderRadius: 6, flexShrink: 0,
          background: 'linear-gradient(135deg, #722ed1, #1a1a2e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, position: 'relative',
        }}>
          {replay.thumbnail}
          <div style={{
            position: 'absolute', bottom: 4, right: 6,
            background: 'rgba(0,0,0,0.7)', borderRadius: 4, padding: '1px 6px',
            color: '#fff', fontSize: 9, fontFamily: 'monospace',
          }}>
            <PlayCircleOutlined style={{ marginRight: 2, fontSize: 8 }} />
            {fmtDur(replay.duration)}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {replay.title}
          </div>
          <div style={{ fontSize: 10, color: '#999', marginBottom: 2 }}>
            {replay.anchor.avatar} {replay.anchor.name} · {replay.category}
          </div>
          <Space size={4}>
            <Tag style={{ fontSize: 9, lineHeight: '14px', margin: 0 }}><EyeOutlined /> {replay.views}</Tag>
            {replay.tags.map(t => <Tag key={t} style={{ fontSize: 9, lineHeight: '14px', margin: 0 }}>{t}</Tag>)}
          </Space>
        </div>
      </div>
    </Card>
  );
};

/** 列表页 */
const AppReplayListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<string>('all');

  const filtered = ALL_REPLAYS.filter(r =>
    (cat === 'all' || r.category === cat) &&
    (!search || r.title.includes(search) || r.anchor.name.includes(search))
  );

  return (
    <MobileFrame title="回放" tabs={APP_PATIENT_TABS} basePath="/app">
      <div style={{ padding: 12 }}>
        <Input.Search placeholder="搜索回放..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 8 }} allowClear />
        <Select value={cat} onChange={setCat} style={{ width: '100%', marginBottom: 12 }} size="small"
          options={[
            { label: '全部', value: 'all' },
            { label: '健康知识', value: '健康' },
            { label: '饮食食谱', value: '饮食' },
            { label: '互助活动', value: '活动' },
            { label: '问答专场', value: '问答' },
          ]} />
        {filtered.length === 0 ? <Empty description="暂无回放" /> : filtered.map(r => (
          <ReplayCard key={r.id} replay={r} onClick={() => navigate(`/app/community/replay/${r.id}`)} />
        ))}
      </div>
    </MobileFrame>
  );
};

export default AppReplayListPage;

/** 播放页 */
export const AppReplayWatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const replay = ALL_REPLAYS.find(r => r.id === id);
  if (!replay) return <div>回放不存在</div>;

  const fmtProgress = (p: number) => {
    const total = Math.floor((replay.duration * p) / 100);
    const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 模拟播放进度
  React.useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(timer); return 100; }
        return prev + 0.15;
      });
    }, 200);
    return () => clearInterval(timer);
  }, [playing]);

  const handlePlayPause = () => setPlaying(!playing);
  const handleSkip = (s: number) => setProgress(p => Math.min(100, Math.max(0, p + (s / replay.duration) * 100)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1a1a2e' }}>
      {/* 顶部返回 */}
      <div style={{
        padding: '8px 12px', color: '#fff', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <LeftOutlined onClick={() => navigate('/app/community/replays')}
          style={{ fontSize: 18, cursor: 'pointer', color: '#fff' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {replay.title}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
            {replay.anchor.avatar} {replay.anchor.name}
          </div>
        </div>
      </div>

      {/* 播放画面 */}
      <div style={{
        flex: 1, margin: '4px 8px', borderRadius: 8, overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(135deg, #722ed1 0%, #1a1a2e 50%, #0f3460 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 200,
      }}>
        {!playing && progress === 0 && (
          <div onClick={handlePlayPause} style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <CaretRightOutlined style={{ fontSize: 28, color: '#fff' }} />
          </div>
        )}
        {progress > 0 && (
          <div style={{ fontSize: 48, opacity: 0.6 }}>{replay.thumbnail}</div>
        )}
        {/* 进度条 */}
        {progress > 0 && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 12px' }}>
            <Slider value={progress} onChange={setProgress} style={{ marginBottom: 4 }}
              trackStyle={{ background: '#722ed1' }} railStyle={{ background: 'rgba(255,255,255,0.2)' }}
              tipFormatter={v => fmtProgress(v || 0)} />
          </div>
        )}
      </div>

      {/* 视频信息 + 控制 */}
      <div style={{ padding: '8px 12px', color: '#fff' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
          <EyeOutlined /> {replay.views}次观看 · {replay.date}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
          {replay.description}
        </div>

        {/* 控制栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: 4 }}>
          <FastBackwardOutlined style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
            onClick={() => handleSkip(-15)} />
          <StepBackwardOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
            onClick={() => handleSkip(-10)} />
          <div onClick={handlePlayPause} style={{
            width: 44, height: 44, borderRadius: '50%', background: '#722ed1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            {playing ? <PauseCircleOutlined style={{ fontSize: 22, color: '#fff' }} /> : <PlayCircleOutlined style={{ fontSize: 22, color: '#fff' }} />}
          </div>
          <StepForwardOutlined style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
            onClick={() => handleSkip(10)} />
          <FastForwardOutlined style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
            onClick={() => handleSkip(15)} />
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-around', paddingTop: 4 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 10 }}>
            <HeartOutlined style={{ fontSize: 18, display: 'block', margin: '0 auto 2px' }} /> 点赞
          </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 10 }}>
            <MessageOutlined style={{ fontSize: 18, display: 'block', margin: '0 auto 2px' }} /> 评论
          </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 10 }}>
            <DownloadOutlined style={{ fontSize: 18, display: 'block', margin: '0 auto 2px' }} /> 收藏
          </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 10 }}>
            <ShareAltOutlined style={{ fontSize: 18, display: 'block', margin: '0 auto 2px' }} /> 分享
          </span>
        </div>
      </div>
    </div>
  );
};
