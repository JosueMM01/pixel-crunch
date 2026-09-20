import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BackgroundComparisonProps {
  originalUrl: string;
  resultUrl: string;
  originalAlt: string;
  resultAlt: string;
  beforeLabel: string;
  afterLabel: string;
  comparisonLabel: string;
}

const checkerboard = {
  backgroundColor: 'color-mix(in srgb, var(--color-monokai-fg) 7%, transparent)',
  backgroundImage: [
    'linear-gradient(45deg, color-mix(in srgb, var(--color-monokai-fg) 12%, transparent) 25%, transparent 25%)',
    'linear-gradient(-45deg, color-mix(in srgb, var(--color-monokai-fg) 12%, transparent) 25%, transparent 25%)',
    'linear-gradient(45deg, transparent 75%, color-mix(in srgb, var(--color-monokai-fg) 12%, transparent) 75%)',
    'linear-gradient(-45deg, transparent 75%, color-mix(in srgb, var(--color-monokai-fg) 12%, transparent) 75%)',
  ].join(','),
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
  backgroundSize: '16px 16px',
};

export function BackgroundComparison({
  originalUrl,
  resultUrl,
  originalAlt,
  resultAlt,
  beforeLabel,
  afterLabel,
  comparisonLabel,
}: BackgroundComparisonProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <figure className="min-w-0 space-y-3">
      <div className="flex justify-center" role="group" aria-label={comparisonLabel}>
        <div className="inline-flex max-w-full rounded-full border border-monokai-fg/15 p-1">
          {[false, true].map((original) => (
            <button
              key={String(original)}
              type="button"
              aria-pressed={showOriginal === original}
              onClick={() => setShowOriginal(original)}
              className={cn('min-h-10 rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-monokai-green', showOriginal === original ? 'bg-monokai-green text-monokai-bg' : 'text-monokai-fg/70 hover:bg-monokai-fg/10')}
            >
              {original ? beforeLabel : afterLabel}
            </button>
          ))}
        </div>
      </div>
      <div
        className="relative mx-auto h-[clamp(12rem,42svh,24rem)] w-full overflow-hidden rounded-xl border border-monokai-fg/10"
        style={checkerboard}
      >
        <img
          src={showOriginal ? originalUrl : resultUrl}
          alt={showOriginal ? originalAlt : resultAlt}
          className="h-full w-full object-contain"
          draggable={false}
        />
      </div>
    </figure>
  );
}
