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
    <section className="studio-card upload-card">
      <div className="upload-heading-row">
        <div>
          <span className="step-kicker">Step 1</span>
          <h2 className="section-title">Add your artwork</h2>
          <p className="section-copy">Use a photo, scan, or digital colouring page. Your original image is never redrawn.</p>
        </div>

        <div className="upload-actions">
          <button className="upload-primary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={15} />
            Upload image
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} hidden />
          <button className="upload-secondary" onClick={onOpenCamera}>
            <Camera size={15} />
            Use camera
          </button>
        </div>
      </div>

      <details className="sample-details">
        <summary className="sample-summary">
          <span>Just testing? Try a sample page</span>
          <ChevronDown size={16} className="summary-chevron" />
        </summary>

        <div className="sample-grid">
          {SAMPLE_DRAWINGS.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className={`sample-card ${isSelected ? 'selected' : ''}`}
              >
                <div
                  className="sample-thumb"
                  dangerouslySetInnerHTML={{ __html: sample.svgString }}
                />
                <p className="sample-name">{sample.name}</p>
                {isSelected && (
                  <span className="sample-check">
                    <Check size={13} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </details>
    </section>
  );
};
