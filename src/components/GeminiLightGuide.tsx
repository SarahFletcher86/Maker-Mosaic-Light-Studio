import React from 'react';
import { GeminiLightingAnalysis } from '../types';
import { Sparkles, Sun, Moon, Palette, ChevronDown } from 'lucide-react';

interface GeminiLightGuideProps {
  analysis: GeminiLightingAnalysis | null;
  isAnalyzing: boolean;
  onAskGeminiAI: () => void;
}

export const GeminiLightGuide: React.FC<GeminiLightGuideProps> = ({
  analysis,
  isAnalyzing,
  onAskGeminiAI,
}) => {
  if (isAnalyzing) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
        <Sparkles className="w-6 h-6 text-amber-400 mx-auto animate-spin" />
        <h3 className="text-sm font-bold text-white mt-3">Creating your lighting guide…</h3>
        <p className="text-xs text-slate-400 mt-1">Finding the surfaces that face toward and away from your light.</p>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-200 space-y-5">
      <div>
        <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-400">Your guide</span>
        <h3 className="text-lg font-bold text-white mt-1">{analysis.title}</h3>
        <p className="text-sm text-slate-400 mt-1">{analysis.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
          <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5" />
            Add light here
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed mt-2">{analysis.highlightsGuide}</p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
          <h4 className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5" />
            Add shadow here
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed mt-2">{analysis.shadowsGuide}</p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
          <h4 className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            For your medium
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed mt-2">{analysis.colorTheoryTip}</p>
        </div>
      </div>

      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
        <h4 className="text-xs font-bold text-white">A simple order to follow</h4>
        <ol className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {analysis.stepByStepGuide.map((step, idx) => (
            <li key={idx} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
              <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {analysis.regions?.length > 0 && (
        <details className="group border-t border-slate-800 pt-3">
          <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-300">
            <span>Why are those areas marked?</span>
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
            {analysis.regions.slice(0, 12).map((region, idx) => (
              <div key={`${region.kind}-${idx}`} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                <p className="text-xs font-semibold text-white">{region.label}</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{region.explanation}</p>
              </div>
            ))}
          </div>
        </details>
      )}

      <button
        onClick={onAskGeminiAI}
        className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2"
      >
        Re-create guide
      </button>
    </div>
  );
};
