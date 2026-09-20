import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import translations from '@/i18n/es.json';
import { BackgroundMaskEditor } from './BackgroundMaskEditor';

describe('BackgroundMaskEditor', () => {
  const context = {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    stroke: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    createPattern: vi.fn(() => ({})),
    globalCompositeOperation: 'source-over',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    strokeStyle: '',
  };

  beforeEach(() => {
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 100, height: 80, close: vi.fn() })));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, top: 0, right: 100, bottom: 80, left: 0, width: 100, height: 80, toJSON: vi.fn(),
    });
    HTMLCanvasElement.prototype.setPointerCapture = vi.fn();
    HTMLCanvasElement.prototype.releasePointerCapture = vi.fn();
    HTMLCanvasElement.prototype.hasPointerCapture = vi.fn(() => true);
    HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => callback(new Blob(['edited'], { type: 'image/png' })));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.style.overflow = '';
  });

  it('edits the mask locally and returns a PNG blob', async () => {
    const onApply = vi.fn();
    const view = render(
      <BackgroundMaskEditor
        original={new Blob(['original'], { type: 'image/png' })}
        result={new Blob(['result'], { type: 'image/png' })}
        copy={translations.backgroundRemoval}
        onApply={onApply}
        onClose={vi.fn()}
      />,
    );

    const canvas = view.container.querySelector('canvas');
    expect(canvas).toBeTruthy();
    await waitFor(() => expect((screen.getByRole('button', { name: 'Aplicar cambios' }) as HTMLButtonElement).disabled).toBe(false));

    fireEvent.click(screen.getByRole('button', { name: 'Borrar fondo' }));
    fireEvent.pointerDown(canvas!, { pointerId: 1, clientX: 20, clientY: 20 });
    fireEvent.pointerMove(canvas!, { pointerId: 1, clientX: 25, clientY: 25 });
    fireEvent.pointerUp(canvas!, { pointerId: 1, clientX: 25, clientY: 25 });
    expect((screen.getByRole('button', { name: 'Deshacer' }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
    expect((screen.getByRole('button', { name: 'Rehacer' }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Rehacer' }));

    const closeButton = screen.getAllByRole('button', { name: 'Cerrar editor' })[0];
    closeButton.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Aplicar cambios' }));
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(closeButton);

    fireEvent.click(screen.getByRole('button', { name: 'Aplicar cambios' }));
    await waitFor(() => expect(onApply).toHaveBeenCalledWith(expect.any(Blob)));
  });

  it('closes with Escape', async () => {
    const onClose = vi.fn();
    render(
      <BackgroundMaskEditor
        original={new Blob(['original'], { type: 'image/png' })}
        result={new Blob(['result'], { type: 'image/png' })}
        copy={translations.backgroundRemoval}
        onApply={vi.fn()}
        onClose={onClose}
      />,
    );
    await screen.findByRole('dialog', { name: 'Corregir recorte' });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
