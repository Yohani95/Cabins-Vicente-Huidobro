"use client";

import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './ui/Button';
import { Menu, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

type NavItem = {
  href: string;
  label: string;
};

export function Navbar() {
  const t = useTranslations('navbar');
  const [open, setOpen] = useState(false);

  const items = useMemo<NavItem[]>(
    () => [
      { href: '/cabanas', label: t('cabanas') },
      { href: '/piscina', label: t('piscina') },
      { href: '/ubicacion', label: t('ubicacion') },
      { href: '/contacto', label: t('contacto') }
    ],
    [t]
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sand/50 bg-white/75 backdrop-blur-xl">
      <div className="container-page flex h-20 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 font-display text-wood transition hover:text-olive"
        >
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-olive/10 p-1">
            <Image
              src="/favicon.ico"
              alt="Cabañas Vicente Huidobro"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="text-base sm:text-xl">Cabañas Vicente Huidobro</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-olive"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="https://wa.me/56975267860"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" className="shadow-sm shadow-olive/20">
              {t('cta')}
            </Button>
          </a>
          <LanguageSwitcher />
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-sand/60 text-olive md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-sand/40 bg-white/95 md:hidden"
          >
            <div className="container-page flex flex-col gap-4 py-6 text-sm text-slate-700">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-medium"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center justify-between">
                <a
                  href="https://wa.me/56975267860"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" className="w-full">
                    {t('cta')}
                  </Button>
                </a>
                <LanguageSwitcher />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}




