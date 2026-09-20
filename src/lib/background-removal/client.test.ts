import { describe, expect, it, vi } from 'vitest';

import { BackgroundRemovalError, removeBackgroundLocally } from './client';
import type {
  BackgroundRemovalCapabilities,
  BackgroundRemovalWorkerRequest,
  BackgroundRemovalWorkerResponse,
} from '@/types/background-removal';

const cpuCapabilities: BackgroundRemovalCapabilities = {
  webGpu: false,
  constrained: false,
  mobile: false,
  deviceMemoryGiB: 8,
  hardwareConcurrency: 8,
};

function validPng(): Blob {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, 640);
  view.setUint32(20, 480);
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'image/png' });
}

type WorkerPlan = (worker: FakeWorker, request: BackgroundRemovalWorkerRequest) => void;

class FakeWorker extends EventTarget {
  terminated = false;

  constructor(private readonly plan: WorkerPlan) {
    super();
  }

  postMessage(request: BackgroundRemovalWorkerRequest): void {
    this.plan(this, request);
  }

  terminate(): void {
    this.terminated = true;
  }

  respond(response: BackgroundRemovalWorkerResponse): void {
    this.dispatchEvent(new MessageEvent('message', { data: response }));
  }
}

function workerFactory(plans: WorkerPlan[]): { factory: () => Worker; workers: FakeWorker[] } {
  const workers: FakeWorker[] = [];
  return {
    workers,
    factory: () => {
      const plan = plans[workers.length];
      if (!plan) throw new Error('Unexpected worker attempt');
      const worker = new FakeWorker(plan);
      workers.push(worker);
      return worker as unknown as Worker;
    },
  };
}

describe('removeBackgroundLocally', () => {
  it('forwards progress, returns output, and terminates the one-shot worker', async () => {
    const progress = vi.fn();
    const output = new Blob(['result'], { type: 'image/png' });
    const { factory, workers } = workerFactory([
      (worker, request) => queueMicrotask(() => {
        worker.respond({
          type: 'progress',
          progress: { operationId: request.operationId, stage: 'inference', route: request.route },
        });
        worker.respond({
          type: 'complete',
          operationId: request.operationId,
          output,
          route: request.route,
        });
      }),
    ]);

    const result = await removeBackgroundLocally(validPng(), {
      capabilities: cpuCapabilities,
      workerFactory: factory,
      onProgress: progress,
    });

    expect(result.output).toBe(output);
    expect(result.route).toEqual({ device: 'cpu', model: 'isnet_fp16' });
    expect(progress).toHaveBeenCalledOnce();
    expect(workers[0].terminated).toBe(true);
  });

  it('retries a failed download once before using the lighter model', async () => {
    const failDownload: WorkerPlan = (worker, request) => queueMicrotask(() => worker.respond({
      type: 'error',
      operationId: request.operationId,
      code: 'asset-download',
      message: 'Failed to fetch model chunk',
      retryable: true,
      route: request.route,
    }));
    const { factory, workers } = workerFactory([
      failDownload,
      failDownload,
      (worker, request) => queueMicrotask(() => worker.respond({
        type: 'complete',
        operationId: request.operationId,
        output: new Blob(['ok'], { type: 'image/png' }),
        route: request.route,
      })),
    ]);

    const result = await removeBackgroundLocally(validPng(), {
      capabilities: cpuCapabilities,
      workerFactory: factory,
    });

    expect(result.attempts).toEqual([
      { device: 'cpu', model: 'isnet_fp16' },
      { device: 'cpu', model: 'isnet_fp16' },
      { device: 'cpu', model: 'isnet_quint8' },
    ]);
    expect(workers.every((worker) => worker.terminated)).toBe(true);
  });

  it('skips remaining heavy routes after an out-of-memory error', async () => {
    const gpuCapabilities = { ...cpuCapabilities, webGpu: true };
    const { factory } = workerFactory([
      (worker, request) => queueMicrotask(() => worker.respond({
        type: 'error',
        operationId: request.operationId,
        code: 'insufficient-memory',
        message: 'Out of memory',
        retryable: true,
        route: request.route,
      })),
      (worker, request) => queueMicrotask(() => worker.respond({
        type: 'complete',
        operationId: request.operationId,
        output: new Blob(['ok'], { type: 'image/png' }),
        route: request.route,
      })),
    ]);

    const result = await removeBackgroundLocally(validPng(), {
      capabilities: gpuCapabilities,
      workerFactory: factory,
    });

    expect(result.attempts).toEqual([
      { device: 'gpu', model: 'isnet_fp16' },
      { device: 'cpu', model: 'isnet_quint8' },
    ]);
  });

  it('terminates immediately when cancellation is requested', async () => {
    const controller = new AbortController();
    const { factory, workers } = workerFactory([() => undefined]);
    const pending = removeBackgroundLocally(validPng(), {
      capabilities: cpuCapabilities,
      workerFactory: factory,
      signal: controller.signal,
    });
    controller.abort();

    await expect(pending).rejects.toMatchObject({ code: 'cancelled' });
    expect(workers[0].terminated).toBe(true);
  });

  it('times out and releases every attempted worker', async () => {
    const { factory, workers } = workerFactory([() => undefined, () => undefined]);

    await expect(removeBackgroundLocally(validPng(), {
      capabilities: cpuCapabilities,
      workerFactory: factory,
      timeoutMs: 1,
    })).rejects.toBeInstanceOf(BackgroundRemovalError);
    expect(workers).toHaveLength(2);
    expect(workers.every((worker) => worker.terminated)).toBe(true);
  });
});
