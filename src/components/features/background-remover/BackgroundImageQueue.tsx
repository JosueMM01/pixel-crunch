import { useEffect, useState } from 'react';
import { Check, ImagePlus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BackgroundRemovalPanelCopy, BackgroundRemovalQueueItem } from '@/types';

interface BackgroundImageQueueProps {
  items: BackgroundRemovalQueueItem[];
  activeId: string;
  disabled: boolean;
  copy: BackgroundRemovalPanelCopy;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

function QueueThumbnail({
  item,
  active,
  disabled,
  copy,
  onSelect,
  onRemove,
}: {
  item: BackgroundRemovalQueueItem;
  active: boolean;
  disabled: boolean;
  copy: BackgroundRemovalPanelCopy;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState('');
  const preview = item.editedOutput ?? item.result?.output ?? item.file;

  useEffect(() => {
    const nextUrl = URL.createObjectURL(preview);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [preview]);

  return (
    <li className="group relative w-20 shrink-0">
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        aria-current={active ? 'true' : undefined}
        className={cn(
          'relative h-20 w-20 overflow-hidden rounded-2xl border-2 bg-monokai-fg/5 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-monokai-green focus:ring-offset-2 focus:ring-offset-monokai-bg',
          active ? 'border-monokai-green' : 'border-monokai-fg/15 hover:border-monokai-green/55',
        )}
      >
        {url ? <img src={url} alt={item.file.name} className="h-full w-full object-contain" /> : null}
        {item.result ? (
          <span className="absolute bottom-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-monokai-green text-monokai-bg" title={copy.processedLabel}>
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">{copy.processedLabel}</span>
          </span>
        ) : null}
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="absolute -right-1.5 -top-1.5 grid h-7 w-7 place-items-center rounded-full border border-monokai-fg/20 bg-monokai-bg text-monokai-pink shadow-md transition-colors hover:bg-monokai-pink hover:text-white focus:outline-none focus:ring-2 focus:ring-monokai-pink"
        aria-label={`${copy.removeLabel}: ${item.file.name}`}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <p className="mt-1 truncate text-center text-[11px] text-monokai-fg/60" title={item.file.name}>{item.file.name}</p>
    </li>
  );
}

export function BackgroundImageQueue({
  items,
  activeId,
  disabled,
  copy,
  onSelect,
  onRemove,
  onAdd,
}: BackgroundImageQueueProps) {
  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-monokai-fg">{copy.queueLabel}</h2>
        <span className="text-xs text-monokai-fg/55">{copy.queueCountLabel.replace('{count}', String(items.length))}</span>
      </div>
      <ul className="flex gap-3 overflow-x-auto px-1 pb-2 pt-2" aria-label={copy.queueLabel}>
        {items.map((item) => (
          <QueueThumbnail
            key={item.id}
            item={item}
            active={item.id === activeId}
            disabled={disabled}
            copy={copy}
            onSelect={() => onSelect(item.id)}
            onRemove={() => onRemove(item.id)}
          />
        ))}
        {items.length < 20 ? (
          <li className="w-20 shrink-0">
            <button
              type="button"
              onClick={onAdd}
              disabled={disabled}
              className="grid h-20 w-20 place-items-center rounded-2xl border-2 border-dashed border-monokai-green/45 text-monokai-green transition-colors hover:bg-monokai-green/10 focus:outline-none focus:ring-2 focus:ring-monokai-green"
              aria-label={copy.addImagesLabel}
            >
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
            </button>
            <p className="mt-1 truncate text-center text-[11px] text-monokai-fg/60">{copy.addImagesLabel}</p>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
