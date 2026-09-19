import { describe, expect, it } from 'vitest';
import {
  getAlternateRoute,
  getLocaleFromPath,
  getLocalizedRoute,
  localizedRoutes,
} from './routes';

describe('localized routes', () => {
  it.each(Object.keys(localizedRoutes.es) as Array<keyof typeof localizedRoutes.es>)('defines matching Spanish and English paths for %s', (key) => {
    expect(localizedRoutes.es[key]).toMatch(/^\//);
    expect(localizedRoutes.en[key]).toMatch(/^\/en(?:\/|$)/);
    expect(localizedRoutes.es[key]).toMatch(/\/$/);
    expect(localizedRoutes.en[key]).toMatch(/\/$/);
  });

  it('keeps the active tool when switching languages', () => {
    expect(getAlternateRoute('es', 'compress')).toBe('/en/compress/');
    expect(getAlternateRoute('en', 'convert')).toBe('/convertir/');
    expect(getAlternateRoute('es', 'removeBackground')).toBe('/en/remove-background/');
  });

  it('resolves localized paths and locale prefixes', () => {
    expect(getLocalizedRoute('es', 'home')).toBe('/');
    expect(getLocalizedRoute('en', 'home')).toBe('/en/');
    expect(getLocaleFromPath('/en/convert/')).toBe('en');
    expect(getLocaleFromPath('/convertir/')).toBe('es');
  });
});
