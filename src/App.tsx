import React, { useState } from 'react';
import { SAMPLE_DRAWINGS } from './data/samples';
import { SampleDrawing, LightSource, ShadingSettings, GeminiLightingAnalysis, AnalysisProvider } from './types';
import { Header } from './components/Header';
import { SamplePicker } from './components/SamplePicker';
import { LightingCanvas } from './components/LightingCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { GeminiLightGuide } from './components/GeminiLightGuide';
import { CameraScanModal } from './components/CameraScanModal';

export default function App() {
  const [selectedSample, setSelectedSample] = useState<SampleDrawing>(SAMPLE_DRAWINGS[0]);
  const [customImageDataUrl, setCustomImageDataUrl] = useState<string | undefined>(undefined);

  // Light Source State
  const [light, setLight] = useState<LightSource>({
    x: 25,
    y: 20,
    z: 70,
    color: '#FFF4D6',
    intensity: 0.95,
    radius: 220,
    type: 'directional',
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
    showGuideMarkers: false,
    showLightRays: false,
    coloringMedium: 'colored-pencils',
    shadowPalette: 'auto',
    highlightPalette: 'auto',
    highlightColor: '#FFF2C7',
    showLearningMap: false,
    previewSurface: 'white',
    boostHighlightVisibility: true,
  });

  // AI lighting analysis state. OpenAI is the default candidate; Gemini remains available for A/B testing.
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiLightingAnalysis | null>(null);
  const [analysisProvider, setAnalysisProvider] = useState<AnalysisProvider>('openai');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzedDirection, setAnalyzedDirection] = useState<{ x: number; y: number } | null>(null);

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  // Handle Preset Line Art Selection
  const handleSelectSample = (sample: SampleDrawing) => {
    setSelectedSample(sample);
    setCustomImageDataUrl(undefined);
    setGeminiAnalysis(null);
    setAnalyzedDirection(null);
  };

  // Handle Custom Image Upload or Camera Scan
  const handleCustomImage = (dataUrl: string) => {
    setCustomImageDataUrl(dataUrl);
    setGeminiAnalysis(null);
    setAnalyzedDirection(null);
  };

  // Call the selected server-side vision provider for lighting analysis.
  const handleCreateLightingGuide = async () => {
    setIsAnalyzing(true);
    try {
      // Normalize the exact displayed artwork to a 600x600 PNG before analysis.
      // This keeps the model's 0..100 guide coordinates aligned with the UI canvas,
      // including portrait/landscape uploads that are letterboxed to fit.
      const base64 = await new Promise<string>((resolve) => {
        const img = new Image();
        let objectUrl: string | null = null;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 600;
          canvas.height = 600;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            resolve('');
            return;
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 600, 600);

          const scale = Math.min(600 / img.width, 600 / img.height);
          const width = img.width * scale;
          const height = img.height * scale;
          const x = (600 - width) / 2;
          const y = (600 - height) / 2;
          ctx.drawImage(img, x, y, width, height);

          if (objectUrl) URL.revokeObjectURL(objectUrl);
          resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          resolve('');
        };

        if (customImageDataUrl) {
          img.src = customImageDataUrl;
        } else if (selectedSample) {
          const svgBlob = new Blob([selectedSample.svgString], {
            type: 'image/svg+xml;charset=utf-8',
          });
          objectUrl = URL.createObjectURL(svgBlob);
          img.src = objectUrl;
        } else {
          resolve('');
        }
      });

      if (!base64) {
        console.error('No valid image data for lighting analysis');
        return;
      }

      const res = await fetch('/api/lighting/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          lightSource: light,
          coloringMedium: settings.coloringMedium,
          mimeType: 'image/png',
          provider: analysisProvider,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setGeminiAnalysis(json.data);
        setAnalyzedDirection({ x: light.x, y: light.y });
        console.info('Lighting analysis usage:', json.meta);
      } else {
        console.error('Lighting analysis failed:', json.error);
      }
    } catch (err) {
      console.error('API call error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const guideNeedsUpdate = Boolean(
    geminiAnalysis &&
    analyzedDirection &&
    (Math.abs(light.x - analyzedDirection.x) > 0.5 || Math.abs(light.y - analyzedDirection.y) > 0.5)
  );

  return (
    <div className="studio-app">
      {/* Top Navigation Header */}
      <Header />

      {/* Main Container */}
      <main className="studio-main">
        <>
            {/* Top Row: Sample Picker */}
            <SamplePicker
              selectedSampleId={customImageDataUrl ? 'custom' : selectedSample.id}
              onSelectSample={handleSelectSample}
              onCustomImageUpload={handleCustomImage}
              onOpenCamera={() => setIsCameraOpen(true)}
            />

            {/* Middle Row: Canvas Stage + Controls Panel */}
            <div className="studio-workspace-grid">
              {/* Left Column: Interactive Canvas Stage (7 cols) */}
              <div className="studio-canvas-column">
                <LightingCanvas
                  svgString={selectedSample?.svgString}
                  customImageDataUrl={customImageDataUrl}
                  light={light}
                  setLight={setLight}
                  settings={settings}
                  setSettings={setSettings}
                  guideRegions={geminiAnalysis?.regions || []}
                  guideNeedsUpdate={guideNeedsUpdate}
                />
              </div>

              {/* Right Column: Light & Shader Controls (5 cols) */}
              <div className="studio-controls-column">
                <ControlsPanel
                  light={light}
                  setLight={setLight}
                  settings={settings}
                  setSettings={setSettings}
                  onCreateLightingGuide={handleCreateLightingGuide}
                  analysisProvider={analysisProvider}
                  setAnalysisProvider={setAnalysisProvider}
                  isAnalyzing={isAnalyzing}
                  guideNeedsUpdate={guideNeedsUpdate}
                />
              </div>
            </div>

            {/* Bottom Row: Gemini AI Light Guide Breakdown */}
            <GeminiLightGuide
              analysis={geminiAnalysis}
              isAnalyzing={isAnalyzing}
              onAskGeminiAI={handleCreateLightingGuide}
              coloringMedium={settings.coloringMedium}
            />
        </>
      </main>

      <CameraScanModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCaptureImage={handleCustomImage}
      />
    </div>
  );
}
