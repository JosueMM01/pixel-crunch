import { useCallback, useState } from 'react';
import { ImagePreview } from './ImagePreview';
import { UploadZone } from './UploadZone';
import type { UploaderPanelProps } from '@/types';

export function UploaderPanel({ uploadCopy, previewCopy }: UploaderPanelProps) {
  const [files, setFiles] = useState<File[]>([]);

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
      <ImagePreview files={files} onRemove={handleRemove} copy={previewCopy} />
    </div>
  );
}
