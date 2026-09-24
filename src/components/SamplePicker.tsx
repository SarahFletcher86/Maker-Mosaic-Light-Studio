import React, { useRef } from 'react';
import { SAMPLE_DRAWINGS } from '../data/samples';
import { SampleDrawing } from '../types';
import { Camera, Upload, Check, ChevronDown } from 'lucide-react';

interface SamplePickerProps {
  selectedSampleId: string;
  onSelectSample: (sample: SampleDrawing) => void;
  onCustomImageUpload: (dataUrl: string, name?: string) => void;
  onOpenCamera: () => void;
}

export const SamplePicker: React.FC<SamplePickerProps> = ({
  selectedSampleId,
  onSelectSample,
  onCustomImageUpload,
  onOpenCamera,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) onCustomImageUpload(result, file.name);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-slate-200 space-y-4">
      <div>
        <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-400">Step 1</span>
        <h2 className="text-lg font-bold text-white mt-1">Add your page</h2>
        <p className="text-sm text-slate-400 mt-1">Upload a photo or image of the artwork you want help shading.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-3 rounded-xl transition-all"
        >
          <Upload className="w-4 h-4" />
          Upload image
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

        <button
          onClick={onOpenCamera}
          className="flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-4 py-3 rounded-xl transition-all"
        >
          <Camera className="w-4 h-4 text-amber-400" />
          Use camera
        </button>
      </div>

      <details className="group border-t border-slate-800 pt-3">
        <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-white">
          <span>Just testing? Try a sample page</span>
          <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-3">
          {SAMPLE_DRAWINGS.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className={`relative rounded-xl p-2 text-left transition-all border ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  className="aspect-square w-full bg-white rounded-lg overflow-hidden flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:block"
                  dangerouslySetInnerHTML={{ __html: sample.svgString }}
                />
                <p className="text-[10px] font-semibold text-slate-300 mt-1.5 truncate">{sample.name}</p>
                {isSelected && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </details>
    </div>
  );
};
