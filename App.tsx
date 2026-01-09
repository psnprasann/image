import React, { useState } from 'react';
import { PixelCrop, ProcessedImage } from './types';
import { getCroppedImg, optimizeToSize, readFile } from './services/imageUtils';
import Dropzone from './components/Dropzone';
import Editor from './components/Editor';
import ResultView from './components/ResultView';
import BatchProcessor from './components/BatchProcessor';
import { Scissors, Zap, Image as ImageIcon, Layers } from 'lucide-react';

enum AppState {
  IDLE,
  EDITING,
  RESULT,
  BATCH,
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [mode, setMode] = useState<'single' | 'multiple'>('single');
  
  // Single Mode State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Batch Mode State
  const [batchFiles, setBatchFiles] = useState<File[]>([]);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    if (mode === 'single') {
        // Handle single file (take the first one)
        const file = files[0];
        try {
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
            setOriginalFile(file);
            setState(AppState.EDITING);
        } catch (e) {
            console.error("Failed to read file", e);
            alert("Could not read file. Please try again.");
        }
    } else {
        // Handle multiple files
        setBatchFiles(files);
        setState(AppState.BATCH);
    }
  };

  const handleConfirmCrop = async (cropPixels: PixelCrop, quality: number, targetSize: number, addWatermark: boolean) => {
    if (!imageSrc || !originalFile) return;

    setIsProcessing(true);
    try {
      let blob: Blob | null = null;
      
      if (targetSize > 0) {
        // Target size in bytes
        blob = await optimizeToSize(imageSrc, cropPixels, 0, targetSize, addWatermark);
      } else {
        blob = await getCroppedImg(imageSrc, cropPixels, 0, quality, 1.0, addWatermark);
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        
        setProcessedImage({
          blob,
          url,
          originalSize: originalFile.size,
          newSize: blob.size,
          width: cropPixels.width,
          height: cropPixels.height,
          originalName: originalFile.name
        });
        setState(AppState.RESULT);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (processedImage) {
      URL.revokeObjectURL(processedImage.url);
    }
    setState(AppState.IDLE);
    setImageSrc(null);
    setOriginalFile(null);
    setProcessedImage(null);
    setBatchFiles([]);
  };

  const handleCancelEdit = () => {
    setState(AppState.IDLE);
    setImageSrc(null);
    setOriginalFile(null);
    setBatchFiles([]);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              SmartOptimizer
            </h1>
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            High-Performance Image Reducer
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col">
        
        {state === AppState.IDLE && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-4 max-w-2xl">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight">
                Reduce Image Size, <br />
                <span className="text-blue-600">Keep the Quality.</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Crop your images to a perfect <span className="font-semibold text-slate-800">3:2 ratio</span>, convert to efficient <span className="font-semibold text-slate-800">WebP</span> format, and optimize for the web.
              </p>
            </div>

            {/* Mode Selection */}
            <div className="bg-white p-1 rounded-xl border border-slate-200 inline-flex shadow-sm">
                <button
                    onClick={() => setMode('single')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                        mode === 'single' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <ImageIcon className="w-4 h-4" /> Single Image
                </button>
                <button
                    onClick={() => setMode('multiple')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                        mode === 'multiple' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <Layers className="w-4 h-4" /> Multiple Images
                </button>
            </div>

            <Dropzone 
                onFileSelected={handleFilesSelected} 
                multiple={mode === 'multiple'} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mt-12">
               <FeatureCard 
                 icon={<Scissors className="w-6 h-6 text-blue-500" />}
                 title="Smart Crop"
                 desc="Fixed 3:2 aspect ratio perfect for standard web layouts."
               />
               <FeatureCard 
                 icon={<Zap className="w-6 h-6 text-amber-500" />}
                 title="Fast WebP"
                 desc="Modern WebP format conversion for superior compression."
               />
               <FeatureCard 
                 icon={<Zap className="w-6 h-6 text-purple-500" />}
                 title="Instant Rename"
                 desc="Easily rename files before downloading optimized versions."
               />
            </div>
          </div>
        )}

        {state === AppState.EDITING && imageSrc && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-300">
             {isProcessing ? (
               <div className="text-center space-y-4">
                 <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                 <p className="text-xl font-medium text-slate-700">Optimizing your image...</p>
               </div>
             ) : (
               <Editor 
                  imageSrc={imageSrc} 
                  onConfirm={handleConfirmCrop}
                  onCancel={handleCancelEdit}
                />
             )}
          </div>
        )}

        {state === AppState.RESULT && processedImage && imageSrc && (
          <ResultView 
            processed={processedImage} 
            originalImageSrc={imageSrc}
            onReset={handleReset}
          />
        )}

        {state === AppState.BATCH && batchFiles.length > 0 && (
            <BatchProcessor 
                files={batchFiles}
                onCancel={handleCancelEdit}
            />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Smart Image Optimizer. All processing happens locally in your browser.
        </div>
      </footer>
    </div>
  );
};

// Simple Feature Card Component
const FeatureCard: React.FC<{icon: React.ReactNode, title: string, desc: string}> = ({icon, title, desc}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="mb-4 bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default App;