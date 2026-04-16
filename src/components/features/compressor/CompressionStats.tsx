import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn, formatBytes } from '@/lib/utils';
import type {
  CompressionStatsCopy,
  CompressionStatsItem,
  CompressionStatsProps,
} from '@/types';

const DEFAULT_COPY: CompressionStatsCopy = {
  title: 'Compression stats',
  description: 'Compare original size against compressed size.',
  emptyStateLabel: 'No compression data to show yet.',
  originalLabel: 'Original',
  compressedLabel: 'Compressed',
  savingsLabel: 'Savings',
  percentageLabel: 'Reduction',
  estimatedLabel: 'Estimated',
  errorLabel: 'Error',
};

interface NormalizedStatsItem extends CompressionStatsItem {
  safeOriginal: number;
  safeCompressed: number;
  savingsBytes: number;
  savingsPercent: number;
  isComparable: boolean;
}

function toNormalizedItem(item: CompressionStatsItem): NormalizedStatsItem {
  const safeOriginal = Math.max(0, item.originalBytes);

  if (item.hasError) {
    return {
      ...item,
      safeOriginal,
      safeCompressed: 0,
      savingsBytes: 0,
      savingsPercent: 0,
      isComparable: false,
    };
  }

  const safeCompressed = Math.max(0, item.compressedBytes);
  const savingsBytes = safeOriginal - safeCompressed;
  const savingsPercent = safeOriginal === 0
    ? 0
    : (savingsBytes / safeOriginal) * 100;

  return {
    ...item,
    safeOriginal,
    safeCompressed,
    savingsBytes,
    savingsPercent,
    isComparable: true,
  };
}

function getSavingsBadgeVariant(savingsBytes: number): 'success' | 'warning' | 'error' {
  if (savingsBytes > 0) return 'success';
  if (savingsBytes === 0) return 'warning';
  return 'error';
}

function formatSignedBytes(value: number): string {
  const absValue = Math.abs(value);
  if (value > 0) return formatBytes(absValue);
  if (value < 0) return `-${formatBytes(absValue)}`;
  return formatBytes(0);
}

function formatSignedPercent(value: number): string {
  const absValue = Math.abs(value).toFixed(1);
  if (value > 0) return `${absValue}%`;
  if (value < 0) return `-${absValue}%`;
  return '0.0%';
}

export function CompressionStats({
  items,
  copy,
  compact = false,
  embedded = false,
}: CompressionStatsProps) {
  const resolvedCopy = useMemo<CompressionStatsCopy>(
    () => ({ ...DEFAULT_COPY, ...copy }),
    [copy]
  );

  const normalizedItems = useMemo(
    () => items.map(toNormalizedItem),
    [items]
  );

  const totals = useMemo(() => {
    const comparableItems = normalizedItems.filter((item) => item.isComparable);
    const original = comparableItems.reduce((sum, item) => sum + item.safeOriginal, 0);
    const compressed = comparableItems.reduce((sum, item) => sum + item.safeCompressed, 0);
    const savingsBytes = original - compressed;
    const savingsPercent = original === 0 ? 0 : (savingsBytes / original) * 100;

    return {
      original,
      compressed,
      savingsBytes,
      savingsPercent,
    };
  }, [normalizedItems]);

  return (
    <section className={cn('w-full', embedded ? 'space-y-3' : 'max-w-5xl mx-auto space-y-4')}>
      <Card
        variant="border"
        padding={compact ? 'sm' : 'md'}
        className="border-monokai-green/40 bg-monokai-bg/50"
      >
        <div className={cn(compact ? 'space-y-3' : 'space-y-4')}>
          <div>
            <h3 className={cn('font-semibold text-monokai-green', compact ? 'text-lg md:text-xl' : 'text-xl md:text-2xl')}>
              {resolvedCopy.title}
            </h3>
            <p className={cn('mt-1 text-monokai-fg/70', compact ? 'text-xs md:text-sm' : 'text-sm md:text-base')}>
              {resolvedCopy.description}
            </p>
          </div>

          {normalizedItems.length === 0 ? (
            <p className="text-sm md:text-base text-monokai-fg/70">
              {resolvedCopy.emptyStateLabel}
            </p>
          ) : (
            <>
              <div
                className={cn(
                  'grid gap-2',
                  compact ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 md:grid-cols-4'
                )}
              >
                <Card variant="border" padding="sm" className="border-monokai-cyan/30 bg-monokai-bg/60">
                  <p className="text-xs text-monokai-fg/70">{resolvedCopy.originalLabel}</p>
                  <p className="text-sm md:text-base font-semibold text-monokai-cyan">
                    {formatBytes(totals.original)}
                  </p>
                </Card>

                <Card variant="border" padding="sm" className="border-monokai-purple/30 bg-monokai-bg/60">
                  <p className="text-xs text-monokai-fg/70">{resolvedCopy.compressedLabel}</p>
                  <p className="text-sm md:text-base font-semibold text-monokai-purple">
                    {formatBytes(totals.compressed)}
                  </p>
                </Card>

                <Card variant="border" padding="sm" className="border-monokai-green/30 bg-monokai-bg/60">
                  <p className="text-xs text-monokai-fg/70">{resolvedCopy.savingsLabel}</p>
                  <p className="text-sm md:text-base font-semibold text-monokai-green">
                    {formatSignedBytes(totals.savingsBytes)}
                  </p>
                </Card>

                <Card variant="border" padding="sm" className="border-monokai-yellow/30 bg-monokai-bg/60">
                  <p className="text-xs text-monokai-fg/70">{resolvedCopy.percentageLabel}</p>
                  <p className="text-sm md:text-base font-semibold text-monokai-yellow">
                    {formatSignedPercent(totals.savingsPercent)}
                  </p>
                </Card>
              </div>

              <div className="space-y-2" aria-label={resolvedCopy.title}>
                {normalizedItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'rounded-md border border-monokai-fg/20 bg-monokai-bg/60',
                      compact ? 'p-2.5' : 'p-3'
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt={`Vista previa de ${item.filename}`}
                          className="h-14 w-14 shrink-0 rounded-md border border-monokai-purple/35 object-cover"
                        />
                      ) : null}

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p
                            className={cn('truncate font-medium text-monokai-fg', compact ? 'text-xs sm:text-sm' : 'text-sm')}
                            title={item.filename}
                          >
                            {item.filename}
                          </p>

                          <div className="flex items-center gap-2">
                            <Badge size="sm" className="bg-monokai-fg/10 text-monokai-fg">
                              {resolvedCopy.estimatedLabel}
                            </Badge>
                            {item.hasError && (
                              <Badge variant="error" size="sm">
                                {resolvedCopy.errorLabel}
                              </Badge>
                            )}
                            {item.isComparable && (
                              <Badge variant={getSavingsBadgeVariant(item.savingsBytes)} size="sm">
                                {formatSignedPercent(item.savingsPercent)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-1 text-xs text-monokai-fg/80 sm:grid-cols-2 md:grid-cols-4">
                          <span>
                            {resolvedCopy.originalLabel}: {formatBytes(item.safeOriginal)}
                          </span>
                          <span>
                            {resolvedCopy.compressedLabel}: {item.isComparable ? formatBytes(item.safeCompressed) : '--'}
                          </span>
                          <span>
                            {resolvedCopy.savingsLabel}: {item.isComparable ? formatSignedBytes(item.savingsBytes) : '--'}
                          </span>
                          <span>
                            {resolvedCopy.percentageLabel}: {item.isComparable ? formatSignedPercent(item.savingsPercent) : '--'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>
    </section>
  );
}
