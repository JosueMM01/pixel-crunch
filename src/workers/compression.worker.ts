import imageCompression from 'browser-image-compression';
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
  options: CompressionOptions,
  onProgress: (progress: number) => void
): CompressionLibraryOptions {
  return {
    useWebWorker: false,
    initialQuality: options.quality,
    maxWidthOrHeight: options.maxWidthOrHeight,
    maxSizeMB: options.maxSizeMB,
    fileType: options.fileType,
    onProgress,
  };
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
    const outputFile = await imageCompression(
      file,
      buildCompressionOptions(options, (progress) => {
        const message: CompressionWorkerResponse = {
          type: 'progress',
          payload: {
            jobId,
            progress,
          },
        };

        ctx.postMessage(message);
      })
    );

    const originalSize = file.size;
    const compressedSize = outputFile.size;
    const savingPercent =
      originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0;

    const doneMessage: CompressionWorkerResponse = {
      type: 'done',
      payload: {
        jobId,
        outputFile,
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
