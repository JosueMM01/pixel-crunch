import { classifyBackgroundRemovalError } from '@/lib/background-removal/errors';
import { mapLibraryProgressStage } from '@/lib/background-removal/progress';
import type {
  BackgroundRemovalWorkerRequest,
  BackgroundRemovalWorkerResponse,
} from '@/types/background-removal';

const ctx = self;
let processing = false;

async function verifyWebGpuRoute(): Promise<void> {
  if (!navigator.gpu) throw new Error('WebGPU is unavailable in this worker.');
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error('No WebGPU adapter is available in this worker.');
}

ctx.onmessage = async (event: MessageEvent<BackgroundRemovalWorkerRequest>) => {
  const request = event.data;
  if (request.type !== 'process') return;

  if (processing) {
    const response: BackgroundRemovalWorkerResponse = {
      type: 'error',
      operationId: request.operationId,
      code: 'worker-failed',
      message: 'This worker already has an operation in progress.',
      retryable: false,
      route: request.route,
    };
    ctx.postMessage(response);
    return;
  }

  processing = true;
  const { operationId, image, route, publicPath } = request;

  try {
    const loadingMessage: BackgroundRemovalWorkerResponse = {
      type: 'progress',
      progress: { operationId, stage: 'loading-runtime', route },
    };
    ctx.postMessage(loadingMessage);

    if (route.device === 'gpu') await verifyWebGpuRoute();
    const { removeBackground } = await import('@imgly/background-removal');
    const output = await removeBackground(image, {
      publicPath,
      device: route.device,
      model: route.model,
      proxyToWorker: false,
      output: { format: 'image/png', quality: 1 },
      progress: (key: string, current: number, total: number) => {
        const response: BackgroundRemovalWorkerResponse = {
          type: 'progress',
          progress: {
            operationId,
            stage: mapLibraryProgressStage(key),
            current,
            total,
            route,
          },
        };
        ctx.postMessage(response);
      },
    });

    const response: BackgroundRemovalWorkerResponse = {
      type: 'complete',
      operationId,
      output,
      route,
    };
    ctx.postMessage(response);
  } catch (error) {
    const classified = classifyBackgroundRemovalError(error);
    const response: BackgroundRemovalWorkerResponse = {
      type: 'error',
      operationId,
      route,
      ...classified,
    };
    ctx.postMessage(response);
  }
};
