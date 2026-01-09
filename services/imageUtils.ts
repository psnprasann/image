import { PixelCrop } from '../types';

export const readFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string), false);
    reader.readAsDataURL(file);
  });
};

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export function getCenterCropPixels(mediaWidth: number, mediaHeight: number, aspect: number): PixelCrop {
  const mediaAspect = mediaWidth / mediaHeight;
  let width, height, x, y;

  if (mediaAspect > aspect) {
    height = mediaHeight;
    width = mediaHeight * aspect;
    y = 0;
    x = (mediaWidth - width) / 2;
  } else {
    width = mediaWidth;
    height = mediaWidth / aspect;
    x = 0;
    y = (mediaHeight - height) / 2;
  }

  return { x, y, width, height };
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0,
  quality = 0.92, 
  scale = 1.0,
  addWatermark = false
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

  const targetWidth = Math.max(1, Math.floor(pixelCrop.width * scale));
  const targetHeight = Math.max(1, Math.floor(pixelCrop.height * scale));

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext('2d');

  if (!finalCtx) return null;

  if (scale === 1.0) {
    finalCtx.putImageData(data, 0, 0);
  } else {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = pixelCrop.width;
    tempCanvas.height = pixelCrop.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
        tempCtx.putImageData(data, 0, 0);
        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = 'high';
        finalCtx.drawImage(tempCanvas, 0, 0, pixelCrop.width, pixelCrop.height, 0, 0, targetWidth, targetHeight);
    }
  }

  if (addWatermark) {
    const watermarkText = "©Gokarnastays.com";
    const fontSize = Math.max(12, Math.floor(targetHeight * 0.035));
    finalCtx.font = `bold ${fontSize}px sans-serif`;
    finalCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    finalCtx.textBaseline = 'bottom';
    finalCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    finalCtx.shadowBlur = 4;
    finalCtx.fillText(watermarkText, 20, targetHeight - 20);
  }

  return new Promise((resolve) => {
    finalCanvas.toBlob((blob) => resolve(blob), 'image/webp', quality);
  });
}

export async function optimizeToSize(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation: number,
  maxSizeBytes: number,
  addWatermark = false
): Promise<Blob | null> {
  let scale = 1.0;
  let attempt = 0;
  const maxAttempts = 8;

  while (attempt < maxAttempts) {
    const lowQuality = 0.5;
    const blob = await getCroppedImg(imageSrc, pixelCrop, rotation, lowQuality, scale, addWatermark);
    if (!blob) return null;

    if (blob.size <= maxSizeBytes) {
      return binarySearchQuality(imageSrc, pixelCrop, rotation, scale, maxSizeBytes, addWatermark);
    }

    const ratio = Math.sqrt(maxSizeBytes / blob.size);
    scale = scale * ratio * 0.92;
    if (scale < 0.1) scale = 0.1;
    attempt++;
  }

  return binarySearchQuality(imageSrc, pixelCrop, rotation, scale, maxSizeBytes, addWatermark);
}

async function binarySearchQuality(
    src: string, 
    crop: PixelCrop, 
    rot: number, 
    scale: number, 
    maxBytes: number,
    addWatermark: boolean
): Promise<Blob | null> {
    let low = 0.1;
    let high = 1.0;
    let bestBlob: Blob | null = null;
    
    for (let i = 0; i < 5; i++) {
        const mid = (low + high) / 2;
        const blob = await getCroppedImg(src, crop, rot, mid, scale, addWatermark);
        if (!blob) break;
        if (blob.size <= maxBytes) {
            bestBlob = blob;
            low = mid;
        } else {
            high = mid;
        }
    }
    return bestBlob || await getCroppedImg(src, crop, rot, 0.1, scale, addWatermark);
}

export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};