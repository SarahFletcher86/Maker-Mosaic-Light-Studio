import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, Eye, Sun } from 'lucide-react';
import { LightSource, LightingGuideRegion, ShadingSettings } from '../types';

interface LightingCanvasProps {
  svgString?: string;
  customImageDataUrl?: string;
  light: LightSource;
  setLight: React.Dispatch<React.SetStateAction<LightSource>>;
  settings: ShadingSettings;
  setSettings: React.Dispatch<React.SetStateAction<ShadingSettings>>;
  guideRegions: LightingGuideRegion[];
  guideNeedsUpdate: boolean;
}

const CANVAS_SIZE = 600;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function smoothSvgPath(region: LightingGuideRegion) {
  const points = region.points.map(point => ({
    x: clamp(point.x, 0, 100),
    y: clamp(point.y, 0, 100),
  }));
  if (points.length < 3) return '';

  const midpoint = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });

  const start = midpoint(points[points.length - 1], points[0]);
  let path = `M ${start.x} ${start.y}`;
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    const mid = midpoint(point, next);
    path += ` Q ${point.x} ${point.y} ${mid.x} ${mid.y}`;
  });
  return path + ' Z';
}

export const LightingCanvas: React.FC<LightingCanvasProps> = ({
  svgString,
  customImageDataUrl,
  light,
  setLight,
  settings,
  setSettings,
  guideRegions,
  guideNeedsUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineCanvasRef = useRef<HTMLCanvasElement>(null);
  const [guideReveal, setGuideReveal] = useState(0);
  const [showLightPuck, setShowLightPuck] = useState(false);
  const [isDraggingLight, setIsDraggingLight] = useState(false);
  const [subjectMaskUrl, setSubjectMaskUrl] = useState<string | null>(null);
  const [isBlankLineArt, setIsBlankLineArt] = useState(true);

  const lightX = clamp(light.x, 6, 94);
  const lightY = clamp(light.y, 6, 94);

  const previewSurfaces = {
    white: { label: 'White', color: '#FFFFFF' },
    'warm-paper': { label: 'Warm paper', color: '#EFE3D2' },
    'cool-grey': { label: 'Cool grey', color: '#DCE4E8' },
    dark: { label: 'Dark', color: '#4D535C' },
  } as const;

  const currentSurface = previewSurfaces[settings.previewSurface];

  const analyzeArtworkSurface = useCallback((ctx: CanvasRenderingContext2D) => {
    const image = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const pixels = image.data;
    const total = CANVAS_SIZE * CANVAS_SIZE;
    const barrier = new Uint8Array(total);

    let chromaticPixels = 0;
    let visiblePixels = 0;

    for (let i = 0; i < total; i++) {
      const p = i * 4;
      const r = pixels[p];
      const g = pixels[p + 1];
      const b = pixels[p + 2];
      const a = pixels[p + 3];
      if (a < 20) continue;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      visiblePixels++;
      if (max - min > 34 && max < 248) chromaticPixels++;

      // Treat dark ink as a wall. One-pixel dilation below closes small anti-aliased gaps.
      if (luminance < 112) barrier[i] = 1;
    }

    const dilated = barrier.slice();
    for (let y = 1; y < CANVAS_SIZE - 1; y++) {
      for (let x = 1; x < CANVAS_SIZE - 1; x++) {
        const i = y * CANVAS_SIZE + x;
        if (!barrier[i]) continue;
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            dilated[(y + oy) * CANVAS_SIZE + (x + ox)] = 1;
          }
        }
      }
    }

    // Flood the open paper from the page edges. Anything non-ink that the flood
    // cannot reach is an enclosed colouring surface.
    const background = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    const enqueue = (index: number) => {
      if (index < 0 || index >= total || dilated[index] || background[index]) return;
      background[index] = 1;
      queue[tail++] = index;
    };

    for (let x = 0; x < CANVAS_SIZE; x++) {
      enqueue(x);
      enqueue((CANVAS_SIZE - 1) * CANVAS_SIZE + x);
    }
    for (let y = 0; y < CANVAS_SIZE; y++) {
      enqueue(y * CANVAS_SIZE);
      enqueue(y * CANVAS_SIZE + CANVAS_SIZE - 1);
    }

    while (head < tail) {
      const index = queue[head++];
      const x = index % CANVAS_SIZE;
      const y = Math.floor(index / CANVAS_SIZE);
      if (x > 0) enqueue(index - 1);
      if (x < CANVAS_SIZE - 1) enqueue(index + 1);
      if (y > 0) enqueue(index - CANVAS_SIZE);
      if (y < CANVAS_SIZE - 1) enqueue(index + CANVAS_SIZE);
    }

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = CANVAS_SIZE;
    maskCanvas.height = CANVAS_SIZE;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) {
      setSubjectMaskUrl(null);
      return;
    }

    const mask = maskCtx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
    let enclosedPixels = 0;

    for (let i = 0; i < total; i++) {
      const p = i * 4;
      const insideSurface = !dilated[i] && !background[i];
      const value = insideSurface ? 255 : 0;
      if (insideSurface) enclosedPixels++;
      mask.data[p] = value;
      mask.data[p + 1] = value;
      mask.data[p + 2] = value;
      mask.data[p + 3] = 255;
    }

    maskCtx.putImageData(mask, 0, 0);

    // If the drawing is too open to form meaningful enclosed regions, don't
    // force a bad mask; the semantic guide can still render normally.
    const enclosedRatio = enclosedPixels / total;
    setSubjectMaskUrl(enclosedRatio > 0.025 ? maskCanvas.toDataURL('image/png') : null);

    const chromaticRatio = chromaticPixels / Math.max(1, visiblePixels);
    const blankLineArt = chromaticRatio < 0.015;
    setIsBlankLineArt(blankLineArt);

    // For blank colouring pages only, make near-white paper transparent in the
    // display canvas so an optional preview surface can show through. The export
    // still gets a white paper background.
    if (blankLineArt) {
      for (let i = 0; i < total; i++) {
        const p = i * 4;
        const r = image.data[p];
        const g = image.data[p + 1];
        const b = image.data[p + 2];
        if (r > 243 && g > 243 && b > 243) {
          image.data[p + 3] = 0;
        }
      }
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.putImageData(image, 0, 0);
    }
  }, []);

  const loadArtwork = useCallback(() => {
    const canvas = lineCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (customImageDataUrl) {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
        const width = img.width * scale;
        const height = img.height * scale;
        const x = (CANVAS_SIZE - width) / 2;
        const y = (CANVAS_SIZE - height) / 2;
        ctx.drawImage(img, x, y, width, height);
        analyzeArtworkSurface(ctx);
      };
      img.src = customImageDataUrl;
      return;
    }

    if (svgString) {
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        analyzeArtworkSurface(ctx);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  }, [customImageDataUrl, svgString, analyzeArtworkSurface]);

  useEffect(() => {
    loadArtwork();
  }, [loadArtwork]);

  useEffect(() => {
    setGuideReveal(guideRegions.length > 0 ? 100 : 0);
  }, [guideRegions]);

  const resolved = useMemo(() => {
    const shadow =
      settings.shadowPalette === 'same-color' ? '#5B554F' :
      settings.shadowPalette === 'warm-gray' ? '#81746E' :
      settings.shadowPalette === 'cool-gray' ? '#667085' :
      settings.shadowPalette === 'purple' ? '#65507D' :
      settings.shadowPalette === 'blue' ? '#456589' :
      settings.shadowPalette === 'black' ? '#25242A' :
      settings.shadowColor;

    const highlight =
      settings.highlightPalette === 'paper-white' ? '#FFFDF8' :
      settings.highlightPalette === 'warm' ? '#FFE2A8' :
      settings.highlightPalette === 'cool' ? '#DDF2FF' :
      settings.highlightPalette === 'same-color' ? '#FFFFFF' :
      settings.highlightColor;

    return { shadow, highlight };
  }, [
    settings.shadowPalette,
    settings.highlightPalette,
    settings.shadowColor,
    settings.highlightColor,
  ]);

  const mediumConfig = useMemo(() => {
    switch (settings.coloringMedium) {
      case 'markers':
        return { label: 'Marker', shadowBase: 0.28, highlightBase: 0.27, filter: undefined, hatch: false };
      case 'watercolors':
        return { label: 'Watercolour', shadowBase: 0.20, highlightBase: 0.21, filter: 'url(#watercolor)', hatch: false };
      case 'digital':
        return { label: 'Digital', shadowBase: 0.25, highlightBase: 0.26, filter: 'url(#digitalSoft)', hatch: false };
      default:
        return { label: 'Pencil', shadowBase: 0.17, highlightBase: 0.20, filter: 'url(#pencilGrain)', hatch: false };
    }
  }, [settings.coloringMedium]);

  const drawRegionPath = (
    ctx: CanvasRenderingContext2D,
    region: LightingGuideRegion,
  ) => {
    if (!region.points.length) return false;
    const points = region.points.map(point => ({
      x: (clamp(point.x, 0, 100) / 100) * CANVAS_SIZE,
      y: (clamp(point.y, 0, 100) / 100) * CANVAS_SIZE,
    }));
    if (points.length < 3) return false;

    const midpoint = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    });

    const start = midpoint(points[points.length - 1], points[0]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    points.forEach((point, index) => {
      const next = points[(index + 1) % points.length];
      const mid = midpoint(point, next);
      ctx.quadraticCurveTo(point.x, point.y, mid.x, mid.y);
    });
    ctx.closePath();
    return true;
  };

  const handleDownload = () => {
    const source = lineCanvasRef.current;
    if (!source) return;

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(source, 0, 0);

    guideRegions.forEach((region) => {
      if (!drawRegionPath(ctx, region)) return;
      const isHighlight = region.kind === 'highlight';
      const isDeep = region.kind === 'deep-shadow';
      const isCast = region.kind === 'cast-shadow';
      const strength = clamp(region.strength || .5, .15, 1);
      const base = isHighlight ? mediumConfig.highlightBase : mediumConfig.shadowBase;
      const alpha = clamp(base * (0.65 + strength * .65) * (isDeep ? 1.25 : isCast ? 1.1 : 1), .08, .55);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.globalCompositeOperation =
        isHighlight && settings.highlightPalette === 'same-color' ? 'screen' :
        !isHighlight && settings.shadowPalette === 'same-color' ? 'multiply' :
        'source-over';

      ctx.fillStyle = isHighlight ? resolved.highlight : resolved.shadow;

      if (settings.coloringMedium === 'watercolors') {
        ctx.filter = 'blur(1.4px)';
      } else if (settings.coloringMedium === 'digital') {
        ctx.filter = 'blur(.7px)';
      }

      ctx.fill();
      ctx.restore();

      if (settings.coloringMedium === 'colored-pencils') {
        ctx.save();
        drawRegionPath(ctx, region);
        ctx.clip();
        ctx.globalAlpha = alpha * .55;
        ctx.strokeStyle = isHighlight ? resolved.highlight : resolved.shadow;
        ctx.lineWidth = 1.15;
        for (let offset = -CANVAS_SIZE; offset < CANVAS_SIZE * 2; offset += 9) {
          ctx.beginPath();
          ctx.moveTo(offset, 0);
          ctx.lineTo(offset + CANVAS_SIZE, CANVAS_SIZE);
          ctx.stroke();
        }
        ctx.restore();
      }
    });

    const link = document.createElement('a');
    link.download = `Maker-Mosaic-Light-Guide-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!showLightPuck || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setLight(prev => ({ ...prev, x: clamp(x, 5, 95), y: clamp(y, 5, 95) }));
  };

  const learningColors = {
    highlight: { fill: '#F7C95B', stroke: '#B67A2E' },
    'form-shadow': { fill: '#A889B0', stroke: '#6B566C' },
    'cast-shadow': { fill: '#7BA6BD', stroke: '#5B7890' },
    'deep-shadow': { fill: '#59617F', stroke: '#3F4665' },
  } as const;

  const polygonAppearance = (region: LightingGuideRegion) => {
    if (settings.showLearningMap) {
      const map = learningColors[region.kind];
      return {
        fill: map.fill,
        stroke: map.stroke,
        opacity: clamp(.23 + region.strength * .18, .25, .48),
        filter: undefined,
        blendMode: 'normal' as const,
      };
    }

    const isHighlight = region.kind === 'highlight';
    const isDeep = region.kind === 'deep-shadow';
    const isCast = region.kind === 'cast-shadow';
    const baseOpacity = isHighlight ? mediumConfig.highlightBase : mediumConfig.shadowBase;
    const highlightBoost =
      isHighlight && settings.boostHighlightVisibility
        ? (isBlankLineArt ? 1.55 : 1.25)
        : 1;

    return {
      fill: isHighlight ? resolved.highlight : resolved.shadow,
      stroke: 'none',
      opacity: clamp(
        baseOpacity *
          (.65 + region.strength * .65) *
          (isDeep ? 1.25 : isCast ? 1.1 : 1) *
          highlightBoost,
        .08,
        .62,
      ),
      filter: mediumConfig.filter,
      blendMode:
        isHighlight && settings.highlightPalette === 'same-color' ? 'screen' as const :
        !isHighlight && settings.shadowPalette === 'same-color' ? 'multiply' as const :
        settings.coloringMedium === 'markers' ? 'multiply' as const :
        'normal' as const,
    };
  };

  return (
    <section className="studio-card canvas-card">
      <div className="canvas-toolbar">
        <div className="canvas-title">
          <Sun size={16} color="var(--brass)" />
          <span>Your artwork</span>
        </div>
        <div className="canvas-actions">
          <button
            className="subtle-button"
            type="button"
            onClick={() => setShowLightPuck(value => !value)}
          >
            <Eye size={14} />
            {showLightPuck ? 'Done' : 'Custom light'}
          </button>
          <button
            className="download-button"
            type="button"
            onClick={handleDownload}
            disabled={!guideRegions.length}
            style={{ opacity: guideRegions.length ? 1 : .45 }}
          >
            <Download size={14} />
            Download guide
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="art-stage"
        onPointerDown={handlePointerDown}
        style={{
          cursor: showLightPuck ? 'crosshair' : 'default',
          background: currentSurface.color,
        }}
      >
        <canvas
          ref={lineCanvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />

        {guideRegions.length > 0 && (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              clipPath: `inset(0 ${100 - guideReveal}% 0 0)`,
            }}
          >
            <defs>
              {subjectMaskUrl && (
                <mask
                  id="subjectSurfaceMask"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="100"
                  height="100"
                >
                  <image
                    href={subjectMaskUrl}
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    preserveAspectRatio="none"
                  />
                </mask>
              )}
              <filter id="pencilGrain" x="-8%" y="-8%" width="116%" height="116%">
                <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="3" seed="9" result="noise" />
                <feColorMatrix
                  in="noise"
                  type="matrix"
                  values="
                    0.35 0 0 0 0.34
                    0 0.35 0 0 0.34
                    0 0 0.35 0 0.34
                    0 0 0 .22 0"
                  result="grain"
                />
                <feComposite in="grain" in2="SourceGraphic" operator="in" result="texturedGrain" />
                <feBlend in="SourceGraphic" in2="texturedGrain" mode="multiply" />
              </filter>
              <filter id="watercolor" x="-6%" y="-6%" width="112%" height="112%">
                <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale=".55" result="rough" />
                <feGaussianBlur in="rough" stdDeviation=".10" />
              </filter>
              <filter id="digitalSoft" x="-4%" y="-4%" width="108%" height="108%">
                <feGaussianBlur stdDeviation=".16" />
              </filter>
              <filter id="highlightBloom" x="-15%" y="-15%" width="130%" height="130%">
                <feGaussianBlur stdDeviation=".55" />
              </filter>
            </defs>

            {guideRegions.map((region, index) => {
              const appearance = polygonAppearance(region);
              const path = smoothSvgPath(region);
              const isHighlight = region.kind === 'highlight';

              return (
                <g
                  key={`${region.kind}-${index}`}
                  mask={subjectMaskUrl && region.kind !== 'cast-shadow' ? 'url(#subjectSurfaceMask)' : undefined}
                >
                  {!settings.showLearningMap && isHighlight && (
                    <path
                      d={path}
                      fill={resolved.highlight}
                      fillOpacity={clamp(
                        appearance.opacity * (settings.boostHighlightVisibility ? .9 : .55),
                        .09,
                        settings.boostHighlightVisibility ? .28 : .18
                      )}
                      filter="url(#highlightBloom)"
                      style={{ mixBlendMode: 'normal' }}
                    />
                  )}
                  <path
                    d={path}
                    fill={appearance.fill}
                    fillOpacity={appearance.opacity}
                    stroke={appearance.stroke}
                    strokeWidth={settings.showLearningMap ? .35 : 0}
                    filter={appearance.filter}
                    style={{ mixBlendMode: appearance.blendMode }}
                  />
                </g>
              );
            })}
          </svg>
        )}

        {showLightPuck && (
          <div
            onPointerDown={(event) => {
              event.stopPropagation();
              event.currentTarget.setPointerCapture(event.pointerId);
              setIsDraggingLight(true);
            }}
            onPointerMove={(event) => {
              if (!isDraggingLight || !containerRef.current) return;
              const rect = containerRef.current.getBoundingClientRect();
              const x = ((event.clientX - rect.left) / rect.width) * 100;
              const y = ((event.clientY - rect.top) / rect.height) * 100;
              setLight(prev => ({ ...prev, x: clamp(x, 5, 95), y: clamp(y, 5, 95) }));
            }}
            onPointerUp={(event) => {
              event.currentTarget.releasePointerCapture(event.pointerId);
              setIsDraggingLight(false);
            }}
            onPointerCancel={() => setIsDraggingLight(false)}
            style={{
              position: 'absolute',
              left: `${lightX}%`,
              top: `${lightY}%`,
              transform: 'translate(-50%, -50%)',
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: '2px solid var(--brass)',
              background: light.color,
              boxShadow: '0 6px 20px rgba(50,40,30,.18)',
              display: 'grid',
              placeItems: 'center',
              zIndex: 20,
              cursor: 'grab',
            }}
            title="Drag the light source"
          >
            <Sun size={17} color="var(--ink)" />
          </div>
        )}

        {guideRegions.length > 0 && guideReveal > 0 && guideReveal < 100 && (
          <div
            style={{
              position: 'absolute',
              left: `${guideReveal}%`,
              top: 0,
              bottom: 0,
              width: 2,
              background: 'var(--brass)',
              boxShadow: '0 0 0 1px rgba(255,255,255,.35)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {guideRegions.length > 0 && (
        <>
          <div className="guide-note">
            {guideNeedsUpdate
              ? 'You changed the light direction. Update the lighting guide to move the highlight and shadow areas.'
              : settings.showLearningMap
              ? 'Learning map: gold = highlight, plum = form shadow, blue = cast shadow, indigo = deepest shadow.'
              : isBlankLineArt
                ? `${mediumConfig.label} preview · pale highlight areas mean “keep this lighter” on white paper. Shadows show where to build depth.`
                : `${mediumConfig.label} preview · change medium, light type, or colours and the preview updates instantly.`}
          </div>

          {settings.showLearningMap && (
            <div className="guide-legend">
              <span><i className="legend-dot" style={{ background: '#F7C95B' }} />Highlight</span>
              <span><i className="legend-dot" style={{ background: '#A889B0' }} />Form shadow</span>
              <span><i className="legend-dot" style={{ background: '#7BA6BD' }} />Cast shadow</span>
              <span><i className="legend-dot" style={{ background: '#59617F' }} />Deep shadow</span>
            </div>
          )}

          <div className="preview-surface-panel">
            <div className="preview-surface-header">
              <div>
                <p className="preview-surface-title">Preview surface</p>
                <p className="preview-surface-copy">
                  For visibility only — does not change your artwork or download.
                </p>
              </div>
            </div>

            <div className="preview-surface-chips">
              {Object.entries(previewSurfaces).map(([value, option]) => (
                <button
                  key={value}
                  type="button"
                  className={`surface-chip ${settings.previewSurface === value ? 'selected' : ''}`}
                  onClick={() =>
                    setSettings(prev => ({
                      ...prev,
                      previewSurface: value as ShadingSettings['previewSurface'],
                    }))
                  }
                >
                  <span
                    className="surface-swatch"
                    style={{ background: option.color }}
                    aria-hidden="true"
                  />
                  {option.label}
                </button>
              ))}
            </div>

            <label className="preview-toggle">
              <input
                type="checkbox"
                checked={settings.boostHighlightVisibility}
                onChange={(event) =>
                  setSettings(prev => ({
                    ...prev,
                    boostHighlightVisibility: event.target.checked,
                  }))
                }
              />
              <span>
                <strong>Boost highlight visibility</strong>
                <small>Helpful when planning on an uncoloured page.</small>
              </span>
            </label>
          </div>

          <div className="comparison-slider">
            <span>Original</span>
            <input
              type="range"
              min="0"
              max="100"
              value={guideReveal}
              onChange={(e) => setGuideReveal(Number(e.target.value))}
              aria-label="Compare original artwork with lighting guide"
            />
            <span>Guide</span>
          </div>
        </>
      )}
    </section>
  );
};
