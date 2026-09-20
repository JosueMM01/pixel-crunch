import type { BackgroundRemovalErrorCode, BackgroundRemovalStage } from './background-removal';

export interface BackgroundRemovalPanelCopy {
  uploadTitle: string;
  uploadDescription: string;
  uploadButton: string;
  dropLabel: string;
  pasteLabel: string;
  formatsLabel: string;
  privacyLabel: string;
  replaceLabel: string;
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
  cachedModelLabel: string;
  modelReadyLabel: string;
  progressLabel: string;
  diagnosticsLabel: string;
  routeLabel: string;
  attemptsLabel: string;
  dimensionsLabel: string;
  memoryNote: string;
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
