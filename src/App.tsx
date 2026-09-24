import React, { useState } from 'react';
import { SAMPLE_DRAWINGS } from './data/samples';
import { SampleDrawing, LightSource, ShadingSettings, ActiveTool, GeminiLightingAnalysis } from './types';
import { Header } from './components/Header';
import { SamplePicker } from './components/SamplePicker';
import { LightingCanvas } from './components/LightingCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { GeminiLightGuide } from './components/GeminiLightGuide';
import { TechExplainerModal } from './components/TechExplainerModal';
import { Scratchpad } from './components/Scratchpad';
import { CameraScanModal } from './components/CameraScanModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'draw'>('studio');
  const [selectedSample, setSelectedSample] = useState<SampleDrawing>(SAMPLE_DRAWINGS[0]);
  const [customImageDataUrl, setCustomImageDataUrl] = useState<string | undefined>(undefined);

  // Light Source State
  const [light, setLight] = useState<LightSource>({
    x: 65,
    y: 25,
    z: 60,
    color: '#FFF2C6',
    intensity: 0.95,
    radius: 220,
    type: 'point',
    softness: 8,
  });

  // Shading Shader Settings State
  const [settings, setSettings] = useState<ShadingSettings>({
    style: 'guide-map',
    shadowColor: '#1F1738',
    shadowOpacity: 0.65,
    shadowSteps: 3,
    rimLightEnabled: true,
    rimLightColor: '#5CE0D8',
    rimLightIntensity: 0.8,
    ambientLightColor: '#111827',
    ambientIntensity: 0.2,
    specularIntensity: 0.7,
    specularShininess: 32,
    lineThreshold: 180,
    invertLines: false,
    showGuideMarkers: true,
    showLightRays: true,
    coloringMedium: 'colored-pencils',
  });

  // Active Tool & Color Bucket
  const [activeTool, setActiveTool] = useState<ActiveTool>('light-drag');
  const [paintColor, setPaintColor] = useState<string>('#E06D53');
  const [clearPaintTrigger, setClearPaintTrigger] = useState<number>(0);

  // Gemini AI Analysis State
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiLightingAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Modals
  const [isTechExplainerOpen, setIsTechExplainerOpen] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  // Handle Preset Line Art Selection
  const handleSelectSample = (sample: SampleDrawing) => {
    setSelectedSample(sample);
    setCustomImageDataUrl(undefined);
    setGeminiAnalysis(null);
  };

  // Handle Custom Image Upload or Camera Scan
  const handleCustomImage = (dataUrl: string) => {
    setCustomImageDataUrl(dataUrl);
    setGeminiAnalysis(null);
    setActiveTab('studio');
  };

  // Call Gemini AI API for Lighting Analysis
  const handleAskGeminiAI = async () => {
    setIsAnalyzing(true);
    try {
      // Get base64 PNG string
      let base64 = customImageDataUrl;
      if (!base64 && selectedSample) {
        // Render SVG to HTMLImageElement -> Canvas -> PNG Data URL
        base64 = await new Promise<string>((resolve) => {
          const img = new Image();
          const svgBlob = new Blob([selectedSample.svgString], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 600;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, 600, 600);
              ctx.drawImage(img, 0, 0, 600, 600);
            }
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve('');
          };
          img.src = url;
        });
      }

      if (!base64) {
        console.error('No valid image data for Gemini AI analysis');
        return;
      }

      const res = await fetch('/api/gemini/analyze-lighting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          lightSource: light,
          mimeType: 'image/png',
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setGeminiAnalysis(json.data);
      } else {
        console.error('Gemini analysis failed:', json.error);
      }
    } catch (err) {
      console.error('API call error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply Gemini Recommended Palette Swatches to Canvas Shader
  const handleApplyPalette = (palette: GeminiLightingAnalysis['palette']) => {
    setLight((prev) => ({ ...prev, color: palette.highlight }));
    setSettings((prev) => ({
      ...prev,
      shadowColor: palette.shadow,
      rimLightColor: palette.rimLight,
    }));
    setPaintColor(palette.base);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation Header */}
      <Header
        onOpenTechExplainer={() => setIsTechExplainerOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'draw' ? (
          /* Scratchpad Draw Mode */
          <Scratchpad
            onApplyDrawing={(dataUrl) => handleCustomImage(dataUrl)}
            onCancel={() => setActiveTab('studio')}
          />
        ) : (
          /* Studio Mode */
          <>
            {/* Top Row: Sample Picker */}
            <SamplePicker
              selectedSampleId={customImageDataUrl ? 'custom' : selectedSample.id}
              onSelectSample={handleSelectSample}
              onCustomImageUpload={handleCustomImage}
              onOpenCamera={() => setIsCameraOpen(true)}
              onOpenScratchpad={() => setActiveTab('draw')}
            />

            {/* Middle Row: Canvas Stage + Controls Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Canvas Stage (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <LightingCanvas
                  svgString={selectedSample?.svgString}
                  customImageDataUrl={customImageDataUrl}
                  light={light}
                  setLight={setLight}
                  settings={settings}
                  activeTool={activeTool}
                  paintColor={paintColor}
                  clearPaintTrigger={clearPaintTrigger}
                />
              </div>

              {/* Right Column: Light & Shader Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <ControlsPanel
                  light={light}
                  setLight={setLight}
                  settings={settings}
                  setSettings={setSettings}
                  activeTool={activeTool}
                  setActiveTool={setActiveTool}
                  paintColor={paintColor}
                  setPaintColor={setPaintColor}
                  onClearPaint={() => setClearPaintTrigger((prev) => prev + 1)}
                  onAskGeminiAI={handleAskGeminiAI}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </div>

            {/* Bottom Row: Gemini AI Light Guide Breakdown */}
            <GeminiLightGuide
              analysis={geminiAnalysis}
              isAnalyzing={isAnalyzing}
              onApplyPalette={handleApplyPalette}
              onAskGeminiAI={handleAskGeminiAI}
            />
          </>
        )}
      </main>

      {/* Modals */}
      <TechExplainerModal
        isOpen={isTechExplainerOpen}
        onClose={() => setIsTechExplainerOpen(false)}
      />

      <CameraScanModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCaptureImage={handleCustomImage}
      />
    </div>
  );
}
