import { useId, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type {
  CompressionProgressCopy,
  CompressionProgressProps,
  CompressionProgressStatus,
} from '@/types';

const DEFAULT_COPY: CompressionProgressCopy = {
  title: 'Compression progress',
  idleLabel: 'Waiting to start compression',
  compressingLabel: 'Compressing images...',
  doneLabel: 'Compression completed',
  errorLabel: 'Compression failed',
  progressLabel: 'Progress',
};

const STATUS_STYLES: Record<CompressionProgressStatus, string> = {
  idle: 'text-monokai-fg/80',
  compressing: 'text-monokai-cyan',
  done: 'text-monokai-green',
  error: 'text-monokai-pink',
};

function clampProgress(progress: number): number {
  return Math.min(100, Math.max(0, Math.round(progress)));
}

function getStatusLabel(status: CompressionProgressStatus, copy: CompressionProgressCopy): string {
  if (status === 'compressing') return copy.compressingLabel;
  if (status === 'done') return copy.doneLabel;
  if (status === 'error') return copy.errorLabel;
  return copy.idleLabel;
}

export function CompressionProgress({
  progress,
  status,
  copy,
  compact = false,
}: CompressionProgressProps) {
  const statusId = useId();

  const resolvedCopy = useMemo<CompressionProgressCopy>(
    () => ({ ...DEFAULT_COPY, ...copy }),
    [copy]
  );

  const normalizedProgress = clampProgress(progress);
  const statusLabel = getStatusLabel(status, resolvedCopy);

  return (
    <section className={cn('w-full mx-auto', compact ? 'max-w-5xl' : 'max-w-5xl')}>
      <Card
        variant="border"
        padding={compact ? 'sm' : 'md'}
        className="border-monokai-yellow/40 bg-monokai-bg/50"
      >
        <div className={cn(compact ? 'space-y-2' : 'space-y-3')}>
          <div className="flex items-center justify-between gap-3">
            <h3 className={cn('font-semibold text-monokai-yellow', compact ? 'text-sm md:text-base' : 'text-xl md:text-2xl')}>
              {resolvedCopy.title}
            </h3>
            <span className={cn('font-semibold text-monokai-yellow', compact ? 'text-xs' : 'text-sm')}>
              {normalizedProgress}%
            </span>
          </div>

          <p
            id={statusId}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={cn(compact ? 'text-xs md:text-sm' : 'text-sm md:text-base', STATUS_STYLES[status])}
          >
            {statusLabel}
          </p>

          <div
            role="progressbar"
            aria-label={resolvedCopy.progressLabel}
            aria-describedby={statusId}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={normalizedProgress}
            aria-valuetext={`${normalizedProgress}% - ${statusLabel}`}
            className={cn(compact ? 'h-2' : 'h-3', 'w-full rounded-full bg-monokai-fg/20 overflow-hidden')}
          >
            <div
              className="h-full rounded-full bg-monokai-yellow transition-all duration-300"
              style={{ width: `${normalizedProgress}%` }}
            />
          </div>
        </div>
      </Card>
    </section>
  );
}
