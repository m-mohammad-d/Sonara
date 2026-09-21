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
      <div className="w-[420px] rounded-2xl glass-panel p-6 shadow-2xl border border-white/10 text-slate-100 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold">New Playlist</h2>
          </div>
          <button
            onClick={() => toggleNewPlaylistModal(false)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">
              Playlist Name
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="My Favorite Tracks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">
              Description (optional)
            </label>
            <textarea
              placeholder="Add an optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => toggleNewPlaylistModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition shadow-sm shadow-indigo-500/30"
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
