import { useCallback, useMemo, useState } from 'react';
import { ImagePreview } from './ImagePreview';
import { UploadZone } from './UploadZone';
import { CompressionStats, QualitySlider } from '../compressor';
import type { CompressionStatsItem } from '@/types';
import type { UploaderPanelProps } from '@/types';

interface SelectedFileItem {
  id: string;
  file: File;
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

export function UploaderPanel({
  uploadCopy,
  previewCopy,
  qualityCopy,
  compressionStatsCopy,
}: UploaderPanelProps) {
  const [files, setFiles] = useState<SelectedFileItem[]>([]);
  const [quality, setQuality] = useState<number>(0.8);

  const statsItems = useMemo<CompressionStatsItem[]>(() => {
    return files.map(({ id, file }) => ({
      id,
      filename: file.name,
      originalBytes: file.size,
      compressedBytes: estimateCompressedSize(file.size, quality),
    }));
  }, [files, quality]);

  const handleFilesSelected = useCallback((incomingFiles: File[]) => {
    setFiles((previousFiles) => [
      ...previousFiles,
      ...incomingFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
      })),
    ]);
  }, []);

  const handleRemove = useCallback((indexToRemove: number) => {
    setFiles((previousFiles) =>
      previousFiles.filter((_, fileIndex) => fileIndex !== indexToRemove)
    );
  }, []);

  return (
    <div className="space-y-8">
      <UploadZone onFilesSelected={handleFilesSelected} copy={uploadCopy} />
      <QualitySlider value={quality} onChange={setQuality} copy={qualityCopy} />
      <CompressionStats items={statsItems} copy={compressionStatsCopy} />
      <ImagePreview files={files.map(({ file }) => file)} onRemove={handleRemove} copy={previewCopy} />
    </div>
  );
}
