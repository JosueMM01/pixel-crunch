import { useState } from 'react';

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
  const [position, setPosition] = useState(50);

  return (
    <figure className="space-y-3">
      <div
        className="relative mx-auto aspect-square w-full max-w-2xl overflow-hidden rounded-2xl border border-monokai-green/30 shadow-xl shadow-black/10"
        style={checkerboard}
      >
        <img
          src={originalUrl}
          alt={originalAlt}
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          aria-hidden="true"
        >
          <img
            src={resultUrl}
            alt=""
            className="h-full w-full object-contain"
            draggable={false}
          />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,.35)]"
          style={{ left: `calc(${position}% - 1px)` }}
          aria-hidden="true"
        >
          <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-monokai-bg/90 text-sm font-bold text-monokai-fg shadow-lg">
            ↔
          </span>
        </div>

        <span className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white">
          {afterLabel}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white">
          {beforeLabel}
        </span>
      </div>

      <label className="block">
        <span className="sr-only">{comparisonLabel}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(event) => setPosition(Number(event.currentTarget.value))}
          className="w-full accent-monokai-green"
          aria-label={comparisonLabel}
        />
      </label>
      <p className="sr-only" aria-live="polite">{resultAlt}</p>
    </figure>
  );
}
