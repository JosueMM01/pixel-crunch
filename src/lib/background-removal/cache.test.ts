import { describe, expect, it, vi } from 'vitest';
import { isBackgroundRemovalRouteCached } from './cache';

const resources = {
  '/onnxruntime-web/ort-wasm-simd-threaded.mjs': { chunks: [{ name: 'cpu-js' }] },
  '/onnxruntime-web/ort-wasm-simd-threaded.wasm': { chunks: [{ name: 'cpu-wasm' }] },
  '/onnxruntime-web/ort-wasm-simd-threaded.jsep.mjs': { chunks: [{ name: 'gpu-js' }] },
  '/onnxruntime-web/ort-wasm-simd-threaded.jsep.wasm': { chunks: [{ name: 'gpu-wasm' }] },
  '/models/isnet_fp16': { chunks: [{ name: 'fp16-a' }, { name: 'fp16-b' }] },
  '/models/isnet_quint8': { chunks: [{ name: 'q8' }] },
};

function cacheStorageWith(names: string[]): CacheStorage {
  const cached = new Set(names);
  const cache = {
    match: vi.fn(async (request: RequestInfo | URL) => {
      const url = String(request);
      if (url.endsWith('resources.json')) return new Response(JSON.stringify(resources));
      const name = url.split('/').at(-1) ?? '';
      return cached.has(name) ? new Response('cached') : undefined;
    }),
  };

  return { open: vi.fn(async () => cache) } as unknown as CacheStorage;
}

describe('isBackgroundRemovalRouteCached', () => {
  it('reports a complete CPU model route as cached', async () => {
    const result = await isBackgroundRemovalRouteCached(
      { device: 'cpu', model: 'isnet_quint8' },
      cacheStorageWith(['cpu-js', 'cpu-wasm', 'q8']),
    );

    expect(result).toBe(true);
  });

  it('requires every runtime and model chunk', async () => {
    const result = await isBackgroundRemovalRouteCached(
      { device: 'gpu', model: 'isnet_fp16' },
      cacheStorageWith(['gpu-js', 'gpu-wasm', 'fp16-a']),
    );

    expect(result).toBe(false);
  });

  it('treats unavailable Cache Storage as a cache miss', async () => {
    await expect(
      isBackgroundRemovalRouteCached({ device: 'cpu', model: 'isnet_quint8' }, undefined),
    ).resolves.toBe(false);
  });
});
