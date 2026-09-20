import type {
  BackgroundRemovalCapabilities,
  BackgroundRemovalRoute,
} from '@/types/background-removal';

type NavigatorWithDeviceCapabilities = Navigator & { deviceMemory?: number };

export function selectBackgroundRemovalRoutes(
  capabilities: BackgroundRemovalCapabilities,
): BackgroundRemovalRoute[] {
  if (capabilities.constrained) {
    return [
      { device: 'cpu', model: 'isnet_quint8' },
      ...(capabilities.webGpu ? [{ device: 'gpu' as const, model: 'isnet_quint8' as const }] : []),
    ];
  }

  return [
    ...(capabilities.webGpu ? [{ device: 'gpu' as const, model: 'isnet_fp16' as const }] : []),
    { device: 'cpu', model: 'isnet_fp16' },
    { device: 'cpu', model: 'isnet_quint8' },
  ];
}

export async function detectBackgroundRemovalCapabilities(
  browserNavigator: Navigator = navigator,
): Promise<BackgroundRemovalCapabilities> {
  const candidate = browserNavigator as NavigatorWithDeviceCapabilities;
  const userAgent = candidate.userAgent.toLowerCase();
  const mobile = /android|iphone|ipad|ipod|mobile/.test(userAgent);
  const deviceMemoryGiB = candidate.deviceMemory;
  const hardwareConcurrency = candidate.hardwareConcurrency;
  const constrained =
    mobile ||
    (deviceMemoryGiB !== undefined && deviceMemoryGiB <= 4) ||
    (hardwareConcurrency !== undefined && hardwareConcurrency <= 4);

  let webGpu = false;
  if (candidate.gpu) {
    try {
      webGpu = (await candidate.gpu.requestAdapter()) !== null;
    } catch {
      webGpu = false;
    }
  }

  return {
    webGpu,
    constrained,
    deviceMemoryGiB,
    hardwareConcurrency,
    mobile,
  };
}
