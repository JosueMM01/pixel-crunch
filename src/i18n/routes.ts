export const locales = ['es', 'en'] as const;

export type Locale = (typeof locales)[number];
export type RouteKey = 'home' | 'compress' | 'convert' | 'removeBackground';

export const localizedRoutes = {
  es: {
    home: '/',
    compress: '/comprimir/',
    convert: '/convertir/',
    removeBackground: '/quitar-fondo/',
  },
  en: {
    home: '/en/',
    compress: '/en/compress/',
    convert: '/en/convert/',
    removeBackground: '/en/remove-background/',
  },
} as const satisfies Record<Locale, Record<RouteKey, string>>;

export function getLocalizedRoute(locale: Locale, route: RouteKey): string {
  return localizedRoutes[locale][route];
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'es' ? 'en' : 'es';
}

export function getAlternateRoute(locale: Locale, route: RouteKey): string {
  return getLocalizedRoute(getAlternateLocale(locale), route);
}

export function getLocaleFromPath(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'es';
}
