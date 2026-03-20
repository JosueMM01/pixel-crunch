import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatBytes } from '@/lib/utils';
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

export function CompressionStats({ items, copy }: CompressionStatsProps) {
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
    <section className="w-full max-w-5xl mx-auto space-y-4">
      <Card variant="border" className="border-monokai-green/40 bg-monokai-bg/50">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold text-monokai-green">
              {resolvedCopy.title}
            </h3>
            <p className="mt-1 text-sm md:text-base text-monokai-fg/70">
              {resolvedCopy.description}
            </p>
          </div>

          {normalizedItems.length === 0 ? (
            <p className="text-sm md:text-base text-monokai-fg/70">
              {resolvedCopy.emptyStateLabel}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                    className="rounded-md border border-monokai-fg/20 bg-monokai-bg/60 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p
                        className="text-sm font-medium text-monokai-fg truncate"
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

                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-monokai-fg/80">
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
                ))}
              </div>
            </>
          )}
        </div>
      </Card>
    </section>
  );
}
