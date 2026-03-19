import { useCallback, useMemo, useState } from 'react';
import { ImagePreview } from './ImagePreview';
import { UploadZone } from './UploadZone';
import { CompressionStats, QualitySlider } from '../compressor';
import type { CompressionStatsItem } from '@/types';
import type { UploaderPanelProps } from '@/types';

function estimateCompressedSize(bytes: number, quality: number): number {
  const safeBytes = Math.max(0, bytes);
  const ratio = 0.35 + (quality * 0.65);
  return Math.round(safeBytes * ratio);
}

export function UploaderPanel({
  uploadCopy,
  previewCopy,
  qualityCopy,
  compressionStatsCopy,
}: UploaderPanelProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState<number>(0.8);

  const statsItems = useMemo<CompressionStatsItem[]>(() => {
    return files.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      filename: file.name,
      originalBytes: file.size,
      compressedBytes: estimateCompressedSize(file.size, quality),
    }));
  }, [files, quality]);

  const handleFilesSelected = useCallback((incomingFiles: File[]) => {
    setFiles((previousFiles) => [...previousFiles, ...incomingFiles]);
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
      <ImagePreview files={files} onRemove={handleRemove} copy={previewCopy} />
    </div>
  );
}
