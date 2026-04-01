import { describe, expect, it } from 'vitest';

import {
  DEFAULT_ACCEPTED_FORMATS,
  getDropzoneAcceptMap,
  getFileExtension,
} from './formats';

describe('getFileExtension', () => {
  it('returns normalized extension when filename has extension', () => {
    expect(getFileExtension('photo.JFIF')).toBe('jfif');
  });

  it('returns empty string when extension is missing', () => {
    expect(getFileExtension('photo')).toBe('');
  });
});

describe('getDropzoneAcceptMap', () => {
  it('adds extension hints for accepted formats including jfif for jpeg', () => {
    const accept = getDropzoneAcceptMap(DEFAULT_ACCEPTED_FORMATS);

    expect(accept['image/jpeg']).toEqual(['.jpg', '.jpeg', '.jfif']);
    expect(accept['image/png']).toEqual(['.png']);
    expect(accept['image/webp']).toEqual(['.webp']);
  });
});
