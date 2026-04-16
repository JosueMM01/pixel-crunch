import { describe, expect, it } from 'vitest';
import { compressSvgFile, isSvgFile } from './svgCompression';

describe('isSvgFile', () => {
  it('returns true when mime type is image/svg+xml', () => {
    const file = new File(['<svg></svg>'], 'icon.bin', { type: 'image/svg+xml' });
    expect(isSvgFile(file)).toBe(true);
  });

  it('returns true when extension is .svg and mime type is empty', () => {
    const file = new File(['<svg></svg>'], 'logo.svg', { type: '' });
    expect(isSvgFile(file)).toBe(true);
  });

  it('returns false for non-svg files', () => {
    const file = new File(['hello'], 'photo.png', { type: 'image/png' });
    expect(isSvgFile(file)).toBe(false);
  });
});

describe('compressSvgFile', () => {
  it('reduces bytes for verbose svg input', async () => {
    const source = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
        <!-- comment to remove -->
        <path d="M 0.0000 0.0000 L 10.0000 10.0000 Z" fill="#000000"></path>
      </svg>
    `;

    const input = new File([source], 'verbose.svg', { type: 'image/svg+xml' });
    const output = await compressSvgFile(input, 0.5);

    expect(output.name).toBe('verbose.svg');
    expect(output.type).toBe('image/svg+xml');
    expect(output.size).toBeLessThan(input.size);
  });

  it('normalizes mime type when source mime is missing', async () => {
    const input = new File(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], 'plain.svg', {
      type: '',
    });

    const output = await compressSvgFile(input, 0.8);
    expect(output.type).toBe('image/svg+xml');
  });
});
