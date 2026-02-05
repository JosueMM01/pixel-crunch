import type { FC, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Variante visual del botón
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Tamaño del botón
   * @default 'md'
   */
  size?: ButtonSize;
  
  /**
   * Estado de carga (muestra spinner y deshabilita)
   */
  loading?: boolean;
  
  /**
   * Contenido del botón
   */
  children: ReactNode;
  
  /**
   * Ícono opcional (componente de lucide-react)
   */
  icon?: ReactNode;
  
  /**
   * Posición del ícono
   * @default 'left'
   */
  iconPosition?: 'left' | 'right';
}

/**
 * Componente Button reutilizable con variantes de estilo
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Comprimir
 * </Button>
 * 
 * <Button variant="secondary" icon={<Upload />}>
 *   Subir archivos
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}) => {
  const baseStyles = cn(
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-lg transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
  );

  const variantStyles = {
    primary: cn(
      'bg-blue-600 text-white hover:bg-blue-700',
      'focus:ring-blue-500',
      'dark:bg-blue-500 dark:hover:bg-blue-600'
    ),
    secondary: cn(
      'bg-gray-200 text-gray-900 hover:bg-gray-300',
      'focus:ring-gray-400',
      'dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
    ),
    ghost: cn(
      'bg-transparent text-gray-700 hover:bg-gray-100',
      'focus:ring-gray-300',
      'dark:text-gray-300 dark:hover:bg-gray-800'
    ),
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="inline-flex" aria-hidden="true">
          {icon}
        </span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="inline-flex" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
};
