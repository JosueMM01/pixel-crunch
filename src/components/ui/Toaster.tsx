import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      duration={3200}
      theme={resolvedTheme}
    />
  );
}
