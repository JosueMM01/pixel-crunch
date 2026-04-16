import { applyPalette, GIFEncoder, quantize, type GifPaletteColor } from 'gifenc/dist/gifenc.esm.js';
import { decompressFrames, parseGIF, type ParsedFrame } from 'gifuct-js';
import { getFileExtension } from './formats';

const GIF_MIME_TYPE = 'image/gif';
const UNKNOWN_INPUT_MIME_TYPES = new Set(['', 'application/octet-stream']);

export const DEFAULT_GIF_COLORS = 256;
export const MIN_GIF_COLORS = 2;
export const MAX_GIF_COLORS = 256;

export interface GifCompressionMetadata {
  frameCount: number;
  isAnimated: boolean;
  sourceColorCount: number;
  outputColorCount: number;
}

export interface GifFileMetadata {
  frameCount: number;
  isAnimated: boolean;
  sourceColorCount: number;
}

export interface DecodedGifAnimationFrames {
  width: number;
  height: number;
  frames: Array<{
    pixels: Uint8ClampedArray;
    delay: number;
  }>;
}

export interface CompressGifOptions {
  colors?: number;
  onProgress?: (progress: number) => void;
}

interface ParsedGifFrames {
  frames: ParsedFrame[];
  width: number;
  height: number;
}

function isUnknownInputMimeType(mimeType: string): boolean {
  return UNKNOWN_INPUT_MIME_TYPES.has(mimeType);
}

function toProgressPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function findPaletteTransparencyIndex(palette: GifPaletteColor[]): number {
  return palette.findIndex((color) => color.length === 4 && color[3] === 0);
}

function toGifDelay(delayMs: number): number {
  if (!Number.isFinite(delayMs) || delayMs <= 0) {
    return 100;
  }

  return Math.max(20, Math.round(delayMs));
}

function clearFrameRect(
  composedPixels: Uint8ClampedArray,
  canvasWidth: number,
  frame: ParsedFrame
): void {
  const { width, height, left, top } = frame.dims;

  for (let row = 0; row < height; row += 1) {
    const y = top + row;
    if (y < 0) {
      continue;
    }

    for (let col = 0; col < width; col += 1) {
      const x = left + col;
      if (x < 0) {
        continue;
      }

      const pixelIndex = (y * canvasWidth + x) * 4;
      composedPixels[pixelIndex] = 0;
      composedPixels[pixelIndex + 1] = 0;
      composedPixels[pixelIndex + 2] = 0;
      composedPixels[pixelIndex + 3] = 0;
    }
  }
}

function drawFramePatch(
  composedPixels: Uint8ClampedArray,
  canvasWidth: number,
  frame: ParsedFrame
): void {
  const { patch } = frame;
  const { width, height, left, top } = frame.dims;

  for (let row = 0; row < height; row += 1) {
    const y = top + row;
    if (y < 0) {
      continue;
    }

    for (let col = 0; col < width; col += 1) {
      const x = left + col;
      if (x < 0) {
        continue;
      }

      const srcIndex = (row * width + col) * 4;
      const alpha = patch[srcIndex + 3];

      if (alpha === 0) {
        continue;
      }

      const destIndex = (y * canvasWidth + x) * 4;
      composedPixels[destIndex] = patch[srcIndex];
      composedPixels[destIndex + 1] = patch[srcIndex + 1];
      composedPixels[destIndex + 2] = patch[srcIndex + 2];
      composedPixels[destIndex + 3] = alpha;
    }
  }
}

function toSourceColorCount(frames: ParsedFrame[]): number {
  const uniqueColors = new Set<number>();

  for (const frame of frames) {
    const { patch } = frame;

    for (let pixelOffset = 0; pixelOffset < patch.length; pixelOffset += 4) {
      const packedColor = (((patch[pixelOffset] << 24) >>> 0)
        | (patch[pixelOffset + 1] << 16)
        | (patch[pixelOffset + 2] << 8)
        | patch[pixelOffset + 3]) >>> 0;

      uniqueColors.add(packedColor);

      if (uniqueColors.size >= MAX_GIF_COLORS) {
        return MAX_GIF_COLORS;
      }
    }
  }

  if (uniqueColors.size === 0) {
    return DEFAULT_GIF_COLORS;
  }

  return Math.min(MAX_GIF_COLORS, Math.max(MIN_GIF_COLORS, uniqueColors.size));
}

export function clampGifColorCount(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_GIF_COLORS;
  }

  return Math.min(MAX_GIF_COLORS, Math.max(MIN_GIF_COLORS, Math.round(value)));
}

function getParsedGifFrames(fileBytes: ArrayBuffer): ParsedGifFrames {
  const parsedGif = parseGIF(fileBytes);
  const frames = decompressFrames(parsedGif, true);

  return {
    frames,
    width: parsedGif.lsd.width,
    height: parsedGif.lsd.height,
  };
}

function resolveCanvasSize(
  frames: ParsedFrame[],
  intrinsicWidth: number,
  intrinsicHeight: number
): { width: number; height: number } {
  const maxFrameWidth = frames.reduce((maxValue, frame) => {
    return Math.max(maxValue, frame.dims.left + frame.dims.width);
  }, 1);

  const maxFrameHeight = frames.reduce((maxValue, frame) => {
    return Math.max(maxValue, frame.dims.top + frame.dims.height);
  }, 1);

  return {
    width: Math.max(1, intrinsicWidth, maxFrameWidth),
    height: Math.max(1, intrinsicHeight, maxFrameHeight),
  };
}

function forEachComposedFrame(
  frames: ParsedFrame[],
  canvasWidth: number,
  canvasHeight: number,
  callback: (composedPixels: Uint8ClampedArray, frame: ParsedFrame, frameIndex: number) => void
): void {
  const composedPixels = new Uint8ClampedArray(canvasWidth * canvasHeight * 4);

  let previousFrame: ParsedFrame | null = null;
  let restoreSnapshot: Uint8ClampedArray | null = null;

  frames.forEach((frame, frameIndex) => {
    if (previousFrame) {
      if (previousFrame.disposalType === 2) {
        clearFrameRect(composedPixels, canvasWidth, previousFrame);
      } else if (previousFrame.disposalType === 3 && restoreSnapshot) {
        composedPixels.set(restoreSnapshot);
      }
    }

    restoreSnapshot = frame.disposalType === 3
      ? new Uint8ClampedArray(composedPixels)
      : null;

    drawFramePatch(composedPixels, canvasWidth, frame);

    callback(composedPixels, frame, frameIndex);
    previousFrame = frame;
  });
}

interface GifEncoderFrame {
  rgba: Uint8Array;
  delay: number;
}

function buildGifEncoderFrames(
  frames: ParsedFrame[],
  canvasWidth: number,
  canvasHeight: number
): GifEncoderFrame[] {
  const composedFrames: GifEncoderFrame[] = [];

  forEachComposedFrame(frames, canvasWidth, canvasHeight, (composedPixels, frame) => {
    const rgba = new Uint8Array(composedPixels.length);
    rgba.set(composedPixels);

    composedFrames.push({
      rgba,
      delay: toGifDelay(frame.delay),
    });
  });

  return composedFrames.map((currentFrame, frameIndex) => {
    if (frameIndex === 0) {
      return currentFrame;
    }

    const previousFrame = composedFrames[frameIndex - 1];
    const deltaRgba = new Uint8Array(currentFrame.rgba.length);
    deltaRgba.set(currentFrame.rgba);

    for (let pixelOffset = 0; pixelOffset < deltaRgba.length; pixelOffset += 4) {
      const isSamePixel = currentFrame.rgba[pixelOffset] === previousFrame.rgba[pixelOffset]
        && currentFrame.rgba[pixelOffset + 1] === previousFrame.rgba[pixelOffset + 1]
        && currentFrame.rgba[pixelOffset + 2] === previousFrame.rgba[pixelOffset + 2]
        && currentFrame.rgba[pixelOffset + 3] === previousFrame.rgba[pixelOffset + 3];

      if (!isSamePixel) {
        continue;
      }

      deltaRgba[pixelOffset] = 0;
      deltaRgba[pixelOffset + 1] = 0;
      deltaRgba[pixelOffset + 2] = 0;
      deltaRgba[pixelOffset + 3] = 0;
    }

    return {
      rgba: deltaRgba,
      delay: currentFrame.delay,
    };
  });
}

function collectSampledRgba(
  frames: GifEncoderFrame[],
  maxSamplePixels: number = 180_000
): Uint8Array {
  const totalPixels = frames.reduce((sum, frame) => sum + Math.floor(frame.rgba.length / 4), 0);
  const stride = Math.max(1, Math.ceil(totalPixels / maxSamplePixels));
  const estimatedSampledPixels = Math.max(1, Math.ceil(totalPixels / stride));
  const sampledRgba = new Uint8Array(estimatedSampledPixels * 4);

  let sampledOffset = 0;
  let pixelCounter = 0;

  for (const frame of frames) {
    for (let pixelOffset = 0; pixelOffset < frame.rgba.length; pixelOffset += 4) {
      const shouldSample = pixelCounter % stride === 0;
      pixelCounter += 1;

      if (!shouldSample) {
        continue;
      }

      sampledRgba[sampledOffset] = frame.rgba[pixelOffset];
      sampledRgba[sampledOffset + 1] = frame.rgba[pixelOffset + 1];
      sampledRgba[sampledOffset + 2] = frame.rgba[pixelOffset + 2];
      sampledRgba[sampledOffset + 3] = frame.rgba[pixelOffset + 3];
      sampledOffset += 4;
    }
  }

  return sampledRgba.subarray(0, sampledOffset);
}

function encodeGifBytes(
  frames: GifEncoderFrame[],
  width: number,
  height: number,
  outputColorCount: number,
  onProgress?: (progress: number) => void
): Uint8Array {
  const sampledRgba = collectSampledRgba(frames);
  const palette = quantize(sampledRgba, outputColorCount, {
    format: 'rgba4444',
    oneBitAlpha: true,
    clearAlpha: true,
    clearAlphaColor: 0,
    clearAlphaThreshold: 0,
  });

  const transparentIndex = findPaletteTransparencyIndex(palette);
  const hasTransparency = transparentIndex >= 0;
  const encoder = GIFEncoder();

  frames.forEach((frame, frameIndex) => {
    const indexed = applyPalette(frame.rgba, palette, 'rgba4444');

    encoder.writeFrame(indexed, width, height, {
      palette: frameIndex === 0 ? palette : undefined,
      delay: frame.delay,
      repeat: frameIndex === 0 ? 0 : undefined,
      dispose: 1,
      transparent: hasTransparency,
      transparentIndex: hasTransparency ? transparentIndex : 0,
    });

    onProgress?.(toProgressPercent(((frameIndex + 1) / frames.length) * 100));
  });

  encoder.finish();

  const encodedBytesView = encoder.bytesView();
  const encodedBytes = new Uint8Array(encodedBytesView.length);
  encodedBytes.set(encodedBytesView);
  return encodedBytes;
}

export function isGifFile(file: File): boolean {
  const normalizedType = file.type.toLowerCase().trim();

  if (normalizedType === GIF_MIME_TYPE) {
    return true;
  }

  if (!isUnknownInputMimeType(normalizedType)) {
    return false;
  }

  return getFileExtension(file.name) === 'gif';
}

export async function getGifMetadata(file: File): Promise<GifFileMetadata> {
  if (!isGifFile(file)) {
    throw new Error('El archivo no es un GIF valido.');
  }

  const { frames } = getParsedGifFrames(await file.arrayBuffer());

  if (frames.length === 0) {
    throw new Error('No se detectaron frames en el GIF.');
  }

  return {
    frameCount: frames.length,
    isAnimated: frames.length > 1,
    sourceColorCount: toSourceColorCount(frames),
  };
}

export async function decodeGifAnimationFrames(file: File): Promise<DecodedGifAnimationFrames> {
  if (!isGifFile(file)) {
    throw new Error('El archivo no es un GIF valido.');
  }

  const { frames, width: intrinsicWidth, height: intrinsicHeight } = getParsedGifFrames(
    await file.arrayBuffer()
  );

  if (frames.length === 0) {
    throw new Error('No se detectaron frames en el GIF.');
  }

  const { width: canvasWidth, height: canvasHeight } = resolveCanvasSize(
    frames,
    intrinsicWidth,
    intrinsicHeight
  );

  const composedFrames: DecodedGifAnimationFrames['frames'] = [];

  forEachComposedFrame(frames, canvasWidth, canvasHeight, (composedPixels, frame) => {
    composedFrames.push({
      pixels: new Uint8ClampedArray(composedPixels),
      delay: toGifDelay(frame.delay),
    });
  });

  return {
    width: canvasWidth,
    height: canvasHeight,
    frames: composedFrames,
  };
}

export async function compressGifFile(
  file: File,
  options?: CompressGifOptions
): Promise<{ outputFile: File; metadata: GifCompressionMetadata }> {
  if (!isGifFile(file)) {
    throw new Error('Formato de entrada no soportado para compresion GIF.');
  }

  const { frames, width: intrinsicWidth, height: intrinsicHeight } = getParsedGifFrames(
    await file.arrayBuffer()
  );

  if (frames.length === 0) {
    throw new Error('No se detectaron frames en el GIF.');
  }

  const sourceColorCount = toSourceColorCount(frames);
  const outputColorCount = clampGifColorCount(options?.colors);
  const { width: canvasWidth, height: canvasHeight } = resolveCanvasSize(
    frames,
    intrinsicWidth,
    intrinsicHeight
  );

  const encoderFrames = buildGifEncoderFrames(frames, canvasWidth, canvasHeight);
  const encodedBytes = encodeGifBytes(
    encoderFrames,
    canvasWidth,
    canvasHeight,
    outputColorCount,
    options?.onProgress
  );

  const encodedBytesCopy = new Uint8Array(encodedBytes.length);
  encodedBytesCopy.set(encodedBytes);

  const encodedFile = new File([encodedBytesCopy], file.name, {
    type: GIF_MIME_TYPE,
    lastModified: file.lastModified,
  });

  // Never return a larger GIF than the input file.
  // If re-encoding does not improve size, keep the original file unchanged.
  const outputFile = encodedFile.size < file.size ? encodedFile : file;

  return {
    outputFile,
    metadata: {
      frameCount: frames.length,
      isAnimated: frames.length > 1,
      sourceColorCount,
      outputColorCount,
    },
  };
}
