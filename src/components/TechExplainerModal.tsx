import React from 'react';
import { X, CheckCircle2, Layers, Cpu, Eye, Sparkles, Smartphone, Code, ShieldCheck } from 'lucide-react';

interface TechExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechExplainerModal: React.FC<TechExplainerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">How Hard Is It To Build This Mobile App?</h2>
              <p className="text-xs text-slate-400">Technical Feasibility, Architecture & Implementation Roadmap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-sm leading-relaxed">
          {/* Difficulty Rating Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 rounded-xl p-4 flex items-start space-x-4">
            <div className="bg-amber-500 text-slate-950 font-extrabold text-xs px-2.5 py-1 rounded-md uppercase tracking-wider mt-0.5">
              Rating: Moderate
            </div>
            <div>
              <h3 className="font-semibold text-amber-300">Achievable in 2–4 Weeks (Web/Cross-Platform) or 1–2 Months (Native Mobile)</h3>
              <p className="text-xs text-slate-300 mt-1">
                Creating a mobile app that scans coloring pages, detects 3D forms, and projects interactive lighting is completely feasible today thanks to 2D-to-3D heightmap transforms, fragment shaders (WebGL/Metal), and AI vision models (Gemini API).
              </p>
            </div>
          </div>

          {/* Core Technical Challenges & Solutions */}
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>The 4 Core Architectural Steps</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">1</span>
                  <span>Camera Scan & Line Extraction</span>
                </div>
                <p className="text-xs text-slate-400">
                  Captures paper drawing with smartphone camera. Uses threshold filters (Otsu thresholding / adaptive binarization) to separate dark pencil/ink lines from paper shadows & wrinkles.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center space-x-2 text-orange-400 font-semibold mb-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs">2</span>
                  <span>2.5D Surface Normal Map Generation</span>
                </div>
                <p className="text-xs text-slate-400">
                  Flat 2D line art lacks 3D depth. By calculating a Distance Transform (measuring pixel distance to nearest line), we generate a smooth height map. Sobel gradients then compute 3D surface vectors <code className="text-amber-300">(Nx, Ny, Nz)</code>.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">3</span>
                  <span>Real-Time Fragment Shading</span>
                </div>
                <p className="text-xs text-slate-400">
                  As the user drags a light puck on screen, a custom shader computes Lambertian diffuse dot product <code className="text-amber-300">N · L</code>, Blinn-Phong specular highlights, cel-shading step thresholds, and ambient occlusion.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center space-x-2 text-orange-400 font-semibold mb-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs">4</span>
                  <span>AI Shading Assistant (Gemini API)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Sends line art & light source coordinates to Gemini 3.6 Flash vision model to analyze subject forms, identify core shadows, suggest warm/cool color palettes, and output step-by-step rendering guides.
                </p>
              </div>
            </div>
          </div>

          {/* Technology Stack Comparison */}
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center space-x-2">
              <Code className="w-4 h-4 text-amber-400" />
              <span>Recommended Mobile Tech Stack</span>
            </h3>
            <div className="overflow-hidden border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono">
                  <tr>
                    <th className="p-3">Platform</th>
                    <th className="p-3">Line Extraction</th>
                    <th className="p-3">Shading Engine</th>
                    <th className="p-3">Development Speed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-amber-400">PWA / React Web (Current)</td>
                    <td className="p-3">HTML5 Canvas / OpenCV.js</td>
                    <td className="p-3">WebGL / Canvas 2D</td>
                    <td className="p-3 text-emerald-400 font-bold">Fastest (2 Weeks)</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-blue-400">React Native / Expo</td>
                    <td className="p-3">Skia / OpenCV C++</td>
                    <td className="p-3">React Native Skia Shaders</td>
                    <td className="p-3 text-amber-400 font-bold">Medium (3-4 Weeks)</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-purple-400">Native iOS (Swift) / Android</td>
                    <td className="p-3">CoreImage / Vision Kit</td>
                    <td className="p-3">Metal Shaders / Vulkan</td>
                    <td className="p-3 text-orange-400 font-bold">High Precision (6-8 Weeks)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Lessons & Value */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <h4 className="font-semibold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Why Artists & Students Love This Concept</span>
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Teaches lighting physics & color temperature (warm lights make cool shadows).</li>
              <li>Saves hours of trial-and-error when planning where core shadows fall on complex drawings.</li>
              <li>Provides an interactive bridge between flat 2D coloring books and 3D digital rendering.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20"
          >
            Try Interactive Studio Prototype
          </button>
        </div>
      </div>
    </div>
  );
};
