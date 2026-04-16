import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ImageComparisonProps {
  originalUrl: string;
  compressedUrl?: string | null;
  originalLabel?: string;
  compressedLabel?: string;
  sliderLabel?: string;
  zoomInLabel?: string;
  zoomOutLabel?: string;
  resetZoomLabel?: string;
  className?: string;
}

const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.05;

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 50;
  }

  return Math.min(100, Math.max(0, value));
}

function clampZoom(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_ZOOM;
  }

  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

export function ImageComparison({
  originalUrl,
  compressedUrl,
  originalLabel = 'Antes',
  compressedLabel = 'Después',
  sliderLabel = 'Comparación antes/después',
  zoomInLabel = 'Acercar',
  zoomOutLabel = 'Alejar',
  resetZoomLabel = 'Restablecer',
  className,
}: ImageComparisonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dividerPosition, setDividerPosition] = useState<number>(50);
  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const finalCompressedUrl = compressedUrl ?? originalUrl;
  const zoomPercent = Math.round(zoom * 100);

  const updateDividerFromClientX = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const relativePosition = ((clientX - rect.left) / rect.width) * 100;
    setDividerPosition(clampPercentage(relativePosition));
  }, []);

  const startDragging = useCallback((clientX: number) => {
    setIsDragging(true);
    updateDividerFromClientX(clientX);
  }, [updateDividerFromClientX]);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      updateDividerFromClientX(event.clientX);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, updateDividerFromClientX]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      setZoom((current) => clampZoom(current + delta));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const imageScaleStyle = useMemo(
    () => ({ transform: `scale(${zoom})` }),
    [zoom]
  );

  return (
    <section className={cn('w-full', className)}>
      <Card variant="border" className="border-monokai-cyan/40 bg-monokai-bg/50 lg:h-[28rem]">
        <div className="space-y-3 lg:flex lg:h-full lg:flex-col">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-monokai-fg">
              {sliderLabel}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-14 text-center text-xs font-semibold text-monokai-purple">
                {zoomPercent}%
              </span>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Minus className="h-4 w-4" />}
                onClick={() => setZoom((current) => clampZoom(current - ZOOM_STEP))}
                aria-label={zoomOutLabel}
                className="h-9 min-w-9 border border-monokai-fg/25 px-2 text-monokai-fg hover:bg-monokai-fg/10"
              >
                <span className="sr-only">{zoomOutLabel}</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setZoom((current) => clampZoom(current + ZOOM_STEP))}
                aria-label={zoomInLabel}
                className="h-9 min-w-9 border border-monokai-fg/25 px-2 text-monokai-fg hover:bg-monokai-fg/10"
              >
                <span className="sr-only">{zoomInLabel}</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<RotateCcw className="h-4 w-4" />}
                onClick={() => setZoom(DEFAULT_ZOOM)}
                aria-label={resetZoomLabel}
                className="h-9 border border-monokai-fg/25 px-3 text-xs text-monokai-fg hover:bg-monokai-fg/10 sm:text-sm whitespace-nowrap"
              >
                {resetZoomLabel}
              </Button>
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative h-[clamp(15rem,40vw,24rem)] overflow-hidden rounded-lg border border-monokai-purple/30 bg-monokai-bg/70 select-none touch-none lg:h-full lg:flex-1"
            onPointerDown={(event) => startDragging(event.clientX)}
          >
            <div className="absolute left-3 top-3 z-10 rounded-md border border-monokai-cyan/40 bg-monokai-bg/80 px-2 py-1 text-xs font-semibold text-monokai-cyan">
              {originalLabel}
            </div>
            <div className="absolute right-3 top-3 z-10 rounded-md border border-monokai-green/40 bg-monokai-bg/80 px-2 py-1 text-xs font-semibold text-monokai-green">
              {compressedLabel}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={finalCompressedUrl}
                alt="Vista comprimida"
                className="h-full w-full object-contain"
                style={imageScaleStyle}
                draggable={false}
              />
            </div>

            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - dividerPosition}% 0 0)` }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={originalUrl}
                  alt="Vista original"
                  className="h-full w-full object-contain"
                  style={imageScaleStyle}
                  draggable={false}
                />
              </div>
            </div>

            <div
              className="pointer-events-none absolute inset-y-0 w-0.5 bg-monokai-fg/90"
              style={{ left: `${dividerPosition}%`, transform: 'translateX(-50%)' }}
            />

            <button
              type="button"
              onPointerDown={(event) => {
                event.stopPropagation();
                startDragging(event.clientX);
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  setDividerPosition((current) => clampPercentage(current - 2));
                }

                if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  setDividerPosition((current) => clampPercentage(current + 2));
                }
              }}
              aria-label={sliderLabel}
              className="absolute top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full border border-monokai-fg/40 bg-monokai-bg/85 text-sm font-bold text-monokai-fg"
              style={{ left: `calc(${dividerPosition}% - 20px)` }}
            >
              <span aria-hidden="true">⇆</span>
            </button>
          </div>
        </div>
      </Card>
    </section>
  );
}
