"use client";

import { Button } from './ui/Button';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useState } from 'react';

const OPTIONS = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' }
] as const;

type LocaleCode = (typeof OPTIONS)[number]['code'];

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('navbar');
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const currentLocale = locale as LocaleCode;

  const handleSelect = (code: LocaleCode) => {
    setOpen(false);
    router.push(pathname, { locale: code });
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2"
      >
        <Globe className="h-4 w-4" />
        {locale.toUpperCase()}
      </Button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            role="listbox"
            className="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-sand/40 bg-white shadow-lg"
          >
            {OPTIONS.map((option) => (
              <li key={option.code}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.code)}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm text-slate-700 transition hover:bg-sand/20"
                >
                  <span>{option.label}</span>
                  {option.code === currentLocale && (
                    <span className="text-xs text-olive">{t('current')}</span>
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}




