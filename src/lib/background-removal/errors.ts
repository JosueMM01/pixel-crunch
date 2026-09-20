import type { BackgroundRemovalErrorCode } from '@/types/background-removal';

export interface ClassifiedBackgroundRemovalError {
  code: BackgroundRemovalErrorCode;
  message: string;
  retryable: boolean;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return 'Background removal failed.';
}

export function classifyBackgroundRemovalError(error: unknown): ClassifiedBackgroundRemovalError {
  const message = errorMessage(error);
  const normalized = message.toLowerCase();

  if (/abort|cancel/.test(normalized)) return { code: 'cancelled', message, retryable: false };
  if (/out of memory|memory access|allocation|array buffer allocation|oom/.test(normalized)) {
    return { code: 'insufficient-memory', message, retryable: true };
  }
  if (/webgpu|gpu adapter|execution provider/.test(normalized)) {
    return { code: 'webgpu-unavailable', message, retryable: true };
  }
  if (/fetch|network|resource metadata|download|load model|http/.test(normalized)) {
    return { code: 'asset-download', message, retryable: true };
  }
  if (/decode|invalid image|unsupported image/.test(normalized)) {
    return { code: 'invalid-image', message, retryable: false };
  }

  return { code: 'inference-failed', message, retryable: true };
}
