import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Sparkles } from 'lucide-react';

interface CameraScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureImage: (dataUrl: string) => void;
}

export const CameraScanModal: React.FC<CameraScanModalProps> = ({
  isOpen,
  onClose,
  onCaptureImage
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contrast, setContrast] = useState<number>(140);

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    async function startCam() {
      try {
        setError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1080 } }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setError('Camera permission denied or camera not found on this device.');
      }
    }

    startCam();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = Math.min(video.videoWidth || 600, video.videoHeight || 600);
    canvas.width = 600;
    canvas.height = 600;

    const sx = ((video.videoWidth || size) - size) / 2;
    const sy = ((video.videoHeight || size) - size) / 2;

    // Apply high contrast & threshold to isolate black line art
    ctx.filter = `grayscale(100%) contrast(${contrast}%) brightness(110%)`;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 600, 600);

    const dataUrl = canvas.toDataURL('image/png');
    onCaptureImage(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Paper Line Art Camera Scanner</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-xs text-red-300 text-center">
            {error}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Live Camera Viewfinder */}
            <div className="relative aspect-square w-full bg-black rounded-xl overflow-hidden border-2 border-amber-500/40">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ filter: `grayscale(100%) contrast(${contrast}%)` }}
                className="w-full h-full object-cover"
              />
              {/* Scan Reticle Overlay */}
              <div className="absolute inset-8 border-2 border-dashed border-amber-400/60 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="bg-slate-950/80 text-amber-300 text-[10px] font-mono px-2 py-1 rounded">
                  Center Line Art Here
                </span>
              </div>
            </div>

            {/* Line Contrast Slider */}
            <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
              <div className="flex justify-between text-slate-300 font-medium">
                <span>Line Threshold / Contrast</span>
                <span className="font-mono text-amber-400">{contrast}%</span>
              </div>
              <input
                type="range"
                min="100"
                max="300"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <button
              onClick={handleCapture}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Capture & Extract Line Art</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
