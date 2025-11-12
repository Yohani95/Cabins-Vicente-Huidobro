"use client";

import { Link } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './ui/Button';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
};

export function Navbar() {
  const t = useTranslations('navbar');
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const items = useMemo<NavItem[]>(
    () => [
      { href: '/cabanas', label: t('cabanas') },
      { href: '/piscina', label: t('piscina') },
      { href: '/ubicacion', label: t('ubicacion') },
      { href: '/contacto', label: t('contacto') }
    ],
    [t]
  );

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
    });

    const {
      data: authListener
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      if (!currentSession) {
        setIsSigningOut(false);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isAccountMenuOpen &&
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccountMenuOpen]);

  const handleSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error al cerrar sesión', error);
        setIsSigningOut(false);
        return;
      }
      setOpen(false);
      setIsAccountMenuOpen(false);
      router.push(`/${locale}/admin/login`);
    } catch (error) {
      console.error('Error inesperado al cerrar sesión', error);
      setIsSigningOut(false);
    }
  }, [locale, router]);

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
          {session ? (
            <div className="flex items-center gap-3" ref={accountMenuRef}>
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 rounded-xl border-sand/60 bg-white text-slate-700 hover:border-olive hover:text-olive"
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                >
                  <span>{t('admin_menu')}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isAccountMenuOpen ? 'rotate-180' : 'rotate-0'
                    )}
                  />
                </Button>
                <AnimatePresence>
                  {isAccountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-48 rounded-2xl border border-sand/40 bg-white/95 p-2 text-sm text-slate-700 shadow-xl backdrop-blur"
                    >
                      <Link
                        href="/admin"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-olive/10 hover:text-olive"
                      >
                        {t('admin_dashboard')}
                      </Link>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-rose-50 hover:text-rose-600"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                      >
                        {isSigningOut ? t('logout_loading') : t('logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <LanguageSwitcher />
            </div>
          ) : (
            <>
              <Link href="/admin">
                <Button size="sm" className="shadow-sm shadow-olive/20">
                  {t('admin')}
                </Button>
              </Link>
              <LanguageSwitcher />
            </>
          )}
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
              {session ? (
                <div className="flex flex-col gap-3">
                  <Link href="/admin" onClick={() => setOpen(false)}>
                    <Button size="sm" variant="outline" className="w-full">
                      {t('admin_dashboard')}
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? t('logout_loading') : t('logout')}
                  </Button>
                  <div className="flex justify-end">
                    <LanguageSwitcher />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <Link href="/admin" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full">
                      {t('admin')}
                    </Button>
                  </Link>
                  <LanguageSwitcher />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}




