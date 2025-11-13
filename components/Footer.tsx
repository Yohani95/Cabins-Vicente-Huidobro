"use client";

import { useTranslations } from 'next-intl';
import { MapPin, PhoneCall, Clock } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-sand/40 bg-white/80">
      <div className="container-page grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-lg text-wood">
            Cabañas Vicente Huidobro
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {t('tagline')}
          </p>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 text-olive" />
            <span>{t('address')}: Vicente Huidobro 384, Cartagena, Chile</span>
          </div>
          <div className="flex items-start gap-3">
            <PhoneCall className="mt-1 h-5 w-5 text-olive" />
            <a
              href="https://wa.me/56975267860"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-olive"
            >
              {t('whatsapp')}: +56 9 7526 7860
            </a>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-1 h-5 w-5 text-olive" />
            <span>{t('schedule')}</span>
          </div>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <p className="font-semibold text-olive">{t('newsletter_title')}</p>
          <p>{t('newsletter_desc')}</p>
          <p className="text-xs text-slate-500">
            {t('legal')}
          </p>
        </div>
      </div>
      <div className="border-t border-sand/30 bg-white/70">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-4 text-xs text-slate-500 md:flex-row md:items-center">
          <span>© {year} Cabañas Vicente Huidobro. {t('rights')}</span>
          <div className="flex flex-col gap-1 md:flex-row md:gap-3 md:items-center">
            <span>
              {t('crafted')}{' '}
              <a
                href="https://portafolio-yohani.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-olive hover:underline"
              >
                Yohani Espinoza
              </a>
            </span>
            <span className="hidden md:inline">·</span>
            <span>{t('version')} 1.1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}




