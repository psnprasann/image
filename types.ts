export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface ProcessedImage {
  blob: Blob;
  url: string;
  originalSize: number;
  newSize: number;
  width: number;
  height: number;
  originalName: string;
}

export interface SeoMetadata {
  altText: string;
  filename: string;
  tags: string[];
}