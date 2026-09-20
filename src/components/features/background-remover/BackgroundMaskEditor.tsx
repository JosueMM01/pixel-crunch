import { useCallback, useEffect, useRef, useState } from 'react';
import { Eraser, RotateCcw, RotateCw, Save, Undo2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { BackgroundRemovalPanelCopy } from '@/types';

type BrushMode = 'erase' | 'restore';
interface Point { x: number; y: number }
interface Stroke { mode: BrushMode; size: number; points: Point[] }

interface BackgroundMaskEditorProps {
  original: Blob;
  result: Blob;
  copy: BackgroundRemovalPanelCopy;
  onApply: (output: Blob) => void;
  onClose: () => void;
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

function traceStroke(context: CanvasRenderingContext2D, stroke: Stroke) {
  const first = stroke.points[0];
  if (!first) return;
  context.beginPath();
  context.moveTo(first.x, first.y);
  for (const point of stroke.points.slice(1)) context.lineTo(point.x, point.y);
  if (stroke.points.length === 1) context.lineTo(first.x + 0.01, first.y + 0.01);
  context.lineWidth = stroke.size;
  context.lineCap = 'round';
  context.lineJoin = 'round';
}

export function BackgroundMaskEditor({ original, result, copy, onApply, onClose }: BackgroundMaskEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalRef = useRef<ImageBitmap | null>(null);
  const resultRef = useRef<ImageBitmap | null>(null);
  const scaledOriginalRef = useRef<HTMLCanvasElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawingRef = useRef(false);
  const draftRef = useRef<Stroke | null>(null);
  const [mode, setMode] = useState<BrushMode>('restore');
  const [brushSize, setBrushSize] = useState(36);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStrokes, setRedoStrokes] = useState<Stroke[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const paintStroke = useCallback((context: CanvasRenderingContext2D, stroke: Stroke) => {
    traceStroke(context, stroke);
    if (stroke.mode === 'erase') {
      context.save();
      context.globalCompositeOperation = 'destination-out';
      context.stroke();
      context.restore();
      return;
    }

    const source = scaledOriginalRef.current;
    const canvas = canvasRef.current;
    if (!source || !canvas) return;
    const pattern = context.createPattern(source, 'no-repeat');
    if (!pattern) return;
    context.save();
    context.strokeStyle = pattern;
    context.stroke();
    context.restore();
  }, []);

  const render = useCallback((history: Stroke[], draft?: Stroke | null) => {
    const canvas = canvasRef.current;
    const base = resultRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !base || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(base, 0, 0, canvas.width, canvas.height);
    for (const stroke of history) paintStroke(context, stroke);
    if (draft) paintStroke(context, draft);
  }, [paintStroke]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([createImageBitmap(original), createImageBitmap(result)]).then(([originalBitmap, resultBitmap]) => {
      if (cancelled) {
        originalBitmap.close();
        resultBitmap.close();
        return;
      }
      originalRef.current = originalBitmap;
      resultRef.current = resultBitmap;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = resultBitmap.width;
      canvas.height = resultBitmap.height;
      const scaledOriginal = document.createElement('canvas');
      scaledOriginal.width = resultBitmap.width;
      scaledOriginal.height = resultBitmap.height;
      scaledOriginal.getContext('2d')?.drawImage(originalBitmap, 0, 0, scaledOriginal.width, scaledOriginal.height);
      scaledOriginalRef.current = scaledOriginal;
      setIsReady(true);
      const context = canvas.getContext('2d');
      context?.drawImage(resultBitmap, 0, 0);
    });

    return () => {
      cancelled = true;
      originalRef.current?.close();
      resultRef.current?.close();
      originalRef.current = null;
      resultRef.current = null;
      scaledOriginalRef.current = null;
    };
  }, [original, result]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? []);
      const first = controls[0];
      const last = controls.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const canvasPoint = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isReady) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    draftRef.current = { mode, size: brushSize, points: [canvasPoint(event)] };
    render(strokes, draftRef.current);
  };

  const moveStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const draft = draftRef.current;
    if (!drawingRef.current || !draft) return;
    draft.points.push(canvasPoint(event));
    render(strokes, draft);
  };

  const endStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drawingRef.current = false;
    const draft = draftRef.current;
    draftRef.current = null;
    if (!draft) return;
    setStrokes((current) => [...current, draft].slice(-30));
    setRedoStrokes([]);
  };

  const undo = () => {
    const removed = strokes.at(-1);
    if (!removed) return;
    const next = strokes.slice(0, -1);
    setStrokes(next);
    setRedoStrokes((current) => [...current, removed]);
    render(next);
  };

  const redo = () => {
    const restored = redoStrokes.at(-1);
    if (!restored) return;
    const next = [...strokes, restored];
    setStrokes(next);
    setRedoStrokes((current) => current.slice(0, -1));
    render(next);
  };

  const apply = () => {
    const canvas = canvasRef.current;
    if (!canvas || isApplying) return;
    setIsApplying(true);
    canvas.toBlob((blob) => {
      setIsApplying(false);
      if (blob) onApply(blob);
    }, 'image/png');
  };

  return (
    <div ref={dialogRef} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm md:p-6" role="dialog" aria-modal="true" aria-labelledby="mask-editor-title">
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-monokai-fg/20 bg-monokai-bg shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-monokai-fg/10 p-4 md:p-5">
          <div><h2 id="mask-editor-title" className="text-lg font-bold text-monokai-fg">{copy.editorTitle}</h2><p className="mt-1 max-w-2xl text-xs leading-relaxed text-monokai-fg/60 md:text-sm">{copy.editorDescription}</p></div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-monokai-fg/70 hover:bg-monokai-fg/10 focus:outline-none focus:ring-2 focus:ring-monokai-green" aria-label={copy.closeEditorLabel}><X className="h-5 w-5" aria-hidden="true" /></button>
        </header>

        <div className="flex flex-wrap items-end gap-3 border-b border-monokai-fg/10 p-3 md:px-5">
          <div className="flex rounded-xl border border-monokai-fg/15 p-1">
            <button type="button" onClick={() => setMode('restore')} className={cn('inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold', mode === 'restore' ? 'bg-monokai-green text-monokai-bg' : 'text-monokai-fg')}><RotateCcw className="h-4 w-4" aria-hidden="true" />{copy.restoreLabel}</button>
            <button type="button" onClick={() => setMode('erase')} className={cn('inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold', mode === 'erase' ? 'bg-monokai-green text-monokai-bg' : 'text-monokai-fg')}><Eraser className="h-4 w-4" aria-hidden="true" />{copy.eraseLabel}</button>
          </div>
          <label className="min-w-40 flex-1 text-xs font-semibold text-monokai-fg md:max-w-64">{copy.brushSizeLabel}<input type="range" min="8" max="160" value={brushSize} onChange={(event) => setBrushSize(Number(event.currentTarget.value))} className="mt-2 block w-full accent-monokai-green" /></label>
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={undo} disabled={strokes.length === 0} icon={<Undo2 className="h-4 w-4" />}>{copy.undoLabel}</Button>
            <Button type="button" variant="ghost" size="sm" onClick={redo} disabled={redoStrokes.length === 0} icon={<RotateCw className="h-4 w-4" />}>{copy.redoLabel}</Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-3 md:p-5" style={checkerboard}>
          <canvas ref={canvasRef} className={cn('mx-auto block max-h-[62vh] max-w-full touch-none object-contain', !isReady && 'min-h-64 animate-pulse bg-monokai-fg/5')} onPointerDown={startStroke} onPointerMove={moveStroke} onPointerUp={endStroke} onPointerCancel={endStroke} />
        </div>

        <footer className="flex justify-end gap-3 border-t border-monokai-fg/10 p-4">
          <Button type="button" variant="ghost" onClick={onClose}>{copy.closeEditorLabel}</Button>
          <Button type="button" onClick={apply} loading={isApplying} disabled={!isReady} icon={<Save className="h-4 w-4" />} className="!bg-monokai-green font-bold !text-monokai-bg">{copy.applyEditLabel}</Button>
        </footer>
      </div>
    </div>
  );
}
