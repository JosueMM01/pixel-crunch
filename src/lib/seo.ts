import { getLocalizedRoute, type Locale, type RouteKey } from '../i18n/routes';

export interface FaqItem {
  question: string;
  answer: string;
}

interface StructuredDataOptions {
  siteUrl: URL;
  canonicalUrl: string;
  imageUrl: string;
  imageAlt: string;
  lang: Locale;
  route: RouteKey;
  title: string;
  description: string;
  pageName: string;
  featureList?: string[];
  faqItems?: readonly FaqItem[];
}

type SchemaNode = Record<string, unknown>;

export function buildStructuredData({
  siteUrl,
  canonicalUrl,
  imageUrl,
  imageAlt,
  lang,
  route,
  title,
  description,
  pageName,
  featureList,
  faqItems,
}: StructuredDataOptions) {
  const rootUrl = new URL('/', siteUrl).toString();
  const websiteId = `${rootUrl}#website`;
  const webpageId = `${canonicalUrl}#webpage`;
  const graph: SchemaNode[] = [];

  if (canonicalUrl === rootUrl) {
    graph.push({
      '@type': 'WebSite',
      '@id': websiteId,
      url: rootUrl,
      name: 'Pixel Crunch',
      alternateName: 'PixelCrunch',
      inLanguage: ['es', 'en'],
    });
  }

  const webPage: SchemaNode = {
    '@type': 'WebPage',
    '@id': webpageId,
    url: canonicalUrl,
    name: title,
    description,
    inLanguage: lang,
    isPartOf: { '@id': websiteId },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: imageUrl,
      caption: imageAlt,
    },
  };

  if (route !== 'home') {
    const homeLabel = lang === 'en' ? 'Home' : 'Inicio';
    const breadcrumbId = `${canonicalUrl}#breadcrumb`;
    webPage.breadcrumb = { '@id': breadcrumbId };
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: homeLabel,
          item: new URL(getLocalizedRoute(lang, 'home'), siteUrl).toString(),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: pageName,
          item: canonicalUrl,
        },
      ],
    });
  }

  graph.push(webPage);

  graph.push({
    '@type': 'WebApplication',
    '@id': `${canonicalUrl}#application`,
    name: route === 'home' ? 'Pixel Crunch' : `${pageName} — Pixel Crunch`,
    url: canonicalUrl,
    mainEntityOfPage: { '@id': webpageId },
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires a modern browser with JavaScript enabled',
    description,
    inLanguage: lang,
    isAccessibleForFree: true,
    image: imageUrl,
    featureList,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  });

  if (faqItems?.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      isPartOf: { '@id': webpageId },
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
