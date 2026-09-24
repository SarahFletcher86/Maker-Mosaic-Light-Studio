import React from 'react';
import { LightSource, ShadingSettings, ActiveTool, ColoringMedium } from '../types';
import { Sun, Palette, PaintBucket, Move, Moon, Zap, Flame, Sparkles, Layers, Compass, HelpCircle, Eye } from 'lucide-react';

interface ControlsPanelProps {
  light: LightSource;
  setLight: React.Dispatch<React.SetStateAction<LightSource>>;
  settings: ShadingSettings;
  setSettings: React.Dispatch<React.SetStateAction<ShadingSettings>>;
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  paintColor: string;
  setPaintColor: (color: string) => void;
  onClearPaint: () => void;
  onAskGeminiAI: () => void;
  isAnalyzing: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  light,
  setLight,
  settings,
  setSettings,
  activeTool,
  setActiveTool,
  paintColor,
  setPaintColor,
  onClearPaint,
  onAskGeminiAI,
  isAnalyzing
}) => {
  // Quick Light Direction Angles for Coloring Pages
  const lightDirectionPresets = [
    { name: 'Top-Left Sun (45°)', x: 25, y: 20, z: 65, color: '#FFF2C6', shadow: '#1F1738' },
    { name: 'Top-Right Sun', x: 75, y: 20, z: 65, color: '#FFF0C2', shadow: '#1E1233' },
    { name: 'Direct Overhead', x: 50, y: 10, z: 80, color: '#FFFFFF', shadow: '#111827' },
    { name: 'Front Desk Lamp', x: 50, y: 50, z: 90, color: '#FFF8E7', shadow: '#221835' },
    { name: 'Sunset Warmth', x: 85, y: 35, z: 45, color: '#FF7A45', shadow: '#2D0E32' },
    { name: 'Night Moonlight', x: 20, y: 25, z: 70, color: '#90E0EF', shadow: '#03045E' }
  ];

  // Medium presets
  const mediums: { id: ColoringMedium; label: string; icon: string }[] = [
    { id: 'colored-pencils', label: 'Colored Pencils', icon: '✏️' },
    { id: 'markers', label: 'Alcohol Markers', icon: '🖍️' },
    { id: 'watercolors', label: 'Watercolors', icon: '🎨' },
    { id: 'digital', label: 'Digital Layers', icon: '💻' }
  ];

  // Quick paint swatches
  const paintSwatches = [
    '#E06D53', '#F2A65A', '#E2D870', '#83C5BE', '#006D77',
    '#9B5DE5', '#F15BB5', '#00BBF9', '#38B000', '#F3C68F',
    '#5C3D2E', '#2B2D42', '#8D99AE', '#FFFFFF', '#111827'
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-slate-200 space-y-5">
      {/* Tool Selector (Light Puck vs Paint Bucket) */}
      <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={() => setActiveTool('light-drag')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTool === 'light-drag'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Move className="w-4 h-4" />
          <span>Move Light Source</span>
        </button>

        <button
          onClick={() => setActiveTool('bucket-fill')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTool === 'bucket-fill'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <PaintBucket className="w-4 h-4" />
          <span>Fill Base Color</span>
        </button>
      </div>

      {/* AI Master Assistant Button */}
      <button
        onClick={onAskGeminiAI}
        disabled={isAnalyzing}
        className="w-full relative overflow-hidden group bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 font-extrabold text-xs py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-70"
      >
        <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : 'animate-bounce'}`} />
        <span>{isAnalyzing ? 'Gemini AI Analyzing Page Lighting...' : 'Ask Gemini AI Coloring Coach'}</span>
      </button>

      {/* LIGHT DIRECTION ANGLE PRESETS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Light Source Angle</span>
          </label>
          <span className="text-[10px] text-amber-400 font-mono">X:{Math.round(light.x)}% Y:{Math.round(light.y)}%</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {lightDirectionPresets.map((p) => {
            const isSelected = Math.abs(light.x - p.x) < 8 && Math.abs(light.y - p.y) < 8;
            return (
              <button
                key={p.name}
                onClick={() => {
                  setLight(prev => ({ ...prev, x: p.x, y: p.y, z: p.z, color: p.color }));
                  setSettings(prev => ({ ...prev, shadowColor: p.shadow }));
                }}
                className={`flex items-center space-x-2 p-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="truncate">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LIGHT DISTANCE & SPREAD MODE */}
      <div className="space-y-3 bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300">Light Spread Type</span>
          <div className="flex gap-1">
            <button
              onClick={() => setLight(prev => ({ ...prev, type: 'directional' }))}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                light.type !== 'point'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              ☀️ Distant Key Light
            </button>
            <button
              onClick={() => setLight(prev => ({ ...prev, type: 'point' }))}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                light.type === 'point'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              💡 Local Lamp
            </button>
          </div>
        </div>

        <div className="space-y-1 pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span>Distance / Elevation to Subject</span>
            <span className="text-amber-400 font-mono">{Math.round(light.z)}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={light.z}
            onChange={(e) => setLight(prev => ({ ...prev, z: Number(e.target.value) }))}
            className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* COLORING GUIDE DISPLAY STYLES */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Coloring Overlay Style</span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSettings(prev => ({ ...prev, style: 'guide-map' }))}
            className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-2 ${
              settings.style === 'guide-map'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>🎯 Highlight & Shadow Map</span>
          </button>

          <button
            onClick={() => setSettings(prev => ({ ...prev, style: 'soft-render' }))}
            className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-2 ${
              settings.style === 'soft-render'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>✏️ Soft Blend Preview</span>
          </button>

          <button
            onClick={() => setSettings(prev => ({ ...prev, style: 'cel-shading' }))}
            className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-2 ${
              settings.style === 'cel-shading'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>🖍️ Marker Cel Blocks</span>
          </button>

          <button
            onClick={() => setSettings(prev => ({ ...prev, style: 'heat-map' }))}
            className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-2 ${
              settings.style === 'heat-map'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>🔥 Light Heatmap Zone</span>
          </button>
        </div>
      </div>

      {/* COLORING MEDIUM & GUIDE TOGGLES */}
      <div className="space-y-3 bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300">Coloring Medium</span>
          <div className="flex gap-1">
            {mediums.map((m) => (
              <button
                key={m.id}
                onClick={() => setSettings(prev => ({ ...prev, coloringMedium: m.id }))}
                className={`px-2 py-1 rounded-lg border font-medium text-[11px] transition-all ${
                  settings.coloringMedium === m.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={m.label}
              >
                <span>{m.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Light Rays */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-slate-300 font-semibold">Draw Light Ray Beams</span>
          <input
            type="checkbox"
            checked={settings.showLightRays}
            onChange={(e) => setSettings(prev => ({ ...prev, showLightRays: e.target.checked }))}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </div>

        {/* Toggle Guide Badges */}
        <div className="flex items-center justify-between">
          <span className="text-slate-300 font-semibold">Highlight & Shadow Badges</span>
          <input
            type="checkbox"
            checked={settings.showGuideMarkers}
            onChange={(e) => setSettings(prev => ({ ...prev, showGuideMarkers: e.target.checked }))}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* SHADOW TINT & OPACITY */}
      <div className="space-y-3 bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Shadow Pencil Tint</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] text-slate-400">{settings.shadowColor}</span>
            <input
              type="color"
              value={settings.shadowColor}
              onChange={(e) => setSettings(prev => ({ ...prev, shadowColor: e.target.value }))}
              className="w-5 h-5 rounded border-0 bg-transparent cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Shadow Depth / Pressure</span>
          <span className="text-amber-400 font-mono">{Math.round(settings.shadowOpacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={settings.shadowOpacity}
          onChange={(e) => setSettings(prev => ({ ...prev, shadowOpacity: Number(e.target.value) }))}
          className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* BASE COLOR FILL PALETTE */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <PaintBucket className="w-3.5 h-3.5 text-amber-400" />
            <span>Bucket Paint Color</span>
          </label>
          <button
            onClick={onClearPaint}
            className="text-[10px] text-red-400 hover:text-red-300 font-semibold underline"
          >
            Clear Base Paints
          </button>
        </div>

        {/* Color Swatches Grid */}
        <div className="flex flex-wrap gap-1.5">
          {paintSwatches.map((color) => (
            <button
              key={color}
              onClick={() => {
                setPaintColor(color);
                setActiveTool('bucket-fill');
              }}
              className={`w-6 h-6 rounded-lg border transition-transform ${
                paintColor.toUpperCase() === color.toUpperCase() && activeTool === 'bucket-fill'
                  ? 'scale-125 border-amber-400 ring-2 ring-amber-400/50 z-10'
                  : 'border-slate-700 hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
              title={`Select ${color}`}
            />
          ))}
          <input
            type="color"
            value={paintColor}
            onChange={(e) => {
              setPaintColor(e.target.value);
              setActiveTool('bucket-fill');
            }}
            className="w-6 h-6 rounded-lg border-0 bg-transparent cursor-pointer p-0"
            title="Custom Paint Color"
          />
        </div>
      </div>
    </div>
  );
};

