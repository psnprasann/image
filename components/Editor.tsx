import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area, PixelCrop } from '../types';
import { ZoomIn, ZoomOut, Check, Sliders, ShieldCheck, FileDown, Copyright } from 'lucide-react';

interface EditorProps {
  imageSrc: string;
  onConfirm: (croppedAreaPixels: PixelCrop, quality: number, targetSize: number, addWatermark: boolean) => void;
  onCancel: () => void;
}

const Editor: React.FC<EditorProps> = ({ imageSrc, onConfirm, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [quality, setQuality] = useState(92);
  const [targetSize, setTargetSize] = useState<number>(0); // 0 means manual quality
  const [addWatermark, setAddWatermark] = useState(true);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);

  // Fixed 3:2 aspect ratio
  const aspect = 3 / 2;

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: PixelCrop) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleProcess = () => {
    if (croppedAreaPixels) {
      // Convert quality 0-100 to 0-1 range
      onConfirm(croppedAreaPixels, quality / 100, targetSize, addWatermark);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Editor Area */}
      <div className="relative h-[60vh] bg-slate-900 w-full">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          showGrid={true}
          classes={{
            containerClassName: "bg-slate-900",
            mediaClassName: "",
            cropAreaClassName: "border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
          }}
        />
      </div>

      {/* Controls */}
      <div className="p-6 bg-white border-t border-slate-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Zoom Control */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                <span className="flex items-center gap-2">
                  <ZoomOut className="w-4 h-4" /> Zoom
                </span>
                <span>{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-label="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            
            {/* Watermark Toggle */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Copyright className="w-4 h-4 text-slate-500" /> 
                  Add Watermark
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={addWatermark} 
                    onChange={e => setAddWatermark(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
          </div>

          {/* Quality & Size Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-medium text-slate-600 mb-2">
              <span className="flex items-center gap-2">
                <FileDown className="w-4 h-4" /> Optimization Target
              </span>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
               <button
                  type="button"
                  onClick={() => setTargetSize(0)}
                  className={`px-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    targetSize === 0 
                      ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
               >
                 Manual
               </button>
               <button
                  type="button"
                  onClick={() => setTargetSize(150 * 1024)}
                  className={`px-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    targetSize === 150 * 1024 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 transform scale-105' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
               >
                 &lt; 150KB
               </button>
               <button
                  type="button"
                  onClick={() => setTargetSize(100 * 1024)}
                  className={`px-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    targetSize === 100 * 1024 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 transform scale-105' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
               >
                 &lt; 100KB
               </button>
               <button
                  type="button"
                  onClick={() => setTargetSize(60 * 1024)}
                  className={`px-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    targetSize === 60 * 1024 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 transform scale-105' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
               >
                 &lt; 60KB
               </button>
               <button
                  type="button"
                  onClick={() => setTargetSize(50 * 1024)}
                  className={`px-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    targetSize === 50 * 1024 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 transform scale-105' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
               >
                 &lt; 50KB
               </button>
               <button
                  type="button"
                  onClick={() => setTargetSize(30 * 1024)}
                  className={`px-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    targetSize === 30 * 1024 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 transform scale-105' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
               >
                 &lt; 30KB
               </button>
            </div>

            {/* Contextual Options */}
            <div className="pt-2 h-16">
              {targetSize === 0 ? (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                     <span>Quality Level</span>
                     <span className={quality > 80 ? 'text-green-600' : quality > 50 ? 'text-amber-600' : 'text-red-600'}>
                       {quality}%
                     </span>
                  </div>
                  <input
                    type="range"
                    value={quality}
                    min={10}
                    max={100}
                    step={5}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                  />
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in duration-300">
                   <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                   <p className="text-xs text-blue-800 leading-snug">
                     Quality will be automatically adjusted to ensure the final file size is under <span className="font-bold">{targetSize / 1024}KB</span>.
                   </p>
                </div>
              )}
            </div>
            
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProcess}
            className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editor;