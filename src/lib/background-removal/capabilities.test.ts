import { describe, expect, it, vi } from 'vitest';

import {
  detectBackgroundRemovalCapabilities,
  selectBackgroundRemovalRoutes,
} from './capabilities';

describe('background removal capabilities', () => {
  it('prefers WebGPU fp16 and keeps bounded CPU fallbacks on capable desktops', () => {
    expect(selectBackgroundRemovalRoutes({
      webGpu: true,
      constrained: false,
      mobile: false,
      deviceMemoryGiB: 16,
      hardwareConcurrency: 12,
    })).toEqual([
      { device: 'gpu', model: 'isnet_fp16' },
      { device: 'cpu', model: 'isnet_fp16' },
      { device: 'cpu', model: 'isnet_quint8' },
    ]);
  });

  it('starts with the quantized CPU route on constrained devices', () => {
    expect(selectBackgroundRemovalRoutes({
      webGpu: true,
      constrained: true,
      mobile: true,
      deviceMemoryGiB: 4,
      hardwareConcurrency: 4,
    })).toEqual([
      { device: 'cpu', model: 'isnet_quint8' },
      { device: 'gpu', model: 'isnet_quint8' },
    ]);
  });

  it('verifies an adapter instead of trusting navigator.gpu presence', async () => {
    const requestAdapter = vi.fn().mockResolvedValue({});
    const result = await detectBackgroundRemovalCapabilities({
      userAgent: 'Desktop Browser',
      hardwareConcurrency: 8,
      deviceMemory: 8,
      gpu: { requestAdapter },
    } as unknown as Navigator);

    expect(requestAdapter).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ webGpu: true, constrained: false, mobile: false });
  });

  it('treats rejected adapter requests and Android devices conservatively', async () => {
    const result = await detectBackgroundRemovalCapabilities({
      userAgent: 'Mozilla/5.0 (Linux; Android 15)',
      hardwareConcurrency: 8,
      deviceMemory: 8,
      gpu: { requestAdapter: vi.fn().mockRejectedValue(new Error('blocked')) },
    } as unknown as Navigator);

    expect(result).toMatchObject({ webGpu: false, constrained: true, mobile: true });
  });
});
