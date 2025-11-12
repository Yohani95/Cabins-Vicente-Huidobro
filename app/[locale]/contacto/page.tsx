"use client";

import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function ContactoPage() {
  const t = useTranslations('contacto');

  return (
    <div className="space-y-14">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-sand/40 bg-white/80 p-10 shadow-card"
      >
        <h1 className="heading-rustic text-4xl">
          {t('title')}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-700">
          {t('subtitle')}
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <a
            href="https://wa.me/56975267860?text=Hola%20Cabañas%20Vicente%20Huidobro,%20quisiera%20consultar%20disponibilidad."
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg">{t('cta_whatsapp')}</Button>
          </a>
          <Button variant="outline" size="lg" disabled>
            {t('cta_form')}
          </Button>
        </div>
      </motion.section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card space-y-4 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-olive">
            {t('quick_info.title')}
          </p>
          <ul className="space-y-3 text-sm text-slate-700">
            <li>• {t('quick_info.hours')}</li>
            <li>• {t('quick_info.response')}</li>
            <li>• {t('quick_info.languages')}</li>
          </ul>
        </div>
        <div className="card space-y-4 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-olive">
            {t('coming_soon.title')}
          </p>
          <p className="text-sm text-slate-700">
            {t('coming_soon.description')}
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• {t('coming_soon.admin')}</li>
            <li>• {t('coming_soon.payments')}</li>
            <li>• {t('coming_soon.reminders')}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}




