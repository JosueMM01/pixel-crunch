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
    exploreToolsLabel: string;
    learnMoreLabel: string;
    tools: ToolCardContent[];
    benefits: Array<{ title: string; description: string }>;
    howItWorks: {
      eyebrow: string;
      title: string;
      intro: string;
      steps: Array<{ title: string; description: string }>;
    };
    toolGuide: {
      eyebrow: string;
      title: string;
      intro: string;
      items: Array<{
        route: Exclude<RouteKey, 'home'>;
        title: string;
        description: string;
        facts: string[];
        action: string;
      }>;
    };
    privacy: {
      eyebrow: string;
      title: string;
      intro: string;
      items: Array<{ title: string; description: string }>;
      sourceLabel: string;
    };
    technology: {
      eyebrow: string;
      title: string;
      intro: string;
      flowLabel: string;
      flow: Array<{ label: string; title: string; description: string }>;
      boundaryTitle: string;
      boundaryDescription: string;
      capabilities: Array<{ title: string; description: string }>;
    };
    formatGuide: {
      eyebrow: string;
      title: string;
      intro: string;
      formats: Array<{ name: string; bestFor: string; caution: string }>;
    };
    faq: {
      eyebrow: string;
      title: string;
      items: Array<{ question: string; answer: string }>;
    };
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
      exploreToolsLabel: 'Explorar herramientas',
      learnMoreLabel: 'Cómo funciona',
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
      howItWorks: {
        eyebrow: 'Cómo funciona',
        title: 'Del archivo al resultado, sin intermediarios',
        intro: 'Cada herramienta tiene un flujo breve y conserva el trabajo dentro de la sesión del navegador.',
        steps: [
          { title: 'Elige una tarea', description: 'Abre el compresor o el convertidor y selecciona una o varias imágenes compatibles.' },
          { title: 'Procesa en tu dispositivo', description: 'El navegador lee y transforma los archivos localmente. Pixel Crunch no los envía a una API de procesamiento.' },
          { title: 'Revisa y descarga', description: 'Comprueba el resultado, ajusta las opciones disponibles y guarda archivos individuales o un ZIP cuando corresponda.' },
        ],
      },
      toolGuide: {
        eyebrow: 'Qué hace cada herramienta',
        title: 'Usa la herramienta adecuada para cada imagen',
        intro: 'Comprimir y convertir resuelven problemas distintos. Quitar fondo se incorporará cuando su motor local esté validado.',
        items: [
          {
            route: 'compress',
            title: 'Comprimir imágenes',
            description: 'Reduce el peso del archivo intentando conservar una calidad visual útil. Es apropiado para páginas web, correo y almacenamiento.',
            facts: ['JPG, PNG, WebP, GIF y SVG', 'Control de calidad y comparación', 'Batch y descarga ZIP'],
            action: 'Abrir compresor',
          },
          {
            route: 'convert',
            title: 'Convertir imágenes',
            description: 'Cambia el formato para mejorar compatibilidad, transparencia o tamaño. La disponibilidad depende de los codecs del navegador.',
            facts: ['Entrada JPG, PNG, WebP, GIF y AVIF', 'Salida JPG, PNG, WebP o AVIF', 'GIF animado: se exporta el primer fotograma'],
            action: 'Abrir convertidor',
          },
          {
            route: 'removeBackground',
            title: 'Quitar fondo',
            description: 'Usará un modelo ejecutado en el dispositivo para generar una salida transparente, sin una API remota de inferencia.',
            facts: ['Disponible en una fase posterior', 'Modelo descargado sólo al iniciar', 'Límites de memoria y fallback por validar'],
            action: 'Conocer el avance',
          },
        ],
      },
      privacy: {
        eyebrow: 'Privacidad verificable',
        title: 'Tus imágenes no forman parte de una solicitud de procesamiento',
        intro: 'Cloudflare Pages entrega HTML, CSS, JavaScript y recursos públicos. La transformación se ejecuta en el navegador y no existe un endpoint de Pixel Crunch que reciba tus imágenes.',
        items: [
          { title: 'Sin cuenta ni historial', description: 'No necesitas registrarte y Pixel Crunch no mantiene una biblioteca de tus archivos.' },
          { title: 'Archivos efímeros', description: 'Las imágenes se conservan en memoria durante la sesión; puedes borrarlas desde la herramienta.' },
          { title: 'Código abierto', description: 'El proyecto y su licencia AGPL-3.0-only se pueden revisar públicamente.' },
          { title: 'Red con límites claros', description: 'El navegador sí descarga la aplicación y, en el futuro, el modelo público. Esto no equivale a subir la imagen.' },
        ],
        sourceLabel: 'Revisar el código fuente',
      },
      technology: {
        eyebrow: 'Tecnología y flujo de datos',
        title: 'Cloudflare entrega la aplicación. Tu navegador procesa la imagen.',
        intro: 'Pixel Crunch es un sitio estático. No existe una API de Pixel Crunch que reciba la imagen para comprimirla, convertirla o analizarla.',
        flowLabel: 'Flujo técnico desde la aplicación hasta la descarga',
        flow: [
          { label: '01 · Entrega', title: 'Cloudflare Pages', description: 'Sirve el HTML, los estilos, JavaScript y otros recursos públicos de Pixel Crunch.' },
          { label: '02 · Proceso', title: 'Tu navegador', description: 'Lee la imagen desde tu dispositivo y ejecuta la transformación en memoria con APIs web.' },
          { label: '03 · Resultado', title: 'Tu descarga', description: 'Genera un Blob local y lo guarda en tu dispositivo como archivo individual o ZIP.' },
        ],
        boundaryTitle: 'Qué cruza la red',
        boundaryDescription: 'Se descargan la aplicación y sus recursos públicos. La imagen que seleccionas no se adjunta a una solicitud de procesamiento. En la futura herramienta de quitar fondo, el modelo también se descargará al navegador antes de ejecutar la inferencia local.',
        capabilities: [
          { title: 'File API', description: 'Permite leer los archivos elegidos sin enviarlos a un formulario remoto.' },
          { title: 'Web Workers', description: 'Mueven tareas compatibles fuera del hilo principal para mantener la interfaz disponible.' },
          { title: 'Canvas + codecs', description: 'El navegador decodifica y vuelve a codificar los formatos que realmente soporta.' },
          { title: 'Blob + ZIP', description: 'Construye las descargas en memoria y agrupa resultados por lotes cuando corresponde.' },
        ],
      },
      formatGuide: {
        eyebrow: 'Guía rápida de formatos',
        title: 'El formato correcto depende del contenido',
        intro: 'Cambiar de formato no mejora por sí solo una imagen. Elige según calidad, transparencia, animación y compatibilidad.',
        formats: [
          { name: 'JPG', bestFor: 'Fotografías y compatibilidad amplia.', caution: 'Usa compresión con pérdida y no admite transparencia.' },
          { name: 'PNG', bestFor: 'Logos, capturas y gráficos con transparencia.', caution: 'Puede ser pesado para fotografías.' },
          { name: 'WebP', bestFor: 'Imágenes web con buen equilibrio entre calidad y tamaño.', caution: 'El resultado depende del soporte del navegador.' },
          { name: 'AVIF', bestFor: 'Reducir imágenes compatibles con navegadores modernos.', caution: 'Codificación y soporte no son uniformes en todos los navegadores.' },
          { name: 'GIF', bestFor: 'Animaciones sencillas y compatibilidad.', caution: 'El convertidor exporta únicamente el primer fotograma.' },
          { name: 'SVG', bestFor: 'Logos e ilustraciones vectoriales.', caution: 'Se optimiza en el compresor; no se acepta en el convertidor raster.' },
        ],
      },
      faq: {
        eyebrow: 'Preguntas frecuentes',
        title: 'Lo que conviene saber antes de empezar',
        items: [
          { question: '¿Pixel Crunch sube mis imágenes?', answer: 'No a un servidor de procesamiento. La aplicación transforma los archivos en el navegador. Tu navegador sí solicita el sitio, sus scripts y otros recursos públicos necesarios para ejecutarlo.' },
          { question: '¿Cuál es la diferencia entre comprimir y convertir?', answer: 'Comprimir intenta reducir el peso conservando el formato o su propósito. Convertir crea un archivo en otro formato para cambiar compatibilidad, transparencia o eficiencia.' },
          { question: '¿La calidad puede cambiar?', answer: 'Sí. Los formatos con pérdida y la reducción de colores pueden alterar detalle o color. Por eso el compresor permite ajustar y comparar antes de guardar.' },
          { question: '¿Existe un límite de tamaño?', answer: 'La interfaz actual acepta archivos de hasta 10 MB. El número y tamaño práctico de las imágenes también dependen de la memoria disponible en tu dispositivo.' },
          { question: '¿Funciona sin conexión?', answer: 'No se garantiza en la primera visita ni para todos los recursos. Primero necesitas descargar la aplicación; los modelos de IA también requerirán una descarga inicial cuando esa función esté disponible.' },
          { question: '¿Quitar fondo ya está disponible?', answer: 'Todavía no. La ruta explica el objetivo, pero el motor se habilitará después de validar calidad, memoria, cancelación y fallbacks de navegador.' },
        ],
      },
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
      exploreToolsLabel: 'Explore tools',
      learnMoreLabel: 'How it works',
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
      howItWorks: {
        eyebrow: 'How it works',
        title: 'From file to result, without intermediaries',
        intro: 'Each tool follows a short workflow and keeps the work inside your browser session.',
        steps: [
          { title: 'Choose a task', description: 'Open the compressor or converter and select one or more compatible images.' },
          { title: 'Process on your device', description: 'The browser reads and transforms the files locally. Pixel Crunch does not send them to a processing API.' },
          { title: 'Review and download', description: 'Inspect the result, adjust available options, and save individual files or a ZIP when supported.' },
        ],
      },
      toolGuide: {
        eyebrow: 'What each tool does',
        title: 'Use the right tool for each image',
        intro: 'Compression and conversion solve different problems. Background removal will arrive after its local engine is validated.',
        items: [
          {
            route: 'compress',
            title: 'Compress images',
            description: 'Reduce file size while aiming to preserve useful visual quality. Suitable for websites, email, and storage.',
            facts: ['JPG, PNG, WebP, GIF, and SVG', 'Quality controls and comparison', 'Batch processing and ZIP download'],
            action: 'Open compressor',
          },
          {
            route: 'convert',
            title: 'Convert images',
            description: 'Change format for compatibility, transparency, or size. Availability depends on your browser codecs.',
            facts: ['JPG, PNG, WebP, GIF, and AVIF input', 'JPG, PNG, WebP, or AVIF output', 'Animated GIF: exports the first frame'],
            action: 'Open converter',
          },
          {
            route: 'removeBackground',
            title: 'Remove background',
            description: 'A model running on your device will create transparent output without a remote inference API.',
            facts: ['Available in a later phase', 'Model loads only after you start', 'Memory limits and fallbacks still require validation'],
            action: 'View progress',
          },
        ],
      },
      privacy: {
        eyebrow: 'Verifiable privacy',
        title: 'Your images are not part of a processing request',
        intro: 'Cloudflare Pages delivers HTML, CSS, JavaScript, and public resources. Transformation runs in the browser, and Pixel Crunch has no endpoint that receives your images.',
        items: [
          { title: 'No account or history', description: 'You do not need to register, and Pixel Crunch does not maintain a library of your files.' },
          { title: 'Ephemeral files', description: 'Images stay in memory during the session and can be cleared from the tool.' },
          { title: 'Open source', description: 'The project and its AGPL-3.0-only license are publicly reviewable.' },
          { title: 'Clear network boundaries', description: 'Your browser downloads the application and, later, the public model. That is different from uploading an image.' },
        ],
        sourceLabel: 'Review the source code',
      },
      technology: {
        eyebrow: 'Technology and data flow',
        title: 'Cloudflare delivers the application. Your browser processes the image.',
        intro: 'Pixel Crunch is a static site. There is no Pixel Crunch API that receives the image to compress, convert, or analyze it.',
        flowLabel: 'Technical flow from application delivery to download',
        flow: [
          { label: '01 · Delivery', title: 'Cloudflare Pages', description: 'Serves Pixel Crunch HTML, styles, JavaScript, and other public resources.' },
          { label: '02 · Processing', title: 'Your browser', description: 'Reads the image from your device and performs the transformation in memory with web APIs.' },
          { label: '03 · Result', title: 'Your download', description: 'Creates a local Blob and saves it to your device as an individual file or ZIP.' },
        ],
        boundaryTitle: 'What crosses the network',
        boundaryDescription: 'The application and its public resources are downloaded. The image you select is not attached to a processing request. For the future background-removal tool, the model will also be downloaded to the browser before local inference runs.',
        capabilities: [
          { title: 'File API', description: 'Reads selected files without sending them through a remote form.' },
          { title: 'Web Workers', description: 'Move compatible tasks off the main thread to keep the interface available.' },
          { title: 'Canvas + codecs', description: 'The browser decodes and re-encodes the formats it actually supports.' },
          { title: 'Blob + ZIP', description: 'Builds downloads in memory and groups batch results when supported.' },
        ],
      },
      formatGuide: {
        eyebrow: 'Quick format guide',
        title: 'The right format depends on the content',
        intro: 'Changing format does not improve an image by itself. Choose based on quality, transparency, animation, and compatibility.',
        formats: [
          { name: 'JPG', bestFor: 'Photography and broad compatibility.', caution: 'Uses lossy compression and does not support transparency.' },
          { name: 'PNG', bestFor: 'Logos, screenshots, and graphics with transparency.', caution: 'Can be heavy for photographs.' },
          { name: 'WebP', bestFor: 'Web images with a useful quality-to-size balance.', caution: 'Output depends on browser support.' },
          { name: 'AVIF', bestFor: 'Reducing compatible images in modern browsers.', caution: 'Encoding and support are not uniform across browsers.' },
          { name: 'GIF', bestFor: 'Simple animation and compatibility.', caution: 'The converter exports only the first frame.' },
          { name: 'SVG', bestFor: 'Logos and vector illustrations.', caution: 'Optimized by the compressor; not accepted by the raster converter.' },
        ],
      },
      faq: {
        eyebrow: 'Frequently asked questions',
        title: 'What to know before you start',
        items: [
          { question: 'Does Pixel Crunch upload my images?', answer: 'Not to a processing server. The application transforms files in the browser. Your browser still requests the site, scripts, and other public resources required to run it.' },
          { question: 'What is the difference between compression and conversion?', answer: 'Compression aims to reduce file size while keeping the format or purpose. Conversion creates a different format to change compatibility, transparency, or efficiency.' },
          { question: 'Can image quality change?', answer: 'Yes. Lossy formats and color reduction can alter detail or color. The compressor lets you adjust and compare before saving.' },
          { question: 'Is there a file size limit?', answer: 'The current interface accepts files up to 10 MB. The practical number and size of images also depend on available device memory.' },
          { question: 'Does it work offline?', answer: 'First-visit and complete offline use are not guaranteed. You must download the application first, and AI models will also require an initial download when that feature becomes available.' },
          { question: 'Is background removal available now?', answer: 'Not yet. Its route explains the goal, but the engine will be enabled after quality, memory, cancellation, and browser fallbacks are validated.' },
        ],
      },
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
