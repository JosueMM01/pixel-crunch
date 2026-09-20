import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackgroundRemovalError,
  detectBackgroundRemovalCapabilities,
  isBackgroundRemovalRouteCached,
  prepareBackgroundRemovalInput,
  removeBackgroundLocally,
  selectBackgroundRemovalRoutes,
} from '@/lib/background-removal';
import { BackgroundRemovalInputError } from '@/lib/background-removal/image-limits';
import type { BackgroundRemovalResolution } from '@/lib/background-removal/image-output';
import type {
  BackgroundRemovalErrorCode,
  BackgroundRemovalProgress,
  BackgroundRemovalResult,
  BackgroundRemovalRoute,
} from '@/types/background-removal';

export type BackgroundRemovalUiStatus =
  | 'idle'
  | 'preparing'
  | 'processing'
  | 'success'
  | 'error'
  | 'cancelled';

export type BackgroundRemovalModelSource = 'unknown' | 'network' | 'cache';

interface BackgroundRemovalUiError {
  code: BackgroundRemovalErrorCode | 'unknown';
  message: string;
}

export function useBackgroundRemoval() {
  const [status, setStatus] = useState<BackgroundRemovalUiStatus>('idle');
  const [progress, setProgress] = useState<BackgroundRemovalProgress | null>(null);
  const [result, setResult] = useState<BackgroundRemovalResult | null>(null);
  const [error, setError] = useState<BackgroundRemovalUiError | null>(null);
  const [modelSource, setModelSource] = useState<BackgroundRemovalModelSource>('unknown');
  const [activeRoute, setActiveRoute] = useState<BackgroundRemovalRoute | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const operationRef = useRef(0);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    operationRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStatus('idle');
    setProgress(null);
    setResult(null);
    setError(null);
    setModelSource('unknown');
    setActiveRoute(null);
  }, []);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const process = useCallback(async (image: Blob, resolution: BackgroundRemovalResolution) => {
    const operation = operationRef.current + 1;
    operationRef.current = operation;
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus('preparing');
    setProgress(null);
    setResult(null);
    setError(null);
    setModelSource('unknown');
    setActiveRoute(null);

    try {
      const capabilities = await detectBackgroundRemovalCapabilities();
      const routes = selectBackgroundRemovalRoutes(capabilities);
      const primaryRoute = routes[0];
      setActiveRoute(primaryRoute);
      setModelSource(
        await isBackgroundRemovalRouteCached(primaryRoute) ? 'cache' : 'network',
      );

      const preparedImage = await prepareBackgroundRemovalInput(image, resolution);
      if (controller.signal.aborted) {
        if (operationRef.current === operation) {
          setError({ code: 'cancelled', message: 'Background removal was cancelled.' });
          setStatus('cancelled');
        }
        return;
      }

      setStatus('processing');
      let observedRoute = `${primaryRoute.device}:${primaryRoute.model}`;
      const nextResult = await removeBackgroundLocally(preparedImage, {
        capabilities,
        signal: controller.signal,
        onProgress: (nextProgress) => {
          if (operationRef.current !== operation) return;
          setProgress(nextProgress);
          setActiveRoute(nextProgress.route);

          const routeKey = `${nextProgress.route.device}:${nextProgress.route.model}`;
          if (routeKey !== observedRoute) {
            observedRoute = routeKey;
            setModelSource('unknown');
            void isBackgroundRemovalRouteCached(nextProgress.route).then((cached) => {
              if (operationRef.current === operation) setModelSource(cached ? 'cache' : 'network');
            });
          }
        },
      });

      if (operationRef.current !== operation) return;
      setResult(nextResult);
      setActiveRoute(nextResult.route);
      setStatus('success');
    } catch (caught) {
      if (operationRef.current !== operation) return;

      if (caught instanceof BackgroundRemovalError || caught instanceof BackgroundRemovalInputError) {
        setError({ code: caught.code, message: caught.message });
        setStatus(caught.code === 'cancelled' ? 'cancelled' : 'error');
      } else {
        setError({
          code: 'unknown',
          message: caught instanceof Error ? caught.message : 'Background removal failed.',
        });
        setStatus('error');
      }
    } finally {
      if (operationRef.current === operation) abortControllerRef.current = null;
    }
  }, []);

  return {
    status,
    progress,
    result,
    error,
    modelSource,
    activeRoute,
    process,
    cancel,
    clear,
  };
}
