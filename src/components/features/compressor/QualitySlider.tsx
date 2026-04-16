import { useId, type ChangeEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
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
  id,
  value,
  onChange,
  min = 0.1,
  max = 1,
  step = 0.1,
  copy,
  orientation = 'horizontal',
  compact = false,
  showTitle = true,
  showApplyButton = false,
  onApply,
  applyLabel = 'OK',
  applyDisabled = false,
  valueMode = 'percent',
  valueSuffix,
  showRawValue = true,
  showMinLabel = true,
  showMaxLabel = true,
  minLabel,
  maxLabel,
}: QualitySliderProps) {
  const generatedId = useId();
  const sliderId = id ?? generatedId;
  const resolvedCopy: QualitySliderCopy = { ...DEFAULT_COPY, ...copy };
  const normalizedValue = clampValue(value, min, max);
  const percentage = Math.round(normalizedValue * 100);
  const isVertical = orientation === 'vertical';
  const roundedNumericValue = Math.round(normalizedValue);

  const resolvedValueText = valueMode === 'percent'
    ? (showRawValue ? `${normalizedValue.toFixed(1)} / ${percentage}%` : `${percentage}%`)
    : `${roundedNumericValue}${valueSuffix ? ` ${valueSuffix}` : ''}`;

  const resolvedMinLabel = minLabel
    ?? (valueMode === 'percent' ? `${Math.round(min * 100)}%` : `${Math.round(min)}`);

  const resolvedMaxLabel = maxLabel
    ?? (valueMode === 'percent' ? `${Math.round(max * 100)}%` : `${Math.round(max)}`);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <section className={cn('w-full', isVertical ? 'max-w-[9rem] lg:h-[28rem]' : 'max-w-5xl mx-auto')}>
      <Card
        variant="border"
        padding={compact ? 'sm' : 'md'}
        className={cn('border-monokai-cyan/40 bg-monokai-bg/50', isVertical && 'h-full')}
      >
        <div className={cn(isVertical ? 'flex h-full flex-col space-y-3' : 'space-y-4')}>
          {showTitle ? (
            <div>
              <h3
                className={cn(
                  'font-semibold text-monokai-cyan',
                  compact || isVertical ? 'text-sm md:text-base' : 'text-xl md:text-2xl'
                )}
              >
                {resolvedCopy.title}
              </h3>
              {!isVertical ? (
                <p className="mt-1 text-sm md:text-base text-monokai-fg/70">
                  {resolvedCopy.description}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className={cn('space-y-2', isVertical && 'flex flex-1 flex-col')}>
            <label
              htmlFor={sliderId}
              className={cn(
                'text-sm font-medium text-monokai-fg',
                isVertical
                  ? 'flex flex-col items-center gap-1'
                  : 'flex items-center justify-between'
              )}
            >
              <span>{resolvedCopy.valueLabel}</span>
              <span className="font-semibold text-monokai-purple">
                {resolvedValueText}
              </span>
            </label>

            {isVertical ? (
              <div className="mx-auto flex flex-1 items-center justify-center">
                <input
                  id={sliderId}
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={normalizedValue}
                  onChange={handleChange}
                  className="h-full max-h-[16rem] w-2 cursor-pointer appearance-none rounded-lg bg-monokai-fg/20 accent-monokai-cyan [writing-mode:vertical-lr]"
                  style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  aria-label={resolvedCopy.valueLabel}
                  aria-valuemin={min}
                  aria-valuemax={max}
                  aria-valuenow={normalizedValue}
                  aria-valuetext={resolvedValueText}
                />
              </div>
            ) : (
              <input
                id={sliderId}
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
                aria-valuetext={resolvedValueText}
              />
            )}

            {(showMinLabel || showMaxLabel) ? (
              <div
                className={cn(
                  'text-xs text-monokai-fg/60',
                  isVertical
                    ? 'space-y-1 text-center'
                    : (showMinLabel && showMaxLabel ? 'flex justify-between' : 'flex justify-center')
                )}
              >
                {showMinLabel ? <span>{resolvedMinLabel}</span> : null}
                {showMaxLabel ? <span>{resolvedMaxLabel}</span> : null}
              </div>
            ) : null}

            {showApplyButton ? (
              <div className={cn(isVertical ? 'pt-1 flex justify-center' : 'pt-1 flex justify-end')}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onApply}
                  disabled={applyDisabled}
                  className="min-w-20 border border-monokai-fg/30 bg-transparent text-monokai-fg hover:bg-monokai-fg/10"
                >
                  {applyLabel}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </section>
  );
}
