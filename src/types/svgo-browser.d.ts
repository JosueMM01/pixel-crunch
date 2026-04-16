declare module 'svgo/dist/svgo.browser.js' {
  export interface OptimizeResult {
    data: string;
  }

  export interface OptimizeOptions {
    multipass?: boolean;
    js2svg?: {
      pretty?: boolean;
      indent?: number;
    };
    plugins?: Array<
      | string
      | {
          name: string;
          params?: Record<string, unknown>;
        }
    >;
  }

  export function optimize(svg: string, options?: OptimizeOptions): OptimizeResult;
}
