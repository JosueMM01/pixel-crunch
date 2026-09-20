export type BackgroundRemovalResolution = 'original' | 'optimized' | 'reduced';
export type BackgroundRemovalOutputFormat = 'image/png' | 'image/webp';

const MAX_EDGE_BY_RESOLUTION: Record<BackgroundRemovalResolution, number> = {
  original: Number.POSITIVE_INFINITY,
  optimized: 4096,
  reduced: 2048,
};

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: BackgroundRemovalOutputFormat,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob || blob.type !== type) {
        reject(new Error(`The browser could not encode ${type}.`));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

export function scaledDimensions(
  width: number,
  height: number,
  resolution: BackgroundRemovalResolution,
): { width: number; height: number } {
  const maxEdge = MAX_EDGE_BY_RESOLUTION[resolution];
  const longestEdge = Math.max(width, height);
  if (longestEdge <= maxEdge) return { width, height };

  const scale = maxEdge / longestEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export async function prepareBackgroundRemovalInput(
  image: Blob,
  resolution: BackgroundRemovalResolution,
): Promise<Blob> {
  if (resolution === 'original') return image;

  const bitmap = await createImageBitmap(image, { imageOrientation: 'from-image' });
  try {
    const target = scaledDimensions(bitmap.width, bitmap.height, resolution);
    if (target.width === bitmap.width && target.height === bitmap.height) return image;

    const canvas = document.createElement('canvas');
    canvas.width = target.width;
    canvas.height = target.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('The browser could not prepare the image canvas.');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, 0, 0, target.width, target.height);

    return canvasToBlob(canvas, 'image/png');
  } finally {
    bitmap.close();
  }
}

export async function encodeBackgroundRemovalOutput(
  image: Blob,
  format: BackgroundRemovalOutputFormat,
): Promise<Blob> {
  if (format === 'image/png' && image.type === 'image/png') return image;

  const bitmap = await createImageBitmap(image);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('The browser could not prepare the output canvas.');
    context.drawImage(bitmap, 0, 0);
    return canvasToBlob(canvas, format, format === 'image/webp' ? 0.95 : undefined);
  } finally {
    bitmap.close();
  }
}

export function backgroundRemovalFilename(
  originalName: string,
  format: BackgroundRemovalOutputFormat,
): string {
  const stem = originalName.replace(/\.[^.]+$/, '') || 'pixel-crunch';
  return `${stem}-sin-fondo.${format === 'image/webp' ? 'webp' : 'png'}`;
}
