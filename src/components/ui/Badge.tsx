import type { FC, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'info' | 'success' | 'warning' | 'error' | 'default';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Variante de color del badge
   * @default 'default'
   */
  variant?: BadgeVariant;
  
  /**
   * Tamaño del badge
   * @default 'md'
   */
  size?: BadgeSize;
  
  /**
   * Contenido del badge (texto o elementos)
   */
  children: React.ReactNode;
}

/**
 * Componente Badge para etiquetas y tags pequeños
 * Útil para formatos de archivo, estados, etc.
 * 
 * @example
 * ```tsx
 * <Badge variant="info">JPG</Badge>
 * <Badge variant="success" size="sm">Comprimido</Badge>
 * <Badge variant="warning">10 MB</Badge>
 * ```
 */
export const Badge: FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const baseStyles = cn(
    'inline-flex items-center justify-center',
    'font-medium rounded-full',
    'transition-colors'
  );

  const variantStyles = {
    default: cn(
      'bg-gray-100 text-gray-800',
      'dark:bg-gray-700 dark:text-gray-300'
    ),
    info: cn(
      'bg-blue-100 text-blue-800',
      'dark:bg-blue-900/30 dark:text-blue-400'
    ),
    success: cn(
      'bg-green-100 text-green-800',
      'dark:bg-green-900/30 dark:text-green-400'
    ),
    warning: cn(
      'bg-yellow-100 text-yellow-800',
      'dark:bg-yellow-900/30 dark:text-yellow-400'
    ),
    error: cn(
      'bg-red-100 text-red-800',
      'dark:bg-red-900/30 dark:text-red-400'
    ),
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
