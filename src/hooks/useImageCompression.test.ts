import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  CompressionResult,
  CompressionWorkerRequest,
  CompressionWorkerResponse,
} from '@/types';
import { UNSUPPORTED_FORMAT_MESSAGE, useImageCompression } from './useImageCompression';

const { compressionMock } = vi.hoisted(() => ({
  compressionMock: vi.fn(),
}));

vi.mock('browser-image-compression', () => ({
  default: compressionMock,
}));

type WorkerMessageListener = (event: MessageEvent<CompressionWorkerResponse>) => void;

const OriginalWorker = globalThis.Worker;

class MockCompressionWorker {
  static mode: 'success' | 'error' | 'empty-error' | 'hang' = 'success';
  static terminatedCount = 0;
  static constructorCount = 0;

  private readonly listeners = new Set<WorkerMessageListener>();

  constructor(..._args: unknown[]) {
    MockCompressionWorker.constructorCount += 1;
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (type !== 'message') {
      return;
    }

    if (typeof listener === 'function') {
      this.listeners.add(listener as unknown as WorkerMessageListener);
      return;
    }

    this.listeners.add(listener.handleEvent as unknown as WorkerMessageListener);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (type !== 'message') {
      return;
    }

    if (typeof listener === 'function') {
      this.listeners.delete(listener as unknown as WorkerMessageListener);
      return;
    }

    this.listeners.delete(listener.handleEvent as unknown as WorkerMessageListener);
  }

  postMessage(message: CompressionWorkerRequest): void {
    if (message.type !== 'start') {
      return;
    }

    const { jobId, file } = message.payload;

    queueMicrotask(() => {
      this.emit({
        type: 'progress',
        payload: {
          jobId,
          progress: 145,
        },
      });

      if (MockCompressionWorker.mode === 'error') {
        this.emit({
          type: 'error',
          payload: {
            jobId,
            message: 'Compression worker failed.',
          },
        });
        return;
      }

      if (MockCompressionWorker.mode === 'empty-error') {
        this.emit({
          type: 'error',
          payload: {
            jobId,
            message: '',
          },
        });
        return;
      }

      if (MockCompressionWorker.mode === 'hang') {
        return;
      }

      const outputFile = new File([new Uint8Array([1, 2, 3])], `compressed-${file.name}`, {
        type: file.type,
      });

      this.emit({
        type: 'done',
        payload: {
          jobId,
          outputFile,
          originalSize: file.size,
          compressedSize: outputFile.size,
          savingPercent: file.size > 0 ? ((file.size - outputFile.size) / file.size) * 100 : 0,
        },
      });
    });
  }

  terminate(): void {
    MockCompressionWorker.terminatedCount += 1;
  }

  private emit(message: CompressionWorkerResponse): void {
    const event = { data: message } as MessageEvent<CompressionWorkerResponse>;
    this.listeners.forEach((listener) => listener(event));
  }
}

describe('useImageCompression', () => {
  beforeEach(() => {
    MockCompressionWorker.mode = 'success';
    MockCompressionWorker.terminatedCount = 0;
    MockCompressionWorker.constructorCount = 0;
    compressionMock.mockReset();

    compressionMock.mockImplementation(
      async (
        file: File,
        options?: {
          onProgress?: (progress: number) => void;
        }
      ) => {
        options?.onProgress?.(60);
        return new File([new Uint8Array([1, 2, 3, 4])], `fallback-${file.name}`, {
          type: file.type,
        });
      }
    );

    Object.defineProperty(globalThis, 'Worker', {
      writable: true,
      configurable: true,
      value: MockCompressionWorker,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'Worker', {
      writable: true,
      configurable: true,
      value: OriginalWorker,
    });
  });

  it('compresses multiple files and updates status/progress', async () => {
    const { result } = renderHook(() => useImageCompression());

    const files = [
      new File([new Uint8Array(80)], 'first.jpg', { type: 'image/jpeg' }),
      new File([new Uint8Array(160)], 'second.jpg', { type: 'image/jpeg' }),
    ];

    let output: CompressionResult[] = [];

    await act(async () => {
      output = await result.current.compressMany(files, { quality: 0.7 });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('done');
    });

    expect(output).toHaveLength(2);
    expect(output[0]?.error).toBeUndefined();
    expect(output[0]?.outputFile).toBeInstanceOf(File);
    expect(result.current.isCompressing).toBe(false);
    expect(result.current.progress).toBe(100);
    expect(result.current.results).toHaveLength(2);
    expect(MockCompressionWorker.constructorCount).toBe(1);
  });

  it('returns failed result and error state when worker fails', async () => {
    MockCompressionWorker.mode = 'error';

    const { result } = renderHook(() => useImageCompression());
    const file = new File([new Uint8Array(48)], 'broken.jpg', { type: 'image/jpeg' });

    let output!: CompressionResult;

    await act(async () => {
      output = await result.current.compressOne(file, { quality: 0.5 });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(output.error).toBe('Compression worker failed.');
    expect(result.current.error).toBe('Compression worker failed.');
    expect(result.current.progress).toBe(100);
  });

  it('returns unsupported format error without creating a worker', async () => {
    const { result } = renderHook(() => useImageCompression());
    const file = new File([new Uint8Array(48)], 'animated.gif', { type: 'image/gif' });

    let output!: CompressionResult;

    await act(async () => {
      output = await result.current.compressOne(file, { quality: 0.5 });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(output.error).toBe(UNSUPPORTED_FORMAT_MESSAGE);
    expect(result.current.error).toBe(UNSUPPORTED_FORMAT_MESSAGE);
    expect(MockCompressionWorker.constructorCount).toBe(0);
  });

  it('processes svg as supported passthrough without worker or raster compression', async () => {
    const { result } = renderHook(() => useImageCompression());
    const file = new File(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], 'vector.svg', {
      type: 'image/svg+xml',
    });

    let output!: CompressionResult;

    await act(async () => {
      output = await result.current.compressOne(file, { quality: 0.5 });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('done');
    });

    expect(output.error).toBeUndefined();
    expect(output.outputFile).toBe(file);
    expect(output.compressedSize).toBe(file.size);
    expect(output.savingPercent).toBe(0);
    expect(compressionMock).not.toHaveBeenCalled();
    expect(MockCompressionWorker.constructorCount).toBe(0);
  });

  it('accepts svg files by extension when mime type is missing', async () => {
    const { result } = renderHook(() => useImageCompression());
    const file = new File(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], 'diagram.svg', {
      type: '',
    });

    let output!: CompressionResult;

    await act(async () => {
      output = await result.current.compressOne(file, { quality: 0.5 });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('done');
    });

    expect(output.error).toBeUndefined();
    expect(output.outputFile).toBe(file);
    expect(compressionMock).not.toHaveBeenCalled();
    expect(MockCompressionWorker.constructorCount).toBe(0);
  });

  it('uses default error message when worker sends empty error text', async () => {
    MockCompressionWorker.mode = 'empty-error';

    const { result } = renderHook(() => useImageCompression());
    const file = new File([new Uint8Array(48)], 'empty-error.jpg', { type: 'image/jpeg' });

    let output!: CompressionResult;

    await act(async () => {
      output = await result.current.compressOne(file, { quality: 0.5 });
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(output.error).toBe('Compression failed.');
    expect(result.current.error).toBe('Compression failed.');
  });

  it('falls back to in-thread compression when Worker is unavailable', async () => {
    Object.defineProperty(globalThis, 'Worker', {
      writable: true,
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useImageCompression());
    const file = new File([new Uint8Array(120)], 'fallback.jpg', { type: 'image/jpeg' });

    let output!: CompressionResult;

    await act(async () => {
      output = await result.current.compressOne(file, { quality: 0.9 });
    });

    expect(compressionMock).toHaveBeenCalledTimes(1);
    expect(output.error).toBeUndefined();
    expect(output.outputFile).toBeInstanceOf(File);
    expect(result.current.status).toBe('done');
    expect(result.current.progress).toBe(100);
  });

  it('resets to idle state when compressMany receives an empty array', async () => {
    const { result } = renderHook(() => useImageCompression());

    await act(async () => {
      await result.current.compressMany([]);
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.progress).toBe(0);
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('clears previous results when starting a new batch', async () => {
    const { result } = renderHook(() => useImageCompression());
    const firstFile = new File([new Uint8Array(64)], 'first.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.compressOne(firstFile, { quality: 0.8 });
    });

    expect(result.current.results).toHaveLength(1);

    MockCompressionWorker.mode = 'hang';
    const secondFile = new File([new Uint8Array(64)], 'second.jpg', { type: 'image/jpeg' });

    await act(async () => {
      void result.current.compressOne(secondFile, { quality: 0.8 });
      await Promise.resolve();
    });

    expect(result.current.status).toBe('compressing');
    expect(result.current.results).toEqual([]);

    act(() => {
      result.current.terminate();
    });
  });

  it('settles an in-flight batch when terminate is called', async () => {
    MockCompressionWorker.mode = 'hang';

    const { result } = renderHook(() => useImageCompression());
    const file = new File([new Uint8Array(64)], 'pending.jpg', { type: 'image/jpeg' });

    let pendingPromise!: Promise<CompressionResult>;

    await act(async () => {
      pendingPromise = result.current.compressOne(file, { quality: 0.8 });
      await Promise.resolve();
    });

    act(() => {
      result.current.terminate();
    });

    const settled = await pendingPromise;

    expect(settled.error).toBe('Compression cancelled.');
    expect(result.current.status).toBe('idle');
    expect(result.current.progress).toBe(0);
    expect(result.current.isCompressing).toBe(false);
  });

  it('terminates the worker instance when requested', async () => {
    const { result } = renderHook(() => useImageCompression());
    const file = new File([new Uint8Array(64)], 'sample.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.compressOne(file, { quality: 0.8 });
    });

    act(() => {
      result.current.terminate();
    });

    expect(MockCompressionWorker.terminatedCount).toBeGreaterThan(0);
  });
});
