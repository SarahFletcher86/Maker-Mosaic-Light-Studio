import React from 'react';
import { LightSource, ShadingSettings, ColoringMedium, AnalysisProvider } from '../types';
import { Sparkles, ChevronDown } from 'lucide-react';

interface ControlsPanelProps {
  light: LightSource;
  setLight: React.Dispatch<React.SetStateAction<LightSource>>;
  settings: ShadingSettings;
  setSettings: React.Dispatch<React.SetStateAction<ShadingSettings>>;
  onCreateLightingGuide: () => void;
  analysisProvider: AnalysisProvider;
  setAnalysisProvider: (provider: AnalysisProvider) => void;
  isAnalyzing: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  light,
  setLight,
  settings,
  setSettings,
  onCreateLightingGuide,
  analysisProvider,
  setAnalysisProvider,
  isAnalyzing,
}) => {
  const mediums: { id: ColoringMedium; label: string; icon: string }[] = [
    { id: 'colored-pencils', label: 'Pencils', icon: '✏️' },
    { id: 'markers', label: 'Markers', icon: '🖍️' },
    { id: 'watercolors', label: 'Watercolor', icon: '🎨' },
    { id: 'digital', label: 'Digital', icon: '💻' },
  ];

  const directions = [
    { label: 'Upper left', icon: '↖', x: 25, y: 20 },
    { label: 'Above', icon: '↑', x: 50, y: 12 },
    { label: 'Upper right', icon: '↗', x: 75, y: 20 },
    { label: 'Below', icon: '↑', x: 50, y: 85 },
  ];

  const lightTypes = [
    { label: 'Daylight', icon: '☀️', color: '#FFF4D6', type: 'directional' as const, z: 70, shadow: '#26334D' },
    { label: 'Warm lamp', icon: '💡', color: '#FFE0A3', type: 'point' as const, z: 60, shadow: '#35213F' },
    { label: 'Candle', icon: '🕯️', color: '#FFAD5A', type: 'point' as const, z: 35, shadow: '#3C1839' },
    { label: 'Moonlight', icon: '🌙', color: '#9ED8FF', type: 'directional' as const, z: 70, shadow: '#17285A' },
  ];

  const currentLightType =
    light.color.toUpperCase() === '#FFAD5A' ? 'Candle' :
    light.color.toUpperCase() === '#9ED8FF' ? 'Moonlight' :
    light.type === 'point' ? 'Warm lamp' : 'Daylight';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-slate-200 space-y-5">
      <div>
        <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-400">Step 2</span>
        <h2 className="text-lg font-bold text-white mt-1">Choose your medium</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 mt-3">
          {mediums.map((medium) => (
            <button
              key={medium.id}
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, coloringMedium: medium.id }))}
              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                settings.coloringMedium === medium.id
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="mr-1.5">{medium.icon}</span>{medium.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800 pt-5">
        <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-400">Step 3</span>
        <h2 className="text-lg font-bold text-white mt-1">Where is the light?</h2>
        <p className="text-xs text-slate-400 mt-1">Pick the direction it is coming from.</p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {directions.map((direction) => {
            const selected =
              Math.abs(light.x - direction.x) < 1 &&
              Math.abs(light.y - direction.y) < 1;
            return (
              <button
                key={direction.label}
                type="button"
                onClick={() => setLight(prev => ({ ...prev, x: direction.x, y: direction.y }))}
                className={`px-3 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  selected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-lg mr-2">{direction.icon}</span>{direction.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-800 pt-5">
        <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-400">Step 4</span>
        <h2 className="text-lg font-bold text-white mt-1">What kind of light?</h2>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {lightTypes.map((source) => (
            <button
              key={source.label}
              type="button"
              onClick={() => {
                setLight(prev => ({
                  ...prev,
                  color: source.color,
                  type: source.type,
                  z: source.z,
                }));
                setSettings(prev => ({ ...prev, shadowColor: source.shadow }));
              }}
              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                currentLightType === source.label
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="mr-1.5">{source.icon}</span>{source.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onCreateLightingGuide}
        disabled={isAnalyzing}
        className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
      >
        <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
        {isAnalyzing ? 'Creating your guide…' : 'Create my lighting guide'}
      </button>

      <details className="group border-t border-slate-800 pt-3">
        <summary className="list-none cursor-pointer flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-slate-300">
          <span>Advanced / testing</span>
          <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
        </summary>

        <div className="mt-3 space-y-3 bg-slate-950/70 border border-slate-800 rounded-xl p-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Analysis model</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAnalysisProvider('openai')}
                disabled={isAnalyzing}
                className={`px-2 py-2 rounded-lg border text-[10px] font-bold ${
                  analysisProvider === 'openai'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                    : 'border-slate-800 text-slate-500'
                }`}
              >
                GPT-6 Luna
              </button>
              <button
                type="button"
                onClick={() => setAnalysisProvider('gemini')}
                disabled={isAnalyzing}
                className={`px-2 py-2 rounded-lg border text-[10px] font-bold ${
                  analysisProvider === 'gemini'
                    ? 'bg-blue-500/15 border-blue-500/50 text-blue-300'
                    : 'border-slate-800 text-slate-500'
                }`}
              >
                Gemini Flash-Lite
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Light elevation</span>
              <span>{Math.round(light.z)}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={light.z}
              onChange={(e) => setLight(prev => ({ ...prev, z: Number(e.target.value) }))}
              className="w-full accent-amber-500"
            />
          </div>

          <p className="text-[10px] text-slate-600">
            Position: X {Math.round(light.x)} · Y {Math.round(light.y)}
          </p>
        </div>
      </details>
    </div>
  );
};
