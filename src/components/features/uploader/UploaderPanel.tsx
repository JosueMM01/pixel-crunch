import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import JSZip from 'jszip';
import imageCompression from 'browser-image-compression';
import { ImagePreview } from './ImagePreview';
import { UploadZone } from './UploadZone';
import { CompressionStats, ImageComparison, QualitySlider } from '../compressor';
import { Button } from '@/components/ui/Button';
import { useImageCompression } from '@/hooks/useImageCompression';
import {
  clampGifColorCount,
  compressGifFile,
  decodeGifAnimationFrames,
  DEFAULT_GIF_COLORS,
  getGifMetadata,
  isGifFile,
  MAX_GIF_COLORS,
  MIN_GIF_COLORS,
} from '@/lib/gifCompression';
import { compressSvgFile, isSvgFile } from '@/lib/svgCompression';
import { showError, showSuccess } from '@/lib/toast';
import { formatBytes } from '@/lib/utils';
import type { CompressionResult } from '@/types/compression';
import type {
  CompressionStatsItem,
  ImagePreviewCompressionMeta,
  UploaderPanelProps,
} from '@/types';

interface SelectedFileItem {
  id: string;
  file: File;
  quality: number;
  gifColors: number;
  gifFrameCount?: number;
  gifSourceColorCount?: number;
}

interface CompressedFileEntry {
  quality: number;
  gifColors: number;
  result: CompressionResult;
}

interface GifFramePreviewState {
  width: number;
  height: number;
  originalFrames: Uint8ClampedArray[];
  compressedFrames: Uint8ClampedArray[];
}

type SaveFileFunction = (data: Blob | File, filename?: string) => void;

const DEFAULT_QUALITY = 0.8;
const MIN_QUALITY = 0.1;
const MAX_QUALITY = 0.8;
const QUALITY_STEP = 0.1;
const GIF_COLOR_STEP = 1;
const SHOULD_REVOKE_OBJECT_URLS = !import.meta.env.DEV;

function toAggressiveLossyQuality(quality: number): number {
  const clampedQuality = Math.min(1, Math.max(0.01, quality));
  return Math.pow(clampedQuality, 1.25);
}

function toDerivedMaxSizeMB(file: File, quality: number): number {
  const sourceSizeMB = file.size / (1024 * 1024);
  const clampedQuality = Math.min(1, Math.max(0.01, quality));
  const targetRatio = 0.2 + (clampedQuality * 0.8);
  return Math.max(0.001, sourceSizeMB * targetRatio);
}

function createFileId(): string {
  const randomUUID = globalThis.crypto?.randomUUID;

  if (typeof randomUUID === 'function') {
    return randomUUID.call(globalThis.crypto);
  }

  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Heuristic bounds for estimating output size with a normalized quality value.
const MIN_COMPRESSION_RATIO = 0.35;
const MAX_COMPRESSION_RATIO = 1;

function estimateCompressedSize(bytes: number, quality: number): number {
  const safeBytes = Math.max(0, bytes);
  const clampedQuality = Math.min(1, Math.max(0, quality));
  const ratio = MIN_COMPRESSION_RATIO
    + (MAX_COMPRESSION_RATIO - MIN_COMPRESSION_RATIO) * clampedQuality;
  return Math.round(safeBytes * ratio);
}

function buildCompressedFileName(inputName: string, fallbackExtension = '.jpg'): string {
  const safeName = inputName || 'image';
  const extensionIndex = safeName.lastIndexOf('.');
  const hasExtension = extensionIndex > 0;
  const baseName = hasExtension ? safeName.slice(0, extensionIndex) : safeName;
  const extension = hasExtension ? safeName.slice(extensionIndex) : fallbackExtension;
  return `${baseName}-compressed${extension}`;
}

function buildLivePreviewResult(inputFile: File, outputFile: File): CompressionResult {
  const originalSize = inputFile.size;
  const compressedSize = outputFile.size;
  const savingPercent =
    originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0;

  return {
    id: `preview-${inputFile.name}-${Date.now()}`,
    inputFile,
    outputFile,
    originalSize,
    compressedSize,
    savingPercent,
  };
}

function buildFileObjectUrlCacheKey(file: File): string {
  return `${file.name}-${file.lastModified}-${file.size}`;
}

function framePixelsToDataUrl(
  framePixels: Uint8ClampedArray,
  width: number,
  height: number
): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  const rgbaPixels = new Uint8ClampedArray(framePixels.length);
  rgbaPixels.set(framePixels);

  context.putImageData(new ImageData(rgbaPixels, width, height), 0, 0);
  return canvas.toDataURL('image/png');
}

async function resolveSaveFileFunction(): Promise<SaveFileFunction> {
  const fileSaverModule = await import('file-saver');
  const saveFile = fileSaverModule.saveAs ?? fileSaverModule.default?.saveAs;

  if (typeof saveFile !== 'function') {
    throw new Error('No se pudo inicializar el guardado de archivos.');
  }

  return saveFile;
}

export function UploaderPanel({
  uploadCopy,
  previewCopy,
  qualityCopy,
  compressionStatsCopy,
}: UploaderPanelProps) {
  const [files, setFiles] = useState<SelectedFileItem[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [draftQuality, setDraftQuality] = useState<number>(DEFAULT_QUALITY);
  const [draftGifColors, setDraftGifColors] = useState<number>(DEFAULT_GIF_COLORS);
  const [compressedById, setCompressedById] = useState<Record<string, CompressedFileEntry>>({});
  const [livePreviewResult, setLivePreviewResult] = useState<CompressionResult | null>(null);
  const [gifFramePreview, setGifFramePreview] = useState<GifFramePreviewState | null>(null);
  const [activeGifFrameIndex, setActiveGifFrameIndex] = useState<number>(0);
  const [isBatchCompressing, setIsBatchCompressing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const filePreviewUrlCacheRef = useRef<Map<string, string>>(new Map());
  const compressedPreviewUrlCacheRef = useRef<Map<string, string>>(new Map());
  const {
    compressOne,
    error,
    reset,
    terminate,
  } = useImageCompression();

  useEffect(() => {
    if (files.length === 0) {
      setActivePreviewIndex(0);
      terminate();
      reset();
      setIsDetailsOpen(false);
      setDraftQuality(DEFAULT_QUALITY);
      setDraftGifColors(DEFAULT_GIF_COLORS);
      setGifFramePreview(null);
      setActiveGifFrameIndex(0);

      if (SHOULD_REVOKE_OBJECT_URLS) {
        filePreviewUrlCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      }
      filePreviewUrlCacheRef.current.clear();

      if (SHOULD_REVOKE_OBJECT_URLS) {
        compressedPreviewUrlCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      }
      compressedPreviewUrlCacheRef.current.clear();
    }
  }, [files.length, reset, terminate]);

  useEffect(() => {
    const activeFile = files[activePreviewIndex];
    if (!activeFile) {
      setDraftQuality(DEFAULT_QUALITY);
      setDraftGifColors(DEFAULT_GIF_COLORS);
      setLivePreviewResult(null);
      setGifFramePreview(null);
      setActiveGifFrameIndex(0);
      return;
    }

    setDraftQuality(activeFile.quality);
    const sourceColorCap = Math.min(
      MAX_GIF_COLORS,
      Math.max(MIN_GIF_COLORS, activeFile.gifSourceColorCount ?? MAX_GIF_COLORS)
    );
    setDraftGifColors(Math.min(clampGifColorCount(activeFile.gifColors), sourceColorCap));
    setActiveGifFrameIndex(0);
  }, [activePreviewIndex, files]);

  useEffect(() => {
    const gifItemsWithoutMetadata = files.filter((item) => {
      return isGifFile(item.file) && typeof item.gifFrameCount !== 'number';
    });

    if (gifItemsWithoutMetadata.length === 0) {
      return;
    }

    let cancelled = false;

    gifItemsWithoutMetadata.forEach((item) => {
      void getGifMetadata(item.file)
        .then((metadata) => {
          if (cancelled) {
            return;
          }

          setFiles((previousFiles) => previousFiles.map((currentItem) => {
            if (currentItem.id !== item.id || typeof currentItem.gifFrameCount === 'number') {
              return currentItem;
            }

            const sourceColorCap = Math.min(
              MAX_GIF_COLORS,
              Math.max(MIN_GIF_COLORS, metadata.sourceColorCount)
            );

            return {
              ...currentItem,
              gifFrameCount: metadata.frameCount,
              gifSourceColorCount: sourceColorCap,
              gifColors: Math.min(clampGifColorCount(currentItem.gifColors), sourceColorCap),
            };
          }));
        })
        .catch(() => {
          if (cancelled) {
            return;
          }

          setFiles((previousFiles) => previousFiles.map((currentItem) => {
            if (currentItem.id !== item.id || typeof currentItem.gifFrameCount === 'number') {
              return currentItem;
            }

            return {
              ...currentItem,
              gifFrameCount: 1,
              gifSourceColorCount: MAX_GIF_COLORS,
            };
          }));
        });
    });

    return () => {
      cancelled = true;
    };
  }, [files]);

  useEffect(() => {
    const activeFile = files[activePreviewIndex];
    if (!activeFile) {
      setLivePreviewResult(null);
      return;
    }

    const activeCompressed = compressedById[activeFile.id];
    if (!activeCompressed?.result.outputFile || activeCompressed.result.error) {
      setLivePreviewResult(null);
      return;
    }

    const activeFileIsGif = isGifFile(activeFile.file);
    const activeGifMaxColors = Math.min(
      MAX_GIF_COLORS,
      Math.max(MIN_GIF_COLORS, activeFile.gifSourceColorCount ?? MAX_GIF_COLORS)
    );

    if (
      (activeFileIsGif && activeCompressed.gifColors === draftGifColors)
      || (!activeFileIsGif && Math.abs(activeCompressed.quality - draftQuality) <= 0.001)
    ) {
      setLivePreviewResult(null);
      return;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(() => {
      const previewPromise = activeFileIsGif
        ? compressGifFile(activeFile.file, {
            colors: Math.min(clampGifColorCount(draftGifColors), activeGifMaxColors),
          }).then((result) => result.outputFile)
        : isSvgFile(activeFile.file)
          ? compressSvgFile(activeFile.file, draftQuality)
          : imageCompression(activeFile.file, {
              useWebWorker: false,
              initialQuality: toAggressiveLossyQuality(draftQuality),
              maxSizeMB: toDerivedMaxSizeMB(activeFile.file, draftQuality),
            }).then((outputFile) => (outputFile.size < activeFile.file.size ? outputFile : activeFile.file));

      void previewPromise
        .then((outputFile) => {
          if (isCancelled) {
            return;
          }

          setLivePreviewResult(buildLivePreviewResult(activeFile.file, outputFile));
        })
        .catch(() => {
          if (isCancelled) {
            return;
          }

          setLivePreviewResult(null);
        });
    }, 120);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activePreviewIndex, compressedById, draftGifColors, draftQuality, files]);

  useEffect(() => {
    if (!error) {
      return;
    }

    showError(error);
  }, [error]);

  const filePreviewEntries = useMemo(() => {
    return files.map(({ id, file }) => {
      const existingUrl = filePreviewUrlCacheRef.current.get(id);
      if (existingUrl) {
        return { id, url: existingUrl };
      }

      const createdUrl = URL.createObjectURL(file);
      filePreviewUrlCacheRef.current.set(id, createdUrl);
      return { id, url: createdUrl };
    });
  }, [files]);

  const filePreviewUrlById = useMemo(
    () => new Map(filePreviewEntries.map(({ id, url }) => [id, url])),
    [filePreviewEntries]
  );

  const statsItems = useMemo<CompressionStatsItem[]>(() => {
    return files.map(({ id, file }, index) => {
      const compressedEntry = compressedById[id];
      const isGifInput = isGifFile(file);

      return {
        id,
        filename: file.name,
        originalBytes: file.size,
        compressedBytes: compressedEntry?.result.compressedSize
          ?? (isGifInput
            ? file.size
            : estimateCompressedSize(file.size, files[index]?.quality ?? DEFAULT_QUALITY)),
        hasError: Boolean(compressedEntry?.result.error),
        previewUrl: filePreviewUrlById.get(id),
      };
    });
  }, [compressedById, filePreviewUrlById, files]);

  const previewCompressionMeta = useMemo<Array<ImagePreviewCompressionMeta | undefined>>(
    () => files.map(({ id }) => {
      const compressedEntry = compressedById[id];
      if (!compressedEntry || !compressedEntry.result.outputFile || compressedEntry.result.error) {
        return {
          isCompressed: false,
        };
      }

      return {
        isCompressed: true,
        savingsPercent: compressedEntry.result.savingPercent,
      };
    }),
    [compressedById, files]
  );

  const activeFileId = files[activePreviewIndex]?.id;
  const activeCompressedEntry = activeFileId ? compressedById[activeFileId] : undefined;
  const originalPreviewUrl = activeFileId ? (filePreviewUrlById.get(activeFileId) ?? null) : null;
  const activePreviewOutputFile = livePreviewResult?.outputFile ?? activeCompressedEntry?.result.outputFile ?? null;
  const compressedPreviewUrl = useMemo(() => {
    if (!activePreviewOutputFile) {
      return null;
    }

    const cacheKey = buildFileObjectUrlCacheKey(activePreviewOutputFile);
    const existingUrl = compressedPreviewUrlCacheRef.current.get(cacheKey);
    if (existingUrl) {
      return existingUrl;
    }

    const createdUrl = URL.createObjectURL(activePreviewOutputFile);
    compressedPreviewUrlCacheRef.current.set(cacheKey, createdUrl);
    return createdUrl;
  }, [activePreviewOutputFile]);

  useEffect(() => {
    const currentFile = files[activePreviewIndex];

    if (!currentFile || !isGifFile(currentFile.file) || !activePreviewOutputFile) {
      setGifFramePreview(null);
      return;
    }

    let cancelled = false;

    void Promise.all([
      decodeGifAnimationFrames(currentFile.file),
      decodeGifAnimationFrames(activePreviewOutputFile),
    ])
      .then(([originalAnimation, compressedAnimation]) => {
        if (cancelled) {
          return;
        }

        const sharedFrameCount = Math.min(
          originalAnimation.frames.length,
          compressedAnimation.frames.length
        );

        if (sharedFrameCount === 0) {
          setGifFramePreview(null);
          return;
        }

        setGifFramePreview({
          width: originalAnimation.width,
          height: originalAnimation.height,
          originalFrames: originalAnimation.frames
            .slice(0, sharedFrameCount)
            .map((frame) => frame.pixels),
          compressedFrames: compressedAnimation.frames
            .slice(0, sharedFrameCount)
            .map((frame) => frame.pixels),
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setGifFramePreview(null);
      });

    return () => {
      cancelled = true;
    };
  }, [activePreviewIndex, activePreviewOutputFile, files]);

  const totalGifPreviewFrames = gifFramePreview
    ? Math.min(gifFramePreview.originalFrames.length, gifFramePreview.compressedFrames.length)
    : 0;

  useEffect(() => {
    if (totalGifPreviewFrames <= 0) {
      setActiveGifFrameIndex(0);
      return;
    }

    setActiveGifFrameIndex((previousIndex) => Math.min(previousIndex, totalGifPreviewFrames - 1));
  }, [totalGifPreviewFrames]);

  const clampedGifFrameIndex = totalGifPreviewFrames > 0
    ? Math.min(activeGifFrameIndex, totalGifPreviewFrames - 1)
    : 0;

  const gifOriginalFramePreviewUrl = useMemo(() => {
    if (!gifFramePreview || totalGifPreviewFrames === 0) {
      return null;
    }

    return framePixelsToDataUrl(
      gifFramePreview.originalFrames[clampedGifFrameIndex],
      gifFramePreview.width,
      gifFramePreview.height
    );
  }, [clampedGifFrameIndex, gifFramePreview, totalGifPreviewFrames]);

  const gifCompressedFramePreviewUrl = useMemo(() => {
    if (!gifFramePreview || totalGifPreviewFrames === 0) {
      return null;
    }

    return framePixelsToDataUrl(
      gifFramePreview.compressedFrames[clampedGifFrameIndex],
      gifFramePreview.width,
      gifFramePreview.height
    );
  }, [clampedGifFrameIndex, gifFramePreview, totalGifPreviewFrames]);

  useEffect(() => {
    return () => {
      if (SHOULD_REVOKE_OBJECT_URLS) {
        filePreviewUrlCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      }
      filePreviewUrlCacheRef.current.clear();

      if (SHOULD_REVOKE_OBJECT_URLS) {
        compressedPreviewUrlCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      }
      compressedPreviewUrlCacheRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!isDetailsOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDetailsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailsOpen]);

  useEffect(() => {
    if (!isDetailsOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isDetailsOpen]);

  const activeFile = files[activePreviewIndex];
  const activeFileIsGif = Boolean(activeFile && isGifFile(activeFile.file));
  const activeGifMaxColors = Math.min(
    MAX_GIF_COLORS,
    Math.max(MIN_GIF_COLORS, activeFile?.gifSourceColorCount ?? MAX_GIF_COLORS)
  );
  const comparisonOriginalUrl = activeFileIsGif
    ? (gifOriginalFramePreviewUrl ?? originalPreviewUrl)
    : originalPreviewUrl;
  const comparisonCompressedUrl = activeFileIsGif
    ? (gifCompressedFramePreviewUrl ?? compressedPreviewUrl)
    : compressedPreviewUrl;

  const detailsTitle = compressionStatsCopy?.detailsTitle ?? 'Detalles de compresión';
  const openDetailsLabel = compressionStatsCopy?.openDetailsLabel ?? 'Ver detalles de compresión';
  const closeDetailsLabel = compressionStatsCopy?.closeDetailsLabel ?? 'Cerrar';
  const compressLabel = uploadCopy?.compressLabel ?? 'Comprimir';
  const saveAllLabel = uploadCopy?.saveAllLabel ?? 'Guardar todo';
  const savingLabel = uploadCopy?.savingLabel ?? 'Guardando...';
  const gifTitle = qualityCopy?.gifTitle ?? 'Colores GIF';
  const gifDescription = qualityCopy?.gifDescription
    ?? 'Reduce colores por frame para comprimir GIF sin perder animacion.';
  const gifValueLabel = qualityCopy?.gifValueLabel ?? 'Colores';
  const gifUnitLabel = qualityCopy?.gifUnitLabel ?? 'colores';

  const sliderValue = activeFileIsGif ? draftGifColors : draftQuality;
  const sliderMin = activeFileIsGif ? MIN_GIF_COLORS : MIN_QUALITY;
  const sliderMax = activeFileIsGif ? activeGifMaxColors : MAX_QUALITY;
  const sliderStep = activeFileIsGif ? GIF_COLOR_STEP : QUALITY_STEP;
  const sliderValueMode: 'number' | 'percent' = activeFileIsGif ? 'number' : 'percent';
  const sliderValueSuffix = activeFileIsGif ? gifUnitLabel : undefined;
  const sliderCopy = activeFileIsGif
    ? {
        ...qualityCopy,
        title: gifTitle,
        description: gifDescription,
        valueLabel: gifValueLabel,
      }
    : qualityCopy;
  const sliderMinLabel = activeFileIsGif ? `${MIN_GIF_COLORS} ${gifUnitLabel}` : `${Math.round(MIN_QUALITY * 100)}%`;
  const comparisonOriginalBytes = activeFile?.file.size ?? 0;
  const comparisonCompressedBytes = activePreviewOutputFile?.size ?? comparisonOriginalBytes;
  const comparisonSavingsPercent = comparisonOriginalBytes > 0
    ? ((comparisonOriginalBytes - comparisonCompressedBytes) / comparisonOriginalBytes) * 100
    : 0;
  const comparisonSavingsText = `${comparisonSavingsPercent.toFixed(1)}%`;
  const isEstimatedPreview = Boolean(livePreviewResult?.outputFile);
  const comparisonOriginalMeta = formatBytes(comparisonOriginalBytes, 1);
  const comparisonCompressedMeta = `${isEstimatedPreview ? '≈ ' : ''}${formatBytes(comparisonCompressedBytes, 1)} (${comparisonSavingsText})`;

  const downloadableResults = useMemo(() => {
    return Object.values(compressedById)
      .map((entry) => entry.result)
      .filter((result) => result.outputFile && !result.error);
  }, [compressedById]);

  const pendingFiles = useMemo(() => {
    return files.filter((item) => {
      const compressedEntry = compressedById[item.id];
      if (!compressedEntry || !compressedEntry.result.outputFile || compressedEntry.result.error) {
        return true;
      }

      if (isGifFile(item.file)) {
        return compressedEntry.gifColors !== item.gifColors;
      }

      return Math.abs(compressedEntry.quality - item.quality) > 0.001;
    });
  }, [compressedById, files]);

  const hasActiveCompressed = Boolean(activeCompressedEntry?.result.outputFile && !activeCompressedEntry?.result.error);
  const canApplyQuality = Boolean(files[activePreviewIndex])
    && !isBatchCompressing
    && !isSaving;
  const pendingCount = pendingFiles.length;
  const downloadableCount = downloadableResults.length;

  const canCompress = pendingCount > 0 && !isBatchCompressing && !isSaving;
  const canSave = downloadableResults.length > 0 && !isBatchCompressing && !isSaving;

  useEffect(() => {
    if (!activeFileIsGif) {
      return;
    }

    setDraftGifColors((previousValue) => Math.min(previousValue, activeGifMaxColors));
  }, [activeFileIsGif, activeGifMaxColors]);

  const handleFilesSelected = useCallback((incomingFiles: File[]) => {
    if (incomingFiles.length === 0) {
      return;
    }

    if (isBatchCompressing) {
      terminate();
      setIsBatchCompressing(false);
    }

    setFiles((previousFiles) => {
      const nextFiles = [
        ...previousFiles,
        ...incomingFiles.map((file) => ({
          id: createFileId(),
          file,
          quality: DEFAULT_QUALITY,
          gifColors: DEFAULT_GIF_COLORS,
          gifFrameCount: isGifFile(file) ? undefined : 1,
        })),
      ];

      setActivePreviewIndex((previousIndex) => {
        const previousActiveFile = nextFiles[previousIndex];
        if (previousActiveFile) {
          const previousActiveCompressed = compressedById[previousActiveFile.id];
          if (previousActiveCompressed?.result.outputFile && !previousActiveCompressed.result.error) {
            return previousIndex;
          }
        }

        const firstCompressedIndex = nextFiles.findIndex((item) => {
          const compressedEntry = compressedById[item.id];
          return Boolean(compressedEntry?.result.outputFile && !compressedEntry.result.error);
        });

        return firstCompressedIndex >= 0 ? firstCompressedIndex : nextFiles.length - 1;
      });
      return nextFiles;
    });
  }, [compressedById, isBatchCompressing, terminate]);

  const handleApplyQuality = useCallback(async () => {
    const targetFile = files[activePreviewIndex];
    if (!targetFile || isBatchCompressing || isSaving) {
      return;
    }

    const nextQuality = Math.min(MAX_QUALITY, Math.max(MIN_QUALITY, draftQuality));
    const nextGifColors = Math.min(clampGifColorCount(draftGifColors), activeGifMaxColors);
    const targetFileIsGif = isGifFile(targetFile.file);
    const currentCompressed = compressedById[targetFile.id];

    setFiles((previousFiles) => previousFiles.map((item) => (
      item.id === targetFile.id
        ? {
            ...item,
            quality: nextQuality,
            gifColors: targetFileIsGif ? nextGifColors : item.gifColors,
          }
        : item
    )));

    if (
      currentCompressed
      && currentCompressed.result.outputFile
      && !currentCompressed.result.error
      && (
        (targetFileIsGif && currentCompressed.gifColors === nextGifColors)
        || (!targetFileIsGif && Math.abs(currentCompressed.quality - nextQuality) <= 0.001)
      )
    ) {
      return;
    }

    setIsBatchCompressing(true);

    try {
      const result = await compressOne(targetFile.file, {
        quality: nextQuality,
        gifColors: targetFileIsGif ? nextGifColors : undefined,
      });

      setCompressedById((previousCompressed) => {
        const nextCompressed = { ...previousCompressed };

        if (result.outputFile && !result.error) {
          nextCompressed[targetFile.id] = {
            quality: nextQuality,
            gifColors: targetFileIsGif ? nextGifColors : targetFile.gifColors,
            result,
          };
        } else {
          delete nextCompressed[targetFile.id];
        }

        return nextCompressed;
      });
      setLivePreviewResult(null);

      if (result.outputFile && !result.error) {
        showSuccess('Imagen comprimida correctamente.');
      } else {
        showError('No se pudo comprimir la imagen seleccionada.');
      }
    } catch {
      showError('No se pudo completar la compresion de la imagen seleccionada.');
    } finally {
      setIsBatchCompressing(false);
    }
  }, [
    activeGifMaxColors,
    activePreviewIndex,
    compressedById,
    compressOne,
    draftGifColors,
    draftQuality,
    files,
    isBatchCompressing,
    isSaving,
  ]);

  const handleCompress = useCallback(async () => {
    if (files.length === 0 || isBatchCompressing || isSaving) {
      return;
    }

    if (pendingFiles.length === 0) {
      showSuccess('No hay imagenes pendientes por comprimir.');
      return;
    }

    setIsBatchCompressing(true);

    try {
      const nextCompressedById = { ...compressedById };
      let successCount = 0;

      for (const pendingFile of pendingFiles) {
        const result = await compressOne(pendingFile.file, {
          quality: pendingFile.quality,
          gifColors: isGifFile(pendingFile.file) ? pendingFile.gifColors : undefined,
        });

        if (result.outputFile && !result.error) {
          nextCompressedById[pendingFile.id] = {
            quality: pendingFile.quality,
            gifColors: pendingFile.gifColors,
            result,
          };
          successCount += 1;
          continue;
        }

        delete nextCompressedById[pendingFile.id];
      }

      setCompressedById(nextCompressedById);
      setLivePreviewResult(null);

      setActivePreviewIndex((previousIndex) => {
        const previousFile = files[previousIndex];
        if (previousFile) {
          const previousCompressed = nextCompressedById[previousFile.id];
          if (previousCompressed?.result.outputFile && !previousCompressed.result.error) {
            return previousIndex;
          }
        }

        const firstCompressedIndex = files.findIndex((item) => {
          const compressedEntry = nextCompressedById[item.id];
          return Boolean(compressedEntry?.result.outputFile && !compressedEntry.result.error);
        });

        return firstCompressedIndex >= 0 ? firstCompressedIndex : previousIndex;
      });

      if (successCount > 0) {
        showSuccess(`${successCount} imagen(es) comprimida(s).`);
      } else {
        showError('No se pudo comprimir los archivos seleccionados.');
      }
    } catch {
      showError('No se pudo completar la compresion.');
    } finally {
      setIsBatchCompressing(false);
    }
  }, [compressedById, compressOne, files.length, isBatchCompressing, isSaving, pendingFiles]);

  const handleSave = useCallback(async () => {
    if (!canSave) {
      return;
    }

    setIsSaving(true);

    try {
      const saveFile = await resolveSaveFileFunction();

      if (downloadableResults.length === 1) {
        const [singleResult] = downloadableResults;
        const outputFile = singleResult.outputFile as File;
        const inputName = singleResult.inputFile?.name || 'image';
        const extension = (typeof inputName === 'string' && inputName.lastIndexOf('.') !== -1)
          ? inputName.slice(inputName.lastIndexOf('.'))
          : '.jpg';

        saveFile(outputFile, buildCompressedFileName(inputName, extension));
      } else {
        const zip = new JSZip();

        downloadableResults.forEach((result, index) => {
          if (!result.outputFile) {
            return;
          }

          const inputName = result.inputFile?.name || `image-${index + 1}`;
          const extension = (typeof inputName === 'string' && inputName.lastIndexOf('.') !== -1)
            ? inputName.slice(inputName.lastIndexOf('.'))
            : '.jpg';
          const filename = buildCompressedFileName(inputName, extension);
          const uniqueName = zip.file(filename) ? `${index + 1}-${filename}` : filename;
          zip.file(uniqueName, result.outputFile);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveFile(zipBlob, 'pixel-crunch-comprimidas.zip');
      }

      showSuccess('Archivos guardados correctamente.');
    } catch (reason) {
      showError(reason instanceof Error ? reason.message : 'No se pudo guardar los archivos.');
    } finally {
      setIsSaving(false);
    }
  }, [canSave, downloadableResults]);

  const handleSaveSingle = useCallback(async (index: number) => {
    if (isBatchCompressing || isSaving) {
      return;
    }

    const targetFile = files[index];
    if (!targetFile) {
      return;
    }

    const compressedEntry = compressedById[targetFile.id];
    if (!compressedEntry || !compressedEntry.result.outputFile || compressedEntry.result.error) {
      return;
    }

    setIsSaving(true);

    try {
      const saveFile = await resolveSaveFileFunction();
      const outputFile = compressedEntry.result.outputFile as File;
      const inputName = targetFile.file?.name || 'image';
      const extension = (typeof inputName === 'string' && inputName.lastIndexOf('.') !== -1)
        ? inputName.slice(inputName.lastIndexOf('.'))
        : '.jpg';

      saveFile(outputFile, buildCompressedFileName(inputName, extension));
      showSuccess('Imagen guardada correctamente.');
    } catch (reason) {
      showError(reason instanceof Error ? reason.message : 'No se pudo guardar la imagen.');
    } finally {
      setIsSaving(false);
    }
  }, [compressedById, files, isBatchCompressing, isSaving]);

  const handleQualityChange = useCallback((nextQuality: number) => {
    if (activeFileIsGif) {
      setDraftGifColors(Math.min(clampGifColorCount(nextQuality), activeGifMaxColors));
      return;
    }

    const clampedQuality = Math.min(MAX_QUALITY, Math.max(MIN_QUALITY, nextQuality));
    setDraftQuality(clampedQuality);
  }, [activeFileIsGif, activeGifMaxColors]);

  const handleRemove = useCallback((indexToRemove: number) => {
    if (isBatchCompressing) {
      terminate();
      setIsBatchCompressing(false);
    }

    setFiles((previousFiles) => {
      const removed = previousFiles[indexToRemove];
      const nextFiles = previousFiles.filter((_, fileIndex) => fileIndex !== indexToRemove);

      if (removed) {
        setCompressedById((previousCompressed) => {
          if (!previousCompressed[removed.id]) {
            return previousCompressed;
          }

          const nextCompressed = { ...previousCompressed };
          delete nextCompressed[removed.id];
          return nextCompressed;
        });
      }

      setActivePreviewIndex((previousIndex) => {
        if (nextFiles.length === 0) {
          return 0;
        }

        const previousActiveFile = nextFiles[Math.min(previousIndex, nextFiles.length - 1)];
        if (previousActiveFile) {
          const previousActiveCompressed = compressedById[previousActiveFile.id];
          if (previousActiveCompressed?.result.outputFile && !previousActiveCompressed.result.error) {
            return Math.min(previousIndex, nextFiles.length - 1);
          }
        }

        const firstCompressedIndex = nextFiles.findIndex((item) => {
          const compressedEntry = compressedById[item.id];
          return Boolean(compressedEntry?.result.outputFile && !compressedEntry.result.error);
        });

        if (firstCompressedIndex >= 0) {
          return firstCompressedIndex;
        }

        if (indexToRemove < previousIndex) {
          return previousIndex - 1;
        }

        if (indexToRemove === previousIndex) {
          return Math.min(previousIndex, nextFiles.length - 1);
        }

        return Math.min(previousIndex, nextFiles.length - 1);
      });

      return nextFiles;
    });
    setLivePreviewResult(null);
  }, [compressedById, isBatchCompressing, terminate]);

  const handleClearAll = useCallback(() => {
    if (isBatchCompressing) {
      terminate();
      setIsBatchCompressing(false);
    }

    setFiles([]);
    setCompressedById({});
    setLivePreviewResult(null);
    setActivePreviewIndex(0);
  }, [isBatchCompressing, terminate]);

  const detailsModal = isDetailsOpen && typeof document !== 'undefined'
    ? createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-monokai-bg/85 p-2 backdrop-blur-sm sm:p-4"
        role="presentation"
        onClick={() => setIsDetailsOpen(false)}
      >
        <div
          className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-monokai-cyan/35 bg-monokai-bg/95 shadow-2xl shadow-monokai-bg/60"
          role="dialog"
          aria-modal="true"
          aria-label={detailsTitle}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 border-b border-monokai-fg/10 bg-monokai-bg/95 px-4 py-3 md:px-5 md:py-4">
            <h3 className="text-base md:text-xl font-semibold text-monokai-cyan">{detailsTitle}</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDetailsOpen(false)}
              className="border border-monokai-fg/25 text-monokai-fg hover:bg-monokai-fg/10"
            >
              {closeDetailsLabel}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 md:px-5 md:py-5">
            <CompressionStats
              items={statsItems}
              copy={compressionStatsCopy}
              embedded
            />
          </div>
        </div>
      </div>,
      document.body
    )
    : null;

  return (
    <div className="space-y-4">
      <UploadZone
        onFilesSelected={handleFilesSelected}
        isProcessing={isBatchCompressing}
        hasFiles={files.length > 0}
        onClearAll={handleClearAll}
        copy={uploadCopy}
        footerActions={(
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCompress}
              disabled={!canCompress}
              className="relative min-w-32 border border-monokai-cyan/45 bg-transparent font-semibold text-monokai-cyan hover:bg-monokai-cyan/10"
            >
              {compressLabel}
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-monokai-cyan px-1 text-[11px] font-bold text-monokai-bg">
                {pendingCount}
              </span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={!canSave}
              loading={isSaving}
              className="relative min-w-32 border border-monokai-green/45 bg-transparent font-semibold text-monokai-green hover:bg-monokai-green/10"
            >
              {isSaving ? savingLabel : saveAllLabel}
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-monokai-green px-1 text-[11px] font-bold text-monokai-bg">
                {downloadableCount}
              </span>
            </Button>
          </>
        )}
      >
        <ImagePreview
          files={files.map(({ file }) => file)}
          onRemove={handleRemove}
          onSaveSingle={handleSaveSingle}
          disableSaveSingle={isSaving || isBatchCompressing}
          copy={previewCopy}
          layout="strip"
          compact
          activeIndex={activePreviewIndex}
          onActiveIndexChange={setActivePreviewIndex}
          compressionMetaByIndex={previewCompressionMeta}
        />
      </UploadZone>

      {hasActiveCompressed ? (
        <section className="mx-auto w-full max-w-5xl space-y-3">
          <div className="lg:hidden">
            <QualitySlider
              value={sliderValue}
              onChange={handleQualityChange}
              min={sliderMin}
              max={sliderMax}
              step={sliderStep}
              copy={sliderCopy}
              valueMode={sliderValueMode}
              valueSuffix={sliderValueSuffix}
              showRawValue={false}
              minLabel={sliderMinLabel}
              showMaxLabel={false}
              compact
              showTitle={false}
              showApplyButton
              onApply={handleApplyQuality}
              applyDisabled={!canApplyQuality}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_9rem] lg:items-stretch">
            {activeCompressedEntry?.result.outputFile && comparisonOriginalUrl ? (
              <ImageComparison
                className="lg:order-1"
                originalUrl={comparisonOriginalUrl}
                compressedUrl={comparisonCompressedUrl}
                originalLabel={compressionStatsCopy?.originalLabel ?? 'Antes'}
                compressedLabel={compressionStatsCopy?.compressedLabel ?? 'Después'}
                originalMeta={comparisonOriginalMeta}
                compressedMeta={comparisonCompressedMeta}
              />
            ) : null}

            <div className="hidden lg:block lg:order-2">
              <QualitySlider
                value={sliderValue}
                onChange={handleQualityChange}
                min={sliderMin}
                max={sliderMax}
                step={sliderStep}
                copy={sliderCopy}
                valueMode={sliderValueMode}
                valueSuffix={sliderValueSuffix}
                showRawValue={false}
                minLabel={sliderMinLabel}
                showMaxLabel={false}
                orientation="vertical"
                compact
                showTitle={false}
                showApplyButton
                onApply={handleApplyQuality}
                applyDisabled={!canApplyQuality}
              />
            </div>
          </div>

          {activeFileIsGif && totalGifPreviewFrames > 1 ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveGifFrameIndex((current) => Math.max(0, current - 10))}
                disabled={clampedGifFrameIndex <= 0}
                className="min-w-14 border border-monokai-fg/30 text-monokai-fg hover:bg-monokai-fg/10"
              >
                -10
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveGifFrameIndex((current) => Math.max(0, current - 1))}
                disabled={clampedGifFrameIndex <= 0}
                className="min-w-14 border border-monokai-fg/30 text-monokai-fg hover:bg-monokai-fg/10"
              >
                -1
              </Button>

              <span className="min-w-24 rounded-md border border-monokai-purple/45 bg-monokai-bg/60 px-3 py-1 text-center text-sm font-semibold text-monokai-fg">
                {clampedGifFrameIndex + 1} / {totalGifPreviewFrames}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveGifFrameIndex((current) => Math.min(totalGifPreviewFrames - 1, current + 1))}
                disabled={clampedGifFrameIndex >= totalGifPreviewFrames - 1}
                className="min-w-14 border border-monokai-fg/30 text-monokai-fg hover:bg-monokai-fg/10"
              >
                +1
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveGifFrameIndex((current) => Math.min(totalGifPreviewFrames - 1, current + 10))}
                disabled={clampedGifFrameIndex >= totalGifPreviewFrames - 1}
                className="min-w-14 border border-monokai-fg/30 text-monokai-fg hover:bg-monokai-fg/10"
              >
                +10
              </Button>
            </div>
          ) : null}

        </section>
      ) : null}

      {files.length > 0 ? (
        <div className="mx-auto flex w-full max-w-5xl justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsDetailsOpen(true)}
            className="border border-monokai-cyan/35 text-monokai-cyan hover:bg-monokai-cyan/10"
          >
            {openDetailsLabel}
          </Button>
        </div>
      ) : null}

      {detailsModal}
    </div>
  );
}
