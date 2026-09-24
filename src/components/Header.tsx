import React from 'react';
import { Sun, Sparkles, HelpCircle, Palette, Camera } from 'lucide-react';

interface HeaderProps {
  onOpenTechExplainer: () => void;
  activeTab: 'studio' | 'draw';
  setActiveTab: (tab: 'studio' | 'draw') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTechExplainer,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* App Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 shadow-md shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sun className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 bg-clip-text text-transparent">
              Coloring Light Guide
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Highlight & Shadow Map Assistant for Coloring Pages
            </p>
          </div>
        </div>

        {/* Tab Switcher & Tech Q&A Button */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'studio'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light Studio</span>
            </button>
            <button
              onClick={() => setActiveTab('draw')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'draw'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Draw Line Art</span>
            </button>
          </div>

          <button
            onClick={onOpenTechExplainer}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow-amber-500/10 active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">How Hard Is It To Build This App?</span>
            <span className="md:hidden">Tech Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
