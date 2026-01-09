import React, { useState } from 'react';
import { ProcessedImage } from '../types';
import { formatBytes } from '../services/imageUtils';
import { Download, RefreshCw } from 'lucide-react';

interface ResultViewProps {
  processed: ProcessedImage;
  originalImageSrc: string;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ processed, originalImageSrc, onReset }) => {
  const [filename, setFilename] = useState(() => {
    const name = processed.originalName || 'image';
    return name.substring(0, name.lastIndexOf('.')) || name;
  });

  const sizeReduction = ((processed.originalSize - processed.newSize) / processed.originalSize) * 100;
  const isReduction = sizeReduction > 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Original */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="relative aspect-[3/2] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center order-1">
            <img src={originalImageSrc} alt="Original" className="w-full h-full object-contain" />
          </div>
          <div className="mt-4 flex items-center justify-between order-2">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Original</span>
            <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
              {formatBytes(processed.originalSize)}
            </span>
          </div>
        </div>

        {/* Processed */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-blue-100 relative overflow-hidden flex flex-col">
          <div className="relative aspect-[3/2] bg-slate-900/5 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center order-1">
             <img src={processed.url} alt="Processed" className="w-full h-full object-contain" />
             
             {/* Badge overlay on image */}
             <div className="absolute top-3 right-3 z-10">
                {isReduction ? (
                  <span className="bg-green-100/90 backdrop-blur-sm text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200 shadow-sm">
                    -{sizeReduction.toFixed(0)}% Size
                  </span>
                ) : (
                   <span className="bg-orange-100/90 backdrop-blur-sm text-orange-700 text-xs font-bold px-2 py-1 rounded-full border border-orange-200 shadow-sm">
                    +{(sizeReduction * -1).toFixed(0)}% Size
                  </span>
                )}
             </div>
          </div>
          
          <div className="mt-4 order-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Optimized WebP</span>
              <span className="text-sm font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                {formatBytes(processed.newSize)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
              <span>{processed.width} x {processed.height}px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors w-full md:w-auto"
          >
            <RefreshCw className="w-4 h-4" /> New Image
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
           {/* Rename Input */}
           <div className="relative w-full md:w-64 group">
             <input 
                type="text" 
                value={filename} 
                onChange={(e) => setFilename(e.target.value)}
                className="w-full pl-4 pr-14 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400"
                placeholder="Filename"
             />
             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none select-none bg-slate-50 pl-1">.webp</span>
           </div>

           {/* Download Button */}
           <a
             href={processed.url}
             download={`${filename}.webp`}
             className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-0.5 w-full md:w-auto whitespace-nowrap"
           >
             <Download className="w-5 h-5" /> Download
           </a>
        </div>
      </div>
    </div>
  );
};

export default ResultView;