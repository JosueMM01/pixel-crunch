import { useEffect, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatBytes } from '@/lib/utils';
import type { ImagePreviewCopy, ImagePreviewProps } from '@/types';

const DEFAULT_COPY: ImagePreviewCopy = {
  title: 'Vista previa',
  emptyStateLabel: 'Aún no hay imágenes cargadas.',
  removeLabel: 'Eliminar imagen',
  previewAltPrefix: 'Vista previa de',
};

interface PreviewItem {
  key: string;
  url: string;
  file: File;
}

function getFormatLabel(file: File): string {
  const mimeSubtype = file.type.split('/')[1] ?? '';
  const normalizedSubtype = mimeSubtype.replace('+xml', '');
  return normalizedSubtype.toUpperCase() || 'FILE';
}

export function ImagePreview({ files, onRemove, copy }: ImagePreviewProps) {
  const resolvedCopy = useMemo<ImagePreviewCopy>(
    () => ({ ...DEFAULT_COPY, ...copy }),
    [copy]
  );

  const previews = useMemo<PreviewItem[]>(() => {
    return files.map((file, index) => ({
      key: `${file.name}-${file.lastModified}-${index}`,
      url: URL.createObjectURL(file),
      file,
    }));
  }, [files]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  return (
    <section className="w-full max-w-5xl mx-auto" aria-live="polite">
      <h3 className="mb-4 text-xl md:text-2xl font-semibold text-monokai-purple">
        {resolvedCopy.title}
      </h3>

      {previews.length === 0 ? (
        <Card
          variant="border"
          className="border-monokai-purple/40 bg-monokai-bg/50 text-monokai-fg/70"
        >
          <p className="text-sm md:text-base">{resolvedCopy.emptyStateLabel}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <Card
              key={preview.key}
              variant="border"
              padding="sm"
              className="border-monokai-purple/40 bg-monokai-bg/60 overflow-hidden"
            >
              <div className="relative aspect-square rounded-md overflow-hidden border border-monokai-purple/30 bg-monokai-bg">
                <img
                  src={preview.url}
                  alt={`${resolvedCopy.previewAltPrefix} ${preview.file.name}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="mt-3 space-y-2">
                <p
                  className="text-sm font-medium text-monokai-fg truncate"
                  title={preview.file.name}
                >
                  {preview.file.name}
                </p>

                <div className="flex items-center justify-between gap-2">
                  <Badge
                    size="sm"
                    className="bg-monokai-cyan/20 text-monokai-cyan dark:bg-monokai-cyan/20 dark:text-monokai-cyan"
                  >
                    {getFormatLabel(preview.file)}
                  </Badge>

                  <span className="text-xs text-monokai-fg/70">
                    {formatBytes(preview.file.size)}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => onRemove(index)}
                  className="w-full border border-monokai-pink/40 text-monokai-pink hover:bg-monokai-pink/10 dark:text-monokai-pink dark:hover:bg-monokai-pink/10"
                  aria-label={`${resolvedCopy.removeLabel}: ${preview.file.name}`}
                >
                  {resolvedCopy.removeLabel}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
