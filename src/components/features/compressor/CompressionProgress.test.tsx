import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CompressionProgress } from './CompressionProgress';

describe('CompressionProgress', () => {
  it('clamps the progress value and exposes the correct status text', () => {
    render(<CompressionProgress progress={145} status="done" />);

    const progressbar = screen.getByRole('progressbar', { name: 'Progress' });

    expect(progressbar.getAttribute('aria-valuenow')).toBe('100');
    expect(progressbar.getAttribute('aria-valuetext')).toBe(
      '100% - Compression completed'
    );
    expect(screen.getByRole('status').textContent).toContain('Compression completed');
  });

  it('renders the error state when progress is below zero', () => {
    render(<CompressionProgress progress={-20} status="error" />);

    const progressbar = screen.getByRole('progressbar', { name: 'Progress' });

    expect(progressbar.getAttribute('aria-valuenow')).toBe('0');
    expect(screen.getByRole('status').textContent).toContain('Compression failed');
  });
});