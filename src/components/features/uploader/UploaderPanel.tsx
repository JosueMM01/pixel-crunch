import { useCallback, useState } from 'react';
import { ImagePreview } from './ImagePreview';
import { UploadZone } from './UploadZone';
import { QualitySlider } from '../compressor';
import type { UploaderPanelProps } from '@/types';

export function UploaderPanel({ uploadCopy, previewCopy, qualityCopy }: UploaderPanelProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState<number>(0.8);

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
      <ImagePreview files={files} onRemove={handleRemove} copy={previewCopy} />
    </div>
  );
}
