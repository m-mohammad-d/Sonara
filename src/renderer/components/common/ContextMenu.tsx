import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  ListPlus,
  Heart,
  Folder,
  Trash2,
  FolderPlus,
  Sparkles,
  Download,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { usePlayerStore } from '../../stores/playerStore';
import { usePlaylistStore } from '../../stores/playlistStore';
import { useLibraryStore } from '../../stores/libraryStore';
import { createExportCollection } from '../../../shared/export/normalize';
import type { ExportFormat, ExportSource } from '../../../shared/export/types';
import type { Track } from '../../../shared/types';

export const ContextMenu: React.FC = () => {
  const { contextMenu, closeContextMenu, showToast } = useUIStore();
  const { playTrack, playNext, addToQueue } = usePlayerStore();
  const { playlists, toggleFavorite, isFavorite, addTracksToPlaylist, deletePlaylist } = usePlaylistStore();
  const { tracks } = useLibraryStore();
  const [showPlaylistsSubmenu, setShowPlaylistsSubmenu] = useState(false);
  const [showExportTrackSubmenu, setShowExportTrackSubmenu] = useState(false);
  const [showExportPlaylistSubmenu, setShowExportPlaylistSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('wheel', closeContextMenu);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('wheel', closeContextMenu);
    };
  }, [closeContextMenu]);

  if (!contextMenu) return null;

  const { x, y, track, playlistId } = contextMenu;
  const favorited = track ? isFavorite(track.id) : false;
  const playlistList = Object.values(playlists);

  // Position clamping
  const menuWidth = 200;
  const menuHeight = 320;
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 10);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 10);

  const handleExport = async (
    format: ExportFormat,
    exportTracks: Track[],
    name: string,
    source: ExportSource
  ) => {
    closeContextMenu();
    if (exportTracks.length === 0) {
      showToast('Export', 'No music to export.');
      return;
    }
    const collection = createExportCollection(exportTracks, name, source);
    const result = await window.electronAPI.exportMusicList({ collection, format });
    if (result.success && result.filePath) {
      const savedPath = result.filePath;
      showToast(
        'Export Successful',
        `Saved ${exportTracks.length} ${exportTracks.length === 1 ? 'track' : 'tracks'} as ${format.toUpperCase()}`,
        {
          label: 'Show in Folder',
          onClick: () => window.electronAPI.showItemInFolder(savedPath),
        }
      );
    } else if (!result.canceled) {
      showToast('Export Failed', result.error || 'Could not export the music list. Please try again.');
    }
  };

  return (
    <div
      ref={menuRef}
      style={{ left: `${clampedX}px`, top: `${clampedY}px` }}
      className="fixed z-50 w-52 rounded-xl glass-panel shadow-2xl p-1.5 border border-border text-xs text-foreground animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5"
    >
      {track && (
        <>
          <button
            onClick={() => {
              playTrack(track);
              closeContextMenu();
            }}
            className="group flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-fg transition w-full text-left"
          >
            <Play className="w-3.5 h-3.5 text-accent-text group-hover:text-accent-fg" />
            <span>Play</span>
          </button>

          <button
            onClick={() => {
              playNext(track);
              closeContextMenu();
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-hover hover:text-foreground transition w-full text-left"
          >
            <Sparkles className="w-3.5 h-3.5 text-foreground-muted" />
            <span>Play Next</span>
          </button>

          <button
            onClick={() => {
              addToQueue(track);
              closeContextMenu();
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-hover hover:text-foreground transition w-full text-left"
          >
            <ListPlus className="w-3.5 h-3.5 text-foreground-muted" />
            <span>Add to Queue</span>
          </button>

          <div className="relative" onMouseEnter={() => setShowPlaylistsSubmenu(true)} onMouseLeave={() => setShowPlaylistsSubmenu(false)}>
            <button
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-hover hover:text-foreground transition w-full text-left"
            >
              <div className="flex items-center gap-2.5">
                <FolderPlus className="w-3.5 h-3.5 text-foreground-muted" />
                <span>Add to Playlist</span>
              </div>
              <span className="text-[10px] text-foreground-subtle">▶</span>
            </button>

            {showPlaylistsSubmenu && playlistList.length > 0 && (
              <div className="absolute left-full top-0 ml-1 w-44 rounded-xl glass-panel shadow-2xl p-1 border border-border flex flex-col gap-0.5">
                {playlistList.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => {
                      addTracksToPlaylist(pl.id, [track.id]);
                      closeContextMenu();
                    }}
                    className="px-3 py-1.5 rounded-lg hover:bg-surface-hover text-left truncate text-foreground-secondary hover:text-foreground transition"
                  >
                    {pl.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              toggleFavorite(track.id);
              closeContextMenu();
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-hover hover:text-foreground transition w-full text-left"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                favorited ? 'text-red-400 fill-red-400' : 'text-foreground-muted'
              }`}
            />
            <span>{favorited ? 'Remove from Favorites' : 'Add to Favorites'}</span>
          </button>

          <div
            className="relative"
            onMouseEnter={() => setShowExportTrackSubmenu(true)}
            onMouseLeave={() => setShowExportTrackSubmenu(false)}
          >
            <button
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-hover hover:text-foreground transition w-full text-left"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-3.5 h-3.5 text-foreground-muted" />
                <span>Export Track</span>
              </div>
              <span className="text-[10px] text-foreground-subtle">▶</span>
            </button>

            {showExportTrackSubmenu && (
              <div className="absolute left-full top-0 ml-1 w-44 rounded-xl glass-panel shadow-2xl p-1 border border-border flex flex-col gap-0.5">
                <button
                  onClick={() => handleExport('html', [track], track.title, 'library')}
                  className="px-3 py-1.5 rounded-lg hover:bg-surface-hover text-left truncate text-foreground-secondary hover:text-foreground transition"
                >
                  HTML (.html)
                </button>
                <button
                  onClick={() => handleExport('pdf', [track], track.title, 'library')}
                  className="px-3 py-1.5 rounded-lg hover:bg-surface-hover text-left truncate text-foreground-secondary hover:text-foreground transition"
                >
                  PDF (.pdf)
                </button>
                <button
                  onClick={() => handleExport('csv', [track], track.title, 'library')}
                  className="px-3 py-1.5 rounded-lg hover:bg-surface-hover text-left truncate text-foreground-secondary hover:text-foreground transition"
                >
                  CSV (.csv)
                </button>
                <button
                  onClick={() => handleExport('json', [track], track.title, 'library')}
                  className="px-3 py-1.5 rounded-lg hover:bg-surface-hover text-left truncate text-foreground-secondary hover:text-foreground transition"
                >
                  JSON (.json)
                </button>
              </div>
            )}
          </div>

          <div className="my-1 border-t border-border-subtle" />

          <button
            onClick={() => {
              window.electronAPI.showItemInFolder(track.path);
              closeContextMenu();
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-hover hover:text-foreground transition w-full text-left"
          >
            <Folder className="w-3.5 h-3.5 text-foreground-muted" />
            <span>Show in Folder</span>
          </button>
        </>
      )}

      {playlistId && (
        <>
          {(() => {
            const playlist = playlists[playlistId];
            const playlistTracks = playlist
              ? playlist.trackIds.map((id) => tracks[id]).filter(Boolean)
              : [];

            return (
              <div
                className="relative"
                onMouseEnter={() => setShowExportPlaylistSubmenu(true)}
                onMouseLeave={() => setShowExportPlaylistSubmenu(false)}
              >
                <button
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-hover hover:text-foreground transition w-full text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-3.5 h-3.5 text-foreground-muted" />
                    <span>Export Playlist</span>
                  </div>
                  <span className="text-[10px] text-foreground-subtle">▶</span>
                </button>

                {showExportPlaylistSubmenu && (
                  <div className="absolute left-full top-0 ml-1 w-44 rounded-xl glass-panel shadow-2xl p-1 border border-border flex flex-col gap-0.5">
                    <button
                      onClick={() => handleExport('html', playlistTracks, playlist?.name || 'Playlist', 'playlist')}
                      className="px-3 py-1.5 rounded-lg hover:bg-surface-hover text-left truncate text-foreground-secondary hover:text-foreground transition"
                    >
                      HTML (.html)
                    </button>
                    <button
                      onClick={() => handleExport('pdf', playlistTracks, playlist?.name || 'Playlist', 'playlist')}
                      className="px-3 py-1.5 rounded-lg hover:bg-surface-hover text-left truncate text-foreground-secondary hover:text-foreground transition"
                    >
                      PDF (.pdf)
                    </button>
                    <button
                      onClick={() => handleExport('csv', playlistTracks, playlist?.name || 'Playlist', 'playlist')}
                      className="px-3 py-1.5 rounded-lg hover:bg-surface-hover text-left truncate text-foreground-secondary hover:text-foreground transition"
                    >
                      CSV (.csv)
                    </button>
                    <button
                      onClick={() => handleExport('m3u8', playlistTracks, playlist?.name || 'Playlist', 'playlist')}
                      className="px-3 py-1.5 rounded-lg hover:bg-surface-hover text-left truncate text-foreground-secondary hover:text-foreground transition"
                    >
                      M3U8 (.m3u8)
                    </button>
                    <button
                      onClick={() => handleExport('json', playlistTracks, playlist?.name || 'Playlist', 'playlist')}
                      className="px-3 py-1.5 rounded-lg hover:bg-surface-hover text-left truncate text-foreground-secondary hover:text-foreground transition"
                    >
                      JSON (.json)
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          <button
            onClick={() => {
              deletePlaylist(playlistId);
              closeContextMenu();
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition w-full text-left"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Playlist</span>
          </button>
        </>
      )}
    </div>
  );
};
