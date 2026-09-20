import { act, fireEvent, render, screen } from '@testing-library/react';
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
  act(() => window.dispatchEvent(event));
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

    expect((await screen.findAllByText('portrait.png')).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar fondo' }));

    expect(process).toHaveBeenCalledWith(expect.any(File), 'original');
  });

  it('keeps multiple images until each one is removed', async () => {
    render(<BackgroundRemoverPanel copy={translations.backgroundRemoval} />);
    pasteImage(new File(['first'], 'first.png', { type: 'image/png' }));
    pasteImage(new File(['second'], 'second.png', { type: 'image/png' }));

    expect(await screen.findByText('2 de 20')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Borrar: first.png' }));

    expect(screen.queryByText('first.png')).toBeNull();
    expect(screen.getByText('1 de 20')).toBeTruthy();
    expect(screen.getAllByText('second.png').length).toBeGreaterThan(0);
  });

  it('exposes cancellation while an operation is active', async () => {
    const view = render(<BackgroundRemoverPanel copy={translations.backgroundRemoval} />);
    pasteImage();
    await screen.findAllByText('portrait.png');

    useBackgroundRemovalMock.mockReturnValue(engineState({ status: 'processing' }));
    view.rerender(<BackgroundRemoverPanel copy={translations.backgroundRemoval} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(cancel).toHaveBeenCalledOnce();
  });

  it('keeps a completed result attached to its image', async () => {
    const view = render(<BackgroundRemoverPanel copy={translations.backgroundRemoval} />);
    pasteImage();
    await screen.findAllByText('portrait.png');
    fireEvent.click(screen.getByRole('button', { name: 'Quitar fondo' }));

    useBackgroundRemovalMock.mockReturnValue(engineState({
      status: 'success',
      result: {
        output: new Blob(['result'], { type: 'image/png' }),
        route: { device: 'cpu', model: 'isnet_quint8' },
        attempts: [{ device: 'cpu', model: 'isnet_quint8' }],
      },
      activeRoute: { device: 'cpu', model: 'isnet_quint8' },
    }));
    view.rerender(<BackgroundRemoverPanel copy={translations.backgroundRemoval} />);

    expect(await screen.findByRole('button', { name: 'Descargar resultado' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Editar máscara' })).toBeTruthy();
    expect(clear).toHaveBeenCalled();
  });

  it('uses the selected resolution and exposes retryable errors', async () => {
    const view = render(<BackgroundRemoverPanel copy={translations.backgroundRemoval} />);
    pasteImage();
    await screen.findAllByText('portrait.png');
    fireEvent.change(screen.getByRole('combobox', { name: /Resolución de salida/ }), { target: { value: 'optimized' } });
    fireEvent.click(screen.getByRole('button', { name: 'Quitar fondo' }));
    expect(process).toHaveBeenLastCalledWith(expect.any(File), 'optimized');

    useBackgroundRemovalMock.mockReturnValue(engineState({
      status: 'error',
      error: { code: 'timeout', message: 'timeout' },
      activeRoute: { device: 'cpu', model: 'isnet_fp16' },
    }));
    view.rerender(<BackgroundRemoverPanel copy={translations.backgroundRemoval} />);
    expect(screen.getByRole('alert').textContent).toContain('resolución reducida');
    fireEvent.click(screen.getByRole('button', { name: 'Volver a intentar' }));
    expect(process).toHaveBeenCalledTimes(2);
  });

  it('shows determinate model progress', async () => {
    const view = render(<BackgroundRemoverPanel copy={translations.backgroundRemoval} />);
    pasteImage();
    await screen.findAllByText('portrait.png');
    useBackgroundRemovalMock.mockReturnValue(engineState({
      status: 'processing',
      progress: {
        operationId: 'operation',
        stage: 'downloading-assets',
        current: 1,
        total: 4,
        route: { device: 'cpu', model: 'isnet_quint8' },
      },
      modelSource: 'cache',
      activeRoute: { device: 'cpu', model: 'isnet_quint8' },
    }));
    view.rerender(<BackgroundRemoverPanel copy={translations.backgroundRemoval} />);

    expect(screen.getByText('25%')).toBeTruthy();
    expect(screen.getByText('Cargando el modelo guardado en este navegador.')).toBeTruthy();
  });
});
