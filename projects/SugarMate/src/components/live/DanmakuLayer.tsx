/**
 * 飘屏弹幕层 — 共享组件
 * ShoppingLivePage / KnowledgeLivePage / AppLiveWatchPage 复用
 *
 * Props:
 *   comments     — 弹幕数据
 *   userColor    — 用户名颜色（默认 #ffd700）
 *   bgOpacity    — 背景透明度（默认 0.55）
 *   maxItems     — 最多显示条数（默认 12）
 */
import React, { useState, useEffect, useMemo } from 'react';

export interface DanmakuItem {
  id: string;
  user: string;
  content: string;
}

interface DanmakuLayerProps {
  comments: DanmakuItem[];
  userColor?: string;
  bgOpacity?: number;
  maxItems?: number;
  containerStyle?: React.CSSProperties;
}

const DanmakuLayer: React.FC<DanmakuLayerProps> = ({
  comments,
  userColor = '#ffd700',
  bgOpacity = 0.55,
  maxItems = 12,
  containerStyle,
}) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 40);
    return () => clearInterval(t);
  }, []);

  const slides = useMemo(() => {
    const items = comments.slice(-maxItems);
    // 分段位置计算——给每个弹幕独立的行和偏移
    return items.map((c, i) => {
      const row = i % Math.max(6, Math.min(items.length, 9));
      const baseRight = ((tick % 1000) - (i % items.length) * 180) % 900 - 200;
      return { ...c, row, right: baseRight };
    });
  }, [comments, tick, maxItems]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: 0,
        right: 80,
        height: 'calc(100% - 60px)',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 5,
        ...containerStyle,
      }}
    >
      {slides.map((c) => (
        <div
          key={c.id}
          style={{
            position: 'absolute',
            top: `${15 + c.row * 34}px`,
            right: `${c.right}px`,
            whiteSpace: 'nowrap',
            padding: '3px 12px',
            borderRadius: 14,
            background: `rgba(0,0,0,${bgOpacity})`,
            color: '#fff',
            fontSize: 12,
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span style={{ color: userColor, marginRight: 4 }}>{c.user}</span>
          {c.content}
        </div>
      ))}
    </div>
  );
};

export default DanmakuLayer;
