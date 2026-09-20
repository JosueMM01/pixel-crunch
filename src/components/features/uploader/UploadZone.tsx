import { useCallback, useMemo } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { ImagePlus, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
    DEFAULT_ACCEPTED_FORMATS,
    getDropzoneAcceptMap,
} from '@/lib/formats';
import { cn, formatBytes } from '@/lib/utils';
import { showError, showSuccess } from '@/lib/toast';
import type { UploadZoneCopy, UploadZoneProps } from '@/types';

const DEFAULT_COPY: UploadZoneCopy = {
    title: 'Seleccionar imágenes',
    description: 'Arrastra archivos aquí para seleccionar.',
    idleLabel: 'Arrastra imágenes aquí',
    draggingLabel: 'Suelta los archivos para cargarlos',
    processingLabel: 'Procesando archivos...',
    helperLabel: 'Formatos compatibles: JPG/JPEG/JFIF, PNG, WebP, GIF y SVG',
    addMoreLabel: 'Agregar imágenes',
    clearAllLabel: 'Borrar todo',
    compressLabel: 'Comprimir',
    saveLabel: 'Guardar',
    savingLabel: 'Guardando...',
    successLabel: '{count} imagen(es) cargada(s) correctamente.',
    sizeErrorLabel: 'Archivo demasiado grande. Máximo 10 MB.',
    typeErrorLabel: 'Formato no compatible. Solo JPG/JPEG/JFIF, PNG, WebP, GIF y SVG.',
};

export const UploadZone = ({
    onFilesSelected,
    acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
    maxFileSize = 10 * 1024 * 1024,
    multiple = true,
    isProcessing = false,
    hasFiles = false,
    onClearAll,
    copy,
    children,
    footerActions,
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

    const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
        accept,
        maxSize: maxFileSize,
        multiple,
        onDrop: handleDrop,
        onDropRejected: handleRejected,
        noClick: true,
    });

    const helperText = `${resolvedCopy.helperLabel} • Max ${formatBytes(maxFileSize)}`;

    return (
        <section className="mx-auto w-full max-w-5xl">
            <div
                className="group relative rounded-2xl border border-monokai-fg/15 bg-monokai-bg/60 p-3 shadow-lg shadow-black/5 md:p-4"
                aria-busy={isProcessing}
            >
                {hasFiles ? <div className="mb-3 flex flex-wrap justify-end gap-2">
                    <Button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            open();
                        }}
                        disabled={isProcessing}
                        variant="ghost"
                        size="sm"
                        icon={<ImagePlus className="h-4 w-4" />}
                        className="border border-monokai-cyan/35 text-monokai-cyan hover:bg-monokai-cyan/10 whitespace-nowrap"
                    >
                        {resolvedCopy.addMoreLabel}
                    </Button>

                    <Button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onClearAll?.();
                        }}
                        disabled={!hasFiles || !onClearAll || isProcessing}
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                        className="border border-monokai-pink/35 text-monokai-pink hover:bg-monokai-pink/10 whitespace-nowrap"
                    >
                        {resolvedCopy.clearAllLabel}
                    </Button>
                </div> : null}

                <div
                    {...getRootProps({
                        className: cn(
                            'rounded-xl border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan',
                            hasFiles
                                ? 'border-monokai-fg/10 bg-monokai-bg/35 p-2 md:p-3'
                                : 'border-2 border-dashed border-monokai-cyan/35 bg-monokai-bg/70 px-4 py-8 md:px-6 md:py-10',
                            isDragActive && !hasFiles && 'border-monokai-green bg-monokai-green/10',
                            isDragReject && !hasFiles && 'border-monokai-pink bg-monokai-pink/10'
                        ),
                        role: 'region',
                    })}
                    aria-label={resolvedCopy.idleLabel}
                    aria-live="polite"
                >
                    <input {...getInputProps()} aria-hidden="true" tabIndex={-1} />

                    {hasFiles && children ? (
                        <div className="space-y-3" onClick={(event) => event.stopPropagation()}>
                            {children}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 text-center">
                            <div
                                className={cn(
                                    'flex h-12 w-12 items-center justify-center rounded-xl',
                                    'bg-monokai-bg/80 border border-monokai-cyan/45 text-monokai-cyan',
                                    isDragActive && 'border-monokai-green text-monokai-green',
                                    isDragReject && 'border-monokai-pink text-monokai-pink'
                                )}
                            >
                                {isDragActive ? (
                                    <UploadCloud className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                                )}
                            </div>

                            <div>
                                <p className="text-base font-semibold text-monokai-fg md:text-lg">
                                    {isProcessing
                                        ? resolvedCopy.processingLabel
                                        : isDragActive
                                            ? resolvedCopy.draggingLabel
                                            : resolvedCopy.idleLabel}
                                </p>
                                <p className="mt-1 text-xs text-monokai-fg/60 md:text-sm">{helperText}</p>
                            </div>
                            <Button
                                type="button"
                                onClick={(event) => { event.stopPropagation(); open(); }}
                                disabled={isProcessing}
                                size="sm"
                                icon={<ImagePlus className="h-4 w-4" />}
                                className="!bg-monokai-cyan font-semibold !text-monokai-bg hover:!bg-monokai-cyan/85"
                            >
                                {resolvedCopy.title}
                            </Button>
                        </div>
                    )}
                </div>

                {hasFiles && footerActions ? (
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 border-t border-monokai-fg/10 pt-3">
                        {footerActions}
                    </div>
                ) : null}
            </div>
        </section>
    );
};
