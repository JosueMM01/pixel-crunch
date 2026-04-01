export interface UploadZoneCopy {
  title: string;
  description: string;
  idleLabel: string;
  draggingLabel: string;
  processingLabel: string;
  helperLabel: string;
  successLabel: string;
  sizeErrorLabel: string;
  typeErrorLabel: string;
}

export interface UploadZoneProps {
  onFilesSelected?: (files: File[]) => void;
  acceptedFormats?: readonly string[];
  maxFileSize?: number;
  multiple?: boolean;
  isProcessing?: boolean;
  copy?: Partial<UploadZoneCopy>;
}

export interface ImagePreviewCopy {
  title: string;
  emptyStateLabel: string;
  removeLabel: string;
  previewAltPrefix: string;
}

export interface ImagePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
  copy?: Partial<ImagePreviewCopy>;
}

export interface QualitySliderCopy {
  title: string;
  description: string;
  valueLabel: string;
}

export interface QualitySliderProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  copy?: Partial<QualitySliderCopy>;
}

export interface CompressionStatsCopy {
  title: string;
  description: string;
  emptyStateLabel: string;
  originalLabel: string;
  compressedLabel: string;
  savingsLabel: string;
  percentageLabel: string;
  estimatedLabel: string;
  errorLabel: string;
}

export interface CompressionStatsItem {
  id: string;
  filename: string;
  originalBytes: number;
  compressedBytes: number;
  hasError?: boolean;
}

export interface CompressionStatsProps {
  items: CompressionStatsItem[];
  copy?: Partial<CompressionStatsCopy>;
}

export type CompressionProgressStatus = 'idle' | 'compressing' | 'done' | 'error';

export interface CompressionProgressCopy {
  title: string;
  idleLabel: string;
  compressingLabel: string;
  doneLabel: string;
  errorLabel: string;
  progressLabel: string;
}

export interface CompressionProgressProps {
  progress: number;
  status: CompressionProgressStatus;
  copy?: Partial<CompressionProgressCopy>;
}

export interface UploaderPanelProps {
  uploadCopy?: Partial<UploadZoneCopy>;
  previewCopy?: Partial<ImagePreviewCopy>;
  qualityCopy?: Partial<QualitySliderCopy>;
  compressionStatsCopy?: Partial<CompressionStatsCopy>;
  compressionProgressCopy?: Partial<CompressionProgressCopy>;
}
