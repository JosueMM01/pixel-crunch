import {
  BACKGROUND_REMOVAL_CACHE_NAME,
  BACKGROUND_REMOVAL_PUBLIC_PATH,
} from './constants';
import type { BackgroundRemovalRoute } from '@/types/background-removal';

interface ResourceChunk {
  name: string;
}

type ResourceManifest = Record<string, { chunks: ResourceChunk[] }>;

function requiredResources(route: BackgroundRemovalRoute): string[] {
  const runtimeSuffix = route.device === 'gpu' ? '.jsep' : '';

  return [
    `/onnxruntime-web/ort-wasm-simd-threaded${runtimeSuffix}.mjs`,
    `/onnxruntime-web/ort-wasm-simd-threaded${runtimeSuffix}.wasm`,
    `/models/${route.model}`,
  ];
}

export async function isBackgroundRemovalRouteCached(
  route: BackgroundRemovalRoute,
  cacheStorage: CacheStorage | undefined = globalThis.caches,
): Promise<boolean> {
  if (!cacheStorage) return false;

  try {
    const cache = await cacheStorage.open(BACKGROUND_REMOVAL_CACHE_NAME);
    const manifestResponse = await cache.match(`${BACKGROUND_REMOVAL_PUBLIC_PATH}resources.json`);
    if (!manifestResponse) return false;

    const manifest = await manifestResponse.json() as ResourceManifest;
    const resourceNames = requiredResources(route);
    if (resourceNames.some((name) => !manifest[name])) return false;

    const chunks = resourceNames.flatMap((resourceName) => {
      const resource = manifest[resourceName];
      return resource?.chunks ?? [];
    });

    if (chunks.length === 0) return false;

    const cachedChunks = await Promise.all(
      chunks.map((chunk) => cache.match(`${BACKGROUND_REMOVAL_PUBLIC_PATH}${chunk.name}`)),
    );

    return cachedChunks.every(Boolean);
  } catch {
    return false;
  }
}
