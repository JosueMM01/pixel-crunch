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
