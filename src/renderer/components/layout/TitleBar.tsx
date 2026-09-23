import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Minus,
  Square,
  Copy,
  RefreshCw,
} from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import { useLibraryStore } from "../../stores/libraryStore";

export const TitleBar: React.FC = () => {
  const { history, historyIndex, goBack, goForward } = useUIStore();
  const { searchQuery, setSearchQuery, isScanning, scanProgress } =
    useLibraryStore();
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    window.electronAPI.isWindowMaximized().then(setIsMaximized);
  }, []);

  const handleMinimize = () => {
    window.electronAPI.minimizeWindow();
  };

  const handleMaximize = async () => {
    const max = await window.electronAPI.maximizeWindow();
    setIsMaximized(max);
  };

  const handleClose = () => {
    window.electronAPI.closeWindow();
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  return (
    <header className="h-11 w-full bg-[#090b10] border-b border-white/5 flex items-center justify-between px-3 select-none titlebar-drag-region z-50">
      {/* Left: Navigation buttons */}
      <div className="flex items-center gap-2 titlebar-no-drag">
        <div className="flex items-center gap-2 mr-3">
          <div className="w-5 h-5 rounded-md flex items-center justify-center overflow-hidden shadow-sm shadow-indigo-500/50">
            <img
              src="./icon.png"
              alt="Sonora"
              className="w-full h-full object-contain"
            />
          </div>

          <span className="text-xs font-extrabold tracking-wider bg-linear-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
            SONORA
          </span>
        </div>

        <button
          onClick={goBack}
          disabled={!canGoBack}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-25 disabled:hover:bg-transparent transition"
          title="Back"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goForward}
          disabled={!canGoForward}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-25 disabled:hover:bg-transparent transition"
          title="Forward"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-4 titlebar-no-drag">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tracks, albums, artists, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7 pl-8 pr-7 rounded-full bg-slate-900/80 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-900 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 p-0.5 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Scanning notification & Window controls */}
      <div className="flex items-center gap-3 titlebar-no-drag">
        {isScanning && scanProgress && (
          <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>
              Scanning {scanProgress.current}/{scanProgress.total}
            </span>
          </div>
        )}

        <div className="flex items-center">
          <button
            onClick={handleMinimize}
            className="w-9 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleMaximize}
            className="w-9 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? (
              <Copy className="w-3 h-3 rotate-180" />
            ) : (
              <Square className="w-3 h-3" />
            )}
          </button>

          <button
            onClick={handleClose}
            className="w-9 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500 transition"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
