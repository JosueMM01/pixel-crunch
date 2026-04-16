import type { ReactNode } from 'react';

export interface UploadZoneCopy {
  title: string;
  description: string;
  idleLabel: string;
  draggingLabel: string;
  processingLabel: string;
  helperLabel: string;
  addMoreLabel: string;
  clearAllLabel: string;
  compressLabel: string;
  saveLabel: string;
  saveAllLabel?: string;
  savingLabel: string;
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
  hasFiles?: boolean;
  onClearAll?: () => void;
  copy?: Partial<UploadZoneCopy>;
  children?: ReactNode;
  footerActions?: ReactNode;
}

export interface ImagePreviewCopy {
  emptyStateLabel: string;
  removeLabel: string;
  previewAltPrefix: string;
  saveSingleLabel?: string;
}

export interface ImagePreviewCompressionMeta {
  isCompressed: boolean;
  savingsPercent?: number;
}

export interface ImagePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
  onSaveSingle?: (index: number) => void;
  disableSaveSingle?: boolean;
  copy?: Partial<ImagePreviewCopy>;
  layout?: 'grid' | 'carousel' | 'strip';
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  compact?: boolean;
  compressionMetaByIndex?: Array<ImagePreviewCompressionMeta | undefined>;
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
  orientation?: 'horizontal' | 'vertical';
  compact?: boolean;
  showTitle?: boolean;
  showApplyButton?: boolean;
  onApply?: () => void;
  applyLabel?: string;
  applyDisabled?: boolean;
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
  openDetailsLabel?: string;
  closeDetailsLabel?: string;
  detailsTitle?: string;
}

export interface CompressionStatsItem {
  id: string;
  filename: string;
  originalBytes: number;
  compressedBytes: number;
  hasError?: boolean;
  previewUrl?: string;
}

export interface CompressionStatsProps {
  items: CompressionStatsItem[];
  copy?: Partial<CompressionStatsCopy>;
  compact?: boolean;
  embedded?: boolean;
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
  compact?: boolean;
}

export interface UploaderPanelProps {
  uploadCopy?: Partial<UploadZoneCopy>;
  previewCopy?: Partial<ImagePreviewCopy>;
  qualityCopy?: Partial<QualitySliderCopy>;
  compressionStatsCopy?: Partial<CompressionStatsCopy>;
  compressionProgressCopy?: Partial<CompressionProgressCopy>;
}
