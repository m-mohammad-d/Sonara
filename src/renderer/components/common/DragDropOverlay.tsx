import React from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

interface DragDropOverlayProps {
  isDragging: boolean;
  isProcessing?: boolean;
}

export const DragDropOverlay: React.FC<DragDropOverlayProps> = ({
  isDragging,
  isProcessing = false,
}) => {
  if (!isDragging && !isProcessing) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Audio file drop zone"
      aria-live="polite"
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-8 bg-app/80 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
    >
      <div className="w-full max-w-lg rounded-3xl glass-panel border-2 border-dashed border-accent/60 bg-surface-elevated/90 p-10 flex flex-col items-center justify-center text-center shadow-2xl transition-transform duration-200 animate-in zoom-in-95">
        <div className="p-4 rounded-2xl bg-accent-subtle text-accent-text border border-accent-border mb-4 shadow-sm">
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8 animate-bounce duration-1000" />
          )}
        </div>

        <h2 className="text-base font-bold text-foreground tracking-tight">
          {isProcessing ? 'Importing Audio Files...' : 'Drop music files here'}
        </h2>

        <p className="text-xs text-foreground-muted mt-1 max-w-xs leading-relaxed">
          {isProcessing
            ? 'Parsing metadata and adding tracks to your library'
            : 'Release to add them to your Sonora library'}
        </p>

        {!isProcessing && (
          <div className="mt-5 px-3.5 py-1 rounded-full bg-surface border border-border-subtle text-[11px] font-semibold text-foreground-subtle tracking-wider uppercase">
            MP3 · FLAC · WAV · M4A · AAC · OGG · OPUS · WMA
          </div>
        )}
      </div>
    </div>
  );
};
