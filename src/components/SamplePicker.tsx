import React, { useRef, useState } from 'react';
import { SAMPLE_DRAWINGS } from '../data/samples';
import { SampleDrawing } from '../types';
import { Camera, Upload, Edit3, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

interface SamplePickerProps {
  selectedSampleId: string;
  onSelectSample: (sample: SampleDrawing) => void;
  onCustomImageUpload: (dataUrl: string, name: string) => void;
  onOpenCamera: () => void;
  onOpenScratchpad: () => void;
}

export const SamplePicker: React.FC<SamplePickerProps> = ({
  selectedSampleId,
  onSelectSample,
  onCustomImageUpload,
  onOpenCamera,
  onOpenScratchpad,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', '3D Form Training', 'Cute & Characters', 'Mandalas & Nature'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onCustomImageUpload(result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredSamples = activeCategory === 'All'
    ? SAMPLE_DRAWINGS
    : SAMPLE_DRAWINGS.filter(s => s.category === activeCategory);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-slate-200 space-y-4">
      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Select Drawing or Line Art</span>
          </h2>
          <p className="text-xs text-slate-400">Choose a template, scan paper page with camera, or upload photo</p>
        </div>

        {/* Input Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Camera Scan Button */}
          <button
            onClick={onOpenCamera}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:text-white"
            title="Scan paper coloring page using device camera"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Camera Scan</span>
          </button>

          {/* Upload File */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:text-white"
            title="Upload image or line art file"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Draw Scratchpad */}
          <button
            onClick={onOpenScratchpad}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            title="Draw line art manually"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Draw Own</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Preset Drawing Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {filteredSamples.map((sample) => {
          const isSelected = selectedSampleId === sample.id;
          return (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`relative group rounded-xl p-3 text-left transition-all flex flex-col justify-between border ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              {/* SVG Preview Box */}
              <div className="aspect-square w-full bg-slate-900 rounded-lg p-2 mb-2 flex items-center justify-center border border-slate-800/60 overflow-hidden group-hover:scale-[1.02] transition-transform">
                <div
                  className="w-full h-full text-slate-900 bg-white rounded flex items-center justify-center overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: sample.svgString }}
                />
              </div>

              {/* Title & Category */}
              <div>
                <h3 className="text-xs font-bold text-white truncate group-hover:text-amber-300">
                  {sample.name}
                </h3>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {sample.category}
                </p>
              </div>

              {/* Selected Check Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
