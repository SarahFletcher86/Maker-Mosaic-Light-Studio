export type ShadingStyle = 'guide-map' | 'soft-render' | 'cel-shading' | 'heat-map' | 'ambient-occlusion';

export type LightType = 'point' | 'directional' | 'spotlight';

export type ColoringMedium = 'colored-pencils' | 'markers' | 'watercolors' | 'digital';

export interface LightSource {
  x: number; // 0 to 100 percentage across canvas width
  y: number; // 0 to 100 percentage across canvas height
  z: number; // 10 to 100 elevation / distance from surface
  color: string; // hex color e.g. #FFF4D0
  intensity: number; // 0 to 1.5
  radius: number; // 50 to 500px light radius
  type: LightType;
  softness: number; // 0 to 20 shadow blur
}

export interface ShadingSettings {
  style: ShadingStyle;
  shadowColor: string; // e.g. #1E1233
  shadowOpacity: number; // 0 to 1
  shadowSteps: number; // 2, 3, or 4 for cel shading
  rimLightEnabled: boolean;
  rimLightColor: string;
  rimLightIntensity: number;
  ambientLightColor: string;
  ambientIntensity: number;
  specularIntensity: number;
  specularShininess: number;
  lineThreshold: number; // 0 to 255 line art isolation threshold
  invertLines: boolean;
  showGuideMarkers: boolean; // Show ⭐ Highlight & 🌙 Shadow helper badges on canvas
  showLightRays: boolean; // Show directional light rays
  coloringMedium: ColoringMedium;
}

export interface ColorPalette {
  base: string;
  highlight: string;
  shadow: string;
  rimLight: string;
}

export type LightingRegionKind = 'highlight' | 'form-shadow' | 'cast-shadow' | 'deep-shadow';

export interface GuidePoint {
  x: number; // 0..100 normalized image/canvas coordinate
  y: number; // 0..100 normalized image/canvas coordinate
}

export interface LightingGuideRegion {
  kind: LightingRegionKind;
  label: string;
  explanation: string;
  strength: number; // 0..1 suggested intensity
  points: GuidePoint[];
}

export interface GeminiLightingAnalysis {
  title: string;
  summary: string;
  highlightsGuide: string;
  shadowsGuide: string;
  colorTheoryTip: string;
  stepByStepGuide: string[];
  palette: ColorPalette;
  regions: LightingGuideRegion[];
}

export interface SampleDrawing {
  id: string;
  name: string;
  category: '3D Form Training' | 'Cute & Characters' | 'Mandalas & Nature';
  svgString: string;
  description: string;
  defaultBaseColors?: Record<string, string>;
}

export type ActiveTool = 'light-drag' | 'bucket-fill' | 'paint-brush' | 'eraser';
