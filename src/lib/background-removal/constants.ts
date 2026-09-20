export const BACKGROUND_REMOVAL_ASSET_VERSION = '1.7.0';
export const BACKGROUND_REMOVAL_PUBLIC_PATH = `/vendor/background-removal/${BACKGROUND_REMOVAL_ASSET_VERSION}/dist/`;
export const BACKGROUND_REMOVAL_CACHE_NAME = `pixel-crunch-background-removal-${BACKGROUND_REMOVAL_ASSET_VERSION}`;

export const BACKGROUND_REMOVAL_LIMITS = {
  maxBytes: 25 * 1024 * 1024,
  maxPixels: 24_000_000,
  constrainedMaxPixels: 12_000_000,
  timeoutMs: 120_000,
} as const;
