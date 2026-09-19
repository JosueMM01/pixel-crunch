export type BackgroundRemovalDevice = 'cpu' | 'gpu';
export type BackgroundRemovalModel = 'isnet' | 'isnet_fp16' | 'isnet_quint8';

export interface BackgroundRemovalRoute {
  device: BackgroundRemovalDevice;
  model: BackgroundRemovalModel;
}

export interface BackgroundRemovalCapabilities {
  webGpu: boolean;
  constrained: boolean;
  deviceMemoryGiB?: number;
  hardwareConcurrency?: number;
  mobile: boolean;
}

export type BackgroundRemovalStage =
  | 'loading-runtime'
  | 'downloading-assets'
  | 'decoding'
  | 'inference'
  | 'applying-mask'
  | 'encoding';

export type BackgroundRemovalErrorCode =
  | 'cancelled'
  | 'timeout'
  | 'invalid-image'
  | 'image-too-large'
  | 'asset-download'
  | 'webgpu-unavailable'
  | 'insufficient-memory'
  | 'inference-failed'
  | 'worker-failed';

export interface BackgroundRemovalProgress {
  operationId: string;
  stage: BackgroundRemovalStage;
  current?: number;
  total?: number;
  route: BackgroundRemovalRoute;
}

export interface BackgroundRemovalWorkerRequest {
  type: 'process';
  operationId: string;
  image: Blob;
  route: BackgroundRemovalRoute;
  publicPath: string;
}

export type BackgroundRemovalWorkerResponse =
  | { type: 'progress'; progress: BackgroundRemovalProgress }
  | { type: 'complete'; operationId: string; output: Blob; route: BackgroundRemovalRoute }
  | {
      type: 'error';
      operationId: string;
      code: BackgroundRemovalErrorCode;
      message: string;
      retryable: boolean;
      route: BackgroundRemovalRoute;
    };

export interface BackgroundRemovalResult {
  output: Blob;
  route: BackgroundRemovalRoute;
  attempts: BackgroundRemovalRoute[];
}

export interface BackgroundRemovalImageInfo {
  width: number;
  height: number;
  pixels: number;
  bytes: number;
  mime: 'image/jpeg' | 'image/png' | 'image/webp';
}
