import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CONVERTER_INPUT_FORMATS,
  CONVERTER_OUTPUT_FORMATS,
  convertImageFile,
  countGifFrames,
  isAnimatedGif,
  isGifFile,
  isSupportedConverterInput,
} from './imageConversion';

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function fromBase64Buffer(base64: string): ArrayBuffer {
  const bytes = fromBase64(base64);
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
}

const STATIC_GIF_BASE64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const ANIMATED_GIF_BASE64 = 'R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAIfkEAQAAAAAsAAAAAAEAAQAAAgJEAQA7';

class SuccessfulImage {
  onload: ((this: GlobalEventHandlers, event: Event) => void) | null = null;
  onerror: OnErrorEventHandler = null;
  naturalWidth = 16;
  naturalHeight = 9;
  width = 16;
  height = 9;

  set src(_value: string) {
    queueMicrotask(() => {
      this.onload?.call(this as unknown as GlobalEventHandlers, new Event('load'));
    });
  }
}

class FailedImage {
  onload: ((this: GlobalEventHandlers, event: Event) => void) | null = null;
  onerror: OnErrorEventHandler = null;
  naturalWidth = 0;
  naturalHeight = 0;
  width = 0;
  height = 0;

  set src(_value: string) {
    queueMicrotask(() => {
      if (typeof this.onerror === 'function') {
        this.onerror.call(this as unknown as GlobalEventHandlers, new Event('error'));
      }
    });
  }
}

function installCanvasMock(options?: {
  outputBlob?: Blob | null;
  contextAvailable?: boolean;
}) {
  const drawImage = vi.fn();
  const fillRect = vi.fn();
  const context = options?.contextAvailable === false
    ? null
    : ({
      fillStyle: '',
      drawImage,
      fillRect,
    } as unknown as CanvasRenderingContext2D);

  const toBlob = vi.fn((callback: BlobCallback) => {
    const outputBlob = options && 'outputBlob' in options
      ? options.outputBlob
      : new Blob(['converted'], { type: 'image/png' });

    callback(outputBlob ?? null);
  });

  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
    toBlob,
  } as unknown as HTMLCanvasElement;

  const originalCreateElement = document.createElement.bind(document);
  const createElementSpy = vi
    .spyOn(document, 'createElement')
    .mockImplementation(((tagName: string) => {
      if (tagName.toLowerCase() === 'canvas') {
        return canvas as unknown as HTMLElement;
      }

      return originalCreateElement(tagName);
    }) as typeof document.createElement);

  return {
    canvas,
    drawImage,
    fillRect,
    toBlob,
    createElementSpy,
  };
}

function installImageSuccessMocks(): void {
  Object.defineProperty(globalThis, 'Image', {
    writable: true,
    configurable: true,
    value: SuccessfulImage,
  });

  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-image');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
}

function installImageFailureMocks(): void {
  Object.defineProperty(globalThis, 'Image', {
    writable: true,
    configurable: true,
    value: FailedImage,
  });

  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-image');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('imageConversion constants', () => {
  it('exposes converter formats for heic/jpg/png/webp/gif/bmp/tiff/avif/ico and avif output', () => {
    expect(CONVERTER_INPUT_FORMATS).toContain('image/heic');
    expect(CONVERTER_INPUT_FORMATS).toContain('image/jpeg');
    expect(CONVERTER_INPUT_FORMATS).toContain('image/png');
    expect(CONVERTER_INPUT_FORMATS).toContain('image/webp');
    expect(CONVERTER_INPUT_FORMATS).toContain('image/gif');
    expect(CONVERTER_INPUT_FORMATS).toContain('image/bmp');
    expect(CONVERTER_INPUT_FORMATS).toContain('image/tiff');
    expect(CONVERTER_INPUT_FORMATS).toContain('image/avif');
    expect(CONVERTER_INPUT_FORMATS).toContain('image/x-icon');
    expect(CONVERTER_INPUT_FORMATS).not.toContain('image/svg+xml');
    expect(CONVERTER_OUTPUT_FORMATS.map((item) => item.mimeType)).toContain('image/avif');
  });
});

describe('countGifFrames', () => {
  it('counts one frame for static gif payloads', () => {
    const frameCount = countGifFrames(fromBase64(STATIC_GIF_BASE64));

    expect(frameCount).toBe(1);
  });

  it('counts more than one frame for animated gif payloads', () => {
    const frameCount = countGifFrames(fromBase64(ANIMATED_GIF_BASE64));

    expect(frameCount).toBeGreaterThan(1);
  });

  it('returns zero for malformed payloads', () => {
    expect(countGifFrames(new Uint8Array([0x00, 0x11, 0x22]))).toBe(0);
  });
});

describe('gif helpers', () => {
  it('detects animated and static gif files correctly', async () => {
    const staticFile = new File([fromBase64Buffer(STATIC_GIF_BASE64)], 'static.gif', {
      type: 'image/gif',
    });

    const animatedFile = new File([fromBase64Buffer(ANIMATED_GIF_BASE64)], 'animated.gif', {
      type: 'image/gif',
    });

    await expect(isAnimatedGif(staticFile)).resolves.toBe(false);
    await expect(isAnimatedGif(animatedFile)).resolves.toBe(true);
  });

  it('accepts gif by mime or unknown-mime extension fallback', () => {
    const mimeFile = new File([new Uint8Array([1, 2, 3])], 'sample.bin', {
      type: 'image/gif',
    });

    const extensionFallbackFile = new File([new Uint8Array([1, 2, 3])], 'sample.gif', {
      type: '',
    });

    expect(isGifFile(mimeFile)).toBe(true);
    expect(isGifFile(extensionFallbackFile)).toBe(true);
  });

  it('rejects gif extension fallback when mime is explicitly unsupported', () => {
    const spoofed = new File([new Uint8Array([1, 2, 3])], 'spoofed.gif', {
      type: 'image/bmp',
    });

    expect(isGifFile(spoofed)).toBe(false);
  });
});

describe('isSupportedConverterInput', () => {
  it('accepts supported mime types directly', () => {
    const files = [
      new File([new Uint8Array([1])], 'photo.heic', { type: 'image/heic' }),
      new File([new Uint8Array([1])], 'photo.jpg', { type: 'image/jpeg' }),
      new File([new Uint8Array([1])], 'photo.png', { type: 'image/png' }),
      new File([new Uint8Array([1])], 'photo.webp', { type: 'image/webp' }),
      new File([new Uint8Array([1])], 'photo.gif', { type: 'image/gif' }),
      new File([new Uint8Array([1])], 'photo.bmp', { type: 'image/bmp' }),
      new File([new Uint8Array([1])], 'photo.tiff', { type: 'image/tiff' }),
      new File([new Uint8Array([1])], 'photo.avif', { type: 'image/avif' }),
      new File([new Uint8Array([1])], 'photo.ico', { type: 'image/x-icon' }),
    ];

    files.forEach((file) => {
      expect(isSupportedConverterInput(file)).toBe(true);
    });
  });

  it('accepts unknown mime type only when extension is supported', () => {
    const good = new File([new Uint8Array([1])], 'graphic.ico', {
      type: 'application/octet-stream',
    });

    const bad = new File([new Uint8Array([1])], 'document.pdf', {
      type: 'application/octet-stream',
    });

    expect(isSupportedConverterInput(good)).toBe(true);
    expect(isSupportedConverterInput(bad)).toBe(false);
  });

  it('rejects explicit unsupported mime even if extension looks valid', () => {
    const spoofed = new File([new Uint8Array([1])], 'spoofed.png', {
      type: 'application/pdf',
    });

    expect(isSupportedConverterInput(spoofed)).toBe(false);
  });
});

describe('convertImageFile', () => {
  it('converts static gif to png and keeps animationDiscarded false', async () => {
    installImageSuccessMocks();
    const { drawImage } = installCanvasMock();
    const input = new File([fromBase64Buffer(STATIC_GIF_BASE64)], 'sample.gif', {
      type: 'image/gif',
    });

    const result = await convertImageFile(input, { outputMimeType: 'image/png' });

    expect(result.outputFile.name).toBe('sample.png');
    expect(result.outputFile.type).toBe('image/png');
    expect(result.animationDiscarded).toBe(false);
    expect(drawImage).toHaveBeenCalledOnce();
  });

  it('marks animationDiscarded true for animated gif conversions', async () => {
    installImageSuccessMocks();
    const { fillRect } = installCanvasMock();
    const input = new File([fromBase64Buffer(ANIMATED_GIF_BASE64)], 'animated.gif', {
      type: 'image/gif',
    });

    const result = await convertImageFile(input, { outputMimeType: 'image/jpeg' });

    expect(result.outputFile.name).toBe('animated.jpg');
    expect(result.outputFile.type).toBe('image/jpeg');
    expect(result.animationDiscarded).toBe(true);
    expect(fillRect).toHaveBeenCalledOnce();
  });

  it('fails when output mime export is unsupported by canvas', async () => {
    installImageSuccessMocks();
    installCanvasMock({ outputBlob: null });

    const input = new File([new Uint8Array([1, 2, 3])], 'photo.png', {
      type: 'image/png',
    });

    await expect(
      convertImageFile(input, { outputMimeType: 'image/avif' })
    ).rejects.toThrow('AVIF');
  });

  it('fails when image loading fails', async () => {
    installImageFailureMocks();
    installCanvasMock();

    const input = new File([new Uint8Array([1, 2, 3])], 'photo.png', {
      type: 'image/png',
    });

    await expect(
      convertImageFile(input, { outputMimeType: 'image/webp' })
    ).rejects.toThrow('No se pudo leer la imagen para convertir.');
  });

  it('fails when canvas context is unavailable', async () => {
    installImageSuccessMocks();
    installCanvasMock({ contextAvailable: false });

    const input = new File([new Uint8Array([1, 2, 3])], 'photo.webp', {
      type: 'image/webp',
    });

    await expect(
      convertImageFile(input, { outputMimeType: 'image/png' })
    ).rejects.toThrow('No se pudo inicializar el motor de conversion.');
  });

  it('rejects unsupported input before conversion starts', async () => {
    installImageSuccessMocks();
    installCanvasMock();

    const unsupported = new File([new Uint8Array([1, 2, 3])], 'document.pdf', {
      type: 'application/pdf',
    });

    await expect(
      convertImageFile(unsupported, { outputMimeType: 'image/png' })
    ).rejects.toThrow('Formato de archivo no soportado para conversion.');
  });
});
