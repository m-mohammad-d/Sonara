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
  const themeMode = useSettingsStore((s) => s.themeMode);
  const accentColor = useSettingsStore((s) => s.accentColor);

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

    const computed = window.getComputedStyle(document.documentElement);
    const accent = computed.getPropertyValue('--color-accent').trim() || '#3b82f6';
    const accentHover = computed.getPropertyValue('--color-accent-hover').trim() || '#60a5fa';
    const accentText = computed.getPropertyValue('--color-accent-text').trim() || '#93c5fd';
    const accentSubtle = computed.getPropertyValue('--color-accent-subtle').trim() || 'rgba(59, 130, 246, 0.15)';
    const idleStroke = themeMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

    const render = () => {
      if (!canvas) return;
      const width = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, width, h);

      if (!isPlaying) {
        ctx.strokeStyle = idleStroke;
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
        gradient.addColorStop(0, accent);
        gradient.addColorStop(0.5, accentHover);
        gradient.addColorStop(1, accentText);

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
          gradient.addColorStop(0, accentSubtle);
          gradient.addColorStop(1, accent);

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
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // Default: Smooth continuous spectrum filled wave
        engine.getFrequencyData(freqData);

        const gradient = ctx.createLinearGradient(0, h, 0, 0);
        gradient.addColorStop(0, accentSubtle);
        gradient.addColorStop(0.7, accent);
        gradient.addColorStop(1, accentHover);

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
        ctx.strokeStyle = accentHover;
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
  }, [isPlaying, visualizerMode, height, themeMode, accentColor]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};
