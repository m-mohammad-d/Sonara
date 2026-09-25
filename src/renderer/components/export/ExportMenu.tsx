import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileCode,
  FileText,
  Table,
  Braces,
  ListMusic,
  File,
  FileSpreadsheet,
  Columns3,
  Loader2,
} from 'lucide-react';
import type { Track } from '../../../shared/types';
import type { ExportFormat, ExportSource } from '../../../shared/export/types';
import { createExportCollection } from '../../../shared/export/normalize';
import { useUIStore } from '../../stores/uiStore';

interface ExportMenuProps {
  collectionName: string;
  source: ExportSource;
  tracks: Track[];
  label?: string;
  iconOnly?: boolean;
  className?: string;
}

interface FormatItem {
  format: ExportFormat;
  label: string;
  ext: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DOCUMENT_FORMATS: FormatItem[] = [
  { format: 'html', label: 'HTML Webpage', ext: '.html', icon: FileCode },
  { format: 'pdf', label: 'PDF Document', ext: '.pdf', icon: FileText },
  { format: 'md', label: 'Markdown Table', ext: '.md', icon: FileSpreadsheet },
];

const DATA_FORMATS: FormatItem[] = [
  { format: 'csv', label: 'CSV Spreadsheet', ext: '.csv', icon: Table },
  { format: 'tsv', label: 'TSV Spreadsheet', ext: '.tsv', icon: Columns3 },
  { format: 'json', label: 'JSON Data', ext: '.json', icon: Braces },
];

const PLAYLIST_FORMATS: FormatItem[] = [
  { format: 'm3u8', label: 'M3U8 Playlist', ext: '.m3u8', icon: ListMusic },
  { format: 'txt', label: 'Plain Text', ext: '.txt', icon: File },
];

export const ExportMenu: React.FC<ExportMenuProps> = ({
  collectionName,
  source,
  tracks,
  label = 'Export',
  iconOnly = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useUIStore();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (tracks.length === 0) {
      showToast('Export', 'No music to export.');
      return;
    }
    setIsOpen((prev) => !prev);
  };

  const handleExport = async (format: ExportFormat) => {
    setIsOpen(false);

    if (tracks.length === 0) {
      showToast('Export', 'No music to export.');
      return;
    }

    try {
      setIsExporting(true);
      const collection = createExportCollection(tracks, collectionName, source);
      const result = await window.electronAPI.exportMusicList({
        collection,
        format,
      });

      if (result.canceled) {
        return;
      }

      if (result.success && result.filePath) {
        const savedPath = result.filePath;
        showToast(
          'Export Successful',
          `Saved ${tracks.length} ${tracks.length === 1 ? 'track' : 'tracks'} as ${format.toUpperCase()}`,
          {
            label: 'Show in Folder',
            onClick: () => {
              window.electronAPI.showItemInFolder(savedPath);
            },
          }
        );
      } else {
        showToast('Export Failed', result.error || 'Could not export the music list. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Export failed:', err);
      showToast('Export Failed', 'Could not export the music list. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderSection = (title: string, items: FormatItem[]) => (
    <div className="py-1">
      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground-subtle">
        {title}
      </div>
      {items.map(({ format, label: itemLabel, ext, icon: Icon }) => (
        <button
          key={format}
          role="menuitem"
          onClick={() => handleExport(format)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition text-left group"
        >
          <div className="flex items-center gap-2.5">
            <Icon className="w-3.5 h-3.5 text-accent-text group-hover:scale-110 transition-transform" />
            <span>{itemLabel}</span>
          </div>
          <span className="text-[10px] text-foreground-subtle font-mono">{ext}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={isExporting}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={iconOnly ? `Export ${collectionName}` : undefined}
        className={
          iconOnly
            ? `p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-hover transition disabled:opacity-50 ${className}`
            : `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-surface-hover hover:bg-surface-elevated text-foreground-secondary hover:text-foreground border border-border-subtle transition disabled:opacity-50 shadow-sm ${className}`
        }
      >
        {isExporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-text" />
        ) : (
          <Download className="w-3.5 h-3.5 text-accent-text" />
        )}
        {!iconOnly && <span>{label}</span>}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel shadow-2xl p-1.5 border border-border bg-surface-elevated/95 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100 text-xs flex flex-col divide-y divide-border-subtle select-none"
        >
          {renderSection('Documents', DOCUMENT_FORMATS)}
          {renderSection('Data', DATA_FORMATS)}
          {renderSection('Playlist & Text', PLAYLIST_FORMATS)}
        </div>
      )}
    </div>
  );
};
