import React from 'react';
import { GeminiLightingAnalysis } from '../types';
import { Sparkles, Sun, Moon, Palette, CheckCircle, HelpCircle, Layers, ArrowRight } from 'lucide-react';

interface GeminiLightGuideProps {
  analysis: GeminiLightingAnalysis | null;
  isAnalyzing: boolean;
  onApplyPalette: (palette: GeminiLightingAnalysis['palette']) => void;
  onAskGeminiAI: () => void;
}

export const GeminiLightGuide: React.FC<GeminiLightGuideProps> = ({
  analysis,
  isAnalyzing,
  onApplyPalette,
  onAskGeminiAI
}) => {
  if (isAnalyzing) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Mapping Light & Forms...</h3>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing 3D geometry, plane normals, core shadows, and highlight zones for your line art
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Light & Shadow Guide</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Create a guide to map likely highlights, form shadows, cast shadows, and deep creases directly onto your artwork.
          </p>
        </div>
        <button
          onClick={onAskGeminiAI}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md hover:shadow-amber-500/20 transition-all inline-flex items-center space-x-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Create Lighting Guide</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-200 space-y-5">
      {/* Title & Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{analysis.title}</h3>
            <p className="text-[11px] text-slate-400">{analysis.summary}</p>
          </div>
        </div>

        <button
          onClick={() => onApplyPalette(analysis.palette)}
          className="flex items-center space-x-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Apply AI Swatches</span>
        </button>
      </div>

      {/* Recommended 4-Tone Color Palette */}
      <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center space-x-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Recommended 4-Tone Lighting Palette</span>
          </span>
          <span className="text-[10px] text-slate-400">Click swatch to copy hex</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Base Tone */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center space-x-2">
            <div className="w-6 h-6 rounded border border-white/20" style={{ backgroundColor: analysis.palette.base }} />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Base Tone</p>
              <p className="text-xs font-bold text-white font-mono">{analysis.palette.base}</p>
            </div>
          </div>

          {/* Highlight Tone */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center space-x-2">
            <div className="w-6 h-6 rounded border border-white/20" style={{ backgroundColor: analysis.palette.highlight }} />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Highlight</p>
              <p className="text-xs font-bold text-white font-mono">{analysis.palette.highlight}</p>
            </div>
          </div>

          {/* Shadow Tone */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center space-x-2">
            <div className="w-6 h-6 rounded border border-white/20" style={{ backgroundColor: analysis.palette.shadow }} />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Core Shadow</p>
              <p className="text-xs font-bold text-white font-mono">{analysis.palette.shadow}</p>
            </div>
          </div>

          {/* Rim Light Tone */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center space-x-2">
            <div className="w-6 h-6 rounded border border-white/20" style={{ backgroundColor: analysis.palette.rimLight }} />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Rim Bounce</p>
              <p className="text-xs font-bold text-white font-mono">{analysis.palette.rimLight}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shading Guide Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Highlights Guide */}
        <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <h4 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Highlights & Catchlights</span>
          </h4>
          <p className="text-xs text-slate-300 leading-normal">{analysis.highlightsGuide}</p>
        </div>

        {/* Shadows Guide */}
        <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <h4 className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Core Shadows & Creases</span>
          </h4>
          <p className="text-xs text-slate-300 leading-normal">{analysis.shadowsGuide}</p>
        </div>

        {/* Color Theory Tip */}
        <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <h4 className="text-xs font-bold text-orange-300 flex items-center space-x-1.5">
            <Palette className="w-3.5 h-3.5 text-orange-400" />
            <span>Warm vs Cool Color Shift</span>
          </h4>
          <p className="text-xs text-slate-300 leading-normal">{analysis.colorTheoryTip}</p>
        </div>
      </div>

      {/* Semantic regions mapped directly onto the original artwork */}
      {analysis.regions?.length > 0 && (
        <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Mapped Light & Shadow Zones</span>
            </h4>
            <span className="text-[10px] text-slate-400">{analysis.regions.length} guide regions on your artwork</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {analysis.regions.slice(0, 12).map((region, idx) => {
              const style = {
                highlight: {
                  dot: 'text-amber-300',
                  badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
                  label: 'Highlight',
                },
                'form-shadow': {
                  dot: 'text-violet-300',
                  badge: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
                  label: 'Form shadow',
                },
                'cast-shadow': {
                  dot: 'text-blue-300',
                  badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
                  label: 'Cast shadow',
                },
                'deep-shadow': {
                  dot: 'text-indigo-300',
                  badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
                  label: 'Deep shadow',
                },
              }[region.kind];

              return (
                <div key={`${region.kind}-${idx}`} className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 ${style.dot}`}>●</span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{region.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${style.badge}`}>
                          {style.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal mt-1">{region.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step-by-Step Rendering Sequence */}
      <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Recommended 4-Step Rendering Workflow</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {analysis.stepByStepGuide.map((step, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800/80 p-2.5 rounded-lg text-xs space-y-1">
              <span className="font-mono text-[10px] text-amber-400 font-extrabold uppercase">Step 0{idx + 1}</span>
              <p className="text-slate-300 leading-tight">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
