import { useCallback, useEffect, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import type {
  CompressionOptions,
  CompressionResult,
  CompressionWorkerRequest,
  CompressionWorkerResponse,
  UseImageCompressionReturn,
} from '@/types/compression';
import type { CompressionProgressStatus } from '@/types';

type CompressionLibraryOptions = Parameters<typeof imageCompression>[1];

type PendingJob = {
  file: File;
  batchId: string;
  resolve: (result: CompressionResult) => void;
  reject: (reason?: unknown) => void;
};

const DEFAULT_OPTIONS: CompressionOptions = {
  quality: 0.8,
};

function clampProgress(progress: number): number {
  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(progress)));
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getCompressionId(file: File): string {
  return `${file.name}-${file.lastModified}-${file.size}-${createId()}`;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  return 'Compression failed.';
}

function toCompressionOptions(
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

function toSuccessfulResult(file: File, outputFile: File): CompressionResult {
  const originalSize = file.size;
  const compressedSize = outputFile.size;
  const savingPercent =
    originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0;

  return {
    id: getCompressionId(file),
    inputFile: file,
    outputFile,
    originalSize,
    compressedSize,
    savingPercent,
  };
}

function toFailedResult(file: File, error: unknown): CompressionResult {
  return {
    id: getCompressionId(file),
    inputFile: file,
    originalSize: file.size,
    compressedSize: file.size,
    savingPercent: 0,
    error: toErrorMessage(error),
  };
}

export function useImageCompression(): UseImageCompressionReturn {
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<CompressionProgressStatus>('idle');

  const workerRef = useRef<Worker | null>(null);
  const pendingJobsRef = useRef<Map<string, PendingJob>>(new Map());
  const activeBatchIdRef = useRef<string | null>(null);
  const batchJobsRef = useRef<Map<string, Set<string>>>(new Map());
  const jobProgressRef = useRef<Map<string, number>>(new Map());

  const updateBatchProgress = useCallback((batchId: string) => {
    const batchJobs = batchJobsRef.current.get(batchId);
    if (!batchJobs || batchJobs.size === 0) {
      setProgress(0);
      return;
    }

    let total = 0;
    batchJobs.forEach((jobId) => {
      total += jobProgressRef.current.get(jobId) ?? 0;
    });

    setProgress(clampProgress(total / batchJobs.size));
  }, []);

  const clearBatchState = useCallback((batchId: string) => {
    const batchJobs = batchJobsRef.current.get(batchId);
    if (!batchJobs) {
      return;
    }

    batchJobs.forEach((jobId) => {
      jobProgressRef.current.delete(jobId);
      pendingJobsRef.current.delete(jobId);
    });

    batchJobsRef.current.delete(batchId);
  }, []);

  const handleWorkerMessage = useCallback(
    (event: MessageEvent<CompressionWorkerResponse>) => {
      const message = event.data;
      if (!message) {
        return;
      }

      if (message.type === 'progress') {
        const { jobId, progress: messageProgress } = message.payload;
        const job = pendingJobsRef.current.get(jobId);
        if (!job) {
          return;
        }

        jobProgressRef.current.set(jobId, clampProgress(messageProgress));

        if (job.batchId === activeBatchIdRef.current) {
          updateBatchProgress(job.batchId);
        }

        return;
      }

      if (message.type === 'done') {
        const { jobId, outputFile, originalSize, compressedSize, savingPercent } = message.payload;
        const job = pendingJobsRef.current.get(jobId);
        if (!job) {
          return;
        }

        pendingJobsRef.current.delete(jobId);
        jobProgressRef.current.set(jobId, 100);

        const result: CompressionResult = {
          id: getCompressionId(job.file),
          inputFile: job.file,
          outputFile,
          originalSize,
          compressedSize,
          savingPercent,
        };

        job.resolve(result);

        if (job.batchId === activeBatchIdRef.current) {
          updateBatchProgress(job.batchId);
        }

        return;
      }

      if (message.type === 'error') {
        const { jobId, message: errorMessage } = message.payload;
        const job = pendingJobsRef.current.get(jobId);
        if (!job) {
          return;
        }

        pendingJobsRef.current.delete(jobId);
        jobProgressRef.current.set(jobId, 100);
        job.reject(new Error(errorMessage));

        if (job.batchId === activeBatchIdRef.current) {
          updateBatchProgress(job.batchId);
        }
      }
    },
    [updateBatchProgress]
  );

  const attachWorker = useCallback((): Worker | null => {
    if (typeof Worker === 'undefined') {
      return null;
    }

    if (workerRef.current) {
      return workerRef.current;
    }

    const worker = new Worker(new URL('../workers/compression.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.addEventListener('message', handleWorkerMessage as EventListener);
    workerRef.current = worker;

    return worker;
  }, [handleWorkerMessage]);

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.removeEventListener('message', handleWorkerMessage as EventListener);
      workerRef.current.terminate();
      workerRef.current = null;
    }

    pendingJobsRef.current.clear();
    batchJobsRef.current.clear();
    jobProgressRef.current.clear();
    activeBatchIdRef.current = null;
    setIsCompressing(false);
  }, [handleWorkerMessage]);

  const reset = useCallback(() => {
    setResults([]);
    setProgress(0);
    setError(null);
    setStatus('idle');
  }, []);

  const compressWithFallback = useCallback(
    async (
      file: File,
      options: CompressionOptions,
      batchId: string,
      jobId: string
    ): Promise<CompressionResult> => {
      const outputFile = await imageCompression(
        file,
        toCompressionOptions(options, (currentProgress) => {
          jobProgressRef.current.set(jobId, clampProgress(currentProgress));
          if (batchId === activeBatchIdRef.current) {
            updateBatchProgress(batchId);
          }
        })
      );

      jobProgressRef.current.set(jobId, 100);
      if (batchId === activeBatchIdRef.current) {
        updateBatchProgress(batchId);
      }

      return toSuccessfulResult(file, outputFile);
    },
    [updateBatchProgress]
  );

  const compressFile = useCallback(
    async (file: File, options: CompressionOptions, batchId: string, index: number) => {
      const jobId = `${batchId}-${index}-${createId()}`;

      if (!batchJobsRef.current.has(batchId)) {
        batchJobsRef.current.set(batchId, new Set<string>());
      }

      batchJobsRef.current.get(batchId)?.add(jobId);
      jobProgressRef.current.set(jobId, 0);

      const worker = attachWorker();
      if (!worker) {
        return compressWithFallback(file, options, batchId, jobId);
      }

      return new Promise<CompressionResult>((resolve, reject) => {
        pendingJobsRef.current.set(jobId, {
          file,
          batchId,
          resolve,
          reject,
        });

        const message: CompressionWorkerRequest = {
          type: 'start',
          payload: {
            jobId,
            file,
            options,
          },
        };

        worker.postMessage(message);
      });
    },
    [attachWorker, compressWithFallback]
  );

  const compressMany = useCallback(
    async (files: File[], options?: Partial<CompressionOptions>): Promise<CompressionResult[]> => {
      if (files.length === 0) {
        reset();
        return [];
      }

      const mergedOptions: CompressionOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
      };

      const batchId = createId();
      activeBatchIdRef.current = batchId;
      setIsCompressing(true);
      setProgress(0);
      setError(null);
      setStatus('compressing');

      const tasks = files.map(async (file, index) => {
        try {
          return await compressFile(file, mergedOptions, batchId, index);
        } catch (reason) {
          return toFailedResult(file, reason);
        }
      });

      const resolvedResults = await Promise.all(tasks);

      if (activeBatchIdRef.current !== batchId) {
        return resolvedResults;
      }

      const firstError = resolvedResults.find((result) => typeof result.error === 'string');

      setResults(resolvedResults);
      setIsCompressing(false);
      setProgress(100);
      setStatus(firstError ? 'error' : 'done');
      setError(firstError?.error ?? null);
      clearBatchState(batchId);

      return resolvedResults;
    },
    [clearBatchState, compressFile, reset]
  );

  const compressOne = useCallback(
    async (file: File, options?: Partial<CompressionOptions>): Promise<CompressionResult> => {
      const [result] = await compressMany([file], options);
      return result;
    },
    [compressMany]
  );

  useEffect(() => {
    return () => {
      terminate();
    };
  }, [terminate]);

  return {
    compressOne,
    compressMany,
    isCompressing,
    status,
    progress,
    error,
    results,
    reset,
    terminate,
  };
}
