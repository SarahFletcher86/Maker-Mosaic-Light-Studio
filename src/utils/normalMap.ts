import { LightSource, ShadingSettings } from '../types';

export interface CanvasShadingContext {
  width: number;
  height: number;
  normalMapData: Float32Array; // 3 values per pixel: nx, ny, nz
  heightMapData: Float32Array; // distance height 0..1 per pixel
  lineMaskData: Uint8Array; // 255 for black line, 0 for interior
  baseColorData: ImageData; // RGBA base fills
}

/**
 * Processes line art canvas to extract height maps and 3D surface normal vectors.
 * Uses distance transform to synthesize a 3D bevel/dome volume for enclosed line art shapes.
 */
export function processLineArtSurface(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold: number = 180,
  invertLines: boolean = false
): CanvasShadingContext {
  const imgData = ctx.getImageData(0, 0, width, height);
  const pixels = imgData.data;
  const numPixels = width * height;

  const lineMaskData = new Uint8Array(numPixels);
  const distanceMap = new Float32Array(numPixels);

  // 1. Line isolation & binarization
  for (let i = 0; i < numPixels; i++) {
    const idx = i * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    const alpha = pixels[idx + 3];

    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const isLine = alpha > 50 && (invertLines ? luminance > threshold : luminance < threshold);

    lineMaskData[i] = isLine ? 255 : 0;
    distanceMap[i] = isLine ? 0 : 9999;
  }

  // 2. Fast two-pass Chamfer distance transform for 3D depth/height estimation
  // Forward pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (lineMaskData[idx] === 255) continue;

      let minD = distanceMap[idx];
      if (x > 0) minD = Math.min(minD, distanceMap[idx - 1] + 1);
      if (y > 0) minD = Math.min(minD, distanceMap[idx - width] + 1);
      if (x > 0 && y > 0) minD = Math.min(minD, distanceMap[idx - width - 1] + 1.414);
      if (x < width - 1 && y > 0) minD = Math.min(minD, distanceMap[idx - width + 1] + 1.414);

      distanceMap[idx] = minD;
    }
  }

  // Backward pass
  let maxDistance = 1;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const idx = y * width + x;
      if (lineMaskData[idx] === 255) continue;

      let minD = distanceMap[idx];
      if (x < width - 1) minD = Math.min(minD, distanceMap[idx + 1] + 1);
      if (y < height - 1) minD = Math.min(minD, distanceMap[idx + width] + 1);
      if (x < width - 1 && y < height - 1) minD = Math.min(minD, distanceMap[idx + width + 1] + 1.414);
      if (x > 0 && y < height - 1) minD = Math.min(minD, distanceMap[idx + width - 1] + 1.414);

      distanceMap[idx] = minD;
      if (minD > maxDistance && minD < 9999) {
        maxDistance = minD;
      }
    }
  }

  // Normalize heightmap and compute smooth 3D Normals
  const heightMapData = new Float32Array(numPixels);
  const maxCap = Math.min(maxDistance, 45); // Max bevel height cap

  for (let i = 0; i < numPixels; i++) {
    if (lineMaskData[i] === 255) {
      heightMapData[i] = 0;
    } else {
      // Smooth sigmoid or sine dome shape
      const normD = Math.min(1, distanceMap[i] / maxCap);
      heightMapData[i] = Math.sin((normD * Math.PI) / 2);
    }
  }

  // 3. Sobel filter gradient for 3D Surface Normal vectors (Nx, Ny, Nz)
  const normalMapData = new Float32Array(numPixels * 3);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const nIdx = idx * 3;

      if (lineMaskData[idx] === 255) {
        // Flat normal pointing out of screen on lines
        normalMapData[nIdx] = 0;
        normalMapData[nIdx + 1] = 0;
        normalMapData[nIdx + 2] = 1;
        continue;
      }

      // Height samples
      const hL = heightMapData[idx - 1];
      const hR = heightMapData[idx + 1];
      const hU = heightMapData[idx - width];
      const hD = heightMapData[idx + width];

      const dzdx = (hR - hL) * 2.5;
      const dzdy = (hD - hU) * 2.5;

      // Normal vector N = (-dzdx, -dzdy, 1)
      const nx = -dzdx;
      const ny = -dzdy;
      const nz = 1.0;

      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      normalMapData[nIdx] = nx / len;
      normalMapData[nIdx + 1] = ny / len;
      normalMapData[nIdx + 2] = nz / len;
    }
  }

  // Base color image data placeholder
  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = width;
  baseCanvas.height = height;
  const baseCtx = baseCanvas.getContext('2d')!;
  baseCtx.fillStyle = '#FFFFFF';
  baseCtx.fillRect(0, 0, width, height);

  return {
    width,
    height,
    normalMapData,
    heightMapData,
    lineMaskData,
    baseColorData: baseCtx.getImageData(0, 0, width, height)
  };
}

/**
 * Converts Hex string to RGB [r, g, b] 0..255
 */
export function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [255, 255, 255];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Real-time rendering function that draws light, shadows, specular highlights,
 * cel shading, or cast shadow overlays onto target canvas.
 */
export function renderLightingOverlay(
  targetCtx: CanvasRenderingContext2D,
  shadingCtx: CanvasShadingContext,
  light: LightSource,
  settings: ShadingSettings,
  baseImageCanvas?: HTMLCanvasElement
) {
  const { width, height, normalMapData, lineMaskData } = shadingCtx;
  const outputImgData = targetCtx.createImageData(width, height);
  const outData = outputImgData.data;

  // Base image pixel buffer if present
  let basePixels: Uint8ClampedArray | null = null;
  if (baseImageCanvas) {
    const bCtx = baseImageCanvas.getContext('2d');
    if (bCtx) {
      basePixels = bCtx.getImageData(0, 0, width, height).data;
    }
  }

  // Light position in pixel space
  const lxPixel = (light.x / 100) * width;
  const lyPixel = (light.y / 100) * height;
  const lzPixel = (light.z / 100) * Math.max(width, height);

  const lightRgb = hexToRgb(light.color);
  const shadowRgb = hexToRgb(settings.shadowColor);
  const rimRgb = hexToRgb(settings.rimLightColor);

  // Precalculate normalized light position or vector
  const isDirectional = light.type !== 'point';

  // Distant directional light key vector (calculates key light angle across entire page)
  const dxDir = (lxPixel - width / 2);
  const dyDir = (lyPixel - height / 2);
  const dzDir = (light.z / 100) * Math.max(width, height) * 1.5;
  const dirDist = Math.sqrt(dxDir * dxDir + dyDir * dyDir + dzDir * dzDir) || 1;
  const dirLx = dxDir / dirDist;
  const dirLy = dyDir / dirDist;
  const dirLz = dzDir / dirDist;

  const isHeatmap = settings.style === 'heat-map';
  const isGuideMap = settings.style === 'guide-map';

  // Peak highlight and shadow coordinate trackers for guide markers
  let maxDot = -1;
  let minDot = 2;
  let peakX = width / 2;
  let peakY = height / 2;
  let shadowX = width / 2;
  let shadowY = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const pixelIdx = idx * 4;
      const nIdx = idx * 3;

      // Base color defaults to white or existing colored canvas
      let br = 255, bg = 255, bb = 255, ba = 255;
      if (basePixels) {
        br = basePixels[pixelIdx];
        bg = basePixels[pixelIdx + 1];
        bb = basePixels[pixelIdx + 2];
        ba = basePixels[pixelIdx + 3];
      }

      // If this pixel is a black line art pixel, draw lines dark and clean
      if (lineMaskData[idx] === 255) {
        outData[pixelIdx] = settings.invertLines ? 255 : 20;
        outData[pixelIdx + 1] = settings.invertLines ? 255 : 20;
        outData[pixelIdx + 2] = settings.invertLines ? 255 : 20;
        outData[pixelIdx + 3] = ba;
        continue;
      }

      // 3D Normal Vector
      const nx = normalMapData[nIdx];
      const ny = normalMapData[nIdx + 1];
      const nz = normalMapData[nIdx + 2];

      const isFlatPaper = Math.abs(nx) < 0.05 && Math.abs(ny) < 0.05;
      if (isFlatPaper) {
        // Flat background paper has no 3D slope: maintain clean original paper color
        outData[pixelIdx] = br;
        outData[pixelIdx + 1] = bg;
        outData[pixelIdx + 2] = bb;
        outData[pixelIdx + 3] = ba;
        continue;
      }

      let lx = dirLx;
      let ly = dirLy;
      let lz = dirLz;

      if (!isDirectional) {
        // Point Light / Local Desk Lamp (with elevated z offset to prevent tight crowding)
        const dx = lxPixel - x;
        const dy = lyPixel - y;
        const dz = (light.z / 100) * Math.max(width, height) + 350;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        lx = dx / dist;
        ly = dy / dist;
        lz = dz / dist;
      }

      // Dot product N · L (Lambertian diffuse)
      let dot = nx * lx + ny * ly + nz * lz;
      const rawDot = dot;

      // Track max/min dot points for guide marker overlays
      if (rawDot > maxDot) {
        maxDot = rawDot;
        peakX = x;
        peakY = y;
      }
      if (rawDot < minDot) {
        minDot = rawDot;
        shadowX = x;
        shadowY = y;
      }

      if (isHeatmap) {
        // Red = Highlight (high dot), Yellow = Mid, Blue = Shadow
        let hr = 0, hg = 0, hb = 0;
        if (dot > 0.6) {
          hr = 255; hg = Math.round((dot - 0.6) * 600); hb = 0; // Red to Yellow
        } else if (dot > 0.2) {
          hr = Math.round((dot - 0.2) * 600); hg = 255; hb = 0; // Yellow to Green
        } else {
          hr = 0; hg = Math.round(dot * 1000); hb = 255; // Cyan to Blue
        }
        outData[pixelIdx] = hr;
        outData[pixelIdx + 1] = hg;
        outData[pixelIdx + 2] = hb;
        outData[pixelIdx + 3] = 255;
        continue;
      }

      if (isGuideMap) {
        // Coloring Guide Map Overlay:
        // Preserves crisp black line art and clean white paper midtones.
        // Applies clean indigo pencil shadows in dark zones and warm highlights on lit forms.
        const isInk = br < 80 && bg < 80 && bb < 80;

        if (isInk) {
          outData[pixelIdx] = br;
          outData[pixelIdx + 1] = bg;
          outData[pixelIdx + 2] = bb;
          outData[pixelIdx + 3] = ba;
          continue;
        }

        let rRatio = 1.0;
        let gRatio = 1.0;
        let bRatio = 1.0;

        if (dot < 0.32) {
          // Shadow zone: soft indigo / pencil shadow tint
          const s = (0.32 - dot) / 0.32;
          rRatio = 0.80 - s * 0.15;
          gRatio = 0.78 - s * 0.15;
          bRatio = 0.95 + s * 0.05;
        } else if (dot > 0.70) {
          // Highlight zone: subtle warm golden highlight (only on curved forms or strong light direction)
          const h = (dot - 0.70) / 0.30;
          rRatio = 1.0;
          gRatio = 0.98;
          bRatio = 0.85 - h * 0.15;
        } else {
          // Midtone zone: Keep clean white paper unchanged
          rRatio = 1.0;
          gRatio = 1.0;
          bRatio = 1.0;
        }

        let gr = br * rRatio;
        let gg = bg * gRatio;
        let gb = bb * bRatio;

        outData[pixelIdx] = Math.min(255, Math.max(0, Math.round(gr)));
        outData[pixelIdx + 1] = Math.min(255, Math.max(0, Math.round(gg)));
        outData[pixelIdx + 2] = Math.min(255, Math.max(0, Math.round(gb)));
        outData[pixelIdx + 3] = ba;
        continue;
      }

      // Cel Shading vs Soft Render step calculation
      if (settings.style === 'cel-shading') {
        if (dot < 0.25) {
          dot = 0.15; // Shadow
        } else if (dot < 0.65) {
          dot = 0.55; // Midtone
        } else {
          dot = 0.95; // Highlight
        }
      } else {
        dot = Math.max(0.1, dot);
      }

      // Preserve crisp black ink lines
      const isBlackInk = br < 70 && bg < 70 && bb < 70;
      if (isBlackInk) {
        outData[pixelIdx] = br;
        outData[pixelIdx + 1] = bg;
        outData[pixelIdx + 2] = bb;
        outData[pixelIdx + 3] = ba;
        continue;
      }

      // Blinn-Phong Specular Highlight (H = (L + V) / |L + V|)
      const hx = lx;
      const hy = ly;
      const hz = lz + 1.0;
      const hLen = Math.sqrt(hx * hx + hy * hy + hz * hz);
      const dotH = Math.max(0, (nx * hx + ny * hy + nz * hz) / hLen);
      const specPower = Math.pow(dotH, settings.specularShininess || 32);
      const specular = specPower * (settings.specularIntensity || 0.4) * light.intensity;

      // Rim Lighting calculation
      let rimFactor = 0;
      if (settings.rimLightEnabled) {
        const viewDotN = nz;
        const edgeFactor = Math.pow(1.0 - viewDotN, 2.0);
        if (rawDot < 0.3) {
          rimFactor = edgeFactor * (settings.rimLightIntensity || 0.8);
        }
      }

      // Composite pixel color: Multiply/Overlay blend to keep paper white clean
      const isLightZone = dot >= 0.4;
      let finalR = br;
      let finalG = bg;
      let finalB = bb;

      if (dot < 0.35) {
        // Shadow Side: Apply soft cool shadow tint
        const shadowAmt = (0.35 - dot) / 0.35;
        finalR = br * (1.0 - shadowAmt * 0.25);
        finalG = bg * (1.0 - shadowAmt * 0.28);
        finalB = bb * (1.0 - shadowAmt * 0.10);
      } else if (dot > 0.7) {
        // Highlight Side: Apply subtle warm highlight tint
        const highlightAmt = (dot - 0.7) / 0.3;
        finalR = Math.min(255, br + highlightAmt * 15);
        finalG = Math.min(255, bg + highlightAmt * 12);
        finalB = Math.max(0, bb - highlightAmt * 15);
      }

      // Add specular and rim light highlights
      finalR += specular * 200 + rimRgb[0] * rimFactor * 0.5;
      finalG += specular * 200 + rimRgb[1] * rimFactor * 0.5;
      finalB += specular * 200 + rimRgb[2] * rimFactor * 0.5;

      outData[pixelIdx] = Math.min(255, Math.max(0, Math.round(finalR)));
      outData[pixelIdx + 1] = Math.min(255, Math.max(0, Math.round(finalG)));
      outData[pixelIdx + 2] = Math.min(255, Math.max(0, Math.round(finalB)));
      outData[pixelIdx + 3] = ba;
    }
  }

  targetCtx.putImageData(outputImgData, 0, 0);

  // Draw Light Direction Rays if enabled
  if (settings.showLightRays) {
    targetCtx.save();
    targetCtx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    targetCtx.lineWidth = 2;
    targetCtx.setLineDash([6, 6]);

    const numRays = 8;
    for (let i = 0; i < numRays; i++) {
      const angle = (i * (2 * Math.PI)) / numRays;
      const rayLen = 180;
      const targetX = lxPixel + Math.cos(angle) * rayLen;
      const targetY = lyPixel + Math.sin(angle) * rayLen;

      targetCtx.beginPath();
      targetCtx.moveTo(lxPixel, lyPixel);
      targetCtx.lineTo(targetX, targetY);
      targetCtx.stroke();
    }
    targetCtx.restore();
  }
}

/**
 * Flood Fill algorithm to color base line art regions
 */
export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColorHex: string,
  lineMaskData: Uint8Array,
  width: number,
  height: number
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const startIdx = (startY * width + startX) * 4;
  const startR = data[startIdx];
  const startG = data[startIdx + 1];
  const startB = data[startIdx + 2];
  const startA = data[startIdx + 3];

  const fillRgb = hexToRgb(fillColorHex);

  // If already filled with target color or clicked on black line, return
  if (
    lineMaskData[startY * width + startX] === 255 ||
    (startR === fillRgb[0] && startG === fillRgb[1] && startB === fillRgb[2] && startA === 255)
  ) {
    return;
  }

  const pixelStack: [number, number][] = [[startX, startY]];
  const visited = new Uint8Array(width * height);

  function matchColor(x: number, y: number): boolean {
    const idx = y * width + x;
    if (lineMaskData[idx] === 255) return false;
    const pIdx = idx * 4;
    const r = data[pIdx];
    const g = data[pIdx + 1];
    const b = data[pIdx + 2];

    const diff = Math.abs(r - startR) + Math.abs(g - startG) + Math.abs(b - startB);
    return diff < 40;
  }

  while (pixelStack.length > 0) {
    const [x, y] = pixelStack.pop()!;
    let currentY = y;

    while (currentY >= 0 && matchColor(x, currentY)) {
      currentY--;
    }
    currentY++;

    let reachLeft = false;
    let reachRight = false;

    while (currentY < height && matchColor(x, currentY)) {
      const idx = currentY * width + x;
      if (visited[idx]) break;

      visited[idx] = 1;
      const pIdx = idx * 4;
      data[pIdx] = fillRgb[0];
      data[pIdx + 1] = fillRgb[1];
      data[pIdx + 2] = fillRgb[2];
      data[pIdx + 3] = 255;

      if (x > 0) {
        if (matchColor(x - 1, currentY)) {
          if (!reachLeft) {
            pixelStack.push([x - 1, currentY]);
            reachLeft = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }
      }

      if (x < width - 1) {
        if (matchColor(x + 1, currentY)) {
          if (!reachRight) {
            pixelStack.push([x + 1, currentY]);
            reachRight = true;
          }
        } else if (reachRight) {
          reachRight = false;
        }
      }

      currentY++;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
