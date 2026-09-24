import React, { useRef, useState, useEffect } from 'react';
import { Edit3, Eraser, RotateCcw, Check, Trash2 } from 'lucide-react';

interface ScratchpadProps {
  onApplyDrawing: (dataUrl: string) => void;
  onCancel: () => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ onApplyDrawing, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState<number>(6);

  const CANVAS_SIZE = 600;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : '#111827';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onApplyDrawing(dataUrl);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-200 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>Line Art Scratchpad</span>
          </h2>
          <p className="text-xs text-slate-400">Draw your own shapes, characters, or line art to shade</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleClear}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleApply}
            className="flex items-center space-x-1 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply to Light Studio</span>
          </button>
        </div>
      </div>

      {/* Drawing Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTool('brush')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              tool === 'brush'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Ink Brush</span>
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              tool === 'eraser'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Line Thickness</span>
          <input
            type="range"
            min="2"
            max="24"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <span className="font-mono text-amber-400">{brushSize}px</span>
        </div>
      </div>

      {/* Canvas Drawing Surface */}
      <div className="relative aspect-square w-full max-w-[500px] mx-auto bg-white rounded-xl shadow-inner border-2 border-slate-700 overflow-hidden cursor-crosshair touch-none select-none">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};
