import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Clipboard, Download, ImagePlus, Info, LoaderCircle, Paintbrush, RefreshCw, ShieldCheck, Sparkles, Trash2, X } from 'lucide-react';
import { BackgroundComparison } from './BackgroundComparison';
import { BackgroundImageQueue } from './BackgroundImageQueue';
import { BackgroundMaskEditor } from './BackgroundMaskEditor';
import { Button } from '@/components/ui/Button';
import { useBackgroundRemoval } from '@/hooks/useBackgroundRemoval';
import { backgroundRemovalFilename, encodeBackgroundRemovalOutput, detectBackgroundRemovalCapabilities, selectBackgroundRemovalRoutes, isBackgroundRemovalRouteCached } from '@/lib/background-removal';
import type { BackgroundRemovalOutputFormat, BackgroundRemovalResolution } from '@/lib/background-removal/image-output';
import { showError, showSuccess } from '@/lib/toast';
import { cn, formatBytes } from '@/lib/utils';
import type { BackgroundRemovalQueueItem, BackgroundRemoverPanelProps } from '@/types';

const ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_FILES = 20;
const MAX_SESSION_SIZE = 200 * 1024 * 1024;

function useObjectUrl(blob: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const nextUrl = URL.createObjectURL(blob);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [blob]);

  return url;
}

function isSupportedImage(file: File): boolean {
  return Object.hasOwn(ACCEPT, file.type) && file.size > 0 && file.size <= MAX_FILE_SIZE;
}

function createQueueItem(file: File): BackgroundRemovalQueueItem {
  return { id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`, file };
}

export function BackgroundRemoverPanel({ copy }: BackgroundRemoverPanelProps) {
  const [items, setItems] = useState<BackgroundRemovalQueueItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [resolution, setResolution] = useState<BackgroundRemovalResolution>('optimized');
  const [outputFormat, setOutputFormat] = useState<BackgroundRemovalOutputFormat>('image/png');
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [needsModelDownload, setNeedsModelDownload] = useState(false);
  const engine = useBackgroundRemoval();
  const activeItem = items.find((item) => item.id === activeId) ?? null;
  const activeOutput = activeItem?.editedOutput ?? activeItem?.result?.output ?? null;
  const originalUrl = useObjectUrl(activeItem?.file ?? null);
  const resultUrl = useObjectUrl(activeOutput);
  const isBusy = engine.status === 'preparing' || engine.status === 'processing';
  const completedResultRef = useRef(engine.result);

  useEffect(() => {
    let cancelled = false;
    setNeedsModelDownload(false);
    if (!activeItem || activeOutput || isBusy) return;
    void detectBackgroundRemovalCapabilities()
      .then((capabilities) => isBackgroundRemovalRouteCached(selectBackgroundRemovalRoutes(capabilities)[0]))
      .then((cached) => { if (!cancelled) setNeedsModelDownload(!cached); })
      .catch(() => { if (!cancelled) setNeedsModelDownload(true); });
    return () => { cancelled = true; };
  }, [activeId, Boolean(activeOutput), isBusy]);

  useEffect(() => {
    if (!engine.result || !processingId || completedResultRef.current === engine.result) return;
    completedResultRef.current = engine.result;
    setItems((current) => current.map((item) => item.id === processingId
      ? { ...item, result: engine.result ?? undefined, editedOutput: undefined }
      : item));
    setProcessingId(null);
    engine.clear();
  }, [engine.clear, engine.result, processingId]);

  const addFiles = useCallback((files: File[], source: 'picker' | 'paste' = 'picker') => {
    const supported = files.filter(isSupportedImage);
    if (supported.length !== files.length) {
      showError(files.some((file) => file.size > MAX_FILE_SIZE) ? copy.sizeErrorLabel : copy.typeErrorLabel);
    }
    if (supported.length === 0) return;

    const remainingSlots = MAX_FILES - items.length;
    if (remainingSlots <= 0) {
      showError(copy.queueLimitErrorLabel);
      return;
    }

    const currentBytes = items.reduce((total, item) => total + item.file.size, 0);
    const nextItems: BackgroundRemovalQueueItem[] = [];
    let nextBytes = currentBytes;
    let reachedSizeLimit = false;
    for (const file of supported.slice(0, remainingSlots)) {
      if (nextBytes + file.size > MAX_SESSION_SIZE) {
        reachedSizeLimit = true;
        continue;
      }
      nextItems.push(createQueueItem(file));
      nextBytes += file.size;
    }

    if (supported.length > remainingSlots) showError(copy.queueLimitErrorLabel);
    else if (reachedSizeLimit) showError(copy.queueSizeErrorLabel);
    if (nextItems.length === 0) return;

    setItems([...items, ...nextItems]);
    if (!activeId) setActiveId(nextItems[0].id);
    if (source === 'paste') showSuccess(copy.pasteSuccessLabel);
  }, [activeId, copy.pasteSuccessLabel, copy.queueLimitErrorLabel, copy.queueSizeErrorLabel, copy.sizeErrorLabel, copy.typeErrorLabel, items]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPT,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: isBusy,
    noClick: true,
    onDrop: (acceptedFiles) => addFiles(acceptedFiles),
    onDropRejected: (rejections) => {
      const tooLarge = rejections.some((item) => item.errors.some((error) => error.code === 'file-too-large'));
      showError(tooLarge ? copy.sizeErrorLabel : copy.typeErrorLabel);
    },
  });

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if (isBusy) return;
      const imageFiles = Array.from(event.clipboardData?.items ?? [])
        .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null);
      if (imageFiles.length === 0) return;
      event.preventDefault();
      addFiles(imageFiles, 'paste');
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addFiles, isBusy]);

  const selectItem = useCallback((id: string) => {
    if (isBusy || id === activeId) return;
    engine.clear();
    setProcessingId(null);
    setDimensions(null);
    setActiveId(id);
  }, [activeId, engine.clear, isBusy]);

  const removeItem = useCallback((id: string) => {
    if (isBusy) return;
    engine.clear();
    setProcessingId(null);
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index < 0) return current;
      const next = current.filter((item) => item.id !== id);
      if (id === activeId) {
        setActiveId(next[Math.min(index, next.length - 1)]?.id ?? '');
        setDimensions(null);
      }
      return next;
    });
  }, [activeId, engine.clear, isBusy]);

  const handleProcess = useCallback(() => {
    if (!activeItem || isBusy) return;
    completedResultRef.current = null;
    setProcessingId(activeItem.id);
    void engine.process(activeItem.file, resolution);
  }, [activeItem, engine.process, isBusy, resolution]);

  const handleDownload = useCallback(async () => {
    if (!activeOutput || !activeItem || isSaving) return;
    setIsSaving(true);
    try {
      const output = await encodeBackgroundRemovalOutput(activeOutput, outputFormat);
      const fileSaver = await import('file-saver');
      const saveAs = fileSaver.saveAs ?? fileSaver.default?.saveAs;
      if (typeof saveAs !== 'function') throw new Error(copy.exportErrorLabel);
      saveAs(output, backgroundRemovalFilename(activeItem.file.name, outputFormat));
    } catch {
      showError(copy.exportErrorLabel);
    } finally {
      setIsSaving(false);
    }
  }, [activeItem, activeOutput, copy.exportErrorLabel, isSaving, outputFormat]);

  const applyEdit = useCallback((output: Blob) => {
    setItems((current) => current.map((item) => item.id === activeId ? { ...item, editedOutput: output } : item));
    setIsEditing(false);
  }, [activeId]);

  const progressPercent = useMemo(() => {
    const { current, total } = engine.progress ?? {};
    if (typeof current !== 'number' || typeof total !== 'number' || total <= 0) return null;
    return Math.max(0, Math.min(100, Math.round((current / total) * 100)));
  }, [engine.progress]);

  const stageLabel = engine.status === 'preparing' ? copy.stageLabels.preparing
    : engine.progress ? copy.stageLabels[engine.progress.stage] : copy.processingLabel;
  const modelLabel = engine.modelSource === 'cache' ? copy.cachedModelLabel
    : engine.modelSource === 'network' ? copy.downloadingModelLabel : copy.modelReadyLabel;
  const errorMessage = engine.error ? copy.errors[engine.error.code] ?? copy.errors.unknown : null;
  const route = activeItem?.result?.route ?? engine.activeRoute;
  const attempts = activeItem?.result?.attempts.length ?? (engine.activeRoute ? 1 : 0);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      {items.length === 0 ? (
        <section {...getRootProps({ role: 'region', tabIndex: -1, className: cn(
          'relative overflow-hidden rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-all md:px-8 md:py-10',
          'border-monokai-green/40 bg-monokai-bg/65 shadow-xl shadow-black/5 focus-within:ring-2 focus-within:ring-monokai-green',
          isDragActive && 'scale-[1.01] border-monokai-green bg-monokai-green/10',
        ) })} aria-label={copy.uploadTitle}>
          <input {...getInputProps()} aria-hidden="true" tabIndex={-1} />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-monokai-green/10 blur-3xl" />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl border border-monokai-green/35 bg-monokai-green/10 text-monokai-green"><ImagePlus className="h-6 w-6" aria-hidden="true" /></span>
            <Button type="button" onClick={open} className="mt-4 min-h-11 w-full max-w-64 !bg-monokai-green text-sm font-bold !text-monokai-bg hover:!bg-monokai-green/85" icon={<ImagePlus className="h-4 w-4" />}>{copy.uploadButton}</Button>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-monokai-fg/70">{copy.uploadDescription}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs text-monokai-fg/60">
              <span className="rounded-full border border-monokai-fg/15 px-3 py-1.5">{copy.dropLabel}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-monokai-fg/15 px-3 py-1.5"><Clipboard className="h-3.5 w-3.5" aria-hidden="true" />{copy.pasteLabel}</span>
            </div>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs text-monokai-green"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />{copy.privacyLabel}</span>
          </div>
        </section>
      ) : activeItem ? (
        <section {...getRootProps({ className: cn('min-w-0 rounded-2xl border border-monokai-fg/15 bg-monokai-bg/60 p-3 shadow-xl shadow-black/5 sm:p-5', isDragActive && 'border-monokai-green bg-monokai-green/5') })}>
          <input {...getInputProps()} aria-hidden="true" tabIndex={-1} />

          <div className="flex items-center gap-3">
            {originalUrl ? <img src={originalUrl} alt="" aria-hidden="true" className="absolute h-px w-px opacity-0" onLoad={(event) => setDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} /> : null}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-monokai-fg">{activeItem.file.name}</p>
              <p className="mt-1 text-xs text-monokai-fg/60">{dimensions ? `${dimensions.width} × ${dimensions.height} · ` : ''}{formatBytes(activeItem.file.size)}</p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(activeId)} disabled={isBusy} icon={<Trash2 className="h-4 w-4" />} className="self-start text-monokai-pink sm:self-auto">{copy.removeLabel}</Button>
          </div>

          {!activeOutput && !isBusy ? (
            <div className="mt-4 grid gap-3 border-t border-monokai-fg/10 pt-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <label className="block text-sm font-semibold text-monokai-fg">
                {copy.resolutionLabel}
                <select value={resolution} onChange={(event) => setResolution(event.currentTarget.value as BackgroundRemovalResolution)} className="mt-2 w-full min-w-0 max-w-full rounded-xl border border-monokai-fg/20 bg-monokai-bg px-3 py-2.5 text-sm text-monokai-fg focus:border-monokai-green focus:outline-none focus:ring-2 focus:ring-monokai-green/30">
                  {(Object.keys(copy.resolutionOptions) as BackgroundRemovalResolution[]).map((option) => <option key={option} value={option}>{copy.resolutionOptions[option].label}</option>)}
                </select>
                <span className="mt-1.5 block text-xs font-normal leading-relaxed text-monokai-fg/55">{copy.resolutionOptions[resolution].description}</span>
              </label>
              <Button type="button" onClick={handleProcess} className="min-h-11 whitespace-nowrap !bg-monokai-green font-bold !text-monokai-bg hover:!bg-monokai-green/85" icon={<Sparkles className="h-5 w-5" />}>{copy.processLabel}</Button>
              {needsModelDownload ? <p role="status" className="text-xs leading-relaxed text-monokai-fg/65 md:col-span-2">{copy.modelDownloadNotice}</p> : null}
            </div>
          ) : null}

          {isBusy ? (
            <div className="mt-5 rounded-2xl border border-monokai-green/25 bg-monokai-green/5 p-5" role="status" aria-live="polite">
              <div className="flex flex-wrap items-start gap-3">
                <LoaderCircle className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-monokai-green" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-monokai-fg">{stageLabel}</p><p className="mt-1 text-xs text-monokai-fg/60">{modelLabel}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-monokai-fg/10" aria-label={copy.progressLabel}><div className={cn('h-full rounded-full bg-monokai-green transition-[width]', progressPercent === null && 'w-1/3 animate-pulse')} style={progressPercent === null ? undefined : { width: `${progressPercent}%` }} /></div>
                  {progressPercent !== null ? <p className="mt-1 text-right text-xs text-monokai-fg/55">{progressPercent}%</p> : null}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={engine.cancel} icon={<X className="h-4 w-4" />}>{copy.cancelLabel}</Button>
              </div>
            </div>
          ) : null}

          {errorMessage ? <div className="mt-5 rounded-2xl border border-monokai-pink/35 bg-monokai-pink/5 p-5" role="alert"><p className="font-semibold text-monokai-pink">{errorMessage}</p><Button type="button" variant="ghost" size="sm" onClick={handleProcess} className="mt-3 border border-monokai-pink/35 text-monokai-pink" icon={<RefreshCw className="h-4 w-4" />}>{copy.retryLabel}</Button></div> : null}

          {activeOutput && originalUrl && resultUrl ? (
            <div className="mt-4 space-y-4 border-t border-monokai-fg/10 pt-4">
              <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
                <label className="sr-only" htmlFor="background-output-format">{copy.formatLabel}</label>
                <select id="background-output-format" value={outputFormat} onChange={(event) => setOutputFormat(event.currentTarget.value as BackgroundRemovalOutputFormat)} className="col-span-2 min-h-11 min-w-0 max-w-full rounded-lg border border-monokai-fg/20 bg-monokai-bg px-3 text-sm font-semibold text-monokai-fg focus:border-monokai-green focus:outline-none focus:ring-2 focus:ring-monokai-green/30">
                  <option value="image/png">{copy.formatOptions.png}</option>
                  <option value="image/webp">{copy.formatOptions.webp}</option>
                </select>
                <Button type="button" onClick={handleDownload} loading={isSaving} icon={<Download className="h-4 w-4" />} className="min-h-11 !bg-monokai-green text-sm font-bold !text-monokai-bg hover:!bg-monokai-green/85">{copy.downloadLabel}</Button>
                <Button type="button" variant="ghost" onClick={() => setIsEditing(true)} icon={<Paintbrush className="h-4 w-4" />} className="min-h-11 text-sm sm:mr-auto sm:order-first">{copy.editLabel}</Button>
              </div>
              <BackgroundComparison key={resultUrl} originalUrl={originalUrl} resultUrl={resultUrl} originalAlt={`${copy.beforeLabel}: ${activeItem.file.name}`} resultAlt={`${copy.afterLabel}: ${activeItem.file.name}`} beforeLabel={copy.beforeLabel} afterLabel={copy.afterLabel} comparisonLabel={copy.comparisonLabel} />
            </div>
          ) : null}
          <div className="mt-4 border-t border-monokai-fg/10 pt-3">
            <BackgroundImageQueue items={items} activeId={activeId} disabled={isBusy} copy={copy} onSelect={selectItem} onRemove={removeItem} onAdd={open} />
          </div>
        </section>
      ) : null}

      {activeItem && route ? (
        <details className="rounded-2xl border border-monokai-fg/15 bg-monokai-bg/45 p-4 text-sm text-monokai-fg/70">
          <summary className="cursor-pointer list-none font-semibold text-monokai-fg"><span className="inline-flex items-center gap-2"><Info className="h-4 w-4" aria-hidden="true" />{copy.diagnosticsLabel}</span></summary>
          <dl className="mt-4 grid gap-2 sm:grid-cols-3">
            <div><dt className="text-xs text-monokai-fg/50">{copy.routeLabel}</dt><dd>{`${route.device.toUpperCase()} · ${route.model}`}</dd></div>
            <div><dt className="text-xs text-monokai-fg/50">{copy.attemptsLabel}</dt><dd>{attempts}</dd></div>
            <div><dt className="text-xs text-monokai-fg/50">{copy.dimensionsLabel}</dt><dd>{dimensions ? `${dimensions.width} × ${dimensions.height}` : '—'}</dd></div>
          </dl>
        </details>
      ) : null}

      {isEditing && activeItem && activeOutput ? (
        <BackgroundMaskEditor original={activeItem.file} result={activeOutput} copy={copy} onApply={applyEdit} onClose={() => setIsEditing(false)} />
      ) : null}
    </div>
  );
}
