import { describe, expect, it } from 'vitest';

import { classifyBackgroundRemovalError } from './errors';
import { mapLibraryProgressStage } from './progress';

describe('background removal worker helpers', () => {
  it.each([
    ['Failed to fetch model chunk', 'asset-download', true],
    ['WebGPU adapter unavailable', 'webgpu-unavailable', true],
    ['Out of memory allocating tensor', 'insufficient-memory', true],
    ['Invalid image decode', 'invalid-image', false],
    ['Inference session failed', 'inference-failed', true],
  ])('classifies %s', (message, code, retryable) => {
    expect(classifyBackgroundRemovalError(new Error(message))).toMatchObject({ code, retryable });
  });

  it.each([
    ['fetch:/models/isnet_fp16', 'downloading-assets'],
    ['compute:decode', 'decoding'],
    ['compute:inference', 'inference'],
    ['compute:mask', 'applying-mask'],
    ['compute:encode', 'encoding'],
    ['unknown', 'loading-runtime'],
  ])('maps %s to %s', (key, stage) => {
    expect(mapLibraryProgressStage(key)).toBe(stage);
  });
});
