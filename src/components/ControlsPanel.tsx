import React from 'react';
import {
  LightSource,
  ShadingSettings,
  ColoringMedium,
  AnalysisProvider,
  ShadowPalette,
  HighlightPalette,
} from '../types';
import { Sparkles, ChevronDown, SunMedium, MoonStar } from 'lucide-react';

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
  const mediums: { id: ColoringMedium; label: string; note: string }[] = [
    { id: 'colored-pencils', label: 'Pencil', note: 'soft layered texture' },
    { id: 'markers', label: 'Marker', note: 'smooth translucent passes' },
    { id: 'watercolors', label: 'Watercolour', note: 'soft transparent wash' },
    { id: 'digital', label: 'Digital', note: 'clean soft blend' },
  ];

  const directions = [
    { label: 'Upper left', icon: '↖', x: 25, y: 20 },
    { label: 'Above', icon: '↑', x: 50, y: 12 },
    { label: 'Upper right', icon: '↗', x: 75, y: 20 },
    { label: 'Below', icon: '↑', x: 50, y: 85 },
  ];

  const lightTypes = [
    {
      label: 'Daylight',
      icon: '☀',
      color: '#FFF4D6',
      type: 'directional' as const,
      z: 70,
      shadow: '#667085',
      highlight: '#FFF7DD',
    },
    {
      label: 'Warm lamp',
      icon: '●',
      color: '#FFE0A3',
      type: 'point' as const,
      z: 60,
      shadow: '#655166',
      highlight: '#FFD58A',
    },
    {
      label: 'Fire / candle',
      icon: '✦',
      color: '#FFAD5A',
      type: 'point' as const,
      z: 35,
      shadow: '#69394B',
      highlight: '#FFC268',
    },
    {
      label: 'Moonlight',
      icon: '☾',
      color: '#9ED8FF',
      type: 'directional' as const,
      z: 70,
      shadow: '#435277',
      highlight: '#D9F0FF',
    },
  ];

  const currentLightType =
    light.color.toUpperCase() === '#FFAD5A' ? 'Fire / candle' :
    light.color.toUpperCase() === '#9ED8FF' ? 'Moonlight' :
    light.type === 'point' ? 'Warm lamp' : 'Daylight';

  const shadows: { id: ShadowPalette; label: string; swatch?: string }[] = [
    { id: 'auto', label: 'Auto' },
    { id: 'same-color', label: 'Layer base colour' },
    { id: 'cool-gray', label: 'Cool grey', swatch: '#667085' },
    { id: 'warm-gray', label: 'Warm grey', swatch: '#81746E' },
    { id: 'purple', label: 'Purple', swatch: '#65507D' },
    { id: 'blue', label: 'Blue', swatch: '#456589' },
    { id: 'black', label: 'Deep', swatch: '#25242A' },
    { id: 'custom', label: 'Custom' },
  ];

  const highlights: { id: HighlightPalette; label: string; swatch?: string }[] = [
    { id: 'auto', label: 'Auto' },
    { id: 'paper-white', label: 'Paper white', swatch: '#FFFDF8' },
    { id: 'same-color', label: 'Lift base colour' },
    { id: 'warm', label: 'Warm cream', swatch: '#FFE2A8' },
    { id: 'cool', label: 'Cool glow', swatch: '#DDF2FF' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <section className="studio-card controls-card">
      <div className="control-section first">
        <span className="step-kicker">Step 2</span>
        <h2 className="section-title">What are you colouring with?</h2>
        <div className="medium-grid">
          {mediums.map((medium) => (
            <button
              key={medium.id}
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, coloringMedium: medium.id }))}
              className={`choice-card ${settings.coloringMedium === medium.id ? 'selected' : ''}`}
            >
              <span className="choice-label">{medium.label}</span>
              <span className="choice-note">{medium.note}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="control-section">
        <span className="step-kicker">Step 3</span>
        <h2 className="section-title">Where is the light coming from?</h2>
        <div className="direction-grid">
          {directions.map((direction) => {
            const selected =
              Math.abs(light.x - direction.x) < 1 &&
              Math.abs(light.y - direction.y) < 1;
            return (
              <button
                key={direction.label}
                type="button"
                onClick={() => setLight(prev => ({ ...prev, x: direction.x, y: direction.y }))}
                className={`direction-button ${selected ? 'selected' : ''}`}
              >
                <span className="direction-icon">{direction.icon}</span>
                {direction.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="control-section">
        <span className="step-kicker">Step 4</span>
        <h2 className="section-title">What kind of light?</h2>
        <div className="light-grid">
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
                setSettings(prev => ({
                  ...prev,
                  shadowColor: prev.shadowPalette === 'auto' ? source.shadow : prev.shadowColor,
                  highlightColor: prev.highlightPalette === 'auto' ? source.highlight : prev.highlightColor,
                }));
              }}
              className={`light-button ${currentLightType === source.label ? 'selected' : ''}`}
            >
              <span className="light-icon">{source.icon}</span>
              {source.label}
            </button>
          ))}
        </div>
      </div>

      <details className="style-details" open>
        <summary>
          <span>
            <strong>Shading colours</strong>
            <small>Optional — Auto is a good starting point</small>
          </span>
          <ChevronDown className="summary-chevron" />
        </summary>

        <div className="style-details-body">
          <div className="palette-row">
            <div className="palette-row-title">
              <MoonStar size={16} />
              <span>Shadows</span>
            </div>
            <div className="palette-chips">
              {shadows.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    shadowPalette: option.id,
                    shadowColor:
                      option.id === 'cool-gray' ? '#667085' :
                      option.id === 'warm-gray' ? '#81746E' :
                      option.id === 'purple' ? '#65507D' :
                      option.id === 'blue' ? '#456589' :
                      option.id === 'black' ? '#25242A' :
                      prev.shadowColor,
                  }))}
                  className={`palette-chip ${settings.shadowPalette === option.id ? 'selected' : ''}`}
                >
                  {option.swatch && <span className="chip-swatch" style={{ backgroundColor: option.swatch }} />}
                  {option.label}
                </button>
              ))}
              {settings.shadowPalette === 'custom' && (
                <input
                  aria-label="Custom shadow colour"
                  type="color"
                  value={settings.shadowColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, shadowColor: e.target.value }))}
                  className="color-well"
                />
              )}
            </div>
          </div>

          <div className="palette-row">
            <div className="palette-row-title">
              <SunMedium size={16} />
              <span>Highlights</span>
            </div>
            <div className="palette-chips">
              {highlights.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    highlightPalette: option.id,
                    highlightColor:
                      option.id === 'paper-white' ? '#FFFDF8' :
                      option.id === 'warm' ? '#FFE2A8' :
                      option.id === 'cool' ? '#DDF2FF' :
                      prev.highlightColor,
                  }))}
                  className={`palette-chip ${settings.highlightPalette === option.id ? 'selected' : ''}`}
                >
                  {option.swatch && <span className="chip-swatch" style={{ backgroundColor: option.swatch }} />}
                  {option.label}
                </button>
              ))}
              {settings.highlightPalette === 'custom' && (
                <input
                  aria-label="Custom highlight colour"
                  type="color"
                  value={settings.highlightColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, highlightColor: e.target.value }))}
                  className="color-well"
                />
              )}
            </div>
          </div>

          <label className="learning-toggle">
            <input
              type="checkbox"
              checked={settings.showLearningMap}
              onChange={(e) => setSettings(prev => ({ ...prev, showLearningMap: e.target.checked }))}
            />
            <span>
              <strong>Show learning map</strong>
              <small>See the colour-coded regions instead of the finished-medium preview.</small>
            </span>
          </label>
        </div>
      </details>

      <button
        onClick={onCreateLightingGuide}
        disabled={isAnalyzing}
        className="primary-action"
      >
        <Sparkles size={17} className={isAnalyzing ? 'spin' : ''} />
        {isAnalyzing ? 'Creating your guide…' : 'Create my lighting guide'}
      </button>

      <details className="testing-details">
        <summary>
          <span>Advanced / testing</span>
          <ChevronDown className="summary-chevron" />
        </summary>
        <div className="testing-body">
          <p className="testing-label">Analysis model</p>
          <div className="testing-models">
            <button
              type="button"
              onClick={() => setAnalysisProvider('openai')}
              className={analysisProvider === 'openai' ? 'selected' : ''}
            >
              GPT-6 Luna
            </button>
            <button
              type="button"
              onClick={() => setAnalysisProvider('gemini')}
              className={analysisProvider === 'gemini' ? 'selected' : ''}
            >
              Gemini Flash-Lite
            </button>
          </div>
          <label className="advanced-range">
            <span>Light elevation <strong>{Math.round(light.z)}%</strong></span>
            <input
              type="range"
              min="10"
              max="100"
              value={light.z}
              onChange={(e) => setLight(prev => ({ ...prev, z: Number(e.target.value) }))}
            />
          </label>
        </div>
      </details>
    </section>
  );
};
