import { BACKGROUND_REMOVAL_LIMITS } from './constants';
import type {
  BackgroundRemovalCapabilities,
  BackgroundRemovalImageInfo,
} from '@/types/background-removal';

const SUPPORTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export class BackgroundRemovalInputError extends Error {
  constructor(
    message: string,
    readonly code: 'invalid-image' | 'image-too-large',
  ) {
    super(message);
    this.name = 'BackgroundRemovalInputError';
  }
}

function readPngDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < 24 || !signature.every((value, index) => bytes[index] === value)) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function readJpegDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2;

  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 2 > bytes.length) return null;
    const segmentLength = view.getUint16(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isStartOfFrame && segmentLength >= 7) {
      return {
        height: view.getUint16(offset + 3),
        width: view.getUint16(offset + 5),
      };
    }
    offset += segmentLength;
  }

  return null;
}

function readUint24LittleEndian(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function readWebpDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  const text = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  if (bytes.length < 30 || text(0, 4) !== 'RIFF' || text(8, 12) !== 'WEBP') return null;

  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const chunkType = text(offset, offset + 4);
    const chunkSize = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset + 4, true);
    const payload = offset + 8;

    if (chunkType === 'VP8X' && payload + 10 <= bytes.length) {
      return {
        width: readUint24LittleEndian(bytes, payload + 4) + 1,
        height: readUint24LittleEndian(bytes, payload + 7) + 1,
      };
    }
    if (chunkType === 'VP8 ' && payload + 10 <= bytes.length && bytes[payload + 3] === 0x9d && bytes[payload + 4] === 0x01 && bytes[payload + 5] === 0x2a) {
      return {
        width: (bytes[payload + 6] | (bytes[payload + 7] << 8)) & 0x3fff,
        height: (bytes[payload + 8] | (bytes[payload + 9] << 8)) & 0x3fff,
      };
    }
    if (chunkType === 'VP8L' && payload + 5 <= bytes.length && bytes[payload] === 0x2f) {
      return {
        width: 1 + bytes[payload + 1] + ((bytes[payload + 2] & 0x3f) << 8),
        height: 1 + (bytes[payload + 2] >> 6) + (bytes[payload + 3] << 2) + ((bytes[payload + 4] & 0x0f) << 10),
      };
    }

    offset = payload + chunkSize + (chunkSize % 2);
  }

  return null;
}

export function readImageDimensions(
  bytes: Uint8Array,
  mime: string,
): { width: number; height: number } | null {
  if (mime === 'image/png') return readPngDimensions(bytes);
  if (mime === 'image/jpeg') return readJpegDimensions(bytes);
  if (mime === 'image/webp') return readWebpDimensions(bytes);
  return null;
}

export async function validateBackgroundRemovalImage(
  image: Blob,
  capabilities: BackgroundRemovalCapabilities,
): Promise<BackgroundRemovalImageInfo> {
  if (!SUPPORTED_MIME_TYPES.has(image.type)) {
    throw new BackgroundRemovalInputError('Only JPG, PNG, and WebP images are supported.', 'invalid-image');
  }
  if (image.size === 0 || image.size > BACKGROUND_REMOVAL_LIMITS.maxBytes) {
    throw new BackgroundRemovalInputError('The image file size is outside the supported limit.', 'image-too-large');
  }

  const header = new Uint8Array(await image.slice(0, 256 * 1024).arrayBuffer());
  const dimensions = readImageDimensions(header, image.type);
  if (!dimensions || dimensions.width < 1 || dimensions.height < 1) {
    throw new BackgroundRemovalInputError('The image header is invalid or unsupported.', 'invalid-image');
  }

  const pixels = dimensions.width * dimensions.height;
  const pixelLimit = capabilities.constrained
    ? BACKGROUND_REMOVAL_LIMITS.constrainedMaxPixels
    : BACKGROUND_REMOVAL_LIMITS.maxPixels;
  if (!Number.isSafeInteger(pixels) || pixels > pixelLimit) {
    throw new BackgroundRemovalInputError(
      `The image contains ${pixels.toLocaleString()} pixels; this device supports up to ${pixelLimit.toLocaleString()} pixels for this operation.`,
      'image-too-large',
    );
  }

  return {
    ...dimensions,
    pixels,
    bytes: image.size,
    mime: image.type as BackgroundRemovalImageInfo['mime'],
  };
}
