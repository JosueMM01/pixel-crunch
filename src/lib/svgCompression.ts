import { getFileExtension } from './formats';

const SVG_MIME_TYPE = 'image/svg+xml';
const MIN_QUALITY = 0.1;
const MAX_QUALITY = 0.8;
const MIN_FLOAT_PRECISION = 0;
const MAX_FLOAT_PRECISION = 4;

function clampQuality(value: number): number {
  if (!Number.isFinite(value)) {
    return MAX_QUALITY;
  }

  return Math.min(MAX_QUALITY, Math.max(MIN_QUALITY, value));
}

function toFloatPrecision(quality: number): number {
  const clampedQuality = clampQuality(quality);
  const normalized = (clampedQuality - MIN_QUALITY) / (MAX_QUALITY - MIN_QUALITY);

  return Math.round(
    MIN_FLOAT_PRECISION + normalized * (MAX_FLOAT_PRECISION - MIN_FLOAT_PRECISION)
  );
}

export function isSvgFile(file: File): boolean {
  const normalizedType = file.type.toLowerCase();
  return normalizedType === SVG_MIME_TYPE || getFileExtension(file.name) === 'svg';
}

async function loadOptimizeFunction() {
  const module = await import('svgo/dist/svgo.browser.js');
  return module.optimize;
}

export async function compressSvgFile(file: File, quality: number): Promise<File> {
  const source = await file.text();
  const floatPrecision = toFloatPrecision(quality);
  const optimize = await loadOptimizeFunction();

  const optimized = optimize(source, {
    multipass: true,
    js2svg: {
      pretty: false,
      indent: 0,
    },
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            cleanupNumericValues: {
              floatPrecision,
            },
            convertPathData: {
              floatPrecision,
            },
          },
        },
      },
      'removeDimensions',
    ],
  });

  const optimizedSource = typeof optimized.data === 'string' && optimized.data.length > 0
    ? optimized.data
    : source;

  return new File([optimizedSource], file.name, {
    type: file.type.trim().length > 0 ? file.type : SVG_MIME_TYPE,
    lastModified: file.lastModified,
  });
}
