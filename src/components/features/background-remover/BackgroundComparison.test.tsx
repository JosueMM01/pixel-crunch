import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BackgroundComparison } from './BackgroundComparison';

const props = {
  originalUrl: 'blob:original',
  resultUrl: 'blob:transparent',
  originalAlt: 'Original: portrait.png',
  resultAlt: 'Sin fondo: portrait.png',
  beforeLabel: 'Original',
  afterLabel: 'Sin fondo',
  comparisonLabel: 'Comparar imagen original y resultado',
};

describe('BackgroundComparison', () => {
  it('shows only the transparent result so the original cannot bleed through it', () => {
    render(<BackgroundComparison {...props} />);

    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByRole('img').getAttribute('src')).toBe('blob:transparent');
    expect(screen.getByRole('button', { name: 'Sin fondo' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('switches between the original and result without overlaying either image', () => {
    render(<BackgroundComparison {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Original' }));
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByRole('img', { name: props.originalAlt }).getAttribute('src')).toBe('blob:original');

    fireEvent.click(screen.getByRole('button', { name: 'Sin fondo' }));
    expect(screen.getByRole('img', { name: props.resultAlt }).getAttribute('src')).toBe('blob:transparent');
  });
});
