import '../globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import {
  getMessages,
  getTranslations,
  unstable_setRequestLocale
} from 'next-intl/server';
import { locales } from '../../next-intl.config';
import { Inter, Merriweather } from 'next/font/google';
import clsx from 'clsx';
import type { Metadata, Viewport } from 'next';

type Locale = (typeof locales)[number];

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: Locale;
  }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Exportar viewport por separado (requerido en Next.js 15)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#3E5C4B' }
  ]
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cabanas-vicente-huidobro.com';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  const ogImagePath = t('ogImage');
  const ogImageUrl = ogImagePath.startsWith('http')
    ? ogImagePath
    : `${siteUrl}${ogImagePath}`;
  const url = `${siteUrl}/${locale}`;

  return {
    metadataBase: new URL(siteUrl),
    title: t('title'),
    description: t('description'),
    keywords: t('keywords').split(','),
    authors: [{ name: 'Yohani Espinoza', url: 'https://portafolio-yohani.vercel.app/' }],
    creator: 'Yohani Espinoza',
    publisher: 'Cabañas Vicente Huidobro',
    formatDetection: {
      telephone: true,
      email: true,
      address: true
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.ico'
    },
    manifest: '/site.webmanifest',
    alternates: {
      canonical: url,
      languages: {
        es: `${siteUrl}/es`,
        en: `${siteUrl}/en`
      }
    },
    openGraph: {
      type: 'website',
      title: t('ogTitle'),
      description: t('ogDescription'),
      url,
      siteName: t('siteName'),
      images: [
        {
          url: ogImageUrl,
          width: 1600,
          height: 900,
          alt: t('ogTitle')
        }
      ],
      locale: locale === 'es' ? 'es_CL' : 'en_US'
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('ogDescription'),
      images: [ogImageUrl],
      creator: '@cabanasvh'
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  };
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-display',
  display: 'swap'
});

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;
  unstable_setRequestLocale(locale);
  const messages = await getMessages();
  const tSeo = await getTranslations({ locale, namespace: 'seo' });

  const businessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': `${siteUrl}/${locale}#business`,
    name: tSeo('siteName'),
    description: tSeo('description'),
    url: `${siteUrl}/${locale}`,
    telephone: '+56 9 7526 7860',
    email: 'contacto@cabanas-vicente-huidobro.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Vicente Huidobro 384',
      addressLocality: 'Cartagena',
      addressRegion: 'Valparaíso',
      postalCode: '2710000',
      addressCountry: 'CL'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -33.553309,
      longitude: -71.600991
    },
    image: [
      tSeo('ogImage').startsWith('http')
        ? tSeo('ogImage')
        : `${siteUrl}${tSeo('ogImage')}`
    ],
    priceRange: '$$',
    openingHours: 'Mo-Su 09:00-01:00',
    starRating: {
      '@type': 'Rating',
      ratingValue: '5'
    },
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Swimming Pool',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Free WiFi',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Free Parking',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'BBQ Grill',
        value: true
      }
    ],
    numberOfRooms: 2,
    petsAllowed: false,
    checkinTime: '14:00',
    checkoutTime: '12:00'
  };

  return (
    <html
      lang={locale}
      className={clsx(inter.variable, merriweather.variable)}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen bg-canvas text-slate-800 font-body antialiased"
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="container-page flex-1 py-12">{children}</main>
            <Footer />
          </div>
          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(businessSchema)
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}




