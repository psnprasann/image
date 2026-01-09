import React, { useState, useEffect } from 'react';
import { ProcessedImage } from '../types';
import { optimizeToSize, getCroppedImg, readFile, createImage, getCenterCropPixels, formatBytes } from '../services/imageUtils';
import { Check, Download, AlertCircle, Loader2, Play, FileDown, Copyright } from 'lucide-react';

interface BatchProcessorProps {
  files: File[];
  onCancel: () => void;
}

interface BatchFileStatus {
  file: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  processedImage?: ProcessedImage;
  error?: string;
  originalSrc?: string;
}

const BatchProcessor: React.FC<BatchProcessorProps> = ({ files, onCancel }) => {
  const [items, setItems] = useState<BatchFileStatus[]>([]);
  const [targetSize, setTargetSize] = useState<number>(0);
  const [quality, setQuality] = useState(85);
  const [addWatermark, setAddWatermark] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Initialize items
    setItems(files.map(f => ({ file: f, status: 'pending' })));
  }, [files]);

  const processBatch = async () => {
    setIsProcessing(true);
    
    // Process sequentially to avoid browser hanging
    const newItems = [...items];
    
    for (let i = 0; i < newItems.length; i++) {
        if (newItems[i].status === 'done') continue;

        // Update status to processing
        newItems[i] = { ...newItems[i], status: 'processing' };
        setItems([...newItems]);

        try {
            const file = newItems[i].file;
            const src = await readFile(file);
            const image = await createImage(src);
            const cropPixels = getCenterCropPixels(image.width, image.height, 3/2);

            let blob: Blob | null = null;
            if (targetSize > 0) {
                blob = await optimizeToSize(src, cropPixels, 0, targetSize, addWatermark);
            } else {
                blob = await getCroppedImg(src, cropPixels, 0, quality / 100, 1.0, addWatermark);
            }

            if (blob) {
                const url = URL.createObjectURL(blob);
                newItems[i] = {
                    ...newItems[i],
                    status: 'done',
                    originalSrc: src,
                    processedImage: {
                        blob,
                        url,
                        originalSize: file.size,
                        newSize: blob.size,
                        width: cropPixels.width,
                        height: cropPixels.height,
                        originalName: file.name
                    }
                };
            } else {
                throw new Error("Failed to generate blob");
            }

        } catch (e) {
            console.error(e);
            newItems[i] = { ...newItems[i], status: 'error', error: 'Failed to process' };
        }

        setItems([...newItems]);
    }

    setIsProcessing(false);
  };

  const processedCount = items.filter(i => i.status === 'done').length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Configuration Header */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 pb-6 border-b border-slate-100">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Batch Processing</h2>
                <p className="text-slate-500 text-sm">
                    {files.length} images selected. All images will be center-cropped to 3:2.
                </p>
            </div>
            <div className="flex gap-3">
                 <button 
                   onClick={onCancel}
                   disabled={isProcessing}
                   className="px-4 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50"
                 >
                    Back
                 </button>
                 {!isProcessing && processedCount < items.length && (
                    <button 
                        onClick={processBatch}
                        className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2"
                    >
                        <Play className="w-4 h-4" /> Start Processing
                    </button>
                 )}
            </div>
         </div>

         {/* Settings Controls (Only show if not everything is done) */}
         {processedCount < items.length && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        disabled={isProcessing}
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {/* Target Size / Quality */}
                <div className="col-span-1 lg:col-span-2 space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                        <span className="flex items-center gap-2">
                            <FileDown className="w-4 h-4" /> Optimization Target
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[0, 150*1024, 100*1024, 60*1024, 30*1024].map(size => (
                            <button
                                key={size}
                                onClick={() => setTargetSize(size)}
                                disabled={isProcessing}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                    targetSize === size
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {size === 0 ? 'Manual Quality' : `< ${size/1024}KB`}
                            </button>
                        ))}
                    </div>
                    {targetSize === 0 && (
                        <div className="pt-2">
                             <input
                                type="range"
                                value={quality}
                                min={10}
                                max={100}
                                step={5}
                                disabled={isProcessing}
                                onChange={(e) => setQuality(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                            />
                            <div className="text-right text-xs text-slate-500 mt-1">Quality: {quality}%</div>
                        </div>
                    )}
                </div>
            </div>
         )}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {items.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4 overflow-hidden">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                        item.status === 'done' ? 'bg-green-100 text-green-600' :
                        item.status === 'error' ? 'bg-red-100 text-red-600' :
                        item.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                        'bg-slate-100 text-slate-400'
                    }`}>
                        {item.status === 'processing' ? <Loader2 className="w-6 h-6 animate-spin" /> :
                         item.status === 'done' ? <Check className="w-6 h-6" /> :
                         item.status === 'error' ? <AlertCircle className="w-6 h-6" /> :
                         <span className="text-xs font-bold">{idx + 1}</span>
                        }
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-medium text-slate-800 truncate">{item.file.name}</h4>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                             <span>{formatBytes(item.file.size)}</span>
                             {item.processedImage && (
                                 <>
                                    <span className="text-slate-300">→</span>
                                    <span className="text-green-600 font-bold">{formatBytes(item.processedImage.newSize)}</span>
                                 </>
                             )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                     {item.status === 'done' && item.processedImage && (
                         <a 
                            href={item.processedImage.url}
                            download={`optimized_${item.file.name.split('.')[0]}.webp`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download"
                         >
                            <Download className="w-5 h-5" />
                         </a>
                     )}
                     {item.status === 'error' && (
                         <span className="text-red-500 text-xs">{item.error}</span>
                     )}
                </div>
            </div>
        ))}
      </div>

    </div>
  );
};

export default BatchProcessor;