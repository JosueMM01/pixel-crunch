import { getDropzoneAcceptMap, getFileExtension } from './formats';

const GIF_MIME_TYPE = 'image/gif';
const UNKNOWN_INPUT_MIME_TYPES = new Set(['', 'application/octet-stream']);

export const CONVERTER_INPUT_FORMATS = [
  'image/heic',
  'image/heif',
  'image/jpeg',
  'image/png',
  'image/webp',
  GIF_MIME_TYPE,
  'image/bmp',
  'image/x-ms-bmp',
  'image/tiff',
  'image/avif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/ico',
] as const;

export const CONVERTER_OUTPUT_FORMATS = [
  { mimeType: 'image/jpeg', extension: 'jpg', label: 'JPG' },
  { mimeType: 'image/png', extension: 'png', label: 'PNG' },
  { mimeType: 'image/webp', extension: 'webp', label: 'WebP' },
  { mimeType: 'image/avif', extension: 'avif', label: 'AVIF' },
] as const;

export type ConverterOutputMimeType = (typeof CONVERTER_OUTPUT_FORMATS)[number]['mimeType'];

export interface ConvertImageFileOptions {
  outputMimeType: ConverterOutputMimeType;
  quality?: number;
}

export interface ConvertImageFileResult {
  outputFile: File;
  wasAnimatedGif: boolean;
  animationDiscarded: boolean;
}

const LOSSY_OUTPUT_FORMATS = new Set<ConverterOutputMimeType>([
  'image/jpeg',
  'image/webp',
  'image/avif',
]);

const CONVERTER_SUPPORTED_EXTENSIONS = new Set(
  Object.values(getDropzoneAcceptMap(CONVERTER_INPUT_FORMATS))
    .flat()
    .map((extension) => extension.replace('.', '').toLowerCase())
);

function isUnknownInputMimeType(mimeType: string): boolean {
  return UNKNOWN_INPUT_MIME_TYPES.has(mimeType);
}

function isGifHeader(bytes: Uint8Array): boolean {
  if (bytes.length < 6) {
    return false;
  }

  const signature = String.fromCharCode(
    bytes[0],
    bytes[1],
    bytes[2],
    bytes[3],
    bytes[4],
    bytes[5]
  );

  return signature === 'GIF87a' || signature === 'GIF89a';
}

function skipSubBlocks(bytes: Uint8Array, startOffset: number): number {
  let offset = startOffset;

  while (offset < bytes.length) {
    const blockSize = bytes[offset];
    offset += 1;

    if (blockSize === 0) {
      return offset;
    }

    offset += blockSize;
  }

  return offset;
}

function getOutputExtension(outputMimeType: ConverterOutputMimeType): string {
  const format = CONVERTER_OUTPUT_FORMATS.find((item) => item.mimeType === outputMimeType);
  return format?.extension ?? 'png';
}

function replaceFileExtension(filename: string, extension: string): string {
  const safeName = filename.trim().length > 0 ? filename : 'image';
  const normalizedExtension = extension.replace('.', '').toLowerCase();
  const lastDot = safeName.lastIndexOf('.');
  const baseName = lastDot > 0 ? safeName.slice(0, lastDot) : safeName;

  return `${baseName}.${normalizedExtension}`;
}

function clampQuality(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0.92;
  }

  return Math.min(1, Math.max(0, value));
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer la imagen para convertir.'));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: ConverterOutputMimeType,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(
          new Error(
            mimeType === 'image/avif'
              ? 'Tu navegador no soporta exportacion AVIF para este archivo.'
              : 'No se pudo generar el archivo convertido.'
          )
        );
        return;
      }

      resolve(blob);
    }, mimeType, quality);
  });
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

export function isSupportedConverterInput(file: File): boolean {
  const normalizedType = file.type.toLowerCase().trim();
  if (CONVERTER_INPUT_FORMATS.some((supportedType) => supportedType === normalizedType)) {
    return true;
  }

  if (!isUnknownInputMimeType(normalizedType)) {
    return false;
  }

  const extension = getFileExtension(file.name);
  return extension.length > 0 && CONVERTER_SUPPORTED_EXTENSIONS.has(extension);
}

export function countGifFrames(bytes: Uint8Array): number {
  if (bytes.length < 13 || !isGifHeader(bytes)) {
    return 0;
  }

  let offset = 6;
  const packedField = bytes[offset + 4];
  offset += 7;

  if ((packedField & 0x80) !== 0) {
    const globalColorTableLength = 3 * (1 << ((packedField & 0x07) + 1));
    offset += globalColorTableLength;
  }

  let frameCount = 0;

  while (offset < bytes.length) {
    const blockType = bytes[offset];

    if (blockType === 0x3b) {
      break;
    }

    if (blockType === 0x2c) {
      if (offset + 10 > bytes.length) {
        break;
      }

      const localPackedField = bytes[offset + 9];
      offset += 10;

      if ((localPackedField & 0x80) !== 0) {
        const localColorTableLength = 3 * (1 << ((localPackedField & 0x07) + 1));
        offset += localColorTableLength;
      }

      if (offset >= bytes.length) {
        break;
      }

      offset += 1;
      offset = skipSubBlocks(bytes, offset);
      frameCount += 1;
      continue;
    }

    if (blockType === 0x21) {
      if (offset + 2 > bytes.length) {
        break;
      }

      offset += 2;
      offset = skipSubBlocks(bytes, offset);
      continue;
    }

    break;
  }

  return frameCount;
}

export async function isAnimatedGif(file: File): Promise<boolean> {
  if (!isGifFile(file)) {
    return false;
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  return countGifFrames(bytes) > 1;
}

export async function convertImageFile(
  file: File,
  options: ConvertImageFileOptions
): Promise<ConvertImageFileResult> {
  if (!isSupportedConverterInput(file)) {
    throw new Error('Formato de archivo no soportado para conversion.');
  }

  const outputMimeType = options.outputMimeType;
  const wasAnimatedGif = await isAnimatedGif(file);
  const image = await loadImageFromFile(file);

  const width = Math.max(1, image.naturalWidth || image.width || 1);
  const height = Math.max(1, image.naturalHeight || image.height || 1);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('No se pudo inicializar el motor de conversion.');
  }

  if (outputMimeType === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
  }

  context.drawImage(image, 0, 0, width, height);

  const quality = LOSSY_OUTPUT_FORMATS.has(outputMimeType)
    ? clampQuality(options.quality)
    : undefined;

  const blob = await canvasToBlob(canvas, outputMimeType, quality);
  const outputExtension = getOutputExtension(outputMimeType);
  const outputFilename = replaceFileExtension(file.name, outputExtension);

  return {
    outputFile: new File([blob], outputFilename, {
      type: outputMimeType,
      lastModified: file.lastModified,
    }),
    wasAnimatedGif,
    animationDiscarded: wasAnimatedGif,
  };
}
