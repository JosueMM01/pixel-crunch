export const DEFAULT_ACCEPTED_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

const ACCEPT_EXTENSIONS_BY_MIME: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg', '.jfif'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot < 0 || lastDot === filename.length - 1) {
    return '';
  }

  return filename.slice(lastDot + 1).toLowerCase();
}

export function getDropzoneAcceptMap(acceptedFormats: readonly string[]): Record<string, string[]> {
  return acceptedFormats.reduce<Record<string, string[]>>((acc, format) => {
    const normalized = format.toLowerCase();
    acc[normalized] = ACCEPT_EXTENSIONS_BY_MIME[normalized] ?? [];
    return acc;
  }, {});
}
