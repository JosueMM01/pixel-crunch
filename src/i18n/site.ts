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
  faq: Array<{ question: string; answer: string }>;
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
  removeBackground: ToolPageContent;
}

export const siteContent = {
  es: {
    landing: {
      title: 'Pixel Crunch — Comprimir, convertir y quitar fondo',
      description: 'Comprime, convierte y quita el fondo de imágenes gratis en tu navegador. Tus archivos se procesan localmente y no se envían a una API.',
      heading: 'Tus imágenes. Tu dispositivo. Tus herramientas.',
      intro: 'Pixel Crunch reúne herramientas pequeñas y rápidas para trabajar con imágenes sin enviarlas a una API de procesamiento.',
      privacyNote: 'El código y los recursos se descargan desde Pixel Crunch; tus imágenes permanecen en el navegador durante el procesamiento.',
      toolsHeading: 'Elige una herramienta',
      exploreToolsLabel: 'Explorar herramientas',
      learnMoreLabel: 'Cómo funciona',
      tools: [
        { route: 'compress', title: 'Comprimir', description: 'Reduce el peso de JPG, PNG, WebP, GIF y SVG con control de calidad y descarga por lotes.', action: 'Comprimir imágenes', accent: 'cyan' },
        { route: 'convert', title: 'Convertir', description: 'Convierte formatos compatibles del navegador a JPG, PNG, WebP o AVIF.', action: 'Convertir imágenes', accent: 'pink' },
        { route: 'removeBackground', title: 'Quitar fondo', description: 'Elimina el fondo localmente mediante un modelo cargado sólo cuando inicias el proceso.', action: 'Quitar fondo', accent: 'green' },
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
          { title: 'Elige una tarea', description: 'Abre la herramienta que necesitas y selecciona una o varias imágenes compatibles.' },
          { title: 'Procesa en tu dispositivo', description: 'El navegador lee y transforma los archivos localmente. Pixel Crunch no los envía a una API de procesamiento.' },
          { title: 'Revisa y descarga', description: 'Comprueba el resultado, ajusta las opciones disponibles y guarda archivos individuales o un ZIP cuando corresponda.' },
        ],
      },
      toolGuide: {
        eyebrow: 'Qué hace cada herramienta',
        title: 'Usa la herramienta adecuada para cada imagen',
        intro: 'Comprimir, convertir y quitar fondo resuelven problemas distintos, pero mantienen el procesamiento en tu navegador.',
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
            description: 'Ejecuta un modelo en el dispositivo para separar el sujeto y generar una salida transparente, sin una API remota de inferencia.',
            facts: ['Entrada JPG, PNG o WebP', 'Modelo cargado sólo al iniciar', 'Salida transparente PNG o WebP'],
            action: 'Quitar fondo',
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
          { title: 'Red con límites claros', description: 'El navegador descarga la aplicación y el modelo público cuando quitas un fondo. Esto no equivale a subir la imagen.' },
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
        boundaryDescription: 'Se descargan la aplicación y sus recursos públicos. La imagen que seleccionas no se adjunta a una solicitud de procesamiento. Al quitar fondo, el modelo se descarga al navegador antes de ejecutar la inferencia local.',
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
          { question: '¿Funciona sin conexión?', answer: 'No se garantiza en la primera visita ni para todos los recursos. Primero necesitas descargar la aplicación; Quitar fondo también necesita descargar el modelo antes de ejecutar la inferencia local.' },
          { question: '¿Cómo funciona Quitar fondo?', answer: 'El navegador descarga el modelo, analiza la imagen en el dispositivo y genera una salida transparente. La imagen no se envía a una API remota de inferencia; la velocidad y memoria disponible dependen del dispositivo.' },
        ],
      },
    },
    compress: {
      title: 'Comprimir imágenes online gratis — Pixel Crunch',
      description: 'Comprime imágenes JPG, PNG, WebP, GIF y SVG gratis en tu navegador. Compara la calidad, procesa lotes y descarga un ZIP sin subir archivos.',
      heading: 'Comprimir imágenes online gratis',
      intro: 'Reduce el peso de tus imágenes directamente en el navegador. Ajusta la calidad y revisa el resultado antes de descargarlo.',
      bullets: ['Procesamiento local sin subir imágenes.', 'Conserva animaciones GIF y optimiza SVG.', 'Procesamiento por lotes y descarga ZIP.'],
      formats: ['JPG/JPEG/JFIF', 'PNG', 'WebP', 'GIF', 'SVG'],
      detailsTitle: 'Compresión con control',
      details: 'La compresión mantiene cada archivo en memoria durante la sesión. Puedes comparar el resultado, ajustar calidad y guardar archivos individuales o un ZIP.',
      faq: [
        { question: '¿Cómo comprimir una imagen sin subirla a un servidor?', answer: 'Selecciona una o varias imágenes, ajusta la calidad y descarga el resultado. Pixel Crunch realiza la compresión dentro del navegador.' },
        { question: '¿Qué formatos puede comprimir Pixel Crunch?', answer: 'Admite JPG, JPEG, JFIF, PNG, WebP, GIF y SVG. Conserva la animación de GIF y optimiza SVG sin rasterizarlo.' },
        { question: '¿Comprimir reduce la calidad?', answer: 'Puede hacerlo en formatos con pérdida. La comparación y el control de calidad permiten decidir el equilibrio antes de descargar.' },
      ],
    },
    convert: {
      title: 'Convertir imágenes online gratis — Pixel Crunch',
      description: 'Convierte imágenes JPG, PNG, WebP, GIF y AVIF gratis en tu navegador. Exporta formatos compatibles sin subir tus archivos a un servidor.',
      heading: 'Convertir imágenes online gratis',
      intro: 'Cambia el formato de imágenes que tu navegador puede decodificar. La disponibilidad de WebP y AVIF de salida depende del navegador.',
      bullets: ['Convierte a JPG, PNG, WebP o AVIF.', 'Los GIF animados exportan el primer fotograma.', 'Valida el MIME real antes de ofrecer la descarga.'],
      formats: ['JPG/JPEG/JFIF', 'PNG', 'WebP', 'GIF', 'AVIF'],
      detailsTitle: 'Compatibilidad honesta',
      details: 'Pixel Crunch usa los codecs del navegador. Si el navegador no puede decodificar una entrada o generar el formato elegido, muestra un error y no guarda un archivo con extensión incorrecta.',
      faq: [
        { question: '¿A qué formatos puedo convertir una imagen?', answer: 'Puedes exportar JPG, PNG, WebP o AVIF cuando el navegador admite ese codec. Pixel Crunch valida el formato real antes de descargar.' },
        { question: '¿Puedo convertir PNG a JPG o WebP?', answer: 'Sí. El convertidor acepta PNG y permite elegir JPG o WebP, además de otros formatos compatibles con el navegador.' },
        { question: '¿Qué ocurre con un GIF animado?', answer: 'El convertidor exporta sólo el primer fotograma. Usa el compresor si quieres conservar la animación del GIF.' },
      ],
    },
    removeBackground: {
      title: 'Quitar fondo de imagen gratis — Pixel Crunch',
      description: 'Quita el fondo de una imagen gratis y crea un PNG o WebP transparente. El modelo se ejecuta localmente en tu navegador, sin una API de inferencia.',
      heading: 'Quitar fondo de una imagen gratis',
      intro: 'La herramienta ejecuta la segmentación en tu dispositivo y descarga el modelo sólo cuando inicias el proceso.',
      bullets: ['Inferencia completamente en el navegador.', 'Worker independiente y carga bajo demanda.', 'Salida transparente en PNG o WebP.'],
      detailsTitle: 'Privacidad desde el diseño',
      details: 'El modelo es un recurso estático servido por Pixel Crunch. Procesamiento local no significa que funcione offline desde la primera visita.',
      faq: [
        { question: '¿La imagen se envía a un servidor para quitar el fondo?', answer: 'No. El navegador descarga un modelo público y ejecuta la inferencia en tu dispositivo; la imagen no se envía a una API remota de procesamiento.' },
        { question: '¿Por qué se descarga un modelo?', answer: 'El modelo contiene los datos necesarios para distinguir el sujeto del fondo. Se descarga al iniciar el proceso y el navegador puede conservarlo en caché.' },
        { question: '¿En qué formato se descarga el resultado?', answer: 'Puedes descargar una imagen transparente en PNG o WebP. La disponibilidad de WebP depende del navegador.' },
      ],
    },
  },
  en: {
    landing: {
      title: 'Pixel Crunch — Image compressor, converter and background remover',
      description: 'Compress, convert, and remove image backgrounds for free in your browser. Files are processed locally and are not sent to a processing API.',
      heading: 'Your images. Your device. Your tools.',
      intro: 'Pixel Crunch brings together focused image tools that work without sending your files to a processing API.',
      privacyNote: 'Code and resources are downloaded from Pixel Crunch; your images remain in the browser while they are processed.',
      toolsHeading: 'Choose a tool',
      exploreToolsLabel: 'Explore tools',
      learnMoreLabel: 'How it works',
      tools: [
        { route: 'compress', title: 'Compress', description: 'Reduce JPG, PNG, WebP, GIF, and SVG file size with quality control and batch downloads.', action: 'Compress images', accent: 'cyan' },
        { route: 'convert', title: 'Convert', description: 'Convert browser-compatible images to JPG, PNG, WebP, or AVIF.', action: 'Convert images', accent: 'pink' },
        { route: 'removeBackground', title: 'Remove background', description: 'Remove backgrounds locally with a model loaded only after you start processing.', action: 'Remove background', accent: 'green' },
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
          { title: 'Choose a task', description: 'Open the tool you need and select one or more compatible images.' },
          { title: 'Process on your device', description: 'The browser reads and transforms the files locally. Pixel Crunch does not send them to a processing API.' },
          { title: 'Review and download', description: 'Inspect the result, adjust available options, and save individual files or a ZIP when supported.' },
        ],
      },
      toolGuide: {
        eyebrow: 'What each tool does',
        title: 'Use the right tool for each image',
        intro: 'Compression, conversion, and background removal solve different problems while keeping processing in your browser.',
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
            description: 'A model running on your device separates the subject and creates transparent output without a remote inference API.',
            facts: ['JPG, PNG, or WebP input', 'Model loads only after you start', 'Transparent PNG or WebP output'],
            action: 'Remove background',
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
          { title: 'Clear network boundaries', description: 'Your browser downloads the application and the public model when removing a background. That is different from uploading an image.' },
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
        boundaryDescription: 'The application and its public resources are downloaded. The image you select is not attached to a processing request. When removing a background, the model is downloaded to the browser before local inference runs.',
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
          { question: 'Does it work offline?', answer: 'First-visit and complete offline use are not guaranteed. You must download the application first; background removal also needs to download its model before local inference runs.' },
          { question: 'How does background removal work?', answer: 'The browser downloads the model, analyzes the image on your device, and creates transparent output. The image is not sent to a remote inference API; speed and available memory depend on the device.' },
        ],
      },
    },
    compress: {
      title: 'Free image compressor online — Pixel Crunch',
      description: 'Compress JPG, PNG, WebP, GIF, and SVG images online for free. Compare quality, process batches, and download a ZIP without uploading files.',
      heading: 'Free image compressor online',
      intro: 'Reduce image file size directly in your browser. Adjust quality and inspect the result before downloading.',
      bullets: ['Local processing without image uploads.', 'Preserves animated GIF files and optimizes SVG.', 'Batch processing and ZIP downloads.'],
      formats: ['JPG/JPEG/JFIF', 'PNG', 'WebP', 'GIF', 'SVG'],
      detailsTitle: 'Compression with control',
      details: 'Files remain in memory during the session. Compare output, adjust quality, and download individual files or a ZIP archive.',
      faq: [
        { question: 'How can I compress an image without uploading it?', answer: 'Select one or more images, adjust quality, and download the result. Pixel Crunch performs compression inside your browser.' },
        { question: 'Which image formats can Pixel Crunch compress?', answer: 'It supports JPG, JPEG, JFIF, PNG, WebP, GIF, and SVG. GIF animation is preserved and SVG files stay vector-based.' },
        { question: 'Does image compression reduce quality?', answer: 'It can in lossy formats. The comparison and quality control let you choose the balance before downloading.' },
      ],
    },
    convert: {
      title: 'Free image converter online — Pixel Crunch',
      description: 'Convert JPG, PNG, WebP, GIF, and AVIF images online for free. Export supported formats in your browser without uploading files to a server.',
      heading: 'Free image converter online',
      intro: 'Change the format of images your browser can decode. WebP and AVIF output availability depends on the browser.',
      bullets: ['Convert to JPG, PNG, WebP, or AVIF.', 'Animated GIF files export the first frame.', 'Checks the actual MIME type before download.'],
      formats: ['JPG/JPEG/JFIF', 'PNG', 'WebP', 'GIF', 'AVIF'],
      detailsTitle: 'Honest compatibility',
      details: 'Pixel Crunch uses browser codecs. If the browser cannot decode the input or create the selected output, it reports an error instead of saving a file with the wrong extension.',
      faq: [
        { question: 'Which formats can I convert an image to?', answer: 'You can export JPG, PNG, WebP, or AVIF when your browser supports that codec. Pixel Crunch verifies the real output format.' },
        { question: 'Can I convert PNG to JPG or WebP?', answer: 'Yes. The converter accepts PNG and lets you choose JPG or WebP, along with other formats supported by your browser.' },
        { question: 'What happens to an animated GIF?', answer: 'The converter exports only the first frame. Use the compressor when you need to preserve GIF animation.' },
      ],
    },
    removeBackground: {
      title: 'Remove image background free — Pixel Crunch',
      description: 'Remove an image background online for free and create a transparent PNG or WebP. The model runs locally in your browser without a remote inference API.',
      heading: 'Remove image backgrounds online for free',
      intro: 'The tool runs segmentation on your device and downloads its model only after you start processing.',
      bullets: ['Inference runs entirely in the browser.', 'Independent worker and on-demand loading.', 'Transparent PNG or WebP output.'],
      detailsTitle: 'Privacy by design',
      details: 'The model is a static resource served by Pixel Crunch. Local processing does not mean first-visit offline support.',
      faq: [
        { question: 'Is my image sent to a server for background removal?', answer: 'No. The browser downloads a public model and runs inference on your device; the image is not sent to a remote processing API.' },
        { question: 'Why does the tool download a model?', answer: 'The model contains the data needed to separate a subject from its background. It loads when processing starts and can remain in browser cache.' },
        { question: 'Which format is the background-free result?', answer: 'You can download a transparent PNG or WebP image. WebP availability depends on browser support.' },
      ],
    },
  },
} as const satisfies Record<Locale, SiteContent>;
