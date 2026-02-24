export interface UploadZoneCopy {
  title: string;
  description: string;
  idleLabel: string;
  draggingLabel: string;
  processingLabel: string;
  helperLabel: string;
  sizeErrorLabel: string;
  typeErrorLabel: string;
}

export interface UploadZoneProps {
  onFilesSelected?: (files: File[]) => void;
  acceptedFormats?: string[];
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

export interface UploaderPanelProps {
  uploadCopy?: Partial<UploadZoneCopy>;
  previewCopy?: Partial<ImagePreviewCopy>;
}
