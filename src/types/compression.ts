import type { CompressionProgressStatus } from './upload';

export interface CompressionOptions {
  quality: number;
  maxWidthOrHeight?: number;
  maxSizeMB?: number;
  fileType?: string;
}

export interface CompressionResult {
  id: string;
  inputFile: File;
  outputFile?: File;
  originalSize: number;
  compressedSize: number;
  savingPercent: number;
  error?: string;
}

export interface CompressionWorkerStartMessage {
  type: 'start';
  payload: {
    jobId: string;
    file: File;
    options: CompressionOptions;
  };
}

export interface CompressionWorkerProgressMessage {
  type: 'progress';
  payload: {
    jobId: string;
    progress: number;
  };
}

export interface CompressionWorkerDoneMessage {
  type: 'done';
  payload: {
    jobId: string;
    outputFile: File;
    originalSize: number;
    compressedSize: number;
    savingPercent: number;
  };
}

export interface CompressionWorkerErrorMessage {
  type: 'error';
  payload: {
    jobId: string;
    message: string;
  };
}

export type CompressionWorkerRequest = CompressionWorkerStartMessage;

export type CompressionWorkerResponse =
  | CompressionWorkerProgressMessage
  | CompressionWorkerDoneMessage
  | CompressionWorkerErrorMessage;

export interface UseImageCompressionReturn {
  compressOne: (file: File, options?: Partial<CompressionOptions>) => Promise<CompressionResult>;
  compressMany: (files: File[], options?: Partial<CompressionOptions>) => Promise<CompressionResult[]>;
  isCompressing: boolean;
  status: CompressionProgressStatus;
  progress: number;
  error: string | null;
  results: CompressionResult[];
  reset: () => void;
  terminate: () => void;
}
