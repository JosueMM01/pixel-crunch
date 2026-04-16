import imageCompression from 'browser-image-compression';
import { compressGifFile, isGifFile } from '../lib/gifCompression';
import type {
  CompressionOptions,
  CompressionWorkerRequest,
  CompressionWorkerResponse,
} from '../types/compression';

type CompressionLibraryOptions = Parameters<typeof imageCompression>[1];

const ctx = self;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  return 'Worker compression failed.';
}

function buildCompressionOptions(
  file: File,
  options: CompressionOptions,
  onProgress: (progress: number) => void
): CompressionLibraryOptions {
  const clampedQuality = Math.min(1, Math.max(0.01, options.quality));
  const aggressiveQuality = Math.pow(clampedQuality, 1.25);
  const sourceSizeMB = file.size / (1024 * 1024);
  const derivedMaxSizeMB = Math.max(0.001, sourceSizeMB * (0.2 + (clampedQuality * 0.8)));

  return {
    useWebWorker: false,
    initialQuality: aggressiveQuality,
    maxWidthOrHeight: options.maxWidthOrHeight,
    maxSizeMB: options.maxSizeMB ?? derivedMaxSizeMB,
    fileType: options.fileType,
    onProgress,
  };
}

function computeSavingPercent(originalSize: number, compressedSize: number): number {
  return originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0;
}

ctx.onmessage = async (event: MessageEvent<CompressionWorkerRequest>) => {
  const { data } = event;
  if (data.type !== 'start') {
    return;
  }

  const {
    payload: { jobId, file, options },
  } = data;

  try {
    if (isGifFile(file)) {
      const { outputFile, metadata } = await compressGifFile(file, {
        colors: options.gifColors,
        onProgress: (progress) => {
          const progressMessage: CompressionWorkerResponse = {
            type: 'progress',
            payload: {
              jobId,
              progress,
            },
          };

          ctx.postMessage(progressMessage);
        },
      });

      const originalSize = file.size;
      const compressedSize = outputFile.size;
      const savingPercent = computeSavingPercent(originalSize, compressedSize);

      const doneMessage: CompressionWorkerResponse = {
        type: 'done',
        payload: {
          jobId,
          outputFile,
          originalSize,
          compressedSize,
          savingPercent,
          gifMetadata: metadata,
        },
      };

      ctx.postMessage(doneMessage);
      return;
    }

    const outputFile = await imageCompression(
      file,
      buildCompressionOptions(file, options, (progress) => {
        const progressMessage: CompressionWorkerResponse = {
          type: 'progress',
          payload: {
            jobId,
            progress,
          },
        };

        ctx.postMessage(progressMessage);
      })
    );

    const normalizedOutputFile = outputFile.size < file.size ? outputFile : file;

    const originalSize = file.size;
    const compressedSize = normalizedOutputFile.size;
    const savingPercent = computeSavingPercent(originalSize, compressedSize);

    const doneMessage: CompressionWorkerResponse = {
      type: 'done',
      payload: {
        jobId,
        outputFile: normalizedOutputFile,
        originalSize,
        compressedSize,
        savingPercent,
      },
    };

    ctx.postMessage(doneMessage);
  } catch (error) {
    const errorMessage: CompressionWorkerResponse = {
      type: 'error',
      payload: {
        jobId,
        message: toErrorMessage(error),
      },
    };

    ctx.postMessage(errorMessage);
  }
};
