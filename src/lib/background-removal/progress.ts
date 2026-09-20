import type { BackgroundRemovalStage } from '@/types/background-removal';

export function mapLibraryProgressStage(key: string): BackgroundRemovalStage {
  if (key.startsWith('fetch:')) return 'downloading-assets';
  if (key === 'compute:decode') return 'decoding';
  if (key === 'compute:inference') return 'inference';
  if (key === 'compute:mask') return 'applying-mask';
  if (key === 'compute:encode') return 'encoding';
  return 'loading-runtime';
}
