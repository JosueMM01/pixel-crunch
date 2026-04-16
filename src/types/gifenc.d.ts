declare module 'gifenc' {
  export type GifPaletteColor = [number, number, number] | [number, number, number, number];

  export interface GifEncoderOptions {
    auto?: boolean;
    initialCapacity?: number;
  }

  export interface GifFrameOptions {
    palette?: GifPaletteColor[];
    first?: boolean;
    transparent?: boolean;
    transparentIndex?: number;
    delay?: number;
    repeat?: number;
    dispose?: number;
  }

  export interface GifEncoderInstance {
    finish: () => void;
    bytes: () => Uint8Array;
    bytesView: () => Uint8Array;
    writeFrame: (
      index: Uint8Array,
      width: number,
      height: number,
      options?: GifFrameOptions
    ) => void;
  }

  export interface QuantizeOptions {
    format?: 'rgb565' | 'rgb444' | 'rgba4444';
    oneBitAlpha?: boolean | number;
    clearAlpha?: boolean;
    clearAlphaThreshold?: number;
    clearAlphaColor?: number;
  }

  export interface GifEncModule {
    GIFEncoder: (options?: GifEncoderOptions) => GifEncoderInstance;
    quantize: (
      rgba: Uint8Array | Uint8ClampedArray,
      maxColors: number,
      options?: QuantizeOptions
    ) => GifPaletteColor[];
    applyPalette: (
      rgba: Uint8Array | Uint8ClampedArray,
      palette: GifPaletteColor[],
      format?: 'rgb565' | 'rgb444' | 'rgba4444'
    ) => Uint8Array;
  }

  export const GIFEncoder: GifEncModule['GIFEncoder'];
  export const quantize: GifEncModule['quantize'];
  export const applyPalette: GifEncModule['applyPalette'];

  const gifenc: GifEncModule;

  export default gifenc;
}

declare module 'gifenc/dist/gifenc.esm.js' {
  export * from 'gifenc';
  import gifenc from 'gifenc';
  export default gifenc;
}
