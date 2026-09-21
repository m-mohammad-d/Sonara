import React, { useEffect, useRef } from 'react';
import { AudioEngine } from '../../audio/engine';
import { usePlayerStore } from '../../stores/playerStore';
import { useSettingsStore } from '../../stores/settingsStore';

interface AudioVisualizerProps {
  className?: string;
  height?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  className = '',
  height = 56,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const visualizerMode = useSettingsStore((s) => s.visualizerMode);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = AudioEngine.getInstance();
    let animId: number;

    const bufferLength = engine.getAnalyserFrequencyBinCount();
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    const render = () => {
      if (!canvas) return;
      const width = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, width, h);

      if (!isPlaying) {
        // Draw subtle idle line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(width, h / 2);
        ctx.stroke();
        return;
      }

      if (visualizerMode === 'waveform') {
        engine.getTimeDomainData(timeData);

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(0.5, '#a855f7');
        gradient.addColorStop(1, '#06b6d4');

        ctx.lineWidth = 2;
        ctx.strokeStyle = gradient;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, h / 2);
        ctx.stroke();
      } else if (visualizerMode === 'bars') {
        engine.getFrequencyData(freqData);

        const barCount = 48;
        const barWidth = (width / barCount) * 0.75;
        const gap = (width / barCount) * 0.25;
        const step = Math.floor(bufferLength / barCount);

        for (let i = 0; i < barCount; i++) {
          const val = freqData[i * step] || 0;
          const percent = val / 255;
          const barHeight = Math.max(3, percent * (h - 6));

          const gradient = ctx.createLinearGradient(0, h, 0, h - barHeight);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
          gradient.addColorStop(1, '#818cf8');

          ctx.fillStyle = gradient;
          const x = i * (barWidth + gap);
          const y = h - barHeight;

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else if (visualizerMode === 'circular') {
        engine.getFrequencyData(freqData);

        const centerX = width / 2;
        const centerY = h / 2;
        const radius = Math.min(centerX, centerY) * 0.55;
        const points = 64;

        ctx.beginPath();
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const val = freqData[i % bufferLength] || 0;
          const barLen = (val / 255) * (radius * 0.8);
          const r = radius + barLen;

          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // Default: Smooth continuous spectrum filled wave
        engine.getFrequencyData(freqData);

        const gradient = ctx.createLinearGradient(0, h, 0, 0);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.05)');
        gradient.addColorStop(0.5, 'rgba(129, 140, 248, 0.35)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0.8)');

        ctx.beginPath();
        ctx.moveTo(0, h);

        const sliceWidth = width / (bufferLength * 0.65);
        let x = 0;

        for (let i = 0; i < bufferLength * 0.65; i++) {
          const val = freqData[i] || 0;
          const percent = val / 255;
          const y = h - percent * (h - 4);

          ctx.lineTo(x, y);
          x += sliceWidth;
        }

        ctx.lineTo(width, h);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Top line
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        x = 0;
        for (let i = 0; i < bufferLength * 0.65; i++) {
          const val = freqData[i] || 0;
          const percent = val / 255;
          const y = h - percent * (h - 4);

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }
        ctx.stroke();
      }

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    if (isPlaying) {
      animId = requestAnimationFrame(render);
    } else {
      render();
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, visualizerMode, height]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};
