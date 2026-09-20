import { describe, expect, it } from 'vitest';

import { buildStructuredData } from './seo';

const siteUrl = new URL('https://pixel-crunch.josuem01.dev');

describe('buildStructuredData', () => {
  it('declares Pixel Crunch as the site name only on the subdomain root', () => {
    const data = buildStructuredData({
      siteUrl,
      canonicalUrl: 'https://pixel-crunch.josuem01.dev/',
      imageUrl: 'https://pixel-crunch.josuem01.dev/Logo.png',
      imageAlt: 'Logo de Pixel Crunch',
      lang: 'es',
      route: 'home',
      title: 'Pixel Crunch',
      description: 'Herramientas privadas para imágenes.',
      pageName: 'Pixel Crunch',
    });

    expect(data['@graph']).toContainEqual(expect.objectContaining({
      '@type': 'WebSite',
      name: 'Pixel Crunch',
      url: 'https://pixel-crunch.josuem01.dev/',
    }));
  });

  it('adds localized breadcrumbs and visible FAQ content to tool metadata', () => {
    const data = buildStructuredData({
      siteUrl,
      canonicalUrl: 'https://pixel-crunch.josuem01.dev/en/compress/',
      imageUrl: 'https://pixel-crunch.josuem01.dev/Logo.png',
      imageAlt: 'Pixel Crunch logo',
      lang: 'en',
      route: 'compress',
      title: 'Free image compressor online — Pixel Crunch',
      description: 'Compress images locally.',
      pageName: 'Free image compressor online',
      faqItems: [{ question: 'Are images uploaded?', answer: 'No.' }],
    });

    expect(data['@graph']).not.toContainEqual(expect.objectContaining({ '@type': 'WebSite' }));
    expect(data['@graph']).toContainEqual(expect.objectContaining({
      '@type': 'BreadcrumbList',
      itemListElement: expect.arrayContaining([
        expect.objectContaining({ name: 'Home', item: 'https://pixel-crunch.josuem01.dev/en/' }),
      ]),
    }));
    expect(data['@graph']).toContainEqual(expect.objectContaining({
      '@type': 'FAQPage',
      mainEntity: [expect.objectContaining({ name: 'Are images uploaded?' })],
    }));
  });
});
