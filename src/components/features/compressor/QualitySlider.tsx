import type { ChangeEvent } from 'react';
import { Card } from '@/components/ui/Card';
import type { QualitySliderCopy, QualitySliderProps } from '@/types';

const DEFAULT_COPY: QualitySliderCopy = {
  title: 'Calidad de compresión',
  description: 'Ajusta la calidad de salida antes de comprimir.',
  valueLabel: 'Calidad',
};

function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function QualitySlider({
  value,
  onChange,
  min = 0.1,
  max = 1,
  step = 0.1,
  copy,
}: QualitySliderProps) {
  const resolvedCopy: QualitySliderCopy = { ...DEFAULT_COPY, ...copy };
  const normalizedValue = clampValue(value, min, max);
  const percentage = Math.round(normalizedValue * 100);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <section className="w-full max-w-5xl mx-auto" aria-live="polite">
      <Card
        variant="border"
        className="border-monokai-cyan/40 bg-monokai-bg/50"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold text-monokai-cyan">
              {resolvedCopy.title}
            </h3>
            <p className="mt-1 text-sm md:text-base text-monokai-fg/70">
              {resolvedCopy.description}
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="quality-slider"
              className="flex items-center justify-between text-sm font-medium text-monokai-fg"
            >
              <span>{resolvedCopy.valueLabel}</span>
              <span className="font-semibold text-monokai-purple">
                {normalizedValue.toFixed(1)} / {percentage}%
              </span>
            </label>

            <input
              id="quality-slider"
              type="range"
              min={min}
              max={max}
              step={step}
              value={normalizedValue}
              onChange={handleChange}
              className="w-full accent-monokai-cyan"
              aria-label={resolvedCopy.valueLabel}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={normalizedValue}
              aria-valuetext={`${normalizedValue.toFixed(1)} (${percentage}%)`}
            />

            <div className="flex justify-between text-xs text-monokai-fg/60">
              <span>{min.toFixed(1)} ({Math.round(min * 100)}%)</span>
              <span>{max.toFixed(1)} ({Math.round(max * 100)}%)</span>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
