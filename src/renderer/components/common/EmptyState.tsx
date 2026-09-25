import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-auto ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-accent-subtle border border-accent-border flex items-center justify-center text-accent-text mb-4 shadow-lg shadow-accent-shadow">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="text-base font-bold text-foreground mb-1.5">{title}</h3>
      <p className="text-xs text-foreground-muted leading-relaxed mb-6">{description}</p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-accent hover:bg-accent-hover text-accent-fg transition shadow-sm shadow-accent-shadow active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
