import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Layers } from 'lucide-react';

interface DropzoneProps {
  onFileSelected: (files: File[]) => void;
  multiple?: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileSelected, multiple = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (multiple) {
        onFileSelected(Array.from(e.dataTransfer.files));
      } else {
        onFileSelected([e.dataTransfer.files[0]]);
      }
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        if (multiple) {
            onFileSelected(Array.from(e.target.files));
        } else {
            onFileSelected([e.target.files[0]]);
        }
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full max-w-2xl mx-auto h-80 border-4 border-dashed rounded-3xl
        flex flex-col items-center justify-center cursor-pointer transition-all duration-300
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
          : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
        }
      `}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept="image/*"
        multiple={multiple}
        className="hidden"
      />
      <div className="p-6 rounded-full bg-slate-100 mb-6">
        {isDragOver ? (
          <Upload className="w-12 h-12 text-blue-500 animate-bounce" />
        ) : multiple ? (
          <Layers className="w-12 h-12 text-slate-400" />
        ) : (
          <ImageIcon className="w-12 h-12 text-slate-400" />
        )}
      </div>
      <h3 className="text-xl font-bold text-slate-700 mb-2">
        {isDragOver 
            ? 'Drop images here' 
            : multiple 
                ? 'Click or Drag multiple images' 
                : 'Click or Drag an image'
        }
      </h3>
      <p className="text-slate-500 text-sm max-w-xs text-center">
        Support for JPG, PNG, and WebP. Images will be processed locally.
      </p>
    </div>
  );
};

export default Dropzone;