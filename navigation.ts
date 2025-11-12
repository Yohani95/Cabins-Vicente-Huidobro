import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales } from './next-intl.config';

export const localePrefix = 'always';

export const { Link, usePathname, useRouter } =
  createSharedPathnamesNavigation({
    locales,
    localePrefix
  });

