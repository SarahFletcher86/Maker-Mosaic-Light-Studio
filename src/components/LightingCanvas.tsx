import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LightSource, ShadingSettings, ActiveTool, LightingGuideRegion } from '../types';
import { processLineArtSurface, renderLightingOverlay, floodFill, CanvasShadingContext } from '../utils/normalMap';
import { Sun, Moon, Sliders, Move, Download, RefreshCw, ZoomIn, ZoomOut, Eye } from 'lucide-react';

interface LightingCanvasProps {
  svgString?: string;
  customImageDataUrl?: string;
  light: LightSource;
  setLight: React.Dispatch<React.SetStateAction<LightSource>>;
  settings: ShadingSettings;
  activeTool: ActiveTool;
  paintColor: string;
  clearPaintTrigger: number;
  guideRegions: LightingGuideRegion[];
}

export const LightingCanvas: React.FC<LightingCanvasProps> = ({
  svgString,
  customImageDataUrl,
  light,
  setLight,
  settings,
  activeTool,
  paintColor,
  clearPaintTrigger,
  guideRegions
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineCanvasRef = useRef<HTMLCanvasElement>(null);
  const basePaintCanvasRef = useRef<HTMLCanvasElement>(null);
  const shadingCanvasRef = useRef<HTMLCanvasElement>(null);

  const [shadingCtx, setShadingCtx] = useState<CanvasShadingContext | null>(null);
  const [isDraggingLight, setIsDraggingLight] = useState(false);
  const [isDraggingShadow, setIsDraggingShadow] = useState(false);
  const [splitPosition, setSplitPosition] = useState<number>(100); // 100 = full shaded view, <100 = split comparison
  const [showLightPuck, setShowLightPuck] = useState(true);

  const CANVAS_SIZE = 600;

  // Derived Puck Positions (clamped safely inside canvas boundaries)
  const lightX = Math.max(10, Math.min(90, light.x));
  const lightY = Math.max(10, Math.min(90, light.y));
  const shadowX = 100 - lightX;
  const shadowY = 100 - lightY;

  // Initialize Line Art Canvas
  const loadLineArt = useCallback(() => {
    const lineCanvas = lineCanvasRef.current;
    const baseCanvas = basePaintCanvasRef.current;
    if (!lineCanvas || !baseCanvas) return;

    const lineCtx = lineCanvas.getContext('2d', { willReadFrequently: true });
    const baseCtx = baseCanvas.getContext('2d', { willReadFrequently: true });
    if (!lineCtx || !baseCtx) return;

    lineCtx.fillStyle = '#FFFFFF';
    lineCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    baseCtx.fillStyle = '#FFFFFF';
    baseCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (customImageDataUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const scale = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (CANVAS_SIZE - w) / 2;
        const y = (CANVAS_SIZE - h) / 2;

        lineCtx.drawImage(img, x, y, w, h);
        const processed = processLineArtSurface(lineCtx, CANVAS_SIZE, CANVAS_SIZE, settings.lineThreshold, settings.invertLines);
        setShadingCtx(processed);
      };
      img.src = customImageDataUrl;
    } else if (svgString) {
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        lineCtx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        URL.revokeObjectURL(url);
        const processed = processLineArtSurface(lineCtx, CANVAS_SIZE, CANVAS_SIZE, settings.lineThreshold, settings.invertLines);
        setShadingCtx(processed);
      };
      img.src = url;
    }
  }, [customImageDataUrl, svgString, settings.lineThreshold, settings.invertLines]);

  useEffect(() => {
    loadLineArt();
  }, [loadLineArt]);

  // Clear paint base canvas when clear trigger updates
  useEffect(() => {
    const baseCanvas = basePaintCanvasRef.current;
    if (!baseCanvas) return;
    const baseCtx = baseCanvas.getContext('2d');
    if (!baseCtx) return;
    baseCtx.fillStyle = '#FFFFFF';
    baseCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (shadingCtx && shadingCanvasRef.current) {
      const shadingCtx2D = shadingCanvasRef.current.getContext('2d');
      if (shadingCtx2D) {
        renderLightingOverlay(shadingCtx2D, shadingCtx, light, settings, baseCanvas);
      }
    }
  }, [clearPaintTrigger]);

  // Re-render lighting overlay whenever light or shader settings change
  useEffect(() => {
    if (!shadingCtx || !shadingCanvasRef.current) return;
    const shadingCtx2D = shadingCanvasRef.current.getContext('2d');
    if (!shadingCtx2D) return;

    renderLightingOverlay(
      shadingCtx2D,
      shadingCtx,
      light,
      settings,
      basePaintCanvasRef.current || undefined
    );
  }, [shadingCtx, light, settings]);

  // Direct Container Click or Bucket Fill
  const handleContainerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (activeTool === 'light-drag') {
      setLight(prev => ({ ...prev, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }));
    } else if (activeTool === 'bucket-fill' && shadingCtx) {
      const baseCanvas = basePaintCanvasRef.current;
      if (!baseCanvas) return;
      const baseCtx = baseCanvas.getContext('2d');
      if (!baseCtx) return;

      const px = Math.floor((x / 100) * CANVAS_SIZE);
      const py = Math.floor((y / 100) * CANVAS_SIZE);

      floodFill(
        baseCtx,
        px,
        py,
        paintColor,
        shadingCtx.lineMaskData,
        CANVAS_SIZE,
        CANVAS_SIZE
      );

      if (shadingCanvasRef.current) {
        const shadingCtx2D = shadingCanvasRef.current.getContext('2d');
        if (shadingCtx2D) {
          renderLightingOverlay(shadingCtx2D, shadingCtx, light, settings, baseCanvas);
        }
      }
    }
  };

  // Download Image Result
  const handleDownload = () => {
    const shadingCanvas = shadingCanvasRef.current;
    if (!shadingCanvas) return;
    const link = document.createElement('a');
    link.download = `ChromaLight-Shaded-Artwork-${Date.now()}.png`;
    link.href = shadingCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col items-center justify-between space-y-4">
      {/* Canvas Header Toolbar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-white flex items-center space-x-1.5">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Interactive Lighting Stage</span>
          </span>
          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-mono">
            {activeTool === 'light-drag' ? 'Drag Light (☀️) or Shadow (🌙) Puck' : 'Click region to Bucket Fill'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Toggle Puck Visibility */}
          <button
            onClick={() => setShowLightPuck(prev => !prev)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all border ${
              showLightPuck
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle Light & Shadow Pucks"
          >
            <Eye className="w-3.5 h-3.5 inline mr-1" />
            <span>Pucks</span>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg transition-all shadow-sm shadow-amber-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Container */}
      <div
        ref={containerRef}
        onPointerDown={handleContainerPointerDown}
        className="relative w-full aspect-square max-w-[550px] bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-slate-700 cursor-crosshair touch-none select-none"
      >
        {/* Layer 1: Line Art Original Canvas */}
        <canvas
          ref={lineCanvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* Layer 2: Base Color Paint Canvas */}
        <canvas
          ref={basePaintCanvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none mix-blend-multiply"
        />

        {/* Layer 3: Shading Overlay Canvas (Clipped by split view slider) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${splitPosition}%` }}
        >
          <canvas
            ref={shadingCanvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>

        {/* AI semantic guide regions drawn over the ORIGINAL artwork.
            These come from Gemini's understanding of object form/overlap rather than
            the instant distance-transform preview used by the local renderer. */}
        {guideRegions.length > 0 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-[15]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-label="AI highlight and shadow guide overlay"
          >
            {guideRegions.map((region, index) => {
              const colors = {
                highlight: { fill: '#FDE68A', stroke: '#F59E0B' },
                'form-shadow': { fill: '#A78BFA', stroke: '#7C3AED' },
                'cast-shadow': { fill: '#60A5FA', stroke: '#2563EB' },
                'deep-shadow': { fill: '#4338CA', stroke: '#312E81' },
              }[region.kind];

              const points = region.points
                .map((point) => `${Math.max(0, Math.min(100, point.x))},${Math.max(0, Math.min(100, point.y))}`)
                .join(' ');

              const fillOpacity = Math.max(0.12, Math.min(0.46, region.strength * 0.42));

              return (
                <polygon
                  key={`${region.kind}-${index}`}
                  points={points}
                  fill={colors.fill}
                  fillOpacity={fillOpacity}
                  stroke={colors.stroke}
                  strokeOpacity={0.9}
                  strokeWidth={0.45}
                  strokeLinejoin="round"
                >
                  <title>{`${region.label}: ${region.explanation}`}</title>
                </polygon>
              );
            })}
          </svg>
        )}

        {/* SVG Connecting Ray Line between Light Source & Shadow Side */}
        {showLightPuck && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
            <line
              x1={`${lightX}%`}
              y1={`${lightY}%`}
              x2={`${shadowX}%`}
              y2={`${shadowY}%`}
              stroke="rgba(245, 158, 11, 0.6)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
          </svg>
        )}

        {/* 1. Interactive LIGHT SOURCE PUCK (☀️) */}
        {showLightPuck && (
          <div
            onPointerDown={(e) => {
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              setIsDraggingLight(true);
            }}
            onPointerMove={(e) => {
              if (!isDraggingLight || !containerRef.current) return;
              const rect = containerRef.current.getBoundingClientRect();
              const x = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
              const y = Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));
              setLight(prev => ({ ...prev, x, y }));
            }}
            onPointerUp={(e) => {
              e.currentTarget.releasePointerCapture(e.pointerId);
              setIsDraggingLight(false);
            }}
            onPointerCancel={() => setIsDraggingLight(false)}
            className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing touch-none select-none group"
            style={{ left: `${lightX}%`, top: `${lightY}%` }}
            title="Drag Light Source Puck"
          >
            {/* Ambient Pulsing Glow */}
            <div
              className="absolute rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 opacity-40 animate-pulse"
              style={{
                width: '70px',
                height: '70px',
                left: '50%',
                top: '50%',
                backgroundColor: light.color,
                filter: 'blur(10px)',
              }}
            />

            <div className="relative w-9 h-9 rounded-full border-2 border-amber-400 bg-slate-900 shadow-2xl flex items-center justify-center transition-transform group-hover:scale-110">
              <div
                className="w-6 h-6 rounded-full border border-slate-950 flex items-center justify-center shadow-inner"
                style={{ backgroundColor: light.color }}
              >
                <Sun className="w-3.5 h-3.5 text-slate-950 font-bold" />
              </div>
              <span className="absolute -bottom-6 whitespace-nowrap bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-md tracking-tight">
                ☀️ Light Source
              </span>
            </div>
          </div>
        )}

        {/* 2. Interactive SHADOW CAST PUCK (🌙) */}
        {showLightPuck && (
          <div
            onPointerDown={(e) => {
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              setIsDraggingShadow(true);
            }}
            onPointerMove={(e) => {
              if (!isDraggingShadow || !containerRef.current) return;
              const rect = containerRef.current.getBoundingClientRect();
              const sx = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
              const sy = Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));
              setLight(prev => ({ ...prev, x: 100 - sx, y: 100 - sy }));
            }}
            onPointerUp={(e) => {
              e.currentTarget.releasePointerCapture(e.pointerId);
              setIsDraggingShadow(false);
            }}
            onPointerCancel={() => setIsDraggingShadow(false)}
            className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing touch-none select-none group"
            style={{ left: `${shadowX}%`, top: `${shadowY}%` }}
            title="Drag Shadow Cast Side Puck"
          >
            <div className="relative w-9 h-9 rounded-full border-2 border-indigo-400 bg-slate-950 shadow-2xl flex items-center justify-center transition-transform group-hover:scale-110">
              <div
                className="w-6 h-6 rounded-full border border-indigo-500/50 flex items-center justify-center shadow-inner"
                style={{ backgroundColor: settings.shadowColor }}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-200" />
              </div>
              <span className="absolute -bottom-6 whitespace-nowrap bg-indigo-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-md tracking-tight">
                🌙 Shadow Side
              </span>
            </div>
          </div>
        )}

        {/* Comparison Split Line & Handle */}
        {splitPosition < 100 && (
          <div
            className="absolute top-0 bottom-0 z-10 w-0.5 bg-amber-400 shadow-md pointer-events-none"
            style={{ left: `${splitPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow-lg">
              ↔
            </div>
          </div>
        )}
      </div>

      {guideRegions.length > 0 && (
        <div className="w-full flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-slate-300">
          <span className="font-bold text-amber-300">AI guide</span>
          <span><span className="text-amber-300">●</span> Highlight</span>
          <span><span className="text-violet-300">●</span> Form shadow</span>
          <span><span className="text-blue-300">●</span> Cast shadow</span>
          <span><span className="text-indigo-400">●</span> Deep shadow</span>
        </div>
      )}

      {/* Canvas Footer Controls (Split View Slider) */}
      <div className="w-full flex items-center space-x-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400 font-medium whitespace-nowrap">Original</span>
        <input
          type="range"
          min="0"
          max="100"
          value={splitPosition}
          onChange={(e) => setSplitPosition(Number(e.target.value))}
          className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-amber-400 font-bold whitespace-nowrap">Shaded ({splitPosition}%)</span>
      </div>
    </div>
  );
};
