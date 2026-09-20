import { describe, expect, it } from 'vitest';

import {
  BackgroundRemovalInputError,
  readImageDimensions,
  validateBackgroundRemovalImage,
} from './image-limits';
import type { BackgroundRemovalCapabilities } from '@/types/background-removal';

const desktopCapabilities: BackgroundRemovalCapabilities = {
  webGpu: true,
  constrained: false,
  mobile: false,
  deviceMemoryGiB: 16,
  hardwareConcurrency: 12,
};

function pngHeader(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

function jpegHeader(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(23);
  bytes.set([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x0b, 0x08]);
  const view = new DataView(bytes.buffer);
  view.setUint16(13, height);
  view.setUint16(15, width);
  return bytes;
}

function webpExtendedHeader(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(30);
  bytes.set(new TextEncoder().encode('RIFF'), 0);
  bytes.set(new TextEncoder().encode('WEBP'), 8);
  bytes.set(new TextEncoder().encode('VP8X'), 12);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, 10, true);
  const writeUint24 = (offset: number, value: number) => {
    bytes[offset] = value & 0xff;
    bytes[offset + 1] = (value >> 8) & 0xff;
    bytes[offset + 2] = (value >> 16) & 0xff;
  };
  writeUint24(24, width - 1);
  writeUint24(27, height - 1);
  return bytes;
}

describe('background removal image limits', () => {
  it.each([
    ['image/png', pngHeader(1600, 900)],
    ['image/jpeg', jpegHeader(1600, 900)],
    ['image/webp', webpExtendedHeader(1600, 900)],
  ])('reads %s dimensions without decoding pixels', (mime, bytes) => {
    expect(readImageDimensions(bytes, mime)).toEqual({ width: 1600, height: 900 });
  });

  it('validates supported files and returns their declared dimensions', async () => {
    const image = new Blob([pngHeader(2048, 1536).buffer as ArrayBuffer], { type: 'image/png' });
    await expect(validateBackgroundRemovalImage(image, desktopCapabilities)).resolves.toEqual({
      width: 2048,
      height: 1536,
      pixels: 3_145_728,
      bytes: 24,
      mime: 'image/png',
    });
  });

  it('rejects MIME spoofing and malformed headers', async () => {
    const image = new Blob([new TextEncoder().encode('not an image')], { type: 'image/png' });
    await expect(validateBackgroundRemovalImage(image, desktopCapabilities)).rejects.toMatchObject({
      code: 'invalid-image',
    });
  });

  it('rejects excessive dimensions before decoding the image', async () => {
    const constrained = { ...desktopCapabilities, constrained: true };
    const image = new Blob([pngHeader(5000, 3000).buffer as ArrayBuffer], { type: 'image/png' });

    await expect(validateBackgroundRemovalImage(image, constrained)).rejects.toBeInstanceOf(
      BackgroundRemovalInputError,
    );
    await expect(validateBackgroundRemovalImage(image, constrained)).rejects.toMatchObject({
      code: 'image-too-large',
    });
  });
});
