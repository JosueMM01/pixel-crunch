import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatBytes } from '@/lib/utils';
import type { ImagePreviewCopy, ImagePreviewProps } from '@/types';

const DEFAULT_COPY: ImagePreviewCopy = {
  emptyStateLabel: 'Aún no hay imágenes cargadas.',
  removeLabel: 'Eliminar imagen',
  previewAltPrefix: 'Vista previa de',
};

interface PreviewItem {
  key: string;
  url: string;
  file: File;
}

function clampIndex(index: number, maxIndex: number): number {
  if (maxIndex < 0) {
    return 0;
  }

  return Math.min(maxIndex, Math.max(0, index));
}

function getFormatLabel(file: File): string {
  const mimeSubtype = file.type.split('/')[1] ?? '';
  const normalizedSubtype = mimeSubtype.replace('+xml', '');
  return normalizedSubtype.toUpperCase() || 'FILE';
}

export function ImagePreview({
  files,
  onRemove,
  onSaveSingle,
  disableSaveSingle = false,
  copy,
  layout = 'grid',
  activeIndex,
  onActiveIndexChange,
  compact = false,
  compressionMetaByIndex,
}: ImagePreviewProps) {
  const resolvedCopy = useMemo<ImagePreviewCopy>(
    () => ({ ...DEFAULT_COPY, ...copy }),
    [copy]
  );
  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

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

  const maxIndex = previews.length - 1;
  const isControlled = typeof activeIndex === 'number';
  const currentIndex = clampIndex(
    isControlled ? activeIndex : internalActiveIndex,
    maxIndex
  );
  const currentPreview = previews[currentIndex];

  useEffect(() => {
    if (isControlled) {
      return;
    }

    setInternalActiveIndex((previous) => clampIndex(previous, maxIndex));
  }, [isControlled, maxIndex]);

  const setCurrentIndex = useCallback((nextIndex: number) => {
    const safeIndex = clampIndex(nextIndex, maxIndex);

    if (!isControlled) {
      setInternalActiveIndex(safeIndex);
    }

    onActiveIndexChange?.(safeIndex);
  }, [isControlled, maxIndex, onActiveIndexChange]);

  const goToPrevious = useCallback(() => {
    if (previews.length === 0) {
      return;
    }

    const nextIndex = currentIndex === 0 ? maxIndex : currentIndex - 1;
    setCurrentIndex(nextIndex);
  }, [currentIndex, maxIndex, previews.length, setCurrentIndex]);

  const goToNext = useCallback(() => {
    if (previews.length === 0) {
      return;
    }

    const nextIndex = currentIndex === maxIndex ? 0 : currentIndex + 1;
    setCurrentIndex(nextIndex);
  }, [currentIndex, maxIndex, previews.length, setCurrentIndex]);

  const scrollStrip = useCallback((direction: 'left' | 'right') => {
    if (!stripRef.current) {
      return;
    }

    const amount = Math.max(220, Math.round(stripRef.current.clientWidth * 0.7));
    stripRef.current.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    if (layout !== 'strip') {
      return;
    }

    itemRefs.current[currentIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [currentIndex, layout]);

  if (layout === 'strip') {
    return (
      <section className="w-full" aria-live="polite" data-active-index={currentIndex}>
        {previews.length === 0 ? (
          <Card
            variant="border"
            className="border-monokai-purple/40 bg-monokai-bg/50 text-monokai-fg/70"
          >
            <p className="text-sm md:text-base">{resolvedCopy.emptyStateLabel}</p>
          </Card>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => scrollStrip('left')}
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-monokai-purple/40 bg-monokai-bg/85 p-2 text-monokai-fg hover:bg-monokai-purple/20"
              aria-label="Desplazar carrusel a la izquierda"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            <div
              ref={stripRef}
              className={cn(
                'no-scrollbar flex h-[15rem] w-full items-start justify-start gap-3 overflow-x-auto rounded-lg border bg-monokai-bg/40 px-12 py-2',
                'border-monokai-fg/10'
              )}
              role="tablist"
              aria-label="Carrusel de imágenes"
            >
              {previews.map((preview, index) => {
                const isCompressed = Boolean(compressionMetaByIndex?.[index]?.isCompressed);
                const isSelectable = compressionMetaByIndex ? isCompressed : true;
                const savingsPercent = Math.max(
                  0,
                  Math.round(Math.abs(compressionMetaByIndex?.[index]?.savingsPercent ?? 0))
                );
                const shouldShowSavingsOverlay = isCompressed && savingsPercent > 0;

                return (
                  <div
                    key={preview.key}
                    ref={(node) => {
                      itemRefs.current[index] = node;
                    }}
                    role="tab"
                    aria-selected={index === currentIndex}
                    aria-disabled={!isSelectable}
                    aria-label={`Ver imagen ${index + 1}`}
                    tabIndex={isSelectable ? 0 : -1}
                    className={cn(
                      'relative w-48 shrink-0 overflow-hidden rounded-md border bg-monokai-bg/70 text-left',
                      index === currentIndex
                        ? 'border-monokai-cyan ring-2 ring-monokai-cyan/40'
                        : 'border-monokai-purple/30',
                      isSelectable ? 'cursor-pointer' : 'cursor-default opacity-85'
                    )}
                    onClick={() => {
                      if (!isSelectable) {
                        return;
                      }

                      setCurrentIndex(index);
                    }}
                    onKeyDown={(event) => {
                      if (!isSelectable) {
                        return;
                      }

                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setCurrentIndex(index);
                      }
                    }}
                  >
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemove(index);
                      }}
                      className="absolute right-1 top-1 z-10 rounded bg-monokai-bg/80 p-1 text-monokai-pink hover:bg-monokai-pink/20"
                      aria-label={`${resolvedCopy.removeLabel}: ${preview.file.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>

                    <div className="relative h-28 overflow-hidden border-b border-monokai-purple/30">
                      <img
                        src={preview.url}
                        alt={`${resolvedCopy.previewAltPrefix} ${preview.file.name}`}
                        className="h-full w-full bg-monokai-bg/85 object-contain"
                        loading="lazy"
                      />

                      {shouldShowSavingsOverlay ? (
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl font-black text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                          -{savingsPercent}%
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-1 p-2">
                      <p className="truncate text-sm font-medium text-monokai-fg" title={preview.file.name}>
                        {preview.file.name}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          size="sm"
                          className="bg-monokai-cyan/20 text-monokai-cyan dark:bg-monokai-cyan/20 dark:text-monokai-cyan"
                        >
                          {getFormatLabel(preview.file)}
                        </Badge>
                        <span className="text-xs text-monokai-fg/70">{formatBytes(preview.file.size)}</span>
                      </div>

                      {isCompressed && onSaveSingle ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            onSaveSingle(index);
                          }}
                          disabled={disableSaveSingle}
                          className="mt-1 h-7 w-full border border-monokai-green/35 px-2 text-xs font-semibold text-monokai-green hover:bg-monokai-green/10"
                        >
                          {resolvedCopy.saveSingleLabel ?? 'Guardar'}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => scrollStrip('right')}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-monokai-purple/40 bg-monokai-bg/85 p-2 text-monokai-fg hover:bg-monokai-purple/20"
              aria-label="Desplazar carrusel a la derecha"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </section>
    );
  }

  if (layout === 'carousel') {
    return (
      <section className="w-full" aria-live="polite" data-active-index={currentIndex}>
        {previews.length === 0 ? (
          <Card
            variant="border"
            className="border-monokai-purple/40 bg-monokai-bg/50 text-monokai-fg/70"
          >
            <p className="text-sm md:text-base">{resolvedCopy.emptyStateLabel}</p>
          </Card>
        ) : (
          <Card
            variant="border"
            padding={compact ? 'sm' : 'md'}
            className="border-monokai-purple/40 bg-monokai-bg/60"
          >
            <div className="relative aspect-[4/3] rounded-md overflow-hidden border border-monokai-purple/30 bg-monokai-bg">
              <img
                src={currentPreview.url}
                alt={`${resolvedCopy.previewAltPrefix} ${currentPreview.file.name}`}
                className="h-full w-full object-contain"
                loading="lazy"
              />

              {previews.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-monokai-purple/40 bg-monokai-bg/80 p-2 text-monokai-fg hover:bg-monokai-purple/20"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-monokai-purple/40 bg-monokai-bg/80 p-2 text-monokai-fg hover:bg-monokai-purple/20"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="truncate text-sm font-medium text-monokai-fg"
                  title={currentPreview.file.name}
                >
                  {currentPreview.file.name}
                </p>
                <p className="text-xs text-monokai-fg/70">{formatBytes(currentPreview.file.size)}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  size="sm"
                  className="bg-monokai-cyan/20 text-monokai-cyan dark:bg-monokai-cyan/20 dark:text-monokai-cyan"
                >
                  {getFormatLabel(currentPreview.file)}
                </Badge>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="h-4 w-4" />}
                  onClick={() => onRemove(currentIndex)}
                  className="border border-monokai-pink/40 text-monokai-pink hover:bg-monokai-pink/10 dark:text-monokai-pink dark:hover:bg-monokai-pink/10"
                  aria-label={`${resolvedCopy.removeLabel}: ${currentPreview.file.name}`}
                >
                  {resolvedCopy.removeLabel}
                </Button>
              </div>
            </div>

            {previews.length > 1 ? (
              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Carrusel de imágenes">
                {previews.map((preview, index) => (
                  <button
                    key={preview.key}
                    type="button"
                    role="tab"
                    aria-selected={index === currentIndex}
                    aria-label={`Ver imagen ${index + 1}`}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      'h-14 w-14 shrink-0 overflow-hidden rounded-md border',
                      index === currentIndex
                        ? 'border-monokai-cyan ring-2 ring-monokai-cyan/40'
                        : 'border-monokai-purple/30'
                    )}
                  >
                    <img
                      src={preview.url}
                      alt={`${resolvedCopy.previewAltPrefix} ${preview.file.name}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </Card>
        )}
      </section>
    );
  }

  return (
    <section className="w-full max-w-5xl mx-auto" aria-live="polite">
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
