import type { Locale, RouteKey } from './routes';

interface ToolCardContent {
  route: Exclude<RouteKey, 'home'>;
  title: string;
  description: string;
  action: string;
  status?: string;
  accent: 'cyan' | 'pink' | 'green';
}

interface ToolPageContent {
  title: string;
  description: string;
  heading: string;
  intro: string;
  bullets: string[];
  formats?: string[];
  detailsTitle: string;
  details: string;
}

interface SiteContent {
  landing: {
    title: string;
    description: string;
    heading: string;
    intro: string;
    privacyNote: string;
    toolsHeading: string;
    tools: ToolCardContent[];
    benefits: Array<{ title: string; description: string }>;
  };
  compress: ToolPageContent;
  convert: ToolPageContent;
  removeBackground: ToolPageContent & {
    pendingLabel: string;
    pendingDescription: string;
  };
}

export const siteContent = {
  es: {
    landing: {
      title: 'Pixel Crunch — Herramientas privadas para imágenes',
      description: 'Comprime, convierte y próximamente quita fondos de imágenes directamente en tu navegador, sin subir tus archivos a un servidor.',
      heading: 'Tus imágenes. Tu dispositivo. Tus herramientas.',
      intro: 'Pixel Crunch reúne herramientas pequeñas y rápidas para trabajar con imágenes sin enviarlas a una API de procesamiento.',
      privacyNote: 'El código y los recursos se descargan desde Pixel Crunch; tus imágenes permanecen en el navegador durante el procesamiento.',
      toolsHeading: 'Elige una herramienta',
      tools: [
        { route: 'compress', title: 'Comprimir', description: 'Reduce el peso de JPG, PNG, WebP, GIF y SVG con control de calidad y descarga por lotes.', action: 'Comprimir imágenes', accent: 'cyan' },
        { route: 'convert', title: 'Convertir', description: 'Convierte formatos compatibles del navegador a JPG, PNG, WebP o AVIF.', action: 'Convertir imágenes', accent: 'pink' },
        { route: 'removeBackground', title: 'Quitar fondo', description: 'Eliminación de fondo local mediante un modelo cargado sólo cuando lo necesites.', action: 'Ver avance', status: 'Próximamente', accent: 'green' },
      ],
      benefits: [
        { title: 'Privacidad práctica', description: 'No existe una API remota que reciba tus imágenes.' },
        { title: 'Una URL por tarea', description: 'Comparte o guarda directamente la herramienta que necesitas.' },
        { title: 'Carga enfocada', description: 'Cada página hidrata únicamente su herramienta activa.' },
      ],
    },
    compress: {
      title: 'Comprimir imágenes en el navegador — Pixel Crunch',
      description: 'Comprime JPG, PNG, WebP, GIF y SVG localmente con control de calidad, comparación y descarga ZIP.',
      heading: 'Comprimir imágenes',
      intro: 'Reduce el peso de tus imágenes directamente en el navegador. Ajusta la calidad y revisa el resultado antes de descargarlo.',
      bullets: ['Procesamiento local sin subir imágenes.', 'Conserva animaciones GIF y optimiza SVG.', 'Procesamiento por lotes y descarga ZIP.'],
      formats: ['JPG/JPEG/JFIF', 'PNG', 'WebP', 'GIF', 'SVG'],
      detailsTitle: 'Compresión con control',
      details: 'La compresión mantiene cada archivo en memoria durante la sesión. Puedes comparar el resultado, ajustar calidad y guardar archivos individuales o un ZIP.',
    },
    convert: {
      title: 'Convertir imágenes en el navegador — Pixel Crunch',
      description: 'Convierte JPG, PNG, WebP, GIF y AVIF a formatos de salida compatibles con tu navegador, sin subir archivos.',
      heading: 'Convertir imágenes',
      intro: 'Cambia el formato de imágenes que tu navegador puede decodificar. La disponibilidad de WebP y AVIF de salida depende del navegador.',
      bullets: ['Convierte a JPG, PNG, WebP o AVIF.', 'Los GIF animados exportan el primer fotograma.', 'Valida el MIME real antes de ofrecer la descarga.'],
      formats: ['JPG/JPEG/JFIF', 'PNG', 'WebP', 'GIF', 'AVIF'],
      detailsTitle: 'Compatibilidad honesta',
      details: 'Pixel Crunch usa los codecs del navegador. Si el navegador no puede decodificar una entrada o generar el formato elegido, muestra un error y no guarda un archivo con extensión incorrecta.',
    },
    removeBackground: {
      title: 'Quitar fondo en el navegador — Pixel Crunch',
      description: 'Próxima herramienta de Pixel Crunch para quitar fondos localmente en el navegador, sin una API de procesamiento remoto.',
      heading: 'Quitar fondo',
      intro: 'Esta herramienta ejecutará la segmentación en tu dispositivo y descargará el modelo sólo al iniciar el proceso.',
      bullets: ['Inferencia completamente en el navegador.', 'Worker independiente y carga bajo demanda.', 'Salida transparente en PNG o WebP.'],
      detailsTitle: 'Privacidad desde el diseño',
      details: 'El modelo será un recurso estático servido por Pixel Crunch. Procesamiento local no significa que funcione offline desde la primera visita.',
      pendingLabel: 'En preparación',
      pendingDescription: 'La interfaz se habilitará después de validar el motor, los límites de memoria y los fallbacks de navegador.',
    },
  },
  en: {
    landing: {
      title: 'Pixel Crunch — Private image tools',
      description: 'Compress, convert, and soon remove image backgrounds directly in your browser without uploading files to a server.',
      heading: 'Your images. Your device. Your tools.',
      intro: 'Pixel Crunch brings together focused image tools that work without sending your files to a processing API.',
      privacyNote: 'Code and resources are downloaded from Pixel Crunch; your images remain in the browser while they are processed.',
      toolsHeading: 'Choose a tool',
      tools: [
        { route: 'compress', title: 'Compress', description: 'Reduce JPG, PNG, WebP, GIF, and SVG file size with quality control and batch downloads.', action: 'Compress images', accent: 'cyan' },
        { route: 'convert', title: 'Convert', description: 'Convert browser-compatible images to JPG, PNG, WebP, or AVIF.', action: 'Convert images', accent: 'pink' },
        { route: 'removeBackground', title: 'Remove background', description: 'Local background removal with a model loaded only when you need it.', action: 'View progress', status: 'Coming soon', accent: 'green' },
      ],
      benefits: [
        { title: 'Practical privacy', description: 'No remote processing API receives your images.' },
        { title: 'One URL per task', description: 'Share or bookmark the exact tool you need.' },
        { title: 'Focused loading', description: 'Each page hydrates only its active tool.' },
      ],
    },
    compress: {
      title: 'Compress images in your browser — Pixel Crunch',
      description: 'Compress JPG, PNG, WebP, GIF, and SVG locally with quality control, comparison, and ZIP downloads.',
      heading: 'Compress images',
      intro: 'Reduce image file size directly in your browser. Adjust quality and inspect the result before downloading.',
      bullets: ['Local processing without image uploads.', 'Preserves animated GIF files and optimizes SVG.', 'Batch processing and ZIP downloads.'],
      formats: ['JPG/JPEG/JFIF', 'PNG', 'WebP', 'GIF', 'SVG'],
      detailsTitle: 'Compression with control',
      details: 'Files remain in memory during the session. Compare output, adjust quality, and download individual files or a ZIP archive.',
    },
    convert: {
      title: 'Convert images in your browser — Pixel Crunch',
      description: 'Convert JPG, PNG, WebP, GIF, and AVIF to output formats supported by your browser without uploading files.',
      heading: 'Convert images',
      intro: 'Change the format of images your browser can decode. WebP and AVIF output availability depends on the browser.',
      bullets: ['Convert to JPG, PNG, WebP, or AVIF.', 'Animated GIF files export the first frame.', 'Checks the actual MIME type before download.'],
      formats: ['JPG/JPEG/JFIF', 'PNG', 'WebP', 'GIF', 'AVIF'],
      detailsTitle: 'Honest compatibility',
      details: 'Pixel Crunch uses browser codecs. If the browser cannot decode the input or create the selected output, it reports an error instead of saving a file with the wrong extension.',
    },
    removeBackground: {
      title: 'Remove image backgrounds in your browser — Pixel Crunch',
      description: 'Upcoming Pixel Crunch tool for local background removal in the browser without a remote processing API.',
      heading: 'Remove background',
      intro: 'This tool will run segmentation on your device and download its model only after you start processing.',
      bullets: ['Inference runs entirely in the browser.', 'Independent worker and on-demand loading.', 'Transparent PNG or WebP output.'],
      detailsTitle: 'Privacy by design',
      details: 'The model will be a static resource served by Pixel Crunch. Local processing does not mean first-visit offline support.',
      pendingLabel: 'In preparation',
      pendingDescription: 'The interface will be enabled after the engine, memory limits, and browser fallbacks are validated.',
    },
  },
} as const satisfies Record<Locale, SiteContent>;
