import React, { useRef, useState } from 'react';
import { formatTime } from '../../utils/formatters';

interface SliderProps {
  value: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
  showTimeTooltip?: boolean;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  max,
  onChange,
  onScrubStart,
  onScrubEnd,
  showTimeTooltip = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState(0);

  const percent = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || max <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = pos / rect.width;
    setHoverValue(ratio * max);
    setTooltipPos(pos);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || max <= 0) return;
    onScrubStart?.();

    const rect = containerRef.current.getBoundingClientRect();
    const update = (clientX: number) => {
      const pos = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const ratio = pos / rect.width;
      onChange(ratio * max);
    };

    update(e.clientX);

    const handleWindowMouseMove = (moveEvent: MouseEvent) => {
      update(moveEvent.clientX);
    };

    const handleWindowMouseUp = () => {
      onScrubEnd?.();
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoverValue(null);
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      className={`relative py-2 flex items-center cursor-pointer group select-none ${className}`}
    >
      {/* Tooltip on hover */}
      {showTimeTooltip && isHovered && hoverValue !== null && (
        <div
          style={{ left: `${tooltipPos}px` }}
          className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-surface-elevated border border-border text-[10px] font-mono text-foreground shadow-lg pointer-events-none"
        >
          {formatTime(hoverValue)}
        </div>
      )}

      {/* Track background */}
      <div
        style={{ backgroundColor: 'var(--slider-track)' }}
        className="w-full h-1 group-hover:h-1.5 rounded-full relative overflow-hidden transition-all"
      >
        {/* Progress fill */}
        <div
          style={{ width: `${percent}%` }}
          className="h-full bg-accent group-hover:bg-accent-hover rounded-full transition-[height]"
        />
      </div>

      {/* Handle thumb */}
      <div
        style={{ left: `${percent}%` }}
        className="absolute -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      />
    </div>
  );
};
