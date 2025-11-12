import { getRequestConfig } from 'next-intl/server';

export const locales = ['es', 'en'] as const;
export const defaultLocale = 'es';
type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const resolvedLocale: Locale =
    locales.find((item) => item === locale) ?? defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (
      await import(`./lib/i18n/messages.${resolvedLocale}.json`)
    ).default
  };
});


