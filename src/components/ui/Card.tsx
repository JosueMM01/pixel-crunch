import type { FC, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Título opcional del card
   */
  title?: string;
  
  /**
   * Descripción/subtítulo opcional
   */
  description?: string;
  
  /**
   * Contenido del card
   */
  children: ReactNode;
  
  /**
   * Tamaño del padding interno
   * @default 'md'
   */
  padding?: CardPadding;
  
  /**
   * Si muestra borde o sombra
   * @default 'shadow'
   */
  variant?: 'shadow' | 'border' | 'none';
}

/**
 * Componente Card reutilizable para contenedores de contenido
 * 
 * @example
 * ```tsx
 * <Card title="Compresión" description="Configura la calidad">
 *   <QualitySlider />
 * </Card>
 * 
 * <Card padding="lg" variant="border">
 *   <ImagePreview files={files} />
 * </Card>
 * ```
 */
export const Card: FC<CardProps> = ({
  title,
  description,
  children,
  padding = 'md',
  variant = 'shadow',
  className,
  ...props
}) => {
  const baseStyles = cn(
    'rounded-lg bg-white dark:bg-gray-800',
    'transition-colors'
  );

  const variantStyles = {
    shadow: 'shadow-md hover:shadow-lg',
    border: 'border border-gray-200 dark:border-gray-700',
    none: '',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      
      {children}
    </div>
  );
};
