import {
  detectBackgroundRemovalCapabilities,
  selectBackgroundRemovalRoutes,
} from './capabilities';
import { BACKGROUND_REMOVAL_LIMITS, BACKGROUND_REMOVAL_PUBLIC_PATH } from './constants';
import { validateBackgroundRemovalImage } from './image-limits';
import type {
  BackgroundRemovalCapabilities,
  BackgroundRemovalErrorCode,
  BackgroundRemovalProgress,
  BackgroundRemovalResult,
  BackgroundRemovalRoute,
  BackgroundRemovalWorkerRequest,
  BackgroundRemovalWorkerResponse,
} from '@/types/background-removal';

export interface BackgroundRemovalOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  capabilities?: BackgroundRemovalCapabilities;
  onProgress?: (progress: BackgroundRemovalProgress) => void;
  workerFactory?: () => Worker;
}

export class BackgroundRemovalError extends Error {
  constructor(
    message: string,
    readonly code: BackgroundRemovalErrorCode,
    readonly attempts: BackgroundRemovalRoute[],
  ) {
    super(message);
    this.name = 'BackgroundRemovalError';
  }
}

function createBackgroundRemovalWorker(): Worker {
  return new Worker(new URL('../../workers/background-removal.worker.ts', import.meta.url), {
    type: 'module',
    name: 'pixel-crunch-background-removal',
  });
}

function operationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `background-removal-${Date.now()}-${Math.random()}`;
}

function runWorkerAttempt(
  image: Blob,
  route: BackgroundRemovalRoute,
  options: Required<Pick<BackgroundRemovalOptions, 'timeoutMs' | 'workerFactory'>> &
    Pick<BackgroundRemovalOptions, 'signal' | 'onProgress'>,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const worker = options.workerFactory();
    const id = operationId();
    let settled = false;

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      options.signal?.removeEventListener('abort', onAbort);
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onWorkerError);
      worker.terminate();
      callback();
    };
    const onAbort = () => finish(() => reject(new BackgroundRemovalError('Background removal was cancelled.', 'cancelled', [route])));
    const onWorkerError = () => finish(() => reject(new BackgroundRemovalError('The background-removal worker failed.', 'worker-failed', [route])));
    const onMessage = (event: MessageEvent<BackgroundRemovalWorkerResponse>) => {
      const response = event.data;
      if ((response.type === 'progress' ? response.progress.operationId : response.operationId) !== id) return;
      if (response.type === 'progress') {
        options.onProgress?.(response.progress);
        return;
      }
      if (response.type === 'complete') {
        finish(() => resolve(response.output));
        return;
      }
      finish(() => reject(new BackgroundRemovalError(response.message, response.code, [route])));
    };
    const timeout = setTimeout(() => {
      finish(() => reject(new BackgroundRemovalError('Background removal timed out.', 'timeout', [route])));
    }, options.timeoutMs);

    if (options.signal?.aborted) {
      onAbort();
      return;
    }

    options.signal?.addEventListener('abort', onAbort, { once: true });
    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onWorkerError);

    const request: BackgroundRemovalWorkerRequest = {
      type: 'process',
      operationId: id,
      image,
      route,
      publicPath: new URL(BACKGROUND_REMOVAL_PUBLIC_PATH, window.location.origin).toString(),
    };
    worker.postMessage(request);
  });
}

export async function removeBackgroundLocally(
  image: Blob,
  options: BackgroundRemovalOptions = {},
): Promise<BackgroundRemovalResult> {
  const capabilities = options.capabilities ?? await detectBackgroundRemovalCapabilities();
  await validateBackgroundRemovalImage(image, capabilities);
  const routes = selectBackgroundRemovalRoutes(capabilities);
  const attempts: BackgroundRemovalRoute[] = [];
  const failedDownloads = new Set<string>();
  let lastError: BackgroundRemovalError | null = null;
  let skipNonQuantizedRoutes = false;

  for (let index = 0; index < routes.length; index += 1) {
    const route = routes[index];
    if (skipNonQuantizedRoutes && route.model !== 'isnet_quint8') continue;
    attempts.push(route);

    try {
      const output = await runWorkerAttempt(image, route, {
        signal: options.signal,
        timeoutMs: options.timeoutMs ?? BACKGROUND_REMOVAL_LIMITS.timeoutMs,
        onProgress: options.onProgress,
        workerFactory: options.workerFactory ?? createBackgroundRemovalWorker,
      });
      return { output, route, attempts };
    } catch (error) {
      lastError = error instanceof BackgroundRemovalError
        ? error
        : new BackgroundRemovalError('Background removal failed.', 'worker-failed', [route]);

      if (lastError.code === 'cancelled' || lastError.code === 'invalid-image' || lastError.code === 'image-too-large') {
        throw new BackgroundRemovalError(lastError.message, lastError.code, attempts);
      }
      if (lastError.code === 'insufficient-memory') skipNonQuantizedRoutes = true;
      if (lastError.code === 'asset-download') {
        const routeKey = `${route.device}:${route.model}`;
        if (!failedDownloads.has(routeKey)) {
          failedDownloads.add(routeKey);
          index -= 1;
        }
      }
    }
  }

  throw new BackgroundRemovalError(
    lastError?.message ?? 'No compatible background-removal route succeeded.',
    lastError?.code ?? 'inference-failed',
    attempts,
  );
}
