import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CheckCircle2,
  Clipboard,
  Download,
  ImagePlus,
  Info,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { BackgroundComparison } from './BackgroundComparison';
import { Button } from '@/components/ui/Button';
import { useBackgroundRemoval } from '@/hooks/useBackgroundRemoval';
import {
  backgroundRemovalFilename,
  encodeBackgroundRemovalOutput,
} from '@/lib/background-removal';
import type {
  BackgroundRemovalOutputFormat,
  BackgroundRemovalResolution,
} from '@/lib/background-removal/image-output';
import { showError, showSuccess } from '@/lib/toast';
import { cn, formatBytes } from '@/lib/utils';
import type { BackgroundRemoverPanelProps } from '@/types';

const ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};
const MAX_FILE_SIZE = 25 * 1024 * 1024;

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

export function BackgroundRemoverPanel({ copy }: BackgroundRemoverPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [resolution, setResolution] = useState<BackgroundRemovalResolution>('original');
  const [outputFormat, setOutputFormat] = useState<BackgroundRemovalOutputFormat>('image/png');
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const engine = useBackgroundRemoval();
  const originalUrl = useObjectUrl(file);
  const resultUrl = useObjectUrl(engine.result?.output ?? null);
  const isBusy = engine.status === 'preparing' || engine.status === 'processing';

  const clearImage = useCallback(() => {
    engine.clear();
    setFile(null);
    setDimensions(null);
  }, [engine]);

  const selectFile = useCallback((nextFile: File, source: 'picker' | 'paste' = 'picker') => {
    if (!isSupportedImage(nextFile)) {
      showError(nextFile.size > MAX_FILE_SIZE ? copy.sizeErrorLabel : copy.typeErrorLabel);
      return;
    }

    engine.clear();
    setFile(nextFile);
    setDimensions(null);
    if (source === 'paste') showSuccess(copy.pasteSuccessLabel);
  }, [copy.pasteSuccessLabel, copy.sizeErrorLabel, copy.typeErrorLabel, engine]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const nextFile = acceptedFiles[0];
    if (nextFile) selectFile(nextFile);
  }, [selectFile]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPT,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: isBusy,
    noClick: true,
    onDrop,
    onDropRejected: (rejections) => {
      const tooLarge = rejections.some((item) => item.errors.some((error) => error.code === 'file-too-large'));
      showError(tooLarge ? copy.sizeErrorLabel : copy.typeErrorLabel);
    },
  });

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if (isBusy) return;
      const imageItem = Array.from(event.clipboardData?.items ?? [])
        .find((item) => item.kind === 'file' && item.type.startsWith('image/'));
      const pastedFile = imageItem?.getAsFile();
      if (!pastedFile) return;
      event.preventDefault();
      selectFile(pastedFile, 'paste');
    };

    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [isBusy, selectFile]);

  const handleProcess = useCallback(() => {
    if (file && !isBusy) void engine.process(file, resolution);
  }, [engine, file, isBusy, resolution]);

  const handleDownload = useCallback(async () => {
    if (!engine.result?.output || !file || isSaving) return;
    setIsSaving(true);
    try {
      const output = await encodeBackgroundRemovalOutput(engine.result.output, outputFormat);
      const fileSaver = await import('file-saver');
      const saveAs = fileSaver.saveAs ?? fileSaver.default?.saveAs;
      if (typeof saveAs !== 'function') throw new Error(copy.exportErrorLabel);
      saveAs(output, backgroundRemovalFilename(file.name, outputFormat));
    } catch {
      showError(copy.exportErrorLabel);
    } finally {
      setIsSaving(false);
    }
  }, [copy.exportErrorLabel, engine.result?.output, file, isSaving, outputFormat]);

  const progressPercent = useMemo(() => {
    const { current, total } = engine.progress ?? {};
    if (typeof current !== 'number' || typeof total !== 'number' || total <= 0) return null;
    return Math.max(0, Math.min(100, Math.round((current / total) * 100)));
  }, [engine.progress]);

  const stageLabel = engine.status === 'preparing'
    ? copy.stageLabels.preparing
    : engine.progress
      ? copy.stageLabels[engine.progress.stage]
      : copy.processingLabel;
  const modelLabel = engine.modelSource === 'cache'
    ? copy.cachedModelLabel
    : engine.modelSource === 'network'
      ? copy.downloadingModelLabel
      : copy.modelReadyLabel;
  const errorMessage = engine.error ? copy.errors[engine.error.code] ?? copy.errors.unknown : null;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      {!file ? (
        <section
          {...getRootProps({
            role: 'region',
            tabIndex: -1,
            className: cn(
              'relative overflow-hidden rounded-3xl border-2 border-dashed px-5 py-12 text-center transition-all md:px-10 md:py-16',
              'border-monokai-green/40 bg-monokai-bg/65 shadow-xl shadow-black/5',
              'focus-within:ring-2 focus-within:ring-monokai-green focus-within:ring-offset-2 focus-within:ring-offset-monokai-bg',
              isDragActive && 'scale-[1.01] border-monokai-green bg-monokai-green/10',
            ),
          })}
          aria-label={copy.uploadTitle}
        >
          <input {...getInputProps()} aria-hidden="true" tabIndex={-1} />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-monokai-green/10 blur-3xl" />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-monokai-green/35 bg-monokai-green/10 px-3 py-1.5 text-xs font-semibold text-monokai-green">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {copy.privacyLabel}
            </span>
            <span className="grid h-20 w-20 place-items-center rounded-3xl border border-monokai-green/35 bg-monokai-green/10 text-monokai-green shadow-lg shadow-monokai-green/10">
              <ImagePlus className="h-9 w-9" aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-2xl font-bold text-monokai-fg md:text-3xl">{copy.uploadTitle}</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-monokai-fg/70 md:text-base">{copy.uploadDescription}</p>
            <Button
              type="button"
              onClick={open}
              size="lg"
              className="mt-7 min-w-52 !bg-monokai-green font-bold !text-monokai-bg hover:!bg-monokai-green/85"
              icon={<ImagePlus className="h-5 w-5" />}
            >
              {copy.uploadButton}
            </Button>
            <p className="mt-4 text-sm text-monokai-fg/65">{copy.dropLabel}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-monokai-fg/65">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-monokai-fg/15 px-3 py-1.5">
                <Clipboard className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.pasteLabel}
              </span>
              <span className="rounded-full border border-monokai-fg/15 px-3 py-1.5">{copy.formatsLabel}</span>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-monokai-fg/15 bg-monokai-bg/60 p-4 shadow-xl shadow-black/5 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {originalUrl ? (
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-monokai-fg/15 bg-monokai-fg/5">
                <img
                  src={originalUrl}
                  alt={file.name}
                  className="h-full w-full object-cover"
                  onLoad={(event) => setDimensions({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  })}
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-monokai-fg">{file.name}</p>
              <p className="mt-1 text-xs text-monokai-fg/60">
                {dimensions ? `${dimensions.width} × ${dimensions.height} · ` : ''}{formatBytes(file.size)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-monokai-fg/55">{copy.memoryNote}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={open} disabled={isBusy} icon={<RefreshCw className="h-4 w-4" />}>
                {copy.replaceLabel}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clearImage} disabled={isBusy} icon={<Trash2 className="h-4 w-4" />} className="text-monokai-pink">
                {copy.removeLabel}
              </Button>
            </div>
          </div>

          {!engine.result ? (
            <div className="mt-6 grid gap-5 border-t border-monokai-fg/10 pt-5 lg:grid-cols-[1.4fr_.8fr]">
              <fieldset disabled={isBusy}>
                <legend className="mb-3 text-sm font-semibold text-monokai-fg">{copy.resolutionLabel}</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(Object.keys(copy.resolutionOptions) as BackgroundRemovalResolution[]).map((option) => (
                    <label key={option} className={cn(
                      'cursor-pointer rounded-xl border p-3 transition-colors',
                      resolution === option ? 'border-monokai-green bg-monokai-green/10' : 'border-monokai-fg/15 hover:border-monokai-green/45',
                    )}>
                      <input type="radio" name="resolution" value={option} checked={resolution === option} onChange={() => setResolution(option)} className="sr-only" />
                      <span className="block text-sm font-semibold text-monokai-fg">{copy.resolutionOptions[option].label}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-monokai-fg/55">{copy.resolutionOptions[option].description}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset disabled={isBusy}>
                <legend className="mb-3 text-sm font-semibold text-monokai-fg">{copy.formatLabel}</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(['image/png', 'image/webp'] as BackgroundRemovalOutputFormat[]).map((format) => (
                    <label key={format} className={cn(
                      'cursor-pointer rounded-xl border p-3 text-center text-sm font-semibold transition-colors',
                      outputFormat === format ? 'border-monokai-green bg-monokai-green/10 text-monokai-green' : 'border-monokai-fg/15 text-monokai-fg',
                    )}>
                      <input type="radio" name="output-format" value={format} checked={outputFormat === format} onChange={() => setOutputFormat(format)} className="sr-only" />
                      {format === 'image/png' ? copy.formatOptions.png : copy.formatOptions.webp}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          ) : null}

          {isBusy ? (
            <div className="mt-6 rounded-2xl border border-monokai-green/25 bg-monokai-green/5 p-5" role="status" aria-live="polite">
              <div className="flex items-start gap-3">
                <LoaderCircle className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-monokai-green" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-monokai-fg">{stageLabel}</p>
                  <p className="mt-1 text-xs text-monokai-fg/60">{modelLabel}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-monokai-fg/10" aria-label={copy.progressLabel}>
                    <div
                      className={cn('h-full rounded-full bg-monokai-green transition-[width]', progressPercent === null && 'w-1/3 animate-pulse')}
                      style={progressPercent === null ? undefined : { width: `${progressPercent}%` }}
                    />
                  </div>
                  {progressPercent !== null ? <p className="mt-1 text-right text-xs text-monokai-fg/55">{progressPercent}%</p> : null}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={engine.cancel} icon={<X className="h-4 w-4" />}>
                  {copy.cancelLabel}
                </Button>
              </div>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-6 rounded-2xl border border-monokai-pink/35 bg-monokai-pink/5 p-5" role="alert">
              <p className="font-semibold text-monokai-pink">{errorMessage}</p>
              <Button type="button" variant="ghost" size="sm" onClick={handleProcess} className="mt-3 border border-monokai-pink/35 text-monokai-pink" icon={<RefreshCw className="h-4 w-4" />}>
                {copy.retryLabel}
              </Button>
            </div>
          ) : null}

          {!isBusy && !engine.result ? (
            <div className="mt-6 flex justify-center">
              <Button type="button" size="lg" onClick={handleProcess} className="min-w-56 !bg-monokai-green font-bold !text-monokai-bg hover:!bg-monokai-green/85" icon={<Sparkles className="h-5 w-5" />}>
                {copy.processLabel}
              </Button>
            </div>
          ) : null}
        </section>
      )}

      {file && engine.result && originalUrl && resultUrl ? (
        <section className="space-y-5 rounded-3xl border border-monokai-green/25 bg-monokai-bg/60 p-4 shadow-xl shadow-black/5 md:p-6">
          <div className="flex items-center gap-2 text-monokai-green">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-lg font-bold">{copy.afterLabel}</h2>
          </div>
          <BackgroundComparison
            originalUrl={originalUrl}
            resultUrl={resultUrl}
            originalAlt={`${copy.beforeLabel}: ${file.name}`}
            resultAlt={`${copy.afterLabel}: ${file.name}`}
            beforeLabel={copy.beforeLabel}
            afterLabel={copy.afterLabel}
            comparisonLabel={copy.comparisonLabel}
          />
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" size="lg" onClick={handleDownload} loading={isSaving} icon={<Download className="h-5 w-5" />} className="!bg-monokai-green font-bold !text-monokai-bg hover:!bg-monokai-green/85">
              {copy.downloadLabel}
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={clearImage} icon={<ImagePlus className="h-5 w-5" />}>
              {copy.newImageLabel}
            </Button>
          </div>
        </section>
      ) : null}

      {file && (engine.activeRoute || engine.result) ? (
        <details className="rounded-2xl border border-monokai-fg/15 bg-monokai-bg/45 p-4 text-sm text-monokai-fg/70">
          <summary className="cursor-pointer list-none font-semibold text-monokai-fg">
            <span className="inline-flex items-center gap-2"><Info className="h-4 w-4" aria-hidden="true" />{copy.diagnosticsLabel}</span>
          </summary>
          <dl className="mt-4 grid gap-2 sm:grid-cols-3">
            <div><dt className="text-xs text-monokai-fg/50">{copy.routeLabel}</dt><dd>{engine.activeRoute ? `${engine.activeRoute.device.toUpperCase()} · ${engine.activeRoute.model}` : '—'}</dd></div>
            <div><dt className="text-xs text-monokai-fg/50">{copy.attemptsLabel}</dt><dd>{engine.result?.attempts.length ?? 1}</dd></div>
            <div><dt className="text-xs text-monokai-fg/50">{copy.dimensionsLabel}</dt><dd>{dimensions ? `${dimensions.width} × ${dimensions.height}` : '—'}</dd></div>
          </dl>
        </details>
      ) : null}
    </div>
  );
}
