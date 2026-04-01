import { describe, expect, it } from 'vitest';

import { cn, formatBytes } from './utils';

describe('cn', () => {
  it('merges Tailwind classes and removes conflicts', () => {
    expect(cn('px-2 py-1', false && 'hidden', 'px-4')).toBe('py-1 px-4');
  });
});

describe('formatBytes', () => {
  it('formats zero bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('formats kilobytes with the requested precision', () => {
    expect(formatBytes(1536, 1)).toBe('1.5 KB');
  });
});