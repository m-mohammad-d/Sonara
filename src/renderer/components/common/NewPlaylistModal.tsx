import React, { useState, useEffect, useRef } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { usePlaylistStore } from '../../stores/playlistStore';

export const NewPlaylistModal: React.FC = () => {
  const { isNewPlaylistModalOpen, toggleNewPlaylistModal, navigate } = useUIStore();
  const { createPlaylist } = usePlaylistStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isNewPlaylistModalOpen) {
      setName('');
      setDescription('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isNewPlaylistModalOpen]);

  if (!isNewPlaylistModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPl = await createPlaylist(name.trim(), description.trim());
    toggleNewPlaylistModal(false);
    navigate('playlist-detail', { selectedPlaylistId: newPl.id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-[420px] rounded-2xl glass-panel p-6 shadow-2xl border border-border text-foreground flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-subtle text-accent-text">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-foreground">New Playlist</h2>
          </div>
          <button
            onClick={() => toggleNewPlaylistModal(false)}
            className="p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1.5">
              Playlist Name
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="My Favorite Tracks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-input border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground-muted block mb-1.5">
              Description (optional)
            </label>
            <textarea
              placeholder="Add an optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-surface-input border border-border text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => toggleNewPlaylistModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-foreground-muted hover:bg-surface-hover hover:text-foreground transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-accent hover:bg-accent-hover disabled:opacity-50 text-accent-fg transition shadow-sm shadow-accent-shadow"
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
