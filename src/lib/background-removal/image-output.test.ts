import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  backgroundRemovalFilename,
  encodeBackgroundRemovalOutput,
  prepareBackgroundRemovalInput,
  scaledDimensions,
} from './image-output';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function mockBitmap(width: number, height: number) {
  const close = vi.fn();
  vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width, height, close })));
  return close;
}

function mockCanvas(output: Blob | null, hasContext = true) {
  const drawImage = vi.fn();
  const context = hasContext ? {
    drawImage,
    imageSmoothingEnabled: false,
    imageSmoothingQuality: 'low',
  } : null;
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
    toBlob: vi.fn((callback: BlobCallback) => callback(output)),
  };
  vi.spyOn(document, 'createElement').mockReturnValue(canvas as unknown as HTMLCanvasElement);
  return { canvas, drawImage };
}

describe('background-removal image output', () => {
  it('keeps original dimensions unless the user selects a smaller profile', () => {
    expect(scaledDimensions(6000, 4000, 'original')).toEqual({ width: 6000, height: 4000 });
    expect(scaledDimensions(6000, 4000, 'optimized')).toEqual({ width: 4096, height: 2731 });
    expect(scaledDimensions(6000, 4000, 'reduced')).toEqual({ width: 2048, height: 1365 });
  });

  it('does not upscale small images', () => {
    expect(scaledDimensions(1200, 800, 'optimized')).toEqual({ width: 1200, height: 800 });
  });

  it('creates predictable transparent-output filenames', () => {
    expect(backgroundRemovalFilename('portrait.jpeg', 'image/png')).toBe('portrait-sin-fondo.png');
    expect(backgroundRemovalFilename('product', 'image/webp')).toBe('product-sin-fondo.webp');
  });

  it('passes through original input and an existing PNG output', async () => {
    const input = new Blob(['original'], { type: 'image/jpeg' });
    const output = new Blob(['result'], { type: 'image/png' });

    await expect(prepareBackgroundRemovalInput(input, 'original')).resolves.toBe(input);
    await expect(encodeBackgroundRemovalOutput(output, 'image/png')).resolves.toBe(output);
  });

  it('does not redraw an image that already fits the selected profile', async () => {
    const close = mockBitmap(1200, 800);
    const input = new Blob(['small'], { type: 'image/jpeg' });

    await expect(prepareBackgroundRemovalInput(input, 'optimized')).resolves.toBe(input);
    expect(close).toHaveBeenCalledOnce();
  });

  it('resizes a large image and closes the decoded bitmap', async () => {
    const close = mockBitmap(6000, 4000);
    const encoded = new Blob(['resized'], { type: 'image/png' });
    const { canvas, drawImage } = mockCanvas(encoded);

    await expect(
      prepareBackgroundRemovalInput(new Blob(['large'], { type: 'image/jpeg' }), 'optimized'),
    ).resolves.toBe(encoded);
    expect(canvas.width).toBe(4096);
    expect(canvas.height).toBe(2731);
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 4096, 2731);
    expect(close).toHaveBeenCalledOnce();
  });

  it('encodes transparent WebP and validates the returned MIME', async () => {
    const close = mockBitmap(640, 480);
    const encoded = new Blob(['webp'], { type: 'image/webp' });
    const { canvas, drawImage } = mockCanvas(encoded);

    await expect(
      encodeBackgroundRemovalOutput(new Blob(['png'], { type: 'image/png' }), 'image/webp'),
    ).resolves.toBe(encoded);
    expect(canvas.width).toBe(640);
    expect(canvas.height).toBe(480);
    expect(drawImage).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });

  it('rejects unavailable canvas contexts and incorrect encoder output', async () => {
    mockBitmap(640, 480);
    mockCanvas(null, false);
    await expect(
      encodeBackgroundRemovalOutput(new Blob(['png'], { type: 'image/png' }), 'image/webp'),
    ).rejects.toThrow(/output canvas/i);

    vi.restoreAllMocks();
    mockBitmap(640, 480);
    mockCanvas(new Blob(['fallback'], { type: 'image/png' }));
    await expect(
      encodeBackgroundRemovalOutput(new Blob(['png'], { type: 'image/png' }), 'image/webp'),
    ).rejects.toThrow(/could not encode image\/webp/i);
  });
});
