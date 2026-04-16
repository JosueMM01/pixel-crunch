import { describe, expect, it } from 'vitest';
import { decompressFrames, parseGIF } from 'gifuct-js';
import {
  clampGifColorCount,
  compressGifFile,
  DEFAULT_GIF_COLORS,
  getGifMetadata,
  isGifFile,
  MAX_GIF_COLORS,
  MIN_GIF_COLORS,
} from './gifCompression';

function fromBase64Buffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
}

const STATIC_GIF_BASE64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const ANIMATED_GIF_BASE64 = 'R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAIfkEAQAAAAAsAAAAAAEAAQAAAgJEAQA7';

describe('isGifFile', () => {
  it('accepts gif by mime type and extension fallback', () => {
    const withMime = new File([new Uint8Array([1, 2, 3])], 'sample.bin', { type: 'image/gif' });
    const withExtensionFallback = new File([new Uint8Array([1, 2, 3])], 'sample.gif', {
      type: 'application/octet-stream',
    });

    expect(isGifFile(withMime)).toBe(true);
    expect(isGifFile(withExtensionFallback)).toBe(true);
  });

  it('rejects explicit non-gif mime even if extension looks valid', () => {
    const spoofed = new File([new Uint8Array([1, 2, 3])], 'sample.gif', { type: 'image/png' });

    expect(isGifFile(spoofed)).toBe(false);
  });
});

describe('clampGifColorCount', () => {
  it('clamps values to gif color bounds', () => {
    expect(clampGifColorCount(undefined)).toBe(DEFAULT_GIF_COLORS);
    expect(clampGifColorCount(1)).toBe(MIN_GIF_COLORS);
    expect(clampGifColorCount(999)).toBe(MAX_GIF_COLORS);
    expect(clampGifColorCount(64.8)).toBe(65);
  });
});

describe('getGifMetadata', () => {
  it('returns frame metadata for animated gifs', async () => {
    const animatedGif = new File([fromBase64Buffer(ANIMATED_GIF_BASE64)], 'animated.gif', {
      type: 'image/gif',
    });

    const metadata = await getGifMetadata(animatedGif);

    expect(metadata.frameCount).toBeGreaterThan(1);
    expect(metadata.isAnimated).toBe(true);
    expect(metadata.sourceColorCount).toBeGreaterThanOrEqual(2);
  });
});

describe('compressGifFile', () => {
  it('keeps animated gif frame count and outputs valid gif file', async () => {
    const animatedGif = new File([fromBase64Buffer(ANIMATED_GIF_BASE64)], 'animated.gif', {
      type: 'image/gif',
    });

    const result = await compressGifFile(animatedGif, { colors: 16 });

    expect(result.outputFile.type).toBe('image/gif');
    expect(result.outputFile.name).toBe('animated.gif');
    expect(result.metadata.frameCount).toBeGreaterThan(1);
    expect(result.metadata.outputColorCount).toBe(16);

    const parsed = parseGIF(await result.outputFile.arrayBuffer());
    const frames = decompressFrames(parsed, false);

    expect(frames.length).toBe(result.metadata.frameCount);
  });

  it('compresses static gif without reporting animation', async () => {
    const staticGif = new File([fromBase64Buffer(STATIC_GIF_BASE64)], 'static.gif', {
      type: 'image/gif',
    });

    const result = await compressGifFile(staticGif, { colors: 32 });

    expect(result.metadata.frameCount).toBe(1);
    expect(result.metadata.isAnimated).toBe(false);
  });

  it('never returns an output gif larger than the original input', async () => {
    const fixtures = [
      new File([fromBase64Buffer(STATIC_GIF_BASE64)], 'static.gif', {
        type: 'image/gif',
      }),
      new File([fromBase64Buffer(ANIMATED_GIF_BASE64)], 'animated.gif', {
        type: 'image/gif',
      }),
    ];

    for (const fixture of fixtures) {
      const result = await compressGifFile(fixture, { colors: 256 });
      expect(result.outputFile.size).toBeLessThanOrEqual(fixture.size);
    }
  });
});
