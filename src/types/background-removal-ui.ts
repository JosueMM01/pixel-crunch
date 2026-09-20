import type {
  BackgroundRemovalErrorCode,
  BackgroundRemovalResult,
  BackgroundRemovalStage,
} from './background-removal';

export interface BackgroundRemovalQueueItem {
  id: string;
  file: File;
  result?: BackgroundRemovalResult;
  editedOutput?: Blob;
}

export interface BackgroundRemovalPanelCopy {
  uploadTitle: string;
  uploadDescription: string;
  uploadButton: string;
  dropLabel: string;
  pasteLabel: string;
  formatsLabel: string;
  privacyLabel: string;
  addImagesLabel: string;
  removeLabel: string;
  processLabel: string;
  processingLabel: string;
  cancelLabel: string;
  retryLabel: string;
  newImageLabel: string;
  downloadLabel: string;
  beforeLabel: string;
  afterLabel: string;
  comparisonLabel: string;
  resolutionLabel: string;
  resolutionOptions: Record<'original' | 'optimized' | 'reduced', { label: string; description: string }>;
  formatLabel: string;
  formatOptions: Record<'png' | 'webp', string>;
  stageLabels: Record<BackgroundRemovalStage | 'preparing', string>;
  downloadingModelLabel: string;
  modelDownloadNotice: string;
  cachedModelLabel: string;
  modelReadyLabel: string;
  progressLabel: string;
  diagnosticsLabel: string;
  routeLabel: string;
  attemptsLabel: string;
  dimensionsLabel: string;
  memoryNote: string;
  queueLabel: string;
  queueCountLabel: string;
  queueLimitErrorLabel: string;
  queueSizeErrorLabel: string;
  pendingLabel: string;
  processedLabel: string;
  editLabel: string;
  editorTitle: string;
  editorDescription: string;
  eraseLabel: string;
  restoreLabel: string;
  brushSizeLabel: string;
  undoLabel: string;
  redoLabel: string;
  applyEditLabel: string;
  closeEditorLabel: string;
  pasteSuccessLabel: string;
  invalidPasteLabel: string;
  sizeErrorLabel: string;
  typeErrorLabel: string;
  exportErrorLabel: string;
  errors: Record<BackgroundRemovalErrorCode | 'unknown', string>;
}

export interface BackgroundRemoverPanelProps {
  copy: BackgroundRemovalPanelCopy;
}
