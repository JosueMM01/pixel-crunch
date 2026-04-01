import { useCallback, useMemo } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { ImagePlus, UploadCloud } from 'lucide-react';
import {
    DEFAULT_ACCEPTED_FORMATS,
    getDropzoneAcceptMap,
} from '@/lib/formats';
import { cn, formatBytes } from '@/lib/utils';
import { showError, showSuccess } from '@/lib/toast';
import type { UploadZoneCopy, UploadZoneProps } from '@/types';

const DEFAULT_COPY: UploadZoneCopy = {
    title: 'Sube tus imagenes',
    description: 'Arrastra archivos aqui o haz clic para seleccionar.',
    idleLabel: 'Arrastra imagenes aqui o haz clic para seleccionar',
    draggingLabel: 'Suelta los archivos para cargarlos',
    processingLabel: 'Procesando archivos...',
    helperLabel: 'Formatos soportados: JPG/JPEG/JFIF, PNG, WebP',
    successLabel: '{count} imagen(es) cargada(s) correctamente.',
    sizeErrorLabel: 'Archivo muy grande. Maximo 10MB.',
    typeErrorLabel: 'Formato no soportado. Solo JPG/JPEG/JFIF, PNG y WebP.',
};

export const UploadZone = ({
    onFilesSelected,
    acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
    maxFileSize = 10 * 1024 * 1024,
    multiple = true,
    isProcessing = false,
    copy,
}: UploadZoneProps) => {
    const resolvedCopy = useMemo<UploadZoneCopy>(
        () => ({ ...DEFAULT_COPY, ...copy }),
        [copy]
    );

    const accept = useMemo<Record<string, string[]>>(
        () => getDropzoneAcceptMap(acceptedFormats),
        [acceptedFormats]
    );

    const handleDrop = useCallback(
        (files: File[]) => {
            if (files.length === 0) return;
            onFilesSelected?.(files);

            const successMessage = resolvedCopy.successLabel.replace(
                '{count}',
                String(files.length)
            );
            showSuccess(successMessage);
        },
        [onFilesSelected, resolvedCopy.successLabel]
    );

    const handleRejected = useCallback(
        (rejections: FileRejection[]) => {
            const messages = new Set<string>();
            rejections.forEach((rejection) => {
                rejection.errors.forEach((error) => {
                    if (error.code === 'file-too-large') {
                        messages.add(resolvedCopy.sizeErrorLabel);
                        return;
                    }
                    if (error.code === 'file-invalid-type') {
                        messages.add(resolvedCopy.typeErrorLabel);
                        return;
                    }
                    messages.add(error.message);
                });
            });

            messages.forEach((message) => showError(message));
        },
        [resolvedCopy]
    );

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        accept,
        maxSize: maxFileSize,
        multiple,
        onDrop: handleDrop,
        onDropRejected: handleRejected,
    });

    const helperText = `${resolvedCopy.helperLabel} • Max ${formatBytes(maxFileSize)}`;

    return (
        <section className="w-full max-w-5xl mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-monokai-cyan">
                    {resolvedCopy.title}
                </h2>
                <p className="mt-2 text-sm md:text-base text-monokai-fg/70">
                    {resolvedCopy.description}
                </p>
            </div>

            <div
                {...getRootProps({
                    className: cn(
                        'group relative rounded-2xl border-2 border-dashed p-6 md:p-10',
                        'transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan',
                        'bg-monokai-bg/60',
                        isDragActive && 'border-monokai-green bg-monokai-green/10',
                        isDragReject && 'border-monokai-pink bg-monokai-pink/10',
                        !isDragActive && !isDragReject && 'border-monokai-purple/40'
                    ),
                })}
                aria-busy={isProcessing}
                aria-live="polite"
            >
                <input {...getInputProps()} aria-label="Seleccionar archivos" />

                <div className="flex flex-col items-center gap-4 text-center">
                    <div
                        className={cn(
                            'flex h-14 w-14 items-center justify-center rounded-2xl',
                            'bg-monokai-bg/80 border border-monokai-purple/50',
                            isDragActive && 'border-monokai-green text-monokai-green',
                            isDragReject && 'border-monokai-pink text-monokai-pink'
                        )}
                    >
                        {isDragActive ? (
                            <UploadCloud className="h-6 w-6" aria-hidden="true" />
                        ) : (
                            <ImagePlus className="h-6 w-6" aria-hidden="true" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <p className="text-base md:text-lg font-semibold text-monokai-fg">
                            {isProcessing
                                ? resolvedCopy.processingLabel
                                : isDragActive
                                    ? resolvedCopy.draggingLabel
                                    : resolvedCopy.idleLabel}
                        </p>
                        <p className="text-xs md:text-sm text-monokai-fg/60">{helperText}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
