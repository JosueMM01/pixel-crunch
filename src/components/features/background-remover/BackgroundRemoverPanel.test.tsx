import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import translations from '@/i18n/es.json';
import { BackgroundRemoverPanel } from './BackgroundRemoverPanel';

const useBackgroundRemovalMock = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useBackgroundRemoval', () => ({
  useBackgroundRemoval: useBackgroundRemovalMock,
}));

const process = vi.fn();
const cancel = vi.fn();
const clear = vi.fn();

function engineState(overrides: Record<string, unknown> = {}) {
  return {
    status: 'idle',
    progress: null,
    result: null,
    error: null,
    modelSource: 'unknown',
    activeRoute: null,
    process,
    cancel,
    clear,
    ...overrides,
  };
}

function pasteImage(file = new File(['image'], 'portrait.png', { type: 'image/png' })) {
  const event = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', {
    value: {
      items: [{ kind: 'file', type: file.type, getAsFile: () => file }],
    },
  });
  window.dispatchEvent(event);
}

describe('BackgroundRemoverPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    useBackgroundRemovalMock.mockReturnValue(engineState());
  });

  it('offers picker, drag and clipboard entry points', () => {
    render(<BackgroundRemoverPanel copy={translations.backgroundRemoval} />);

    expect(screen.getByRole('button', { name: 'Cargar imagen' })).toBeTruthy();
    expect(screen.getByText(/Ctrl \+ V/)).toBeTruthy();
    expect(screen.getByText(/JPG, PNG o WebP/)).toBeTruthy();
  });

  it('keeps a pasted image in memory and starts the selected operation', async () => {
    render(<BackgroundRemoverPanel copy={translations.backgroundRemoval} />);
    pasteImage();

    expect(await screen.findByText('portrait.png')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar fondo' }));

    expect(process).toHaveBeenCalledWith(expect.any(File), 'original');
    expect(clear).toHaveBeenCalledOnce();
  });

  it('exposes cancellation while an operation is active', async () => {
    const view = render(<BackgroundRemoverPanel copy={translations.backgroundRemoval} />);
    pasteImage();
    await screen.findByText('portrait.png');

    useBackgroundRemovalMock.mockReturnValue(engineState({ status: 'processing' }));
    view.rerender(<BackgroundRemoverPanel copy={translations.backgroundRemoval} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(cancel).toHaveBeenCalledOnce();
  });
});
