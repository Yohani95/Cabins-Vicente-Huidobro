import createMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from './next-intl.config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export const config = {
  matcher: [
    '/((?!_next|api|.*\\..*).*)'
  ]
};




