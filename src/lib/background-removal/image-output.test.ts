import { describe, expect, it } from 'vitest';
import { backgroundRemovalFilename, scaledDimensions } from './image-output';

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
});
