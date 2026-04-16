import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from './Button';

describe('Button', () => {
  it('renders the accessible label and icon content', () => {
    render(
      <Button icon={<span data-testid="icon">+</span>}>Comprimir</Button>
    );

    const button = screen.getByRole('button', { name: 'Comprimir' });

    expect(button).toBeTruthy();
    expect(button.querySelector('[data-testid="icon"]')?.textContent).toBe('+');
  });

  it('marks the button as busy while loading', () => {
    render(<Button loading>Procesando</Button>);

    const button = screen.getByRole('button', { name: 'Procesando' });

    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.querySelector('svg')).not.toBeNull();
  });
});