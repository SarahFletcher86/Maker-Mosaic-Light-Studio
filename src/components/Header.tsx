import React from 'react';
import { Sun } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 shadow-md shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sun className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 bg-clip-text text-transparent">
              Maker Mosaic Light Guide
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              See where your highlights and shadows go
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
