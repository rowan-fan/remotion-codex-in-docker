import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import './styles.css';

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const progress = Math.min(100, Math.round((frame / Math.max(1, durationInFrames - 1)) * 100));
  const seconds = (durationInFrames / fps).toFixed(1);

  return (
    <AbsoluteFill className="video-root">
      <div className="background-grid" />
      <main className="content" style={{opacity}}>
        <p className="eyebrow">Remotion + Codex Docker</p>
        <h1>AI 视频剪辑工作区已就绪</h1>
        <p className="subtitle">
          将素材放入 /media/input，使用 Codex 修改 /workspace，然后渲染到 /media/output/final.mp4。
        </p>
        <div className="status-row">
          <span>MainVideo</span>
          <span>{seconds}s</span>
          <span>{progress}%</span>
        </div>
      </main>
    </AbsoluteFill>
  );
};
