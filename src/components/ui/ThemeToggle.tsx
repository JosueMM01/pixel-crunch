import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-brand-cyan/30 bg-white/70 dark:bg-monokai-bg/80 p-2.5 text-gray-700 dark:text-brand-cyan-light hover:border-brand-blue dark:hover:border-brand-cyan-light transition-colors backdrop-blur-sm"
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={theme === 'system' ? `Tema del sistema (${resolvedTheme})` : `Tema: ${theme}`}
    >
      {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
