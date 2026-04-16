import { useCallback, useMemo, useState } from 'react';
import JSZip from 'jszip';
import { UploadZone } from './UploadZone';
import { ImagePreview } from './ImagePreview';
import { Button } from '@/components/ui/Button';
import {
  CONVERTER_INPUT_FORMATS,
  CONVERTER_OUTPUT_FORMATS,
  convertImageFile,
  type ConverterOutputMimeType,
} from '@/lib/imageConversion';
import { showError, showSuccess, showWarning } from '@/lib/toast';
import type {
  ConverterPanelCopy,
  ConverterPanelProps,
  ImagePreviewCompressionMeta,
  UploadZoneCopy,
} from '@/types';

interface SelectedFileItem {
  id: string;
  file: File;
}

interface ConvertedFileEntry {
  outputFormat: ConverterOutputMimeType;
  outputFile: File;
  animationDiscarded: boolean;
}

type SaveFileFunction = (data: Blob | File, filename?: string) => void;

const DEFAULT_UPLOAD_COPY: UploadZoneCopy = {
  title: 'Sube tus imágenes',
  description: 'Arrastra archivos aquí para seleccionar.',
  idleLabel: 'Arrastra imágenes aquí para convertir',
  draggingLabel: 'Suelta los archivos para convertir',
  processingLabel: 'Convirtiendo archivos...',
  helperLabel: 'Formatos compatibles: HEIC, JPG/JPEG/JFIF, PNG, WebP, GIF, BMP, TIFF, AVIF e ICO',
  addMoreLabel: 'Agregar',
  clearAllLabel: 'Borrar',
  compressLabel: 'Convertir',
  saveLabel: 'Guardar',
  saveAllLabel: 'Guardar todo',
  savingLabel: 'Guardando...',
  successLabel: '{count} imagen(es) cargada(s) correctamente.',
  sizeErrorLabel: 'Archivo demasiado grande. Máximo 10 MB.',
  typeErrorLabel: 'Formato no compatible para conversion.',
};

const DEFAULT_CONVERTER_COPY: ConverterPanelCopy = {
  outputLabel: 'Formato de salida',
  convertLabel: 'Convertir',
  convertingLabel: 'Convirtiendo...',
  saveAllLabel: 'Guardar todo',
  savingLabel: 'Guardando...',
  convertedBadgeLabel: 'Convertidos',
  pendingBadgeLabel: 'Pendientes',
  noPendingLabel: 'No hay archivos pendientes por convertir.',
  successLabel: '{count} archivo(s) convertido(s).',
  partialErrorLabel: 'No se pudo convertir uno o mas archivos.',
  saveSuccessLabel: 'Archivos convertidos guardados correctamente.',
  saveErrorLabel: 'No se pudieron guardar los archivos convertidos.',
  animatedGifWarningLabel: 'Se detectaron {count} GIF animado(s). Se exporto solo el primer fotograma.',
  gifStrategyLabel: 'Nota GIF: si el archivo es animado, la conversion exporta el primer fotograma para mantener compatibilidad de salida.',
  outputFormats: {
    jpg: 'JPG',
    png: 'PNG',
    webp: 'WebP',
    avif: 'AVIF',
  },
};

function createFileId(): string {
  const randomUUID = globalThis.crypto?.randomUUID;

  if (typeof randomUUID === 'function') {
    return randomUUID.call(globalThis.crypto);
  }

  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function resolveSaveFileFunction(): Promise<SaveFileFunction> {
  const fileSaverModule = await import('file-saver');
  const saveFile = fileSaverModule.saveAs ?? fileSaverModule.default?.saveAs;

  if (typeof saveFile !== 'function') {
    throw new Error('No se pudo inicializar el guardado de archivos.');
  }

  return saveFile;
}

function getOutputFormatLabel(
  mimeType: ConverterOutputMimeType,
  copy: ConverterPanelCopy['outputFormats']
): string {
  switch (mimeType) {
    case 'image/jpeg':
      return copy.jpg;
    case 'image/png':
      return copy.png;
    case 'image/webp':
      return copy.webp;
    case 'image/avif':
      return copy.avif;
    default:
      return mimeType;
  }
}

export function ConverterPanel({
  uploadCopy,
  previewCopy,
  converterCopy,
}: ConverterPanelProps) {
  const resolvedUploadCopy = useMemo<UploadZoneCopy>(
    () => ({ ...DEFAULT_UPLOAD_COPY, ...uploadCopy }),
    [uploadCopy]
  );

  const resolvedConverterCopy = useMemo<ConverterPanelCopy>(
    () => ({
      ...DEFAULT_CONVERTER_COPY,
      ...converterCopy,
      outputFormats: {
        ...DEFAULT_CONVERTER_COPY.outputFormats,
        ...converterCopy?.outputFormats,
      },
    }),
    [converterCopy]
  );

  const [files, setFiles] = useState<SelectedFileItem[]>([]);
  const [outputFormat, setOutputFormat] = useState<ConverterOutputMimeType>('image/png');
  const [convertedById, setConvertedById] = useState<Record<string, ConvertedFileEntry>>({});
  const [isConverting, setIsConverting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const pendingFiles = useMemo(
    () => files.filter((item) => convertedById[item.id]?.outputFormat !== outputFormat),
    [convertedById, files, outputFormat]
  );

  const convertedEntries = useMemo(
    () => files.flatMap((item) => {
      const converted = convertedById[item.id];

      if (!converted || converted.outputFormat !== outputFormat) {
        return [];
      }

      return [{
        id: item.id,
        inputFile: item.file,
        ...converted,
      }];
    }),
    [convertedById, files, outputFormat]
  );

  const conversionMetaByIndex = useMemo<Array<ImagePreviewCompressionMeta | undefined>>(
    () => files.map((item) => ({
      isCompressed: convertedById[item.id]?.outputFormat === outputFormat,
      savingsPercent: 0,
    })),
    [convertedById, files, outputFormat]
  );

  const canConvert = pendingFiles.length > 0 && !isConverting && !isSaving;
  const canSave = convertedEntries.length > 0 && !isConverting && !isSaving;

  const handleFilesSelected = useCallback((incomingFiles: File[]) => {
    if (incomingFiles.length === 0) {
      return;
    }

    setFiles((previousFiles) => [
      ...previousFiles,
      ...incomingFiles.map((file) => ({
        id: createFileId(),
        file,
      })),
    ]);
  }, []);

  const handleConvert = useCallback(async () => {
    if (pendingFiles.length === 0 || isConverting || isSaving) {
      if (pendingFiles.length === 0 && !isConverting && !isSaving) {
        showSuccess(resolvedConverterCopy.noPendingLabel);
      }

      return;
    }

    setIsConverting(true);

    try {
      const nextConvertedById = { ...convertedById };
      let successCount = 0;
      let errorCount = 0;
      let animatedGifCount = 0;

      for (const pendingFile of pendingFiles) {
        try {
          const conversion = await convertImageFile(pendingFile.file, {
            outputMimeType: outputFormat,
            quality: 0.92,
          });

          nextConvertedById[pendingFile.id] = {
            outputFormat,
            outputFile: conversion.outputFile,
            animationDiscarded: conversion.animationDiscarded,
          };

          successCount += 1;

          if (conversion.animationDiscarded) {
            animatedGifCount += 1;
          }
        } catch {
          errorCount += 1;
        }
      }

      setConvertedById(nextConvertedById);

      if (successCount > 0) {
        showSuccess(resolvedConverterCopy.successLabel.replace('{count}', String(successCount)));
      }

      if (animatedGifCount > 0) {
        showWarning(
          resolvedConverterCopy.animatedGifWarningLabel.replace(
            '{count}',
            String(animatedGifCount)
          )
        );
      }

      if (errorCount > 0) {
        showError(resolvedConverterCopy.partialErrorLabel);
      }
    } finally {
      setIsConverting(false);
    }
  }, [
    convertedById,
    isConverting,
    isSaving,
    outputFormat,
    pendingFiles,
    resolvedConverterCopy.animatedGifWarningLabel,
    resolvedConverterCopy.noPendingLabel,
    resolvedConverterCopy.partialErrorLabel,
    resolvedConverterCopy.successLabel,
  ]);

  const handleSaveAll = useCallback(async () => {
    if (!canSave) {
      return;
    }

    setIsSaving(true);

    try {
      const saveFile = await resolveSaveFileFunction();

      if (convertedEntries.length === 1) {
        const [singleResult] = convertedEntries;
        saveFile(singleResult.outputFile, singleResult.outputFile.name);
      } else {
        const zip = new JSZip();

        convertedEntries.forEach((result, index) => {
          const filename = result.outputFile.name;
          const uniqueName = zip.file(filename) ? `${index + 1}-${filename}` : filename;
          zip.file(uniqueName, result.outputFile);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveFile(zipBlob, 'pixel-crunch-convertidas.zip');
      }

      showSuccess(resolvedConverterCopy.saveSuccessLabel);
    } catch {
      showError(resolvedConverterCopy.saveErrorLabel);
    } finally {
      setIsSaving(false);
    }
  }, [canSave, convertedEntries, resolvedConverterCopy.saveErrorLabel, resolvedConverterCopy.saveSuccessLabel]);

  const handleSaveSingle = useCallback(async (index: number) => {
    if (isConverting || isSaving) {
      return;
    }

    const targetFile = files[index];
    if (!targetFile) {
      return;
    }

    const convertedEntry = convertedById[targetFile.id];
    if (!convertedEntry || convertedEntry.outputFormat !== outputFormat) {
      return;
    }

    setIsSaving(true);

    try {
      const saveFile = await resolveSaveFileFunction();
      saveFile(convertedEntry.outputFile, convertedEntry.outputFile.name);
      showSuccess(resolvedConverterCopy.saveSuccessLabel);
    } catch {
      showError(resolvedConverterCopy.saveErrorLabel);
    } finally {
      setIsSaving(false);
    }
  }, [
    convertedById,
    files,
    isConverting,
    isSaving,
    outputFormat,
    resolvedConverterCopy.saveErrorLabel,
    resolvedConverterCopy.saveSuccessLabel,
  ]);

  const handleRemove = useCallback((indexToRemove: number) => {
    setFiles((previousFiles) => {
      const removedItem = previousFiles[indexToRemove];
      const nextFiles = previousFiles.filter((_, index) => index !== indexToRemove);

      if (!removedItem) {
        return nextFiles;
      }

      setConvertedById((previousConvertedById) => {
        if (!previousConvertedById[removedItem.id]) {
          return previousConvertedById;
        }

        const nextConvertedById = { ...previousConvertedById };
        delete nextConvertedById[removedItem.id];
        return nextConvertedById;
      });

      return nextFiles;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setConvertedById({});
  }, []);

  return (
    <div className="space-y-4">
      <UploadZone
        onFilesSelected={handleFilesSelected}
        acceptedFormats={CONVERTER_INPUT_FORMATS}
        isProcessing={isConverting}
        hasFiles={files.length > 0}
        onClearAll={handleClearAll}
        copy={resolvedUploadCopy}
        footerActions={(
          <div className="flex w-full flex-col gap-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-monokai-fg/70">
                {resolvedConverterCopy.outputLabel}
              </span>

              {CONVERTER_OUTPUT_FORMATS.map((format) => {
                const selected = outputFormat === format.mimeType;

                return (
                  <Button
                    key={format.mimeType}
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isConverting || isSaving}
                    onClick={() => setOutputFormat(format.mimeType)}
                    className={selected
                      ? 'border border-monokai-cyan/45 bg-monokai-cyan/10 text-monokai-cyan'
                      : 'border border-monokai-fg/25 text-monokai-fg/75 hover:border-monokai-cyan/35 hover:text-monokai-cyan'}
                  >
                    {getOutputFormatLabel(format.mimeType, resolvedConverterCopy.outputFormats)}
                  </Button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleConvert}
                disabled={!canConvert}
                loading={isConverting}
                className="relative min-w-32 border border-monokai-cyan/45 bg-transparent font-semibold text-monokai-cyan hover:bg-monokai-cyan/10"
              >
                {isConverting ? resolvedConverterCopy.convertingLabel : resolvedConverterCopy.convertLabel}
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-monokai-cyan px-1 text-[11px] font-bold text-monokai-bg">
                  {pendingFiles.length}
                </span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSaveAll}
                disabled={!canSave}
                loading={isSaving}
                className="relative min-w-32 border border-monokai-green/45 bg-transparent font-semibold text-monokai-green hover:bg-monokai-green/10"
              >
                {isSaving ? resolvedConverterCopy.savingLabel : resolvedConverterCopy.saveAllLabel}
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-monokai-green px-1 text-[11px] font-bold text-monokai-bg">
                  {convertedEntries.length}
                </span>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-monokai-fg/65">
              <span>
                {resolvedConverterCopy.pendingBadgeLabel}: {pendingFiles.length}
              </span>
              <span>
                {resolvedConverterCopy.convertedBadgeLabel}: {convertedEntries.length}
              </span>
            </div>

            <p className="text-center text-xs text-monokai-fg/60">
              {resolvedConverterCopy.gifStrategyLabel}
            </p>
          </div>
        )}
      >
        <ImagePreview
          files={files.map((item) => item.file)}
          onRemove={handleRemove}
          onSaveSingle={handleSaveSingle}
          disableSaveSingle={isConverting || isSaving}
          copy={previewCopy}
          layout="strip"
          compact
          compressionMetaByIndex={conversionMetaByIndex}
        />
      </UploadZone>
    </div>
  );
}
