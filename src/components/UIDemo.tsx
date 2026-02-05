import { Button, Card, Badge } from '@/components/ui';
import { Upload, Download, Settings } from 'lucide-react';

/**
 * Componente de demostración para probar los componentes UI base
 * Este componente es temporal y se usará para verificar que todo funciona
 */
export const UIDemo = () => {
  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Demo Componentes UI
      </h2>

      {/* Buttons Demo */}
      <Card title="Botones" description="Diferentes variantes y tamaños">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button icon={<Upload size={16} />}>
              Con ícono izquierdo
            </Button>
            <Button icon={<Download size={16} />} iconPosition="right">
              Con ícono derecho
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button loading>Cargando...</Button>
            <Button disabled>Deshabilitado</Button>
          </div>
        </div>
      </Card>

      {/* Badges Demo */}
      <Card title="Badges" description="Etiquetas con diferentes variantes">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="info">JPG</Badge>
          <Badge variant="success">PNG</Badge>
          <Badge variant="warning">WebP</Badge>
          <Badge variant="error">Error</Badge>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge size="sm" variant="info">Small</Badge>
          <Badge size="md" variant="success">Medium</Badge>
        </div>
      </Card>

      {/* Cards Demo */}
      <Card title="Cards Anidados" description="Ejemplo de cards con diferentes configuraciones">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="border" padding="sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Card con borde y padding pequeño
            </p>
          </Card>
          
          <Card variant="shadow" padding="lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Card con sombra y padding grande
            </p>
          </Card>
        </div>
      </Card>

      {/* Interactive Example */}
      <Card 
        title="Ejemplo Interactivo" 
        description="Simula una acción de compresión"
        padding="lg"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <Badge variant="info">JPG</Badge>
            <Badge variant="warning">2.5 MB</Badge>
          </div>
          
          <Button 
            icon={<Settings size={18} />}
            onClick={() => alert('¡Componentes UI funcionando correctamente!')}
          >
            Probar Componente
          </Button>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Haz clic en el botón para verificar que los eventos funcionan
          </p>
        </div>
      </Card>
    </div>
  );
};
